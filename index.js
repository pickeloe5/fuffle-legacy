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
var db = {};
var error = {};

var getHeaders = function(args) {return args;};

function handleRequest(request, response) {
  var hit = false;
  for (var route in routes) {
    if (request.method == route.method && request.url == route.url) {
      routes[url](request, response);
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
    "method": "get",
    "callback": callback
  });
};

exports.post = function(url, callback) {
  routes.push({
    "url": url,
    "method": "post",
    "callback": callback
  });
};

exports.error = function(code, callback) {
  error[code] = callback;
};

exports.makeInserter = function(table, doc, redirect) {
  return function(request, response) {
    db[table].insert(doc);
    response.header("Location", redirect);
    response.end();
  };
};

exports.makeViewSender = function(view, args) {
  return function(request, response) {
    function fetch(view, args, response, newKey, dbArgs) {
      var table = dbArgs.table;
      var doc = dbArgs.doc > 1  ? dbArgs.doc : {};
      db[table].find(doc, function(err, docs) {
        if (docs.length == 1) docs = docs[0];
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

exports.setHeaderArgs = function(args) {
  for (var key in args) {
    headerArgs[key] = args[key];
  }
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

exports.loadTable = function(name) {
  db[name] = new nedb(dataDir + name + ".dat");
  db[name].loadDatabase();
};
