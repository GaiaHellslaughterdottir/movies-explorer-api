const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getMovieList, deleteMovieById, postMovie,
} = require('../controllers/movies');

const constants = require('../utils/constants');

router.get('/', getMovieList);

router.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().hex().required(),
  }),
}), deleteMovieById);

router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().regex(constants.imageRegexPattern),
    trailerLink: Joi.string().required().regex(constants.trailerLinkRegexPattern),
    thumbnail: Joi.string().required().regex(constants.thumbnailRegexPattern),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), postMovie);

module.exports = router;
