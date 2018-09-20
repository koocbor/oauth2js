const utils = require('./utils');
const UserEntity = require('../repository/schema/user/User');

/**
 * An injected repository to handle user related database functions.
 */
let userDb;

async function getUser(id) {
  return userDb.getUserById(id);
}

async function getUsers() {
  return userDb.getUsers();
}

async function getUserByUsername(username) {
  return userDb.getUserByUsername(username);
}

async function registerUser(username, password) {
  if (!utils.isString(username) || !utils.isString(password)) {
    throw new Error('username and password are required to register user');
  }

  const existingUser = await userDb.getUserByUsername(username);
  if (existingUser != null) {
    throw new Error(`username ${username} already exists.`);
  }
  return userDb.registerUser(username, password);
}

async function updateUser(user) {
  const userEntity = new UserEntity({
    _id: user._id, // eslint-disable-line no-underscore-dangle
    username: user.username,
    password: user.password,
    roles: user.roles,
  });
  await userDb.updateUser(userEntity);
  return userDb.getUserById(user._id); // eslint-disable-line no-underscore-dangle
}

module.exports = (injectedUserDb) => {
  userDb = injectedUserDb;

  return {
    getUser,
    getUsers,
    getUserByUsername,
    registerUser,
    updateUser,
  };
};
