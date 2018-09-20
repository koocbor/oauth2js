// app.js
const express = require('express');
const OAuthServer = require('express-oauth-server');
const bodyParser = require('body-parser');
require('./repository/db');

// Setup database repository later
const authDb = require('./repository/authdb');
const userDb = require('./repository/userdb');

// Setup service layer - injecting any necessary repository instances.
const authService = require('./service/authService')(authDb, userDb);
const userService = require('./service/userService')(userDb);

const oAuthModel = require('./oauth/oauthModel')(authService, userService);

// Setup any metadata that must be in place for the application to work.
const startup = require('./startup')(authService);

startup.seed();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create oAuth server layer using

app.oauth = new OAuthServer({
  debug: true,
  model: oAuthModel,
  grants: ['password', 'refresh_token'],
  allowExtendedTokenAttributes: true,
  alwaysIssueNewRefreshToken: true,
  requireClientAuthentication: {},
  accessTokenLifetime: 1800,
  refreshTokenLifetime: 3600,
});

app.use('/oauth/token', app.oauth.token());

const authController = require('./controller/authController')(express.Router(), app, userService);
const meController = require('./controller/meController')(express.Router(), app, userService);
const usersController = require('./controller/usersController')(express.Router(), app, userService);

app.use('/auth', authController);
app.use('/me', meController);
app.use('/users', usersController);

app.get('/', (req, res) => {
  res.send('Success in calling an endpoint.');
});

module.exports = app;
