var env = require("./env.js");

exports.routers = function(fuffle) {
  fuffle.get = function(url, callback) {
    env.routes.push({
      "url": url,
      "method": "GET",
      "callback": callback
    });
  };

  fuffle.post = function(url, callback) {
    env.routes.push({
      "url": url,
      "method": "POST",
      "callback": callback
    });
  };

  fuffle.error = function(code, callback) {
    env.error[code] = callback;
  };
};
