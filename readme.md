#### OAuth2 Node Project

A simple project to test out creating an express based OAuth2 server implementation.

To run you'll have to setup a mongodb instance and edit the connection in `db.js` to point to the database. I suggest docker as a good way to get a temporary mongodb instance running. [https://hub.docker.com/_/mongo/](https://hub.docker.com/_/mongo/)

Current routes (I need to get some OpenAPI action going on this):

- `POST /auth/registerUser` - Will create a new user with the passed username and password properties. **NOTE** - The password is stored in plain text - this is bad - do not do this in real life.
- `POST /oauth/token` - Log in using a `password` grant type. Must pass a valid username and password.
- `GET /me` - Returns the currently logged in user. Uses `Authorization Bearer {access_token}` for authorization.
- `PATCH /me` - Updates the logged in user with the data passed as a JSON body.
- `GET /users` - Returns a list of all users in the system if the requesting user has either a `coach` or `admin` role.