const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  client_id: String,
  expires: Date,
  refresh_token: String,
  scope: String,
  user_id: String,
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
