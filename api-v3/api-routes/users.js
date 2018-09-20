let userService;

const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    res.send(users);
  } catch (e) {
    console.log(`getUsers err: ${e}`);
    next(e);
  }
};

module.exports = (injectedOAuthServer, injectedUserService) => {
  userService = injectedUserService;
  const authenticateScope = { scope: 'urn:teambuildr:admin' };

  return {
    get: [injectedOAuthServer.authenticate(authenticateScope), getUsers],
  };
};
