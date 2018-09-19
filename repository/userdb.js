var Promise = require('bluebird');
var User = require('./schema/user/User');

let mongoConnection;

module.exports = injectedMongoConnection => {
    mongoConnection = injectedMongoConnection

    return {
        getUserById: getUserById,
        getUserByUsername: getUserByUsername,
        getUsers: getUsers,
        registerUser: registerUser,
        updateUser: updateUser
    }
}

async function getUserById(id) {
    return await User.findById(id);
}

async function getUserByUsername(username) {
    return await User.findOne( { 'username': username });
}

async function getUsers() {
    return await User.find( {} );
}

async function registerUser(username, password) {
    return await User.create({
        username: username,
        password: password
    });
}

async function updateUser(user) {
    return await User.findOneAndUpdate( { '_id': user._id }, user);
}