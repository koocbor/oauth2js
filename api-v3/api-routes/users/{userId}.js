let userService;

const getUser = async (req, res, next) => {
  try {
    const id = req.params.userId;
    const user = await userService.getUser(id);
    res.send(user);
  } catch (e) {
    console.log(`getUser err: ${e}`);
    next(e);
  }
};

module.exports = (injectedOAuthServer, injectedUserService) => {
  userService = injectedUserService;
  const authenticateScope = { scope: 'urn:teambuildr:admin' };

  return {
    // parameters: [
    //   {
    //     in: 'path',
    //     name: 'userId',
    //     required: true,
    //     type: 'string',
    //   },
    // ],
    get: [injectedOAuthServer.authenticate(authenticateScope), getUser],
  };
};
