var http = require("http");
var pug = require("pug");
var nedb = require("nedb");
var path = require("path");
var fs = require("fs");


var port = 3000;
var projectDir = path.dirname(require.main.filename);
var viewDir = projectDir + "/views/";
var dataDir = projectDir + "/data/";
var modelDir = projectDir + "/models/";
var staticDir = projectDir + "/static";

var routes = [];
var middlewares = [];
var db = {};
var error = {};

var getHeaders = function(args) {return args;};

middlewares.push(function(request, response) {
  if (request.method.toLowerCase() != "post") return nextMiddleware(request, response);
  var body = [];
  request.on('data', function(chunk) {
    body.push(chunk);
  }).on('end', function() {
    body = Buffer.concat(body).toString();
    var args = body.split("&");
    request.body = {};
    for (i in args) {
      var pair = args[i].split("=");
      request.body[pair[0]] = pair[1];
    }
    nextMiddleware(request, response);
  });
});

function handleRequest(request, response) {
  request.middlewareIndex = 0;
  if (middlewares[0]) middlewares[0](request, response);
}

function nextMiddleware(request, response) {
  request.middlewareIndex++;
  if (middlewares[request.middlewareIndex]) middlewares[request.middlewareIndex](request, response);
  else routing(request, response);
}

function routing(request, response) {
  var hit = false;
  for (var i in routes) {
    var route = routes[i];
    if (request.method.toLowerCase() == route.method.toLowerCase() && request.url.toLowerCase() == route.url.toLowerCase()) {
      route.callback(request, response);
      hit = true;
      break;
    }
  }
  if (!hit) {
    if (fs.existsSync(staticDir + request.url) && fs.statSync(staticDir + request.url).isFile()) {
      response.end(fs.readFileSync(staticDir + request.url));
    } else {
      if (error["404"]) error["404"](request, response);
      else response.end("404");
    }
  }
}

var server = http.createServer(handleRequest);

exports.get = function(url, callback) {
  routes.push({
    "url": url,
    "method": "GET",
    "callback": callback
  });
};

exports.post = function(url, callback) {
  routes.push({
    "url": url,
    "method": "POST",
    "callback": callback
  });
};

exports.error = function(code, callback) {
  error[code] = callback;
};

exports.makeInserter = function(table, mod, redirect) {
  return function(request, response) {
    if (redirect == undefined) redirect = request.url;
    var doc = JSON.parse(JSON.stringify(mod));
    for (key in doc) {
      if (key.startsWith("req:")) {
        var newKey = key.replace("req:", "");
        var newVal = request.body[doc[key]];
        delete doc[key];
        doc[decodeURIComponent(newKey.replace("+", " "))] = decodeURIComponent(newVal.replace("+", " "));
      }
    }
    db[table].find({}).sort({"_inc": -1}).exec(function(err, docs) {
      if (docs.length == 0) doc["_inc"] = 0;
      else doc["_inc"] = parseInt(docs[0]["_inc"]) + 1;
      db[table].insert(doc, function(err, newdoc) {
        response.writeHead(302, {"Location": redirect});
        response.end();
      });
    });
  };
};

exports.makeViewSender = function(view, args) {
  return function(request, response) {
    function fetch(view, args, response, newKey, dbArgs) {
      var table = dbArgs.table;
      var doc = dbArgs.doc > 1  ? dbArgs.doc : {};
      db[table].find(doc).sort({"_inc": 1}).exec(function(err, docs) {
        args[newKey] = docs;
        return checkFetch(view, args, response);
      });
    }
    function checkFetch(view, args, response) {
      if (args == undefined) {
        var hitJson = false;
        var source = fs.readFileSync(viewDir + view + ".pug").toString();
        var json = "";
        for (var i = 0; i < source.length; i++) {
          if (source[i] == "@" && source[i+1] == "{") {
            hitJson = true;
            i += 2;
            while (!(source[i] == "}" && source[i+1] == "@")) {
              json += source[i];
              i++;
            }
          }
          if (!hitJson) break;
          args = JSON.parse(json);
          args["_inline"] = json;
          hitJson = true;
          break;
        }
        if (!hitJson) {
          if (fs.existsSync(modelDir + view + ".json")) {
            args = JSON.parse(fs.readFileSync(modelDir + view + ".json"));
          } else {
            args = {};
          }
        }
      }
      for (var key in args) {
        if (key.startsWith("db:")) {
          var newKey = key.replace("db:", "");
          var dbArgs = args[key];
          delete args[key];
          return fetch(view, args, response, newKey, dbArgs);
        }
      }
      return result(view, args, response);
    }
    function result(view, args, response) {
      var pageArgs = getHeaders(args);
      var source = fs.readFileSync(viewDir + view + ".pug", pageArgs).toString();
      if (args["_inline"]) source = source.replace("@{" + args["_inline"] + "}@", "");
      pageArgs.filename = viewDir + view + ".pug";
      var html = pug.render(source, pageArgs);
      response.end(html);
    }
    return checkFetch(view, args, response);
  }
};

exports.start = function() {
  server.listen(port, function() {
    console.log("Fuffle listening on port " + port);
  });
};

exports.setHeaderArgs = function(funct) {
  getHeaders = funct;
};

exports.setPort = function(p) {
  port = p;
};

exports.setViewDir = function(dir) {
  viewsDir = dir;
};

exports.setDataDir = function(dir) {
  dataDir = dir;
};

exports.setModelDir = function(dir) {
  modelDir = dir;
};

exports.setStaticDir = function(dir) {
  staticDir = dir;
};

exports.addMiddleware(function(middleware) {
  middlewares.push(middleware);
});

exports.loadTable = function(name) {
  db[name] = new nedb(dataDir + name + ".dat");
  db[name].loadDatabase();
};
