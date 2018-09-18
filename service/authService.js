var utils = require('./utils');

/**
 * An injected repository to handle auth related database functions
 */
let authDb
let userDb

module.exports = (injectedAuthDb, injectedUserDb) => {
    authDb = injectedAuthDb
    userDb = injectedUserDb

    return {
        getAccessToken: getAccessToken,
        getClient: getClient,
        modifyAccessTokenWithUser: modifyAccessTokenWithUser,
        saveAccessToken: saveAccessToken,
    }
}

async function getAccessToken(bearerToken) {
    return await authDb.getAccessToken(bearerToken);
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

async function modifyAccessTokenWithUser(accessToken) {
    if (accessToken.user_id) {
        var user = await userDb.getUserById(accessToken.user_id);
        accessToken.user = user;
    }
    return accessToken;
}

async function saveAccessToken(accessToken) {
    
}