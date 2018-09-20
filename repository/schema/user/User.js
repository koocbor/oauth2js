const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  roles: {
    type: Array,
  },
});

module.exports = mongoose.model('User', UserSchema);
