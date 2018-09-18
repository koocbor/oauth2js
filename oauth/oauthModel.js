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
        getClient: getClient,
        getUser: getUser,
        grantTypeAllowed: grantTypeAllowed,
        saveToken: saveToken,
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
        .then(accessToken => authService.modifyAccessTokenWithUser(accessToken))
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

/**
 * 
 * @param {*} clientId 
 * @param {*} clientSecret 
 * @param {*} callback 
 */
function getClient(clientId, clientSecret) {
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

function grantTypeAllowed(clientId, grantType) {
    // TODO: Check the client is allowed the passed grant type.
    return new Promise((resolve, reject) => {
        resolve(true);
    });
}

function saveToken(token, client, user) {
    console.log('saveToken called');

    const accessToken = OAuthAccessToken.create({
        access_token: token.accessToken,
        expires: token.accessTokenExpiresAt,
        OAuthClient: client._id,
        user_id: user._id,
        scope: token.scope
    });

    const refreshToken = token.refreshToken ? OAuthRefreshToken.create({
        // no refresh token for client_credentials
        refresh_token: token.refreshToken,
        expires: token.refreshTokenExpiresAt,
        OAuthClient: client._id,
        user_id: user._id,
        scope: token.scope
      }) : {};

    return Promise.all([accessToken, refreshToken])
    .then(resultArray => {
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