const winston = require("winston");

//Only runs during the scope of express...will not handle exceptions or promises that happen during application startup
module.exports = function(err, req, res, next) {
  winston.error(err.message, { meta: err });

  res.status(500).send("Something failed...");
};
