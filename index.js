//require packages
const express = require('express');
const BodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var datesBetween = require("dates-between");
var DateOnly = require("date-only");
const nodemailer = require('nodemailer');

// declare app variable server and connect to database
app = express();
var server = require('http').createServer(app);
var db = mongoose.connect('mongodb://localhost:27017/coVoiture'); // mongodb://user661:6KLXjWlQA5SNNiyy@mongo834:27017/admin

//session
app.use(session({secret:'cocar'}));

//requrie models
const traget = require('./models/traget.js');
const user = require('./models/user.js');
const reserver = require('./models/reserver.js');
const cardispo = require('./models/cardispo.js');
const cars = require('./models/cars.js');
//set app and requirements
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(BodyParser.urlencoded());
app.use(BodyParser.json());
app.use(session({secret: 'covoiture'}));


// ***** routes *****

// GET REQUESTS
//index
app.get('/', function (req,res) {
  console.log(req.session);
  rmredire(req,res);
  if (req.session.user){
  res.render('index',{user: req.session.user});
}else {
  res.render('index');
}
});
app.get('/index', function(req,res){
  rmredire(req,res);
  if (req.session.user){
  res.render('index',{user: req.session.user});
}else {
  res.render('index');
}
});
//propser
app.get('/proposer', function(req,res){
  rmredire(req,res);
  if (!req.session.user){
    req.session.redire = '/proposer';
    res.redirect('/notlogged');
  }else {
    res.render('proposer', {user:req.session.user});
  }
});
// si la proposition est aller seulement
app.get("/aller", function (req,res) {
  rmredire(req,res);
  if (!req.session.user) {
    res.redirect("/notlogged");
  }else {
    res.render("allerProp1", {user: req.session.user});
  }
});
// si la proposition est aller et retour
app.get("/aller&retour", function (req, res) {
  if (!req.session.user) {
    res.redirect("/notlogged");
  }else {
    res.render("propBoth1", {user: req.session.user});
  }
});
//login
app.get('/login', function(req,res){
  rmredire(req,res);
  if(!req.session.user){
  res.render('login');
}else {
  res.redirect('/profile');
}
});
//register
app.get('/register', function(req,res){
  rmredire(req,res);
  if (req.session.user){
    res.redirect('/');
  }
  res.render('register');
});
//profile of another user
app.get('/detail/:id', function(req,res){
  rmredire(req,res)
  user.findOne({_id:req.params.id}, function(error,result){
    if(error) {
      res.render('error', {error:"le profil que vous chercher n'existe pas"});
    }else {
      res.render('details', {user:result});
    }
  });
});
//show my profile
app.get('/profile', function (req,res) {
  rmredire(req,res);
  console.log(req.session.user);
  if (req.session.user){
    reserver.find({proposerid: req.session.user._id}, function (error,reservation) {
      if (error) res.render('error', {error: error});
      console.log(reservation);
      if (reservation) res.render('profile', {user:req.session.user, reservations:reservation});
    });
  }else {
    req.session.redire = '/profile';
    res.redirect('/notlogged');
  }
});
app.get('/notlogged', function(req,res){
  res.render('notlogged')
});

//logoff
app.get('/logoff', function(req,res){
  req.session.destroy();
  res.redirect('/')
});

//mes reservations(tragets that I proposed)
app.get('/mestragets', function (req,res) {
  rmredire(req,res);
  if (req.session.user) {
    traget.find({userid: req.session.user._id}, function (error, proposition) {
      if (error) res.render('error', {error: error});
      if (proposition) res.render('mestragets', {propo: proposition, user:req.session.user});
    });
  }else {
    req.session.redire = '/mestragets';
    res.redirect('/notlogged');
  }
});
//mes tragets(tragets that I )
app.get('/mesreservations', function (req,res) {
  rmredire(req,res);
  if (req.session.user){
    reserver.find({reserverid: req.session.user._id}, function (error,reserv) {
      if (error) res.render('error', {error:error});
      if (reserv) res.render('mesreservations', {reserv:reserv, user: req.session.user});
    });
  }else {
    req.session.redire = '/mesreservations';
    res.redirect('/notlogged');
  }
});

// POST REQUESTS

