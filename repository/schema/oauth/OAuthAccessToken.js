const mongoose = require('mongoose');

const OAuthAccessTokenSchema = new mongoose.Schema({
  access_token: String,
  client_id: String,
  expires: Date,
  scope: String,
  user_id: String,
});

module.exports = mongoose.model('OAuthAccessToken', OAuthAccessTokenSchema);
