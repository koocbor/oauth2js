'use strict';

var mongoose = require('mongoose');

var OAuthAuthorizationCodeSchema = new mongoose.Schema({
    authorization_code: String,
    client_id: String,
    expires: Date,
    redirect_uri: String,
    scope: String,
    user_id: String,
});

module.exports = mongoose.model('OAuthAuthorizationCode', OAuthAuthorizationCodeSchema);