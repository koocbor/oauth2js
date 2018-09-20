const OAuthAccessTokenEntity = require('../repository/schema/oauth/OAuthAccessToken');
const OAuthAuthorizationCodeEntity = require('../repository/schema/oauth/OAuthAuthorizationCode');
const OAuthClientEntity = require('../repository/schema/oauth/OAuthClient');
const OAuthRefreshTokenEntity = require('../repository/schema/oauth/OAuthRefreshToken');

/**
 * An injected repository to handle auth related database functions
 */
let authDb;
let userDb;

async function modifyAccessTokenWithUser(accessToken) {
  const returnAccessToken = accessToken;
  if (accessToken.user_id) {
    const user = await userDb.getUserById(accessToken.user_id);
    returnAccessToken.user = user;
  }
  return returnAccessToken;
}

async function modifyRefreshTokenWithUser(refreshToken) {
  const returnRefreshToken = refreshToken;
  if (refreshToken.user_id) {
    const user = await userDb.getUserById(refreshToken.user_id);
    returnRefreshToken.user = user;
  }
  return returnRefreshToken;
}

/**
 * @param {String} authorizationCode - The string authorizationCode
 */
async function deleteAuthorizationCode(authorizationCode) {
  return authDb.deleteAuthorizationCode(authorizationCode);
}

async function deleteRefreshToken(refreshToken) {
  return authDb.deleteRefreshToken(refreshToken);
}

/**
 * @param {String} bearerToken - the token string passed in the request
 * @returns {Promise} - the OAuthAccessToken
 */
async function getAccessToken(bearerToken) {
  return authDb.getAccessToken(bearerToken)
    .then(token => modifyAccessTokenWithUser(token))
    .catch((e) => {
      console.error(`getAccessToken err: ${e}`);
      return null;
    });
}

async function getAuthorizationCode(code) {
  return authDb.getAuthorizationCode(code);
// .then(authCode => _modifyAuthorizationCodeWithUser(authCode))
// .catch((e) => {
//   console.error(`getAuthorizationCode err: ${e}`);
//   return null;
// });
}

async function getRefreshToken(refreshToken) {
  return authDb.getRefreshToken(refreshToken)
    .then(token => modifyRefreshTokenWithUser(token))
    .catch((e) => {
      console.error(`getRefreshToken err: ${e}`);
      return null;
    });
}

/**
 * @param {String} clientId - the client id
 * @param {String} clientPassword - the client password
 * @returns {OAuthClient}
 */
async function getClient(clientId) {
  return authDb.getClient(clientId);
}

/**
 * @param {Object} token - The auth token received from the OAuth2 server.
 * @param {Object} client - The client used to create the access token.
 * @param {Object} user - The user the token is for.
 */
async function saveAccessToken(token, client, user) {
  // TODO: Create method to generate approrpiate scope for user.
  let teambuildrScope = `${token.scope} urn:teambuildr:me`;
  if (user.roles && user.roles.indexOf('coach') >= 0) {
    teambuildrScope += ' urn:teambuildr:coach';
  }
  if (user.roles && user.roles.indexOf('admin') >= 0) {
    teambuildrScope += ' urn:teambuildr:admin';
  }
  const accessTokenEntity = new OAuthAccessTokenEntity({
    access_token: token.accessToken,
    expires: token.accessTokenExpiresAt,
    client_id: client._id, // eslint-disable-line no-underscore-dangle
    user_id: user._id, // eslint-disable-line no-underscore-dangle
    scope: teambuildrScope,
  });
  return authDb.createAccessToken(accessTokenEntity);
}

async function saveAuthorizationCode(code, client, user) {
  const authCode = new OAuthAuthorizationCodeEntity({
    authorization_code: code.authorizationCode,
    client_id: client._id, // eslint-disable-line no-underscore-dangle
    expires: code.expiresAt,
    scope: code.scope,
    user_id: user._id, // eslint-disable-line no-underscore-dangle
  });
  return authDb.createAuthorizationCode(authCode);
}

async function saveClient(client) {
  const clientEntity = new OAuthClientEntity({
    client_id: client.client_id,
    client_secret: client.client_secret,
    redirect_uri: client.redirect_uri,
    grants: client.grants,
    app_name: client.app_name,
    website: client.website,
    logo: client.logo,
    user_id: client.user_id, // eslint-disable-line no-underscore-dangle
  });
  return authDb.saveClient(clientEntity);
}

async function saveRefreshToken(token, client, user) {
  const refreshTokenEntity = new OAuthRefreshTokenEntity({
    client_id: client._id, // eslint-disable-line no-underscore-dangle
    expires: token.refreshTokenExpiresAt,
    refresh_token: token.refreshToken,
    scope: token.scope,
    user_id: user._id, // eslint-disable-line no-underscore-dangle
  });
  return authDb.createRefreshToken(refreshTokenEntity);
}

module.exports = (injectedAuthDb, injectedUserDb) => {
  authDb = injectedAuthDb;
  userDb = injectedUserDb;

  return {
    deleteAuthorizationCode,
    deleteRefreshToken,
    getAccessToken,
    getAuthorizationCode,
    getRefreshToken,
    getClient,
    saveAccessToken,
    saveAuthorizationCode,
    saveClient,
    saveRefreshToken,
  };
};