//chercher un traget
app.post('/chercher', function(req,res){
  if(req.body.depart && req.body.dest && req.body.date){
    // find allant
    traget.find({
      depart      : req.body.depart,
      dest        : req.body.dest,
      allezDate   : new DateOnly(req.body.date).toISOString(),
      date_object : {$gte: req.body.date} // date is stored in string format in the tragets schema
    }, function(error, allant){
      if (error) res.render('error', {error: error});
      // find en etap
      traget.find({
        etape:      req.body.depart,
        dest        : req.body.dest,
        allezDate   : new DateOnly(req.body.date).toISOString(),
        date_object : {$gte: req.body.date}
      }, function (error, etape) {
        if (error) res.render('error',{error: error});
        if (req.session.user){
          res.render('found',{allant: allant, etape:etape, user:req.session.user});
        }else {
          //transfer date object to iso string
          if (etape.allezDate) etape.allezDate = etape.allezDate.toISOString();
          res.render('found',{allant: allant, etape:etape});
        }
      });
    });
  }
});
//proposer aller step 1
app.post("/aller1", function (req,res) {
  if (!req.session.user) res.redirect("notlogged");
  if (!req.body.allerDate && !req.body.finDate && req.body.allezTime && req.body.finTime && req.body.etab) res.render("error", {error: "une erreure s'est produite"})
  req.body.allezDate = new Date(req.body.allezDate + " UTC"); //convert to date-only object the allez et fin date
  req.body.finDate   = new Date(req.body.finDate + " UTC");
  var etab           = req.body.etab // etablissement
  // if date of start is bigger than the final date tell error
  if (req.body.allezDate > req.body.finDate) res.render("allerProp1", {user: req.session.user, error: "les dates ne sont pas valides"});
  cardispo.find({
    $or : [
      {
        brand_new  : true,
        etab       : etab
      },
      {
        half_dispo    : false,
        FreeStartDate : {$lte: req.body.allezDate} , // car ends being busy on a date less or equal to the date we choose to start using
        FreeEndDate   : {$gte: req.body.finDate} , // car starts being busy after or at the date we choose to stop using
        etab          : etab
    },
    {
        half_dispo    : true,
        FreeStartDate : {$lte: req.body.allezDate},
        etab          : etab
    }]
  }, function (error, cars) {
    console.log("[+] Finding car")
    if (error) res.render("allerProp1", {user: req.session.user, error:error});
    if (cars) {
      req.session.aller1 = req.body; // the body request will be in session to be needed in step 2
      console.log(req.body);
      res.render("allerProp2", {user:req.session.user, aller1: req.body, cars:cars });
    }
  });
});

