'use strict';

var mongoose = require('mongoose')

var RefreshTokenSchema = new mongoose.Schema({
  client_id: String,
  expires: Date,
  refresh_token: String,
  scope:  String,
  user_id: String
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);