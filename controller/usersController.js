let userService;

/**
 * Return a list of all users.
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @param {*} next - function to tell middleware to execute next function
 */
async function getUsers(req, res, next) {
  try {
    const oauthUser = res.locals.oauth.token.user;
    if (oauthUser.roles == null || oauthUser.roles.filter(role => role === 'coach' || role === 'admin').length === 0) {
      res.code(401);
    } else {
      const users = await userService.getUsers();
      res.send(users);
    }
  } catch (e) {
    next(e);
  }
}

/**
 * @param {*} router - assign routes and endpoint functions for each route to this object.
 * @param {*} expressApp - an instance of the express app. By applying expressApp.oauth.grant()
 *      method to an endpoint, the endpoint will return an OAuthAccessToken object to the client.
 * @param {*} injectedUserService - an injected userService object to handle all
 *      user related routes.
 */
module.exports = (router, expressApp, injectedUserService) => {
  userService = injectedUserService;

  router.get('/', expressApp.oauth.authenticate(), getUsers);
  return router;
};
