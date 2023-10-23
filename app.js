const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { rateLimit } = require('express-rate-limit');
const process = require('process');
const http2 = require('http2');
const { Joi, celebrate, errors } = require('celebrate');
const { login, postUser, logout } = require('./controllers/users');
const auth = require('./middlewares/auth');
const UnauthorizedError = require('./errors/unauthorized');
const BadRequestError = require('./errors/bad-request');
const NotFoundError = require('./errors/not-found-err');
const ConflictError = require('./errors/conflict');
const ForbiddenError = require('./errors/forbidden');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const constants = require('./utils/constants');

const { PORT = 3000 } = process.env;
const app = express();

require('dotenv').config();

mongoose.connect(process.env.NODE_ENV !== constants.productionModeKey
  ? constants.databaseUrl : process.env.DB_URL, {});

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
}));

app.use(requestLogger);

app.use('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().regex(constants.emailRegexPattern),
    password: Joi.string().required(),
  }),
}), postUser);
app.use('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().regex(constants.emailRegexPattern),
    password: Joi.string().required(),
  }),
}), login);

app.use(auth);

app.use('/signout', logout);

app.use('/', require('./routes/index'));

app.use(() => {
  throw new NotFoundError(constants.messages.pageNotFound);
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  if (err instanceof UnauthorizedError) {
    res.status(err.statusCode)
      .send({ message: err.message });
  } else if (err instanceof BadRequestError) {
    res.status(err.statusCode)
      .send({ message: err.message });
  } else if (err instanceof NotFoundError) {
    res.status(err.statusCode)
      .send({ message: err.message });
  } else if (err instanceof ConflictError) {
    res.status(err.statusCode)
      .send({ message: err.message });
  } else if (err instanceof ForbiddenError) {
    res.status(err.statusCode)
      .send({ message: err.message });
  } else {
    res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
