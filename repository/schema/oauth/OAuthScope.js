'use strict';

var mongoose = require('mongoose');

var OAuthScopeSchema = new mongoose.Schema({
    scope: String,
    is_default: { type: Boolean, default: false },
});

module.exports = mongoose.model('OAuthScope', OAuthScopeSchema);