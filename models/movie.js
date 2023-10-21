const mongoose = require('mongoose');
const isURL = require('validator/lib/isURL');

const validateUrl = function (url) {
  return isURL(url);
};

const movieSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    validate: [validateUrl, 'Неправильный формат ссылки'],
  },
  trailerLink: {
    type: String,
    required: true,
    validate: [validateUrl, 'Неправильный формат ссылки'],
  },
  thumbnail: {
    type: String,
    required: true,
    validate: [validateUrl, 'Неправильный формат ссылки'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  movieId: {
    type: Number,
    required: true,
  },
  nameRU: {
    type: String,
    required: true,
  },
  nameEN: {
    type: String,
    required: true,
  },
}, { strict: true });

module.exports = mongoose.model('card', movieSchema);
