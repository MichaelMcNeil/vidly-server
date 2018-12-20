const helmet = require("helmet");
const compression = require("compression");

modules.exports = function(app) {
  app.use(helmet());
  app.use(compression());
};