// step 2 of reserving a path
app.post("/aller2", function (req,res) {
  if (!req.session.aller1) res.redirect("/notlogged");
  var cardispo_id   = req.body.car;
  var desc  = req.body.desc;
  cardispo.findOne({_id: cardispo_id}, function (error,cardispo_result) {
    if (error) res.render("allerProp1", {user: req.session.user, error: error})
    var car = cardispo_result
    console.log(car.brand_new);
    if (car.brand_new === true) {
      cardispo.findOneAndUpdate({_id: cardispo_id}, {$set:
        {
          brand_new     : false,
          car           : car.car,
          FreeStartDate : new DateOnly(0), // car start being free at 0 date
          FreeEndDate   : req.session.aller1.allezDate, // car ends being free when the user decides to take it
          half_dispo    : false
        }
      }, function (error , result_car) {
        cardispo.create({
          brand_new     : false, // a new table created with same car options
          car           : car.car,
          FreeStartDate : req.session.aller1.finDate, // car start being free when user's journey is over
          half_dispo    : true, // means the table is waiting for someone to filll the FreeStartDate
          places        : car.places,
          etab          : car.etab
        }, function (error, final_car) {
          if (error) res.render("allerProp1", {user:req.session.user, error: error})
          else if (final_car) {
          var allezDate = new Date(req.session.aller1.allezDate)
          var hour      = allezDate.getUTCHours()
          var houred    = addzero(hour)
          var mins      = allezDate.getUTCMinutes()
          var mined     = addzero(mins)
          var allezTime = houred+":"+mined // retreive the time in a string format
          var allezDate = new DateOnly(allezDate).toISOString() // date in string format
            traget.create({
              userid      : req.session.user._id,
              nom         : req.session.user.nom,
              prenom      : req.session.user.prenom,
              depart      : req.session.aller1.depart,
              etape       : req.session.aller1.etape,
              dest        : req.session.aller1.dest,
              date_object : req.session.aller1.allezDate, // object to be used for date comparision later
              allezDate   : allezDate, // string
              allezTime   : allezTime, // string
              places      : car.places,
              car         : car.car,
              description : desc
            }, function (error , traget) {
              if (error) res.render("allerProp1", {user:req.session.user, error: error});
              if (traget) {
                res.render("success", {traget: traget, user: req.session.user})
              }
            });
          }
        });
      });
    } else {
      if (car.half_dispo === true) {
        cardispo.findOneAndUpdate({_id: cardispo_id}, {$set:
          {
            FreeEndDate : req.session.aller1.allezDate, // if car is waiting for FreeEndDate it will be created and filled the start date of the user's trip
            half_dispo  : false
          }
        }, function (error, result_car) {
          if (error) res.render('error', {user: req.session.user, error:error});
          else if (result_car) {
            cardispo.create({
              brand_new     : false, // new table created with user journey's end date pointing to the beginning of the free time of the car
              car           : car.car,
              FreeStartDate : req.session.aller1.finDate,
              half_dispo    : true,
              etab          : car.etab,
              places        : car.places
            }, function (error, result_car2) {
              if (error) res.render('allerProp1', {user: req.session.user, error: error});
              else if (result_car2) {
                var allezDate = new Date(req.session.aller1.allezDate)
                var hour      = allezDate.getUTCHours()
                var houred    = addzero(hour)
                var mins      = allezDate.getUTCMinutes()
                var mined     = addzero(mins)
                var allezTime = houred+":"+mined
                var allezDate = new DateOnly(allezDate).toISOString()
                traget.create({
                  userid      : req.session.user._id,
                  nom         : req.session.user.nom,
                  prenom      : req.session.user.prenom,
                  depart      : req.session.aller1.depart,
                  etape       : req.session.aller1.etape,
                  dest        : req.session.aller1.dest,
                  date_object : req.session.aller1.allezDate,
                  allezDate   : allezDate,
                  allezTime   : allezTime,
                  places      : car.places,
                  car         : car.car,
                  description : desc
                }, function (error , traget) {
                  if (error) res.render("aller1", {user:req.session.user, error: error});
                  if (traget) {
                    res.render("success", {traget: traget, user: req.session.user})
                  }
                });
              }
            });
          }
        });
      } else {
        cardispo.findOneAndUpdate({_id: cardispo_id}, {$set:
          {
            FreeEndDate : req.session.aller1.allezDate, // if both Start and End date are there and the car is available modify the FreeEndDate with user's depart date
            half_dispo  : false // make car half dispo
          }
        }, function (error, result_car) {
          if (error) res.render("allerProp1", {user:req.session.user, error: error});
          else if (result_car) {
            cardispo.create({
              brand_new     : false, // craeted a new table with same car options
              FreeStartDate : req.session.aller1.finDate, // car start being free when the user's journey ends
              FreeEndDate   : result_car.FreeEndDate,
              half_dispo    : false, // table waiting for FreeEndDate
              cars          : car.car,
              places        : car.places,
              etab          : car.etab
            }, function (error, final_car) {
              if (error) res.render("allerProp1", {user: req.session.user, error: error})
              else if (final_car) {
                var allezDate = new Date(req.session.aller1.allezDate)
                var hour      = allezDate.getUTCHours()
                var houred    = addzero(hour)
                var mins      = allezDate.getUTCMinutes()
                var mined     = addzero(mins)
                var allezTime = houred+":"+mined
                var allezDate = new DateOnly(allezDate).toISOString()
                traget.create({
                  userid      : req.session.user._id,
                  nom         : req.session.user.nom,
                  prenom      : req.session.user.prenom,
                  depart      : req.session.aller1.depart,
                  etape       : req.session.aller1.etape,
                  dest        : req.session.aller1.dest,
                  date_object : req.session.aller1.allezDate,
                  allezDate   : new DateOnly(req.session.aller1.allezDate).toISOString(),
                  allezTime   : allezTime,
                  places      : car.places,
                  car         : car.car,
                  description : desc
                }, function (error , traget) {
                  if (error) res.render("aller1", {user:req.session.user, error: error});
                  if (traget) {
                    res.render("success", {traget: traget, user: req.session.user})
                  }
                });
              }
            });
          }
        });
      }
    }
  });
});

