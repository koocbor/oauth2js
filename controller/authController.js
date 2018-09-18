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
    router.post('/registerUser', registerUser);

    return router;
}

async function registerUser(req, res) {
    console.log(req.body);
    try {
        const username = req.body.username;
        const password = req.body.password;

        var user = await userService.registerUser(username, password);
        res.send(user);
    } catch (e) {
        res.status(400)
        .json({ 'error': e.toString() })
    }
}