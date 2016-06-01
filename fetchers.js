var env = require("./env.js");

exports.db = function(request, model, next) {
  var result = {};
  check();

  function fetch(key) {
    var args = model[key];

    var table = args.table;
    var doc = args.doc;
    var single = args.single;

    if (doc == null) doc = {};
    if (single == null) single = false;

    env.db[table].find(doc, function(err, docs) {
      if (single) docs = docs[0];
      result[key] = docs;
      check();
    });
  }

  function check() {
    for (var key in model) {
      if (!result[key]) {
        fetch(key);
        return;
      }
    }
    next(result);
  }
};

exports.req = function(request, model, next) {
  var result = {};
  for (var key in model)
    result[key] = request.body[model[key]];
  next(result);
};
