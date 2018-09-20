const jwt = require('jsonwebtoken');

let authService;
let userService;

function generateAccessToken(client, user) {
  console.log('generateAccessToken called');
  return jwt.sign(
    {
      identity: user.username,
      client_id: client.client_id,
      user_id: user.username, // TODO: Actually store user id
    },
    'accesssecret',
  );
}

function generateRefreshToken(client, user) {
  console.log('generateRefreshToken called');
  return jwt.sign(
    {
      identity: user.username,
      client_id: client.client_id,
      user_id: user.username, // TODO: Actually store user id
    },
    'refreshsecret',
  );
}

function getAccessToken(bearerToken) {
  console.log('getAccessToken called');
  return (authService.getAccessToken(bearerToken)
    .then((accessToken) => {
      const token = accessToken;
      if (!token.user) {
        token.user = {
          id: accessToken.user_id,
        };
      }
      token.accessTokenExpiresAt = token.expires;
      token.client = token.OAuthClient;
      token.scope = token.scope;
      return token;
    })
    .catch((e) => {
      console.log(`getAccessToken error: ${e}`);
      return false;
    })
  );
}

function getAuthorizationCode(code) {
  console.log('getAuthorizationCode called');
  return (authService.getAuthorizationCode(code)
    .then((authCode) => {
      if (!authCode) {
        return false;
      }
      const reCode = {
        code,
        client: authCode.client,
        expiresAt: authCode.expires,
        redirectUri: authCode.client.redirectUri,
        user: authCode.user,
        scope: authCode.scope,
      };
      return reCode;
    })
    .catch((e) => {
      console.error(`getAuthorizationCode error: ${e}`);
    })
  );
}

/**
 * @param {String} clientId - the client_id string
 * @param {String} clientSecret - the client_secret string
 */
function getClient(clientId, clientSecret) { // eslint-disable-line no-unused-vars
  // TODO: Actually check the clientSecret matches
  console.log('getClient called');
  return (authService.getClient(clientId)
    .then(oauthClient => oauthClient)
    .catch((e) => {
      console.error(`getClient error: ${e}`);
      return false;
    })
  );
}

function getRefreshToken(refreshToken) {
  console.log('getRefreshToken called');
  if (!refreshToken || refreshToken === 'undefined') {
    return false;
  }
  return (authService.getRefreshToken(refreshToken)
    .then((savedToken) => {
      const tokenTemp = {
        user: savedToken ? savedToken.user : {},
        client: savedToken ? savedToken.client : {},
        refreshTokenExpiresAt: savedToken ? new Date(savedToken.expires) : null,
        refreshToken,
        refresh_token: refreshToken,
        scope: savedToken ? savedToken.scope : null,
      };
      return tokenTemp;
    })
    .catch((e) => {
      console.log(`getRefreshToken error: ${e}`);
      return false;
    })
  );
}

function getUser(username, password) {
  console.log('getUser called');
  return (userService.getUserByUsername(username)
    .then((user) => {
      if (user.username === username
        && user.password === password) {
        return user;
      }
      return false;
    })
    .catch((e) => {
      console.error(`getUser error: ${e}`);
      return false;
    })
  );
}

function grantTypeAllowed(clientId, grantType) { // eslint-disable-line no-unused-vars
  // TODO: Check the client is allowed the passed grant type.
  return new Promise((resolve) => {
    resolve(true);
  });
}

function revokeAuthorizationCode(code) {
  console.log('revokeAuthorizationCode called');
  return (authService.getAuthorizationCode(code.code)
    .then((authorizationCode) => {
      if (authorizationCode) {
        authService.deleteAuthorizationCode(code.code);
        return true;
      }
      return false;
    })
    .catch((e) => {
      console.error(`revokeAuthorizationCode error: ${e}`);
      return false;
    })
  );
}

function revokeToken(token) {
  console.log('revokeToken called');
  return (authService.getRefreshToken(token.refreshToken)
    .then((refreshToken) => {
      if (refreshToken) { authService.deleteRefreshToken(refreshToken); }
      const expiredToken = token;
      const now = new Date();
      expiredToken.refreshTokenExpiresAt = now.setHours(now.getHours() + 1);
      return expiredToken;
    })
    .catch((e) => {
      console.error(`revokeToken error: ${e}`);
    })
  );
}

function saveAuthorizationCode(code, client, user) {
  console.log('saveAuthorizationCode called');
  return (authService.createAuthorizationCode(code, client, user)
    .then(() => ({
      authorizationCode: code.authorizationCode,
      expiresAt: code.expiresAt,
      redirectUri: code.redirectUri,
      scope: code.scope,
      client,
      user,
    }))
    .catch((e) => {
      console.error(`saveAuthorizationCode error: ${e}`);
    })
  );
}

function saveToken(token, client, user) {
  console.log('saveToken called');
  const accessTokenPromise = authService.saveAccessToken(token, client, user);
  const refreshTokenPromise = token.refreshToken
    ? authService.saveRefreshToken(token, client, user) : {};

  return Promise.all([accessTokenPromise, refreshTokenPromise])
    .then((resultArray) => {
      const accessToken = resultArray[0];
      const refreshToken = resultArray[1];
      return {
        accessToken: accessToken.access_token,
        accessTokenExpiresAt: accessToken.expires,
        refreshToken: refreshToken.refresh_token,
        refreshTokenExpiresAt: refreshToken.expires,
        scope: accessToken.scope,
        client: { id: accessToken.client_id },
        user: { id: accessToken.user_id },
      };
    })
    .catch((e) => {
      console.error(`saveToken error: ${e}`);
      return false;
    });
}

function verifyScope(token, scope) {
  if (!token.scope) {
    return false;
  }
  const requestedScopes = scope.split(' ');
  const authorizedScopes = token.scope.split(' ');
  return requestedScopes.every(s => authorizedScopes.indexOf(s) >= 0);
}

module.exports = (injectedAuthService, injectedUserService) => {
  authService = injectedAuthService;
  userService = injectedUserService;

  return {
    generateAccessToken,
    generateRefreshToken,
    getAccessToken,
    getAuthorizationCode,
    getClient,
    getRefreshToken,
    getUser,
    grantTypeAllowed,
    revokeAuthorizationCode,
    revokeToken,
    saveAuthorizationCode,
    saveToken,
    verifyScope,
  };
};
