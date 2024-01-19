const config = require('../common/config');

module.exports.isInt = function (id, errorMessage) {
  return (req, res, next) => {
    const queryId = req.params[id];
    if (config.regex.integer.test(queryId) === false) {
      res.endWithValidationError(errorMessage);
    } else {
      next();
    }
  };
};
