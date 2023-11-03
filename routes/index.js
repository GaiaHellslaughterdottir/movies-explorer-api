const express = require('express');

const router = express.Router();
const { Joi, celebrate } = require('celebrate');
const { login, postUser, logout } = require('../controllers/users');
const auth = require('../middlewares/auth');

const users = require('./users');
const movies = require('./movies');
const constants = require('../utils/constants');
const NotFoundError = require('../errors/not-found-err');

router.use('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().regex(constants.emailRegexPattern),
    password: Joi.string().required(),
  }),
}), postUser);
router.use('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().regex(constants.emailRegexPattern),
    password: Joi.string().required(),
  }),
}), login);

router.use(auth);

router.use('/signout', logout);

router.use('/users', users);
router.use('/movies', movies);

router.use(() => {
  throw new NotFoundError(constants.messages.pageNotFound);
});

module.exports = router;
