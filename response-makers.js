var fs = require("fs");
var pug = require("pug");

var env = require("./env.js");

function isFunction(obj) {
  return obj && {}.toString.call(obj) === '[object Function]';
}

function fetch(request, model, cb) {
  model = JSON.parse(JSON.stringify(model));
  if (fs.existsSync(env.modelDir + "globals.json")) {
    var globals = JSON.parse(fs.readFileSync(env.modelDir + "globals.json"));
    for (var key in globals) {
      if (!(key in model))
        model[key] = globals[key];
    }
  }
  for (var key in model) {
    if (typeof model[key] == "object" && env.fetchers[key]) {
      env.fetchers[key](request, model[key], nextFetch(request, model, key));
      return;
    }
  }
  cb(model);

  function nextFetch(request, model, fetcherKey) {
    return function(result) {
      delete model[fetcherKey];
      for (var key in result)
        model[key] = result[key];
      fetch(request, model, cb);
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

exports.makers = function(fuffle) {
  fuffle.makeCreator = function(table, model, redirect) {
    if (typeof model == "string")
      model = JSON.parse(fs.readFileSync(env.modelDir + model + ".json"));
    return function(request, response) {
      if (redirect == undefined) redirect = request.url;
      fetch(request, model, function(doc) {
        env.db[table].find({}).sort({"_inc": -1}).exec(function(err, docs) {
          if (docs.length == 0) doc["_inc"] = 0;
          else doc["_inc"] = parseInt(docs[0]["_inc"]) + 1;
          env.db[table].insert(doc, function(err, newdoc) {
            if (isFunction(redirect)) {
              redirect(request, response);
            } else {
              response.writeHead(302, {"Location": redirect});
              response.end();
            }
          })
        })
      })
    }
  }

  fuffle.makeReader = function(view, model) {
    if (typeof model == "string")
      model = JSON.parse(fs.readFileSync(env.modelDir + model + ".json"));
    return function(request, response) {
      if (model == null) model = getJSON(view);
      fetch(request, model, function(args) {
        response.end(pug.renderFile(env.viewDir + view + ".pug", args));
      })
    }
  }

  fuffle.makeUpdater = function(table, model, redirect) {
    if (typeof model == "string")
      model = JSON.parse(fs.readFileSync(env.modelDir + model + ".json"));
    return function(request, response) {
      fetch(request, model, function(doc) {
        env.db[table].find({"_id": doc["_id"]}, function(err, preDoc) {
          doc["_inc"] = preDoc[0]["_inc"];
          env.db[table].update({"_id": doc["_id"]}, doc, {}, function(err) {
            if (isFunction(redirect)) {
              redirect(request, response);
            } else {
              response.writeHead(302, {"Location": redirect});
              response.end();
            }
          })
        })
      })
    }
  }

  fuffle.makeDeleter = function(table, model, redirect) {
    if (typeof model == "string")
      model = JSON.parse(fs.readFileSync(env.modelDir + model + ".json"));
    return function(request, response) {
      fetch(request, model, function(doc) {
        if (isFunction(redirect)) {
          redirect(request, response);
        } else {
          response.writeHead(302, {"Location": redirect});
          response.end();
        }
      })
    }
  }

  fuffle.routeCreator = function(url, table, model, redirect) {
    fuffle.post(url, fuffle.makeCreator(table, model, redirect));
  }

  fuffle.routeReader = function(url, view, model) {
    fuffle.get(url, fuffle.makeReader(view, model));
  }

  fuffle.routeUpdater = function(url, table, model, redirect) {
    fuffle.post(url, fuffle.makeUpdater(table, model, redirect));
  }

  fuffle.routeDeleter = function(url, table, model, redirect) {
    fuffle.get(url, fuffle.makeDeleter(table, model, redirect));
  }
}
