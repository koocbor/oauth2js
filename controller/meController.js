let userService;

async function getMe(req, res, next) {
  try {
    const userId = res.locals.oauth.token.user_id;
    const user = await userService.getUser(userId);

    if (user) {
      res.send(user);
    } else {
      res.code(404).send();
    }
  } catch (e) {
    console.error(`getMe err: ${e}`);
    next(e);
  }
}

async function updateMe(req, res, next) {
  try {
    const userId = res.locals.oauth.token.user_id;
    // const oauthUser = res.locals.oauth.token.user;
    const { user } = req.body;

    user._id = userId; // eslint-disable-line no-underscore-dangle
    const updatedUser = await userService.updateUser(user);
    res.send(updatedUser);
  } catch (e) {
    console.log(`updateMe err: ${e}`);
    next(e);
  }
}

/**
 * @param {*} router - assign routes and endpoint functions for each route to this object.
 * @param {*} expressApp - an instance of the express app. By applying expressApp.oauth.grant()
 *      method to an endpoint, the endpoint will return an OAuthAccessToken object to the client.
 * @param {*} injectedUserService - an injected userService object to handle all user
 *  related routes.
 */
module.exports = (router, expressApp, injectedUserService) => {
  userService = injectedUserService;
  const authenticateScope = { scope: 'urn:teambuildr:me' };

  /**
   * The route a client calls to create a new user.
   */
  router.get('/', expressApp.oauth.authenticate(authenticateScope), getMe);
  router.patch('/', expressApp.oauth.authenticate(authenticateScope), updateMe);

  return router;
};