//proposer aller&retour step 1
app.post("/aller&retour1", function (req,res) {
  if (!req.session.user) res.redirect("notlogged");
  if (!req.body.allerDate && !req.body.finDate && req.body.allezTime && req.body.finTime && req.body.etab) res.render("error", {error: "une erreure s'est produite"})
  req.body.allezDate = new Date(req.body.allezDate+" UTC"); //convert to date-only object the allez et fin date
  req.body.finDate   = new Date(req.body.finDate+" UTC");
  var etab           = req.body.etab // etablissement
  // if date of start is bigger than the final date tell error
  if (req.body.allezDate > req.body.finDate) {
    res.render("propBoth1", {user: req.session.user, error: "les dates ne sont pas valides"});
  } else {
    cardispo.find({
      $or : [
        {
          brand_new  : true,
          etab       : etab
        },
        {
          half_dispo    : false,
          FreeStartDate : {$lte: req.body.allezDate} , // car ends being busy on a date less or equal to the date we choose to start using
          FreeEndDate   : {$gte: req.body.finDate} , // car starts being busy after or at the date we choose to stop using
          etab          : etab
      },
      {
          half_dispo    : true,
          FreeStartDate : {$lte: req.body.allezDate},
          etab          : etab
      }]
    }, function (error, cars) {
      console.log("[+] Finding car")
      if (error) res.render("propBoth1", {user: req.session.user, error:error});
      if (cars) {
        req.session.aller1 = req.body; // the body request will be in session to be needed in step 2
        console.log(req.body);
        res.render("propBoth2", {user:req.session.user, aller1: req.body, cars:cars });
      }
    });
  }
});

