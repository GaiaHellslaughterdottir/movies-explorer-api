const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized');

const constants = require('../utils/constants');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError(constants.messages.authForbidden);
  }

  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, process.env.NODE_ENV !== constants.productionModeKey
      ? constants.secretKey : process.env.JWT_SECRET);
  } catch (err) {
    throw new UnauthorizedError(constants.messages.authForbidden);
  }

  req.user = payload;

  next();
};
