const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CarSchema = new Schema ({
  mat:            {type: String}, //matricule
  model:          {type: String},
  places:         {type: Number},
  remarque:       {type: String},
  etablissement:  {type: String}
});

module.exports = mongoose.model("car", CarSchema);
