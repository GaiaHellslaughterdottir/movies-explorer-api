const Card = require('../models/movie');
const BadRequestError = require('../errors/bad-request');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden');

const constants = require('../utils/constants');

module.exports.postMovie = (req, res, next) => {
  const userId = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Card.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: userId,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(constants.messages.movieIncorrectFields));
      } else {
        next(err);
      }
    });
};

module.exports.getMovieList = (req, res, next) => {
  Card.find({ owner: req.user._id })
    .then((movie) => res.send(movie))
    .catch((err) => {
      next(err);
    });
};

module.exports.deleteMovieById = (req, res, next) => {
  Card.findByIdAndRemove(req.params.movieId)
    .then((movie) => {
      if ((movie) == null) {
        throw new NotFoundError(constants.messages.movieNotFound);
      }
      if (movie.owner.toString() !== req.user._id) {
        throw new ForbiddenError(constants.messages.authForbidden);
      }
      return res.send(movie);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(constants.messages.movieNotFound));
      } else {
        next(err);
      }
    });
};
