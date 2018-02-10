const mongoose = require('../db/mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    required: true,
    type: String,
    validate: validator.isEmail
  }
});

UserSchema.statics.findByEmail = function (email) {
  return this.findOne({email: email});
}

UserSchema.statics.verify = function (token) {
  try {
    let decoded = jwt.verify(token, 'private.key');
    return this.findById(decoded.id);
  } catch (e) {
    return Promise.reject(e);
  }
}

UserSchema.methods.generateToken = function () {
  return jwt.sign({
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
    id: this._id.toString()
  }, 'private.key');
}

module.exports = mongoose.model('User', UserSchema);
