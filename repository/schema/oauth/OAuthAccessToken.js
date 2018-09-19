"use strict";

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OAuthAccessTokenSchema = new Schema({
    access_token: String,
    client_id: String,
    expires: Date,
    scope: String,
    user_id: String
});

module.exports = mongoose.model("OAuthAccessToken", OAuthAccessTokenSchema);