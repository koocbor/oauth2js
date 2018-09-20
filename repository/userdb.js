const User = require('./schema/user/User');

async function getUserById(id) {
  return User.findById(id);
}

async function getUserByUsername(username) {
  return User.findOne({ username });
}

async function getUsers() {
  return User.find({});
}

async function registerUser(username, password) {
  return User.create({
    username,
    password,
  });
}

async function updateUser(user) {
  // eslint-disable-next-line no-underscore-dangle
  return User.findOneAndUpdate({ _id: user._id }, user);
}

module.exports = {
  getUserById,
  getUserByUsername,
  getUsers,
  registerUser,
  updateUser,
};
