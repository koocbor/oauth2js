var Promise = require('bluebird');
var OAuthAccessToken = require('./schema/oauth/OAuthAccessToken');
var OAuthClient = require('./schema/oauth/OAuthClient');

let mongoConnection;

module.exports = injectedMongoConnection => {
    monogConnection = injectedMongoConnection
    
    return {
        createAccessToken: createAccessToken,
        getAccessToken: getAccessToken,
        getClient: getClient
    }
}

function createAccessToken(accessToken) {
    return new Promise(function(resolve, reject) {

    });
}

function getAccessToken(bearerToken) {
    return new Promise(function(resolve, reject) {
        OAuthAccessToken.findOne( { access_token: bearerToken })
        .populate("OAuthClient")
        .then(accessToken => {
            console.log(`getAccessToken: ${accessToken}`)

            if (!accessToken) {
                reject(`invalid token`);
            } else {
                resolve(accessToken);
            }
        })
        .catch(e => { 
            reject(e); 
        })
    })
}

// TODO: Actually return a real client
function getClient(clientId) {
    return new Promise(function(resolve, reject) {
        var tempClient = new OAuthClient( {
            client_id: clientId,
            client_secret: 'secret',
            redirect_uri: null,
            grants: [ 'password' ]
        })
        resolve(tempClient);
    });
}