let userService

/**
 * 
 * @param {*} router - assign routes and endpoint functions for each route to this object.
 * @param {*} expressApp - an instance of the express app. By applying expressApp.oauth.grant()
 *      method to an endpoint, the endpoint will return an OAuthAccessToken object to the client.
 * @param {*} injectedUserService - an injected userService object to handle all user related routes.
 */
module.exports = (router, expressApp, injectedUserService) => {
    userService = injectedUserService

    /**
     * The route a client calls to create a new user.
     */
    router.get('/', expressApp.oauth.authenticate(), getMe);

    router.patch('/', expressApp.oauth.authenticate(), updateMe);

    return router;
}

async function getMe(req, res) {
    const userId = res.locals.oauth.token.user_id;
    var user = await userService.getUser(userId);    
    
    if (user) {
        res.send(user);
    } else {
        res.code(404).send();
    }
}

async function updateMe(req, res, next) {
    try {
        const userId = res.locals.oauth.token.user_id;
        const oauthUser = res.locals.oauth.token.user;

        console.log(`userId: ${userId}`);

        var user = req.body;
        
        user._id = userId;
        var updatedUser = await userService.updateUser(user);
        res.send(updatedUser);
    } catch (e) {
        next(e)
    }

}