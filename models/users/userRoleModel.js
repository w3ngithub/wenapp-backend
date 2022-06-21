const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
  key: {
    type: String,
    unique: true,
    trim: true
  },
  value: {
    type: String,
    required: [true, 'Please provide user role name.'],
    unique: true,
    trim: true
  }
});

const UserRole = mongoose.model('User_Role', userRoleSchema);

module.exports = UserRole;
