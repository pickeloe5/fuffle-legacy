var http = require("http");
var pug = require("pug");
var nedb = require("nedb");
var path = require("path");
var fs = require("fs");

const PORT = 3000;

var projectDir = path.dirname(require.main.filename);
var viewDir = projectDir + "/views/";
var dataDir = projectDir + "/data/";
var modelDir = projectDir + "/models/";

var routes = [];
var db = {};

var getHeaders = function(args) {return args;};

function handleRequest(request, response) {
  var hit = false;
  for (var i in routes) {
    var route = routes[i];
    if (request.url == route.url) {
      route.callback(request, response);
      hit = true;
      break;
    }
  }
  if (!hit) response.end();
}

var server = http.createServer(handleRequest);

exports.get = function(url, callback) {
  routes.push({"url": url, "callback": callback});
};

exports.sendView = function(view, args) {
  return function(request, response) {
    function fetch(view, args, response, newKey, dbArgs) {
      var table = dbArgs[0];
      var doc = dbArgs.length > 1  ? dbArgs[1] : {};
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
            i += 2;
            while (!(source[i] == "}" && source[i+1] == "@")) {
              json += source[i];
              i++;
            }
          }
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

exports.getView = function(view, args) {
  var pageArgs = getHeaders(args);
  return pug.renderFile(viewDir + view + ".pug", pageArgs);
};

exports.start = function() {
  server.listen(PORT, function() {
    console.log("Fuffle listening on port 3000");
  });
};

exports.setHeaderArgs = function(args) {
  for (var key in args) {
    headerArgs[key] = args[key];
  }
};

exports.setViewsDir = function(dir) {
  viewsDir = dir;
};

exports.setDataDir = function(dir) {
  dataDir = dir;
};

exports.loadTable = function(name, path) {
  db[name] = new nedb(dataDir + path);
  db[name].loadDatabase();
};

exports.dbAdd = function(name, doc) {
  db[name].insert(doc);
};

exports.dbDelId = function(name, id) {
  db[name].remove({"_id": id}, {});
};

exports.dbDelDoc = function(name, doc) {
  db[name].remove(doc, {});
};

exports.dbDelDocs = function(name, doc) {
  db[name].remove(doc, {"multi": true})
};

exports.dbGet = function(name, doc, cb) {
  db[name].find(doc, function(err, docs) {
    cb(docs, err);
  });
};
