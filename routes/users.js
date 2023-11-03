const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  updateProfile, getCurrentUser,
} = require('../controllers/users');

const constants = require('../utils/constants');

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().regex(constants.emailRegexPattern),
  }),
}), updateProfile);

router.get('/me', getCurrentUser);

module.exports = router;
