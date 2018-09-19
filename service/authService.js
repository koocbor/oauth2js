const utils = require('./utils');
const OAuthAccessTokenEntity = require('../repository/schema/oauth/OAuthAccessToken');
const OAuthAuthorizationCodeEntity = require('../repository/schema/oauth/OAuthAuthorizationCode');
const OAuthClientEntity = require('../repository/schema/oauth/OAuthClient');
const OAuthRefreshTokenEntity = require('../repository/schema/oauth/OAuthRefreshToken');

/**
 * An injected repository to handle auth related database functions
 */
let authDb
let userDb

module.exports = (injectedAuthDb, injectedUserDb) => {
    authDb = injectedAuthDb
    userDb = injectedUserDb

    return {
        deleteAuthorizationCode: deleteAuthorizationCode,
        deleteRefreshToken: deleteRefreshToken,
        getAccessToken: getAccessToken,
        getAuthorizationCode: getAuthorizationCode,
        getRefreshToken: getRefreshToken,
        getClient: getClient,
        saveAccessToken: saveAccessToken,
        saveAuthorizationCode: saveAuthorizationCode,
        saveClient: saveClient,
        saveRefreshToken: saveRefreshToken,
    }
}

/**
 * 
 * @param {String} authorizationCode - The string authorizationCode
 */
async function deleteAuthorizationCode(authorizationCode) {
    return await authDb.deleteAuthorizationCode(authorizationCode);
}

async function deleteRefreshToken(refreshToken) {
    return await authDb.deleteRefreshToken(refreshToken);
}

/**
 * 
 * @param {String} bearerToken 
 * @returns {Promise} - the OAuthAccessToken 
 */
async function getAccessToken(bearerToken) {
    return await authDb.getAccessToken(bearerToken)
        .then(token => _modifyAccessTokenWithUser(token))
        .catch(e => {
            console.error(`getAccessToken err: ${e}`);
            return null;
        })
}

async function getAuthorizationCode(code) {
    return await authDb.getAuthorizationCode(code)
        .then(authCode => _modifyAuthorizationCodeWithUser(authCode))
        .catch(e => {
            console.error(`getAuthorizationCode err: ${e}`);
            return null;
        })
}

async function getRefreshToken(refreshToken) {
    return await authDb.getRefreshToken(refreshToken)
        .then(token => _modifyRefreshTokenWithUser(token))
        .catch(e => {
            console.error(`getRefreshToken err: ${e}`);
            return null;
        })
}

/**
 * 
 * @param {String} clientId - the client id
 * @param {String} clientPassword - the client password
 * @returns {OAuthClient}
 */
async function getClient(clientId) {
    return await authDb.getClient(clientId);    
}

async function _modifyAccessTokenWithUser(accessToken) {
    if (accessToken.user_id) {
        var user = await userDb.getUserById(accessToken.user_id);
        accessToken.user = user;
    }
    return accessToken;
}

async function _modifyRefreshTokenWithUser(refreshToken) {
    if (refreshToken.user_id) {
        var user = await userDb.getUserById(refreshToken.user_id);
        refreshToken.user = user;
    }
    return refreshToken;
}

async function saveAccessToken(token, client, user) {
    var accessTokenEntity = new OAuthAccessTokenEntity({
        access_token: token.accessToken,
        expires: token.accessTokenExpiresAt,
        client_id: client._id,
        user_id: user._id,
        scope: token.scope
    });
    return await authDb.createAccessToken(accessTokenEntity);
}

async function saveAuthorizationCode(code, client, user) {
    let authCode = new OAuthAuthorizationCodeEntity({
        authorization_code: code.authorizationCode,
        client_id: client._id,
        expires: code.expiresAt,
        scope: code.scope,
        user_id: user._id
    });
    return await authDb.createAuthorizationCode(authCode);
}

async function saveClient(client) {
    var clientEntity = new OAuthClientEntity({
        client_id: client.client_id,
        client_secret: client.client_secret,
        redirect_uri: client.redirect_uri,
        grants: client.grants,
        app_name: client.app_name,
        website: client.website,
        logo: client.logo,
        user_id: client.user_id
    });
    return await authDb.saveClient(clientEntity);
}

async function saveRefreshToken(token, client, user) {
    var refreshTokenEntity = new OAuthRefreshTokenEntity({
        client_id: client._id,
        expires: token.refreshTokenExpiresAt,
        refresh_token: token.refreshToken,        
        scope: token.scope,
        user_id: user._id        
    });
    return await authDb.createRefreshToken(refreshTokenEntity);
}