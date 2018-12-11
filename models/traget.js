var mongoose = require('mongoose');
var DateOnly = require('date-only');
var Schema   = mongoose.Schema;

var tragetSchema = new Schema ({
  userid:     {type: String, required: true},
  nom:        {type: String, required: true},
  prenom:     {type: String, required: true},
  depart:     {type: String, required: true},
  etape:      {type: String, required: false},
  dest:       {type: String, required: true},
  allezDate:  {type: String, required: true},
  allezTime:  {type: String, required: true},
  places:     {type: Number, required: false, default:4},
  email:      {type: String, required: false},
  num:        {type: Number},
  facebook:   {type: String, required: false},
  car:        {type: String, required: true}, //moyenne de transport
  description:{type: String}
});

module.exports = mongoose.model('traget', tragetSchema);
