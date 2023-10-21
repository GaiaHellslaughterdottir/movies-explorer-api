const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');

const validateEmail = function (email) {
  return isEmail(email);
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
    required: true,
    validate: [validateEmail, 'Неправильный формат почты'],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
}, { strict: true });

module.exports = mongoose.model('user', userSchema);