// step 2 of reserving a path aller&retour
app.post("/aller&retour2", function (req,res) {
  if (!req.session.aller1) res.redirect("/notlogged");
  var cardispo_id           = req.body.car;
  var desc                  = req.body.desc;
  req.body.retourDepartDate = new Date(req.body.retourDepartDate+" UTC"); // date in utc time
  var finDate               = new Date(req.session.aller1.finDate)
  console.log(req.body.retourDepartDate);
  if (req.body.retourDepartDate > finDate) {
    res.render("allerProp1", {user:req.session.user, error:"la date de retour n'est pas valide"})
  } else {
    cardispo.findOne({_id: cardispo_id}, function (error,cardispo_result) {
      if (error) res.render("allerProp1", {user: req.session.user, error: error})
      var car = cardispo_result
      if (car.brand_new === true) {
        cardispo.findOneAndUpdate({_id: cardispo_id}, {$set:
          {
            brand_new     : false,
            car           : car.car,
            FreeStartDate : new DateOnly(0),
            FreeEndDate   : req.session.aller1.allezDate,
            half_dispo    : false
          }
        }, function (error , result_car) {
          cardispo.create({
            brand_new     : false,
            car           : car.car,
            FreeStartDate : req.session.aller1.finDate,
            half_dispo    : true,
            places        : car.places,
            etab          : car.etab
          }, function (error, final_car) {
            if (error) res.render("allerProp1", {user:req.session.user, error: error})
            else if (final_car) {
            var allezDate = new Date(req.session.aller1.allezDate)
            var hour      = allezDate.getUTCHours()
            var houred    = addzero(hour)
            var mins      = allezDate.getUTCMinutes()
            var mined     = addzero(mins)
            var allezTime = houred+":"+mined // retreive the time in a string format
            var allezDate = new DateOnly(allezDate).toISOString() // date in string format
              traget.create({
                userid      : req.session.user._id,
                nom         : req.session.user.nom,
                prenom      : req.session.user.prenom,
                depart      : req.session.aller1.depart,
                etape       : req.session.aller1.etape,
                dest        : req.session.aller1.dest,
                date_object : req.session.aller1.allezDate,
                allezDate   : allezDate,
                allezTime   : allezTime,
                places      : car.places,
                car         : car.car,
                description : desc
              }, function (error , traget1) {
                if (error) res.render("allerProp1", {user:req.session.user, error: error});
                if (traget1) {
                  var retourDepartDate = new Date(req.body.retourDepartDate)
                  var hour             = retourDepartDate.getUTCHours()
                  var houred           = addzero(hour)
                  var mins             = retourDepartDate.getUTCMinutes()
                  var mined            = addzero(mins)
                  var allezTime        = houred+":"+mined // retreive the time in a string format
                  var retourDepartDate = new DateOnly(retourDepartDate).toISOString() // date in string format
                  traget.create({
                    userid      : req.session.user._id,
                    nom         : req.session.user.nom,
                    prenom      : req.session.user.prenom,
                    depart      : req.session.aller1.dest,
                    etape       : req.session.aller1.etape,
                    dest        : req.session.aller1.depart,
                    date_object : req.body.retourDepartDate, // date object for later aggregation
                    allezDate   : retourDepartDate, // date in string format
                    allezTime   : allezTime, // time in string format
                    places      : car.places,
                    car         : car.car,
                    description : desc
                  }, function (error, traget2) {
                    if (error) res.render("propBoth2", {user: req.session.user, error: error});
                    else if (traget2) res.render("success", {traget: traget1, user: req.session.user, traget2: traget2});
                  });
                }
              });
            }
          });
        });
      } else {
        if (car.half_dispo === true) {
          cardispo.findOneAndUpdate({_id: cardispo_id}, {$set:
            // make the old half dispo full
            {
              FreeEndDate : req.session.aller1.allezDate,
              half_dispo  : false
            }
          }, function (error, result_car) {
              if (error) res.render("error", {user:req.session.user, error: error});
              cardispo.create({
                brand_new     : false,
                car           : car.car,
                FreeStartDate : req.session.aller1.finDate,
                half_dispo    : true,
                etab          : req.session.aller1.etab,
                places        : car.places
              }, function (error, result_car2) {
              if (error) res.render('error', {user: req.session.user, error:error});
              else if (result_car) {
                var allezDate = new Date(req.session.aller1.allezDate)
                var hour      = allezDate.getUTCHours()
                var houred    = addzero(hour)
                var mins      = allezDate.getUTCMinutes()
                var mined     = addzero(mins)
                var allezTime = houred+":"+mined
                var allezDate = new DateOnly(req.session.allezDate).toISOString()
                traget.create({
                  userid      : req.session.user._id,
                  nom         : req.session.user.nom,
                  prenom      : req.session.user.prenom,
                  depart      : req.session.aller1.depart,
                  etape       : req.session.aller1.etape,
                  dest        : req.session.aller1.dest,
                  date_object : req.session.aller1.allezDate,
                  allezDate   : allezDate,
                  allezTime   : allezTime,
                  places      : car.places,
                  car         : car.car,
                  description : desc
                }, function (error , traget1) {
                  if (error) res.render("aller1", {user:req.session.user, error: error});
                  if (traget1) {
                    var retourDepartDate = new Date(req.body.retourDepartDate)
                    var hour             = retourDepartDate.getUTCHours()
                    var houred           = addzero(hour)
                    var mins             = retourDepartDate.getUTCMinutes()
                    var mined            = addzero(mins)
                    var allezTime        = houred+":"+mined // retreive the time in a string format
                    var retourDepartDate = new DateOnly(retourDepartDate).toISOString() // date in string format
                    traget.create({
                      userid      : req.session.user._id,
                      nom         : req.session.user.nom,
                      prenom      : req.session.user.prenom,
                      depart      : req.session.aller1.dest,
                      etape       : req.session.aller1.etape,
                      dest        : req.session.aller1.depart,
                      date_object : req.body.retourDepartDate, // date object for later aggregation
                      allezDate   : retourDepartDate, // date in string format
                      allezTime   : allezTime, // time in string format
                      places      : car.places,
                      car         : car.car,
                      description : desc
                    }, function (error, traget2) {
                      if (error) res.render("propBoth2", {user: req.session.user, error: error});
                      else if (traget2) res.render("success", {traget: traget1, user: req.session.user, traget2: traget2});
                    });
                  }
                });
              }
            });
          });
        } else {
          cardispo.findOneAndUpdate({_id: cardispo_id}, {$set:
            {
              FreeEndDate : req.session.aller1.allezDate,
              half_dispo  : false
            }
          }, function (error, result_car) {
            if (error) res.render("allerProp1", {user:req.session.user, error: error});
            else if (result_car) {
              cardispo.create({
                brand_new     : false,
                FreeStartDate : req.session.aller1.finDate,
                FreeEndDate   : result_car.FreeEndDate,
                half_dispo    : false,
                car           : car.car,
                etab          : car.etab,
                places        : car.places
              }, function (error, final_car) {
                if (error) res.render("allerProp1", {user: req.session.user, error: error})
                else if (final_car) {
                  var allezDate = new Date(req.session.aller1.allezDate)
                  var hour      = allezDate.getUTCHours()
                  var houred    = addzero(hour)
                  var mins      = allezDate.getUTCMinutes()
                  var mined     = addzero(mins)
                  var allezTime = houred+":"+mined
                  var allezDate = new DateOnly(allezDate).toISOString()
                  traget.create({
                    userid      : req.session.user._id,
                    nom         : req.session.user.nom,
                    prenom      : req.session.user.prenom,
                    depart      : req.session.aller1.depart,
                    etape       : req.session.aller1.etape,
                    dest        : req.session.aller1.dest,
                    date_object : req.session.aller1.allezDate,
                    allezDate   : allezDate,
                    allezTime   : allezTime,
                    places      : car.places,
                    car         : car.car,
                    description : desc
                  }, function (error , traget1) {
                    if (error) res.render("aller1", {user:req.session.user, error: error});
                    if (traget1) {
                      var retourDepartDate = new Date(req.body.retourDepartDate)
                      var hour             = retourDepartDate.getUTCHours()
                      var houred           = addzero(hour)
                      var mins             = retourDepartDate.getUTCMinutes()
                      var mined            = addzero(mins)
                      var allezTime        = houred+":"+mined // retreive the time in a string format
                      var retourDepartDate = new DateOnly(retourDepartDate).toISOString() // date in string format
                      traget.create({
                        userid      : req.session.user._id,
                        nom         : req.session.user.nom,
                        prenom      : req.session.user.prenom,
                        depart      : req.session.aller1.dest,
                        etape       : req.session.aller1.etape,
                        dest        : req.session.aller1.depart,
                        date_object : req.body.retourDepartDate, // date object for later aggregation
                        allezDate   : retourDepartDate, // date in string format
                        allezTime   : allezTime, // time in string format
                        places      : car.places,
                        car         : car.car,
                        description : desc
                      }, function (error, traget2) {
                        if (error) res.render("propBoth2", {user: req.session.user, error: error});
                        else if (traget2) res.render("success", {traget: traget1, user: req.session.user, traget2: traget2});
                      });
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
  }
});

// test add car
app.get("/testcar", function (req,res) {
    cars.create({
      mat:            "0000",
      model:          "C4",
      places:          4,
      etablissement:  "Motpellier",
      rattachement:   "Example"
  },function (error, suc1) {
    if (error) res.render("error", {error: error});
    if (suc1) {
      console.log(suc1);
      cardispo.create({
        brand_new : true,
        car       : suc1.mat,
        etab      : suc1.etablissement,
        places    : suc1.places
      }, function (error, suc2) {
        if (error) res.render("error", {error: error});
        else if(suc2) {
          console.log(suc2);
          res.render("error", {error: "Success"});
        }
      });
    }
  });
});

//login
app.post('/login', function(req,res){
  if (req.body.submit){
    user.findOne({
      email: req.body.email
    }, function(error,user){
      if (error) res.render('error', {error:error});
      if (user){ if (bcrypt.compareSync(req.body.pass, user.pass)) {
        req.session.user = user;
        console.log(req.session.user);
        if (req.session.redire){
          console.log("[+] redirection: "+req.session.redire);
          res.redirect(req.session.redire);
        }else {
          console.log("redirecting to profile");
          res.redirect('/profile');
        }
      }else {
        res.render('notlogged',{ps:"ces coordonnés sont fausses, réessayez"});
      }}else {
        res.render("notlogged",{ps:"cet email n'existe pas"})
      }
    });
    };
  });

//register
app.post('/register', function(req,res){
  if (req.body.password == req.body.confirm){
    var hashedpass = bcrypt.hashSync(req.body.password, 10);
    user.create({
      nom         : req.body.nom,
      prenom      : req.body.prenom,
      email       : req.body.email,
      pass        : hashedpass,
      year        : req.body.year,
      number      : req.body.number,
      facebook    : req.body.facebook,
      bestdepart  : req.body.bestdepart,
      bestdest    : req.body.bestdest

    }, function(error, user){
      if (error){ res.render('register', {ps:"cet email est déja utilisé !"});}
      else {
        req.session.user = user;
        res.redirect('/profile');
      }
    });
  }else {
  res.render('register', {ps:"please confirm your password carefully"});
  }
});
//update profile
app.post('/update', function (req,res) {
  if (req.body.submit){
    console.log(req.session.user._id);
    user.findOneAndUpdate({_id: req.session.user._id},{$set:{
      nom        : req.body.nom,
      prenom     : req.body.prenom,
      year       : req.body.year,
      number     : req.body.number,
      facebook   : req.body.facebook,
      bestdepart : req.body.bestdepart,
      bestdest   : req.body.bestdest
    }},{ new: true }, function (err, result) {
      console.log(result);
      if (err) res.render('error', {error:err});
      if (result) {
        req.session.user = result;
        console.log("updating profile :"+req.session.user);
        reserver.find({proposerid: req.session.user._id}, function (error,reservation) {
          if (error) res.render('error', {error: error});
          console.log(reservation);
          if (reservation) res.render('profile', {user:req.session.user, reservations:reservation});
        });
      }
    });
  }
});

// ######[Functions]#########

//function to delete the redirect to session
function rmredire(req,res){
  if (req.session.redire){
    delete req.session.redire;
  }
}

// function to find dates between two dates
var getDates = function(startDate, endDate) {
  startDate.setDate(startDate.getDate()+1);
  var dates = [],
      currentDate = startDate,
      //currentDate.setDate(currentDate.getDate()+1),
      addDays = function(days) {
        var date = new dateOnly(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
  while (currentDate < endDate) {
    dates.push(currentDate);
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
};

function removeDuplicates(arr){
    let unique_array = []
    for(let i = 0;i < arr.length; i++){
        if(unique_array.indexOf(arr[i]) == -1){
            unique_array.push(arr[i])
        }
    }
    return unique_array
}

//listen
console.log("listening on port 3000");
server.listen(80);

// #########[sockets]#######
var io = require('socket.io')(server);
io.sockets.on('connection', function(socket){
  console.log('user connected');
  socket.on('reserver', function (data) {
    console.log("reservation");
    //traget
    var tragetid = data.tragetid;
    var destination = data.destination;
    var depart = data.depart;
    var date = data.date;
    //proposer
    var proposerid = data.proposerid;
    var proposername = data.proposername;
    //reserver credentials
    var reserverid = data.reserverid;
    var reservername = data.reservername;

    // trouver si il a déja fait une reservation
    reserver.create({
      //traget
      tragetid: tragetid,
      depart: depart,
      destination: destination,
      date: date,
      //proposer
      proposerid: proposerid,
      proposername: proposername,
      //reserver
      reserverid: reserverid,
      reservername: reservername,
      reserved: false
    }, function (error, data) {
      if (error) socket.emit('error', error);
      if (data) socket.emit('success', tragetid);
    });
  });
  socket.on('accepter', function (data) {
    var tragetid = data.tragetid;
    var reserveid = data.reserveid;
    traget.findOneAndUpdate({$and: [{_id: tragetid}, {places:{$ne: 0}}]}, {$inc:{places: -1}},{new:true}, function (error,newtraget) {
      if (error) socket.emit('error', error);
      if (newtraget) {
        if(newtraget == ''){
          socket.emit('full',reserveid);
        }else{
            reserver.findOneAndUpdate({_id: reserveid}, {$set:{reserved: true}},{new: true}, function (err, up) {
            if (err) socket.emit('error', {error: err});
            if (up) socket.emit('success', reserveid);
          });
        }}
      });
    });
  });

// add 0 to time number
function addzero(num) {
  var numStr = num.toString()
  if (numStr.length == 1) {
    numStr = "0"+numStr
  }
  return numStr
}
