var http = require("http");
var pug = require("pug");
var nedb = require("nedb");
var path = require("path");

const PORT = 3000;

var projectDir = path.dirname(require.main.filename);
var viewDir = projectDir + "/views/";
var dataDir = projectDir + "/data/";

var routes = [];
var headerArgs = {};
var db = {};

function handleRequest(request, response) {
  response.send = function(data) {
    response.write(data);
    response.end();
  };
  for (var i in routes) {
    var route = routes[i];
    if (request.url == route.url) {
      route.callback(request, response);
    }
  }
}

function makePageArgs(args) {
  var pageArgs = headerArgs;
  for (var key in args) {
    pageArgs[key] = args[key];
  }
  return pageArgs;
}

var server = http.createServer(handleRequest);

exports.get = function(url, callback) {
  routes.push({"url": url, "callback": callback});
};

exports.sendView = function(view, args) {
  for (var i in args) {
    if (args[i].startsWith("db:")) {
      var dbArgs = args[i].replace("db:", "").split(",");
      var x = null;
      dbGet(dbArgs[0]);
    }
  }
  var pageArgs = makePageArgs(args);
  return function(request, response) {
    response.write(pug.renderFile(viewDir + view + ".pug", pageArgs));
  }
};

exports.getView = function(view, args) {
  var pageArgs = makePageArgs(args);
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

exports.addTable = function(name, path) {
  db[name] = new nedb(dataDir + path);
  db[name].loadDatabase();
  return db[name];
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
