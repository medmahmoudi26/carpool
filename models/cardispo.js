const mongoose = require('mongoose');
var DateOnly   = require("date-only");
var Schema     = mongoose.Schema;

var Cardispo = new Schema ({
  car:       {type: String, required:true},
  startDate: {type: Date, required:false},
  endDate:   {type: Date},
  dispo:     {type: Boolean, required: true},
  startTime: {type: String, required:false},
  endTime:   {type: String, required:false},
  etab:      {type: String, required:false}
});

module.exports = mongoose.model("cardispo", Cardispo);
