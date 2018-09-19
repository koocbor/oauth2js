var _ = require('lodash');
var jwt = require("jsonwebtoken");
var OAuthAccessToken = require('../repository/schema/oauth/OAuthAccessToken');
var OAuthRefreshToken = require('../repository/schema/oauth/OAuthRefreshToken');

let authService
let userService

module.exports = (injectedAuthService, injectedUserService) => {
    authService = injectedAuthService
    userService = injectedUserService

    return {
        generateAccessToken: generateAccessToken,
        generateRefreshToken: generateRefreshToken,
        getAccessToken: getAccessToken,
        getAuthorizationCode: getAuthorizationCode,
        getClient: getClient,
        getRefreshToken: getRefreshToken,
        getUser: getUser,
        grantTypeAllowed: grantTypeAllowed,
        revokeAuthorizationCode: revokeAuthorizationCode,
        revokeToken: revokeToken,
        saveAuthorizationCode: saveAuthorizationCode,
        saveToken: saveToken,
        verifyScope: verifyScope,
    }
}

function generateAccessToken(client, user, scope) {
    console.log("generateAccessToken called");
    return jwt.sign(
        {
            identity: user.username,
            client_id: client.client_id,
            user_id: user.username  // TODO: Actually store user id
        },
        'accesssecret');
}

function generateRefreshToken(client, user, scope) {
    console.log("generateRefreshToken called");
    return jwt.sign(
        {
            identity: user.username,
            client_id: client.client_id,
            user_id: user.username  // TODO: Actually store user id
        },
        'refreshsecret');
}

function getAccessToken(bearerToken) {
    console.log(`getAccessToken called`);
    return (authService.getAccessToken(bearerToken)
        .then(accessToken => {
            var token = accessToken;
            if (!token.user) {
                token.user = {
                    id: accessToken.user_id
                };
            }
            token.accessTokenExpiresAt = token.expires;
            token.client = token.OAuthClient;
            token.scope = token.scope;
            return token;
        })
        .catch(e => {
            console.log(`getAccessToken error: ${e}`);
            return false;
        })
    );
}

function getAuthorizationCode(code) {
    console.log(`getAuthorizationCode called`);
    return (authService.getAuthorizationCode(code)
        .then(authCode => {
            if (!authCode) {
                return false;
            }
            return (reCode = {
                code: code,
                client: authCode.client,
                expiresAt: authCode.expires,
                redirectUri: authCode.client.redirectUri,
                user: authCode.user,
                scope: authCode.scope
            });
        })
        .catch(e => {
            console.error(`getAuthorizationCode error: ${e}`);
        })
    );
}   

/**
 * 
 * @param {*} clientId 
 * @param {*} clientSecret 
 * @param {*} callback 
 */
function getClient(clientId, clientSecret) {
    console.log(`getClient called`);
    return ( authService.getClient(clientId)
        .then(oauthClient => {
            return oauthClient;
        })
        .catch(e => {
            console.error(`getClient error: ${e}`);
            return false;
        })
    );
}

function getRefreshToken(refreshToken) {
    console.log(`getRefreshToken called`);
    if (!refreshToken || refreshToken === 'undefined') {
        return false;
    }
    return (authService.getRefreshToken(refreshToken)
        .then(savedToken => {
            var tokenTemp = {
                user: savedToken ? savedToken.user : {},
                client: savedToken ? savedToken.client : {},
                refreshTokenExpiresAt: savedToken ? new Date(savedToken.expires) : null,
                refreshToken: refreshToken,
                refresh_token: refreshToken,
                scope: savedToken ? savedToken.scope : null
            };
            return tokenTemp;
        })
        .catch(e => {
            console.log(`getRefreshToken error: ${e}`);
            return false;
        })
    );
}

function getUser(username, password) {
    return (userService.getUserByUsername(username)
        .then(user => {
            if (user.username == username &&
                user.password == password) {
                return user;
            } else {
                return false;
            }
        })
        .catch(e => {
            console.error(`getUser error: ${e}`);
            return false;
        })
    );
}

function grantTypeAllowed(clientId, grantType) {
    // TODO: Check the client is allowed the passed grant type.
    return new Promise((resolve, reject) => {
        resolve(true);
    });
}

function revokeAuthorizationCode(code) {
    console.log(`revokeAuthorizationCode called`);
    return (authService.getAuthorizationCode(code.code)
        .then(authorizationCode => {
            if (authorizationCode) { 
                authService.deleteAuthorizationCode(code.code) 
                return true
            } else {
                return false;
            }            
        })
        .catch(e => {
            console.error(`revokeAuthorizationCode error: ${e}`);
            return false;
        })
    );
}

function revokeToken(token) {
    console.log(`revokeToken called`);
    return(authService.getRefreshToken(token.refreshToken)
        .then(refreshToken => {
            if (refreshToken) { authService.deleteRefreshToken(refreshToken) }
            var expiredToken = token;
            var now = new Date();
            expiredToken.refreshTokenExpiresAt = now.setHours(now.getHours() + 1);
            return expiredToken;
        })
        .catch(e => {
            console.error(`revokeToken error: ${e}`);
        })
    );
}

function saveAuthorizationCode(code, client, user) {
    console.log(`saveAuthorizationCode called`);
    return (authService.createAuthorizationCode(code, client, user)
        .then(() => { return {
                authorizationCode: code.authorizationCode,
                expiresAt: code.expiresAt,
                redirectUri: code.redirectUri,
                scope: code.scope,
                client: client,
                user: user
            };
        })
        .catch(e => {
            console.error(`saveAuthorizationCode error: ${e}`);
        })
    );
}

function saveToken(token, client, user) {
    console.log('saveToken called');

    const accessToken = authService.saveAccessToken(token, client, user);
    const refreshToken = token.refreshToken ? authService.saveRefreshToken(token, client, user) : {};

    return Promise.all([accessToken, refreshToken])
    .then(resultArray => {
        console.log(resultArray);
        return _.assign(
            {
                client: client,
                user: user,
                access_token: token.accessToken,
                refresh_token: token.refreshToken
            },
            token
        );
    })
    .catch(e => {
        console.error(`saveToken error: ${e}`);
        return false;
    })
}

function verifyScope(token, scope) {
    if (!token.scope) {
        return false;
    }
    let requestedScopes = scope.split(' ');
    let authorizedScopes = token.scope.split(' ');
    return requestedScopes.every(s => authorizedScopes.indexOf(s) >= 0);
}