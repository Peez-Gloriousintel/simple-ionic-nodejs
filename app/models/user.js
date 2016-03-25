var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Users', new Schema({
  username: { type: String, unique: true },
  passwd: String,
  email: { type: String, unique: true},
  firstname: String,
  lastname: String,
  qrcode: String,
}));
