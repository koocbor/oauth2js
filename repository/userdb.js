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

function getUserByUsername(username) {
    return new Promise(function(resolve, reject) {
        User.findOne( { 'username': username } )
        .then(user => {
            resolve(user);
        })
        .catch(e => {
            reject(e);
        })
    })
}

async function getUsers() {
    return await User.find( {} );
}

function registerUser(username, password) {
    return new Promise(function(resolve, reject) {
        var newUser = new User( { username: username,
            password: password });
        newUser.save()
        .then(user => {
            resolve(user);
        })
        .catch(e => {
            reject(`Unable to save ${username} ${e}`);
        })
    });
}

async function updateUser(user) {
    return await User.findOneAndUpdate( user )
}