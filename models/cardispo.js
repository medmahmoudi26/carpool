const mongoose = require('mongoose');
var DateOnly   = require("date-only");
var Schema     = mongoose.Schema;

var Cardispo = new Schema ({
  brand_new     : {type: Boolean, required: false}, // no start no end date exist => create dates
  car           : {type: String, required:true},
  FreeStartDate : {type: Date, required:false},    //car starts to be free
  FreeEndDate   : {type: Date, required: false},   // car no longer free
  half_dispo    : {type: Boolean, required: false}, // if only freestart exists => create freeend
  etab          : {type: String, required:false},
  places        : {type: String, required: false}
});

module.exports = mongoose.model("cardispo", Cardispo);
