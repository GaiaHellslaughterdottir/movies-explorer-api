const winston = require('winston');
const expressWinston = require('express-winston');

const constants = require('../utils/constants');

const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: constants.requestLogFileName }),
  ],
  format: winston.format.json(),
});

const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: constants.errorLogFileName }),
  ],
  format: winston.format.json(),
});

module.exports = {
  requestLogger,
  errorLogger,
};
