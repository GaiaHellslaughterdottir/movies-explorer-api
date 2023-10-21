const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request');
const NotFoundError = require('../errors/not-found-err');
const UnauthorizedError = require('../errors/unauthorized');
const ConflictError = require('../errors/conflict');

module.exports.postUser = (req, res, next) => {
  const {
    name, email,
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
          next(new BadRequestError('Данные пользователя введены некорректно'));
        } else if ('MongoServerError') {
          next(new ConflictError('Пользователь с таким e-mail уже существует'));
        } else {
          next(err);
        }
      }))
    .catch(() => {
      next(new BadRequestError('Пароль пользователя задан некорректно'));
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user == null) {
        throw new NotFoundError('Такой пользователь не найден');
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('ID пользователя задан не корректно'));
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
        next(new BadRequestError('Данные пользователя введены некорректно'));
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
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      bcrypt.compare(password, user.password)
        .then((result) => {
          if (!result) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }
          const token = jwt.sign(
            { _id: user._id },
            process.env.NODE_ENV !== 'production' ? 'some-secret-key' : process.env.JWT_SECRET,
            { expiresIn: '7d' },
          );
          return res.cookie('jwt', token, {
            maxAge: 604800000,
            httpOnly: true,
          })
            .send({ token })
            .end();
        })
        .catch((err) => {
          console.log(err);
          next(new UnauthorizedError('Логин или пароль пользователя введены неверно'));
        });
      return true;
    })
    .catch((err) => {
      console.log(err);
      next(new UnauthorizedError('Логин или пароль пользователя введены неверно'));
    });
};
