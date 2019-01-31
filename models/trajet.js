var mongoose = require('mongoose');
var DateOnly = require('date-only');
var Schema   = mongoose.Schema;

var trajetSchema = new Schema ({
  userid      : {type: String, required: true},
  nom         : {type: String, required: true},
  prenom      : {type: String, required: true},
  depart      : {type: String, required: true},
  etape       : {type: String, required: false},
  dest        : {type: String, required: true},
  date_object : {type: Date, required: true}, // date in object format for comparisions
  allezDate   : {type: String, required: true}, // date yyyy-mm-dd string format for output
  allezTime   : {type: String, required: true}, // time in 00:00 string format for output
  places      : {type: Number, required: false, default:4},
  car         : {type: String, required: true}, //moyenne de transport
  description : {type: String}
});

module.exports = mongoose.model('trajet', trajetSchema);
