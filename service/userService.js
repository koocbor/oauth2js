var utils = require('./utils');
var UserEntity = require('../repository/schema/user/User');
/**
 * An injected repository to handle user related database functions.
 */
let userDb

module.exports = injectedUserDb => {
    userDb = injectedUserDb

    return {
        getUser: getUser,
        getUsers: getUsers,
        getUserByUsername: getUserByUsername,
        registerUser: registerUser,
        updateUser: updateUser,
    }
}

async function getUser(id) {
    return await userDb.getUserById(id);
}

async function getUsers() {
    return await userDb.getUsers();
}

async function getUserByUsername(username) {
    return await userDb.getUserByUsername(username);
}

async function registerUser(username, password) {

    if (!utils.isString(username) || !utils.isString(password)) {
        throw `username and password are required to register user`
    }

    var existingUser = await userDb.getUserByUsername(username);
    if (existingUser != null) {
        throw `username ${username} already exists.`
    }

    var user = await userDb.registerUser(username, password);
    return user;
}

async function updateUser(user) {
    var userEntity = new UserEntity( {
        _id: user._id,
        username: user.username,
        password: user.password,
        roles: user.roles
    })
    await userDb.updateUser(userEntity);
    return await userDb.getUserById(user._id);
}