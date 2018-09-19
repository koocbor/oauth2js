// app.js
const fs = require('fs');
const mongooseConnection = require('./repository/db')

// Setup database repository later
const authDb = require('./repository/authdb')(mongooseConnection)
const userDb = require('./repository/userdb')(mongooseConnection)

// Setup service layer - injecting any necessary repository instances.
const authService = require('./service/authService')(authDb, userDb);
const userService = require('./service/userService')(userDb);

// Setup any metadata that must be in place for the application to work.
const startup = require('./startup')(authService);
startup.seed();

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true }));

// Create oAuth server layer using
const oAuthServer = require('express-oauth-server');
const oAuthModel = require('./oauth/oauthModel')(authService, userService);
app.oauth = new oAuthServer({
    debug: true,
    model: oAuthModel,
    grants: [ 'password', 'refresh_token' ],
    allowExtendedTokenAttributes: true, 
    alwaysIssueNewRefreshToken: true, 
    requireClientAuthentication: {}, 
    accessTokenLifetime:1800,
    refreshTokenLifetime: 3600
})

app.use("/oauth/token", app.oauth.token()); 

const authController = require('./controller/authController')(express.Router(), app, userService);
app.use('/auth', authController)

const meController = require('./controller/meController')(express.Router(), app, userService);
app.use('/me', meController)

const usersController = require('./controller/usersController')(express.Router(), app, userService);
app.use('/users', usersController)

app.get('/', function(req, res) {
    res.send('Success in calling an endpoint.');
})

module.exports = app;