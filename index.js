var http = require("http");
var pug = require("pug");
var fs = require("fs");

var env = require("./env.js");

function fetch(request, model, cb) {
  model = JSON.parse(JSON.stringify(model));
  for (var key in model) {
    if (typeof model[key] == "object" && env.fetchers[key]) {
      env.fetchers[key](request, model, nextFetch(request, model));
      return;
    }
    cb(model);
  }

  function nextFetch(request, model) {
    return function(result) {
      for (var key in result)
        model[key] = result[key];
      fetch(request, model);
    }
  }
}

function getJSON(view) {
  if (fs.existsSync(env.modelDir + view + ".json")) {
    return JSON.parse(fs.readFileSync(env.modelDir + view + ".json"));
  }
  var hitJson = false;
  var source = fs.readFileSync(env.viewDir + view + ".pug").toString();
  var json = "";
  for (var i = 0; i < source.length; i++) {
    if (source[i] == "@" && source[i+1] == "{") {
      hitJson = true;
      i += 2;
      while (!(source[i] == "}" && source[i+1] == "@")) {
        json += source[i];
        i++;
      }
      break;
    }
  }
  if (hitJson) {
    return JSON.parse(json);
  }
  return {};
}

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

exports.makeInserter = function(table, mod, redirect) {
  return function(request, response) {
    if (redirect == undefined) redirect = request.url;
    fetch(request, mod, function(doc) {
      env.db[table].find({}).sort({"_inc": -1}).exec(function(err, docs) {
        if (docs.length == 0) doc["_inc"] = 0;
        else doc["_inc"] = parseInt(docs[0]["_inc"]) + 1;
        env.db[table].insert(doc, function(err, newdoc) {
          response.writeHead(302, {"Location": redirect});
          response.end();
        });
      });
    });
  };
};

exports.makeViewSender = function(view, model) {
  return function(request, response) {
    if (model == null) model = getJSON(view);
    fetch(request, model, function(args) {
      
    });
  }
};

exports.start = function() {
  var server = http.createServer(handleRequest);
  server.listen(env.port, function() {
    console.log("Fuffle listening on port " + env.port);
  });
};

exports.setHeaderArgs = function(funct) {
  getHeaders = funct;
};

exports.setPort = function(p) {
  port = p;
};

env.setters(module.exports);
