var Promise = require('bluebird');
var OAuthAccessToken = require('./schema/oauth/OAuthAccessToken');
var OAuthAuthorizationCode = require('./schema/oauth/OAuthAuthorizationCode');
var OAuthClient = require('./schema/oauth/OAuthClient');
var OAuthRefreshToken = require('./schema/oauth/OAuthRefreshToken');

let mongoConnection;

module.exports = injectedMongoConnection => {
    monogConnection = injectedMongoConnection
    
    return {
        createAccessToken: createAccessToken,
        createAuthorizationCode: createAuthorizationCode,
        createRefreshToken: createRefreshToken,
        deleteAuthorizationCode: deleteAuthorizationCode,
        deleteRefreshToken: deleteRefreshToken,
        getAccessToken: getAccessToken,
        getAuthorizationCode: getAuthorizationCode,
        getRefreshToken: getRefreshToken,
        getClient: getClient,
        saveClient: saveClient,
    }
}

async function createAccessToken(accessTokenEntity) {
    return await accessTokenEntity.save();
}

async function createAuthorizationCode(authCodeEntity) {
    return await authCodeEntity.save();
}

async function createRefreshToken(refreshTokenEntity) {
    console.log(refreshTokenEntity.refresh_token);
    try {
        return await refreshTokenEntity.save();
    } catch (e) {
        console.log('In a fucking error');
        console.log(e);
    }
}

/**
 * Removes the OAuthAuthorizationCode object with the authorization_code matching the passed authorizationCode
 * parameter.
 * @param {String} authorizationCode 
 */
async function deleteAuthorizationCode(authorizationCode) {
    await OAuthAuthorizationCode.fineOneAndRemove( { authorization_code: authorizationCode } );
}

async function deleteRefreshToken(refreshToken) {
    await OAuthRefreshToken.findOneAndRemove( { _id: refreshToken._id } );
}

async function getAccessToken(bearerToken) {
    let token = await OAuthAccessToken.findOne( { access_token: bearerToken })
    if (!token) {
        return null;
    }
    token.client = await OAuthClient.findById( token.client_id );
    return token;
}

async function getAuthorizationCode(code) {
    let authCode = await OAuthAuthorizationCode.findOne( { authorization_code: code });
    if (!authCode) {
        return null;
    }
    authCode.client = await OAuthClient.findById( authCode.client_id );
    return authCode;
}

async function getRefreshToken(refreshToken) {
    let token = await OAuthRefreshToken.findOne( { refresh_token: refreshToken });
    token.client = await OAuthClient.findById( token.client_id );
    return token;
}

async function getClient(clientId) {
    return await OAuthClient.findOne( { client_id: clientId });
}

/**
 * Saves the passed client. If one exists it is updated, if none exists a new
 * client is created.
 * @param {Object} oauthClientEntity 
 */
async function saveClient(oauthClientEntity) {
    var existingClient = await OAuthClient.findOne( { client_id: oauthClientEntity.client_id });
    if (existingClient) {
        oauthClientEntity._id = existingClient._id
        await OAuthClient.findOneAndUpdate( { _id: oauthClientEntity._id }, oauthClientEntity);
    } else {
        oauthClientEntity.save();
    }
}