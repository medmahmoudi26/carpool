//require packages
const express = require('express');
const BodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var datesBetween = require("dates-between");
var DateOnly = require("date-only");

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
  if (!req.session.user) res.redirect("notlogged");
  if(req.body.depart && req.body.dest && req.body.date){
    // find allant
    traget.find({
      depart:    req.body.depart,
      dest:      req.body.dest,
      allezDate: new DateOnly(req.body.date).toISOString() // date is stored in string format in the tragets schema
    }, function(error, allant){
      if (error) res.render('error', {error: error});
      // transfer date object to iso string
      if (allant.allezDate) allant.allezDate = allant.allezDate.toISOString();
      // find en etap
      traget.find({
        etape:      req.body.depart,
        dest:       req.body.dest,
        allezDate:  new DateOnly(req.body.date)
      }, function (error, etape) {
        if (error) res.render('error',{error: error});
        if (req.session.user){
          //transfer date object to iso string
          if (etape.allezDate)  etape.allezDate = etape.allezDate.toISOString();
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
  var allezDate   = new DateOnly(req.body.allezDate);
  var finDate     = new DateOnly(req.body.finDate);
  var allezTime   = req.body.allezTime; // matin ou apres midi
  var finTime     = req.body.finTime; // matin ou apres midi
  var etab        = req.body.etab // etablissement
  // if date of start is bigger than the final date tell error
  if (allezDate > finDate) res.render("allerProp1", {user: req.session.user, error: "les dates ne sont pas valides"});
  cardispo.find({
    $or : [
      {
        dispo: true,
        etab: etab
      },
      {
        dispo: false,
        $or: [
          {endDate : {$lte: allezDate}, endTime: {$ne: allezTime}},
          {startDate : {$gte: finDate}, startTime: {$ne: finTime}}
        ],
        etab: etab
    }]
  }, function (error, cars) {
    console.log("[+] Finding car")
    if (error) res.render("allerProp1", {user: req.session.user, error:error});
    if (cars) {
      // the body request will be in session to be included
      // in databse once the rest of the information is done
      req.session.aller1 = req.body;
      console.log(req.body);
      res.render("allerProp2", {user:req.session.user, aller1: req.body, cars:cars });
    }
  });
});

// step 2 of reserving a path
app.post("/aller2", function (req,res) {
  if (!req.session.aller1) res.redirect("/proposer");
  var car   = req.body.car;
  var desc  = req.body.desc;
  cardispo.findOneAndUpdate({car: car}, {$set: {dispo: false}},function (error, suc1) {
    if (error) {
      delete req.session.aller1;
      res.render("allerProp2", {error: "une erreur s'est survenue, réessayer", user:req.session.user});
    }
    else if (suc1) {
      console.log("[ + ] car set to non dispo")
      cardispo.create({
        car:        car,
        startDate:  req.session.aller1.allezDate,
        endDate:    req.session.aller1.finDate,
        dispo:      false,
        startTime:  req.session.aller1.allezTime,
        endTime:    req.session.aller1.finTime,
        etab:       req.session.aller1.etab
      }, function (error, suc2) {
        if (error) {
          delete req.session.aller1;
          res.render("allerProp2", {error: "Une erreur s'est produite", user: req.session.user});
        }
        else if (suc2) {
          console.log("[ + ] New cardispo created");
          cars.findOne({mat: car}, function (error, found) {
            if (error) {
              delete req.session.aller1;
              res.render("allerProp2", {error: "une erreure s'est produite", user: req.session.user});
            }
            else if (found) {
              var places    = found.places;
              var allezDate = new DateOnly(req.session.aller1.allezDate).toISOString(); // traget date should be string
              traget.create({
                userid:      req.session.user._id,
                nom:         req.session.user.nom,
                prenom:      req.session.user.prenom,
                depart:      req.session.aller1.depart,
                etape:       req.session.aller1.etape,
                dest:        req.session.aller1.dest,
                allezDate:   allezDate,
                allezTime:   req.session.aller1.allezTime, // matin ou apresmidi
                places:      places,
                email:       req.session.user.email,
                num:         req.session.user.number,
                facebook:    req.session.user.facebook,
                car:         car, //mat of the car
                description: desc
              }, function(error, success){
                console.log(success);
                delete req.session.aller1;
                if (error) res.render('allerProp1', {error:"Une erreur s'est produite lors de la création de votre trajet"});
                else if(success) {
                  res.render('success', {elmnt: success, user:req.session.user});
                }
              });
            }
          });
        }
      });
    }
  });
});

//proposer aller&retour step 1
app.post("/aller&retour1", function (req,res) {
  if (!req.session.user) res.redirect("notlogged");
  var allezDate   = new DateOnly(req.body.allezDate);
  var finDate     = new DateOnly(req.body.finDate);
  var allezTime   = req.body.allezTime; // matin ou apres midi
  var finTime     = req.body.finTime; // matin ou apres midi
  var etab        = req.body.etab
  // if date of start is bigger than the final date tell error
  if (allezDate > finDate) res.render("propBroth1", {user: req.session.user, error: "les dates ne sont pas valides"});
  cardispo.find({
    $or : [
      {
        dispo: true,
        etab: etab
      },
      {
        dispo: false,
        $or: [
          {endDate : {$lte: allezDate}, endTime: {$ne: allezTime}},
          {startDate : {$gte: finDate}, startTime: {$ne: finTime}}
        ],
        etab: etab
    }]
  }, function (error, cars) {
    console.log("[+] Finding car ");
    if (error) res.render("propBroth1", {user: req.session.user, error:error});
    if (cars) {
      // the body request will be in session to be included
      // in databse once the rest of the information is done
      req.session.allerRetour = req.body;
      console.log(req.body);
      res.render("propBoth2", {user:req.session.user, allerRetour: req.body, cars:cars });
    }
  });
});

// step 2 of reserving a path aller&retour
app.post("/aller&retour2", function (req,res) {
  if (!req.session.user) res.redirect("notlogged");
  if (!req.session.allerRetour) res.redirect("/proposer");
  var car   = req.body.car;
  var desc  = req.body.desc;
  // if the car was free set it to busy
  cardispo.findOneAndUpdate({car: car}, {$set: {dispo: false}},function (error, suc1) {
    if (error) {
      delete req.session.allerRetour;
      res.render("propBoth1", {error: "une erreur s'est survenue, réessayer", user:req.session.user});
    }
    else if (suc1) {
      // if car set to non dispo create aller traget
      console.log("[ + ] car set to non dispo")
      // make car busy in the period the user is using the car
      cardispo.create({
        car:        car,
        startDate:  req.session.allerRetour.allezDate,
        endDate:    req.session.allerRetour.finDate,
        dispo:      false,
        startTime:  req.session.allerRetour.allezTime,
        endTime:    req.session.allerRetour.finTime,
        etab:       req.session.allerRetour.etab
      }, function (error, suc2) {
        if (error) {
          delete req.session.allerRetour;
          res.render("propBoth1", {error: "Une erreur s'est produite", user: req.session.user});
        }
        else if (suc2) {
          // if car set to non dispo for a period of time find details of the chosen car
          console.log("[ + ] New cardispo created");
          cars.findOne({mat: car}, function (error, found) {
            if (error) {
              delete req.session.allerRetour;
              res.render("propBoth1", {error: "une erreure s'est produite", user: req.session.user});
            }
            else if (found) {
              var places    = found.places; // find the number of places the car can hold
              var allezDate = new DateOnly(req.session.allerRetour.allezDate).toISOString(); // aller depart date should be string
              traget.create({
                userid:      req.session.user._id,
                nom:         req.session.user.nom,
                prenom:      req.session.user.prenom,
                depart:      req.session.allerRetour.depart,
                etape:       req.session.allerRetour.etape,
                dest:        req.session.allerRetour.dest,
                allezDate:   allezDate,
                allezTime:   req.session.allerRetour.allezTime, // matin ou apresmidi
                places:      places,
                email:       req.session.user.email,
                num:         req.session.user.number,
                facebook:    req.session.user.facebook,
                car:         car, //mat of the car
                description: desc
              }, function(error, traget1){
                if (error) {
                  // if error delete session
                  delete req.session.allerRetour;
                  res.render("propBoth1", {user: req.session.user, error: "une erreur s'est produite"});
                }
                // if aller traget created start the retour traget
                console.log(traget1);
                var finDate = new DateOnly(req.session.allerRetour1.finDate).toISOString(); // retour depart date should be string(the final date will be the depart date)
                traget.create({
                  userid:      req.session.user._id,
                  nom:         req.session.user.nom,
                  prenom:      req.session.user.prenom,
                  depart:      req.session.allerRetour.dest, // inverse depart to be destination
                  etape:       req.session.allerRetour.etape,
                  dest:        req.session.allerRetour.depart, // inverse destination to be depart
                  allezDate:   finDate,
                  allezTime:   req.session.allerRetour.retourDepartTime, // quand partez vous matin ou apresmidi
                  places:      places,
                  email:       req.session.user.email,
                  num:         req.session.user.number,
                  facebook:    req.session.user.facebook,
                  car:         car, //mat of the car
                  description: desc
                }, function(error, traget2) {
                  if (error) {
                    delete req.session.allerRetour;
                    res.render("propBoth1", {error: "Une erreur s'est produite lors de le caréation du deusieme trajet", user: req.session.user});
                  }
                  else if (traget2) {
                    delete req.session.allerRetour;
                    res.render("success", {elmnt: traget1, traget2: traget2, user: req.session.user});
                  }
                });
              });
            }
          });
        }
      });
    }
  });
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
        car: suc1.mat,
        etab: suc1.etablissement,
        dispo: true
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
      nom: req.body.nom,
      prenom: req.body.prenom,
      email: req.body.email,
      pass: hashedpass,
      year: req.body.year,
      number: req.body.number,
      facebook: req.body.facebook
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
      nom: req.body.nom,
      prenom: req.body.prenom,
      year: req.body.year,
      number: req.body.number,
      facebook: req.body.facebook
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


//listen
console.log("listening on port 3000");
server.listen(80);

// socket
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
