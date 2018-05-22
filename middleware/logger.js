'use strict'

function logger(req, res, next) {
    const date = new Date();
    console.log(
      `${date} ${req.method} ${req.url}`);
    next();
  }

module.exports = {logger}