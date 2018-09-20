const mongoose = require('mongoose');

const OAuthClientSchema = new mongoose.Schema({
  client_id: String,
  client_secret: String,
  redirect_uri: String,
  grants: {
    type: Array,
  },
  app_name: String,
  website: String,
  description: String,
  logo: String,
  user_id: String,
});

module.exports = mongoose.model('OAuthClient', OAuthClientSchema);
