const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request');
const NotFoundError = require('../errors/not-found-err');
const UnauthorizedError = require('../errors/unauthorized');
const ConflictError = require('../errors/conflict');

const constants = require('../utils/constants');

module.exports.postUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    })
      .then((user) => {
        const fieldName = '_doc';
        const userData = user[fieldName];
        delete userData.password;
        res.send(userData);
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(constants.messages.userIncorrectFields));
        } else if (err.name === 'MongoServerError') {
          next(new ConflictError(constants.messages.userDuplicateEmail));
        } else {
          next(err);
        }
      }))
    .catch(() => {
      next(new BadRequestError(constants.messages.userIncorrectPassword));
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user == null) {
        throw new NotFoundError(constants.messages.userNotFound);
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(constants.messages.userNotFound));
      } else {
        next(err);
      }
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => (
      res.send(user)))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(constants.messages.userIncorrectFields));
      } else if (err.name === 'MongoServerError') {
        next(new ConflictError(constants.messages.userDuplicateEmail));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error(constants.messages.userIncorrectLoginOrPassword));
      }
      bcrypt.compare(password, user.password)
        .then((result) => {
          if (!result) {
            return Promise.reject(new Error(constants.messages.userIncorrectLoginOrPassword));
          }
          const token = jwt.sign(
            { _id: user._id },
            process.env.NODE_ENV !== constants.productionModeKey
              ? constants.secretKey : process.env.JWT_SECRET,
            { expiresIn: constants.tokenExpiredIn },
          );
          return res.cookie('jwt', token, {
            maxAge: constants.tokenMaxAge,
            httpOnly: true,
          })
            .send({ token })
            .end();
        })
        .catch((err) => {
          console.log(err);
          next(new UnauthorizedError(constants.messages.userIncorrectLoginOrPassword));
        });
      return true;
    })
    .catch((err) => {
      console.log(err);
      next(new UnauthorizedError(constants.messages.userIncorrectLoginOrPassword));
    });
};

module.exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.end();
};
