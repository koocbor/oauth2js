const app = require('express')();
const bodyParser = require('body-parser');
const fs = require('fs');
const openapi = require('express-openapi');
const path = require('path');
const cors = require('cors');
const OAuthServer = require('express-oauth-server');

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

app.use(cors());
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

openapi.initialize({
  apiDoc: fs.readFileSync(path.resolve(__dirname, './api-v3/api-doc.yaml'), 'utf8'),
  dependencies: {
    injectedOAuthServer: app.oauth,
    injectedUserService: userService,
  },
  app,
  paths: path.resolve(__dirname, './api-v3/api-routes'),
});

app.use('/oauth/token', app.oauth.token());

app.use((err, req, res) => {
  res.status(err.status).json(err.message);
});

app.get('/', (req, res) => {
  res.send('Success in calling an endpoint.');
});

module.exports = app;
