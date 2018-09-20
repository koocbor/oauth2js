let userService;

const getMe = async (req, res, next) => {
  try {
    const userId = res.locals.oauth.token.user_id;
    const user = await userService.getUser(userId);

    if (user) {
      res.send(user);
    } else {
      res.code(404).send();
    }
  } catch (e) {
    console.log(`getMe err: ${e}`);
    next();
  }
};

const updateMe = async (req, res, next) => {

};

module.exports = (injectedOAuthServer, injectedUserService) => {
  userService = injectedUserService;
  const authenticateScope = { scope: 'urn:teambuildr:me' };

  return {
    get: [injectedOAuthServer.authenticate(authenticateScope), getMe],
    patch: [injectedOAuthServer.authenticate(authenticateScope), updateMe],
  };
};
