const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReserverSchema = new Schema ({
  proposerid   : {type: String, required: true},
  reserverid   : {type: String, required: true},
  trajetid     : {type: String, required: true},
  destination  : {type: String, required: true},
  depart       : {type: String, required: true},
  proposername : {type: String, required: true},
  reservername : {type: String, required: true},
  date         : {type: String, requried: true},
  reserved     : {type: Boolean, required: false}
});

module.exports = mongoose.model('reserver',ReserverSchema);
