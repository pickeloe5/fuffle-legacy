var http = require("http");
var pug = require("pug");
var fs = require("fs");

var env = require("./env.js");
var responseMakers = require("./response-makers.js");
var routers = require("./routers.js");

function handleRequest(request, response) {
  request.middlewareIndex = 0;
  if (env.middlewares[0]) env.middlewares[0](request, response, nextMiddleware);

  function nextMiddleware(request, response) {
    request.middlewareIndex++;
    if (env.middlewares[request.middlewareIndex]) env.middlewares[request.middlewareIndex](request, response, nextMiddleware);
    else routing(request, response);
  }

  function routing(request, response) {
    var hit = false;
    var url = rectifyUrl(request.pathname);
    for (var i in env.routes) {
      var route = env.routes[i];
      route.url = rectifyUrl(route.url);
      if (request.method.toLowerCase() == route.method.toLowerCase() && url.toLowerCase() == route.url.toLowerCase()) {
        route.callback(request, response);
        hit = true;
        break;
      }
    }
    if (!hit) {
      if (fs.existsSync(env.staticDir + url) && fs.statSync(env.staticDir + url).isFile()) {
        response.end(fs.readFileSync(env.staticDir + url));
      } else {
        if (env.error["404"]) env.error["404"](request, response);
        else response.end("404");
      }
    }
  }

  function rectifyUrl(url) {
    if (url[0] != '/') url = "/" + url;
    if (url[url.length - 1] != '/') url = url + "/";
    return url;
  }
}

exports.start = function() {
  var server = http.createServer(handleRequest);
  server.listen(env.port, function() {
    console.log("Fuffle listening on port " + env.port);
  });
};

env.setters(module.exports);
responseMakers.makers(module.exports);
routers.routers(module.exports);
