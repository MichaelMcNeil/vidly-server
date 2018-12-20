const mongoose = require("mongoose");
const winston = require("winston");
const config = require("config");

module.exports = function() {
  const con_config = {
    useNewUrlParser: true,
    useCreateIndex: true
  };

  mongoose
    .connect(
      config.get("db"),
      con_config
    )
    .then(() => winston.info(`Connected to ${config.get("db")}...`));

  //mongoose.set("useCreateIndex", true);
};
