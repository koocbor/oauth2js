const OAuthAccessToken = require('./schema/oauth/OAuthAccessToken');
const OAuthAuthorizationCode = require('./schema/oauth/OAuthAuthorizationCode');
const OAuthClient = require('./schema/oauth/OAuthClient');
const OAuthRefreshToken = require('./schema/oauth/OAuthRefreshToken');

async function createAccessToken(accessTokenEntity) {
  return accessTokenEntity.save();
}

async function createAuthorizationCode(authCodeEntity) {
  return authCodeEntity.save();
}

async function createRefreshToken(refreshTokenEntity) {
  return refreshTokenEntity.save();
}

/**
 * Removes the OAuthAuthorizationCode object with the authorization_code
 * matching the passed authorizationCode
 * parameter.
 * @param {String} authorizationCode - The code string value to remove
 */
async function deleteAuthorizationCode(authorizationCode) {
  return OAuthAuthorizationCode.fineOneAndRemove({ authorization_code: authorizationCode });
}

async function deleteRefreshToken(refreshToken) {
  // eslint-disable-next-line no-underscore-dangle
  return OAuthRefreshToken.findOneAndRemove({ _id: refreshToken._id });
}

async function getAccessToken(bearerToken) {
  const token = await OAuthAccessToken.findOne({ access_token: bearerToken });
  if (!token) {
    return null;
  }
  token.client = await OAuthClient.findById(token.client_id);
  return token;
}

async function getAuthorizationCode(code) {
  const authCode = await OAuthAuthorizationCode.findOne({ authorization_code: code });
  if (!authCode) {
    return null;
  }
  authCode.client = await OAuthClient.findById(authCode.client_id);
  return authCode;
}

async function getRefreshToken(refreshToken) {
  const token = await OAuthRefreshToken.findOne({ refresh_token: refreshToken });
  token.client = await OAuthClient.findById(token.client_id);
  return token;
}

async function getClient(clientId) {
  return OAuthClient.findOne({ client_id: clientId });
}

/**
 * Saves the passed client. If one exists it is updated, if none exists a new
 * client is created.
 * @param {Object} oauthClientEntity - The oauthClient to save
 */
async function saveClient(oauthClientEntity) {
  const existingClient = await OAuthClient.findOne({ client_id: oauthClientEntity.client_id });
  if (existingClient) {
    existingClient.client_id = oauthClientEntity.client_id;
    existingClient.client_secret = oauthClientEntity.client_secret;
    existingClient.redirect_uri = oauthClientEntity.redirect_uri;
    existingClient.grants = oauthClientEntity.grants;
    existingClient.app_name = oauthClientEntity.app_name;
    existingClient.website = oauthClientEntity.website;
    existingClient.description = oauthClientEntity.description;
    existingClient.logo = oauthClientEntity.logo;
    existingClient.user_id = oauthClientEntity.user_id;
    // eslint-disable-next-line no-underscore-dangle
    await OAuthClient.findOneAndUpdate({ _id: existingClient._id }, existingClient);
  } else {
    oauthClientEntity.save();
  }
}

module.exports = {
  createAccessToken,
  createAuthorizationCode,
  createRefreshToken,
  deleteAuthorizationCode,
  deleteRefreshToken,
  getAccessToken,
  getAuthorizationCode,
  getRefreshToken,
  getClient,
  saveClient,
};
