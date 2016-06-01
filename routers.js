

exports.get = function(url, callback) {
  env.routes.push({
    "url": url,
    "method": "GET",
    "callback": callback
  });
};

exports.post = function(url, callback) {
  env.routes.push({
    "url": url,
    "method": "POST",
    "callback": callback
  });
};

exports.error = function(code, callback) {
  env.error[code] = callback;
};
