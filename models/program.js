var mongoose = require('../db');
var Schema = mongoose.Schema;

var programSchema = new Schema({  
  name: { type: String },
}, {timestamps: true});

module.exports = mongoose.model('Program', programSchema);
