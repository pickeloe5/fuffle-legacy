var http = require("http");
var pug = require("pug");
var fs = require("fs");

var env = require("./env.js");
var responseMakers = require("./response-makers.js");

function handleRequest(request, response) {
  request.middlewareIndex = 0;
  if (env.middlewares[0]) env.middlewares[0](request, response, nextMiddleware);

  function nextMiddleware(request, response) {
    request.middlewareIndex++;
    if (env.middlewares[request.middlewareIndex]) env.middlewares[request.middlewareIndex](request, response);
    else routing(request, response);
  }

  function routing(request, response) {
    var hit = false;
    for (var i in env.routes) {
      var route = env.routes[i];
      if (request.method.toLowerCase() == route.method.toLowerCase() && request.url.toLowerCase() == route.url.toLowerCase()) {
        route.callback(request, response);
        hit = true;
        break;
      }
    }
    if (!hit) {
      if (fs.existsSync(env.staticDir + request.url) && fs.statSync(env.staticDir + request.url).isFile()) {
        response.end(fs.readFileSync(env.staticDir + request.url));
      } else {
        if (env.error["404"]) env.error["404"](request, response);
        else response.end("404");
      }
    }
  }
}

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

exports.start = function() {
  var server = http.createServer(handleRequest);
  server.listen(env.port, function() {
    console.log("Fuffle listening on port " + env.port);
  });
};

exports.setPort = function(p) {
  env.port = p;
};

env.setters(module.exports);
responseMakers.makers(module.exports);
