const Card = require('../models/movie');
const BadRequestError = require('../errors/bad-request');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden');

module.exports.postMovie = (req, res, next) => {
  const userId = req.user._id;
  const { country,
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

  Card.create({ country,
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
    owner: userId })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Данные фильма введены некорректно'));
      } else {
        next(err);
      }
    });
};

module.exports.getMovieList = (req, res, next) => {
  Card.find({})
    .then((movie) => res.send(movie))
    .catch((err) => {
      next(err);
    });
};

module.exports.deleteMovieById = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((movie) => {
      if ((movie) == null) {
        throw new NotFoundError('Такой фильм не найден');
      }
      if (movie.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Доступ запрещён');
      }
      return res.send(movie);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('ID фильма задан не корректно'));
      } else {
        next(err);
      }
    });
};
