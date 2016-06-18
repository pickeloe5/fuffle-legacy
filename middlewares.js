var url = require("url");

module.exports = [
  function getPostData(request, response, next) {
    if (request.method.toLowerCase() != "post") {
      next(request, response);
      return;
    }
    var body = [];
    request.on('data', function(chunk) {
      body.push(chunk);
    }).on('end', function() {
      body = Buffer.concat(body).toString();
      if (body.startsWith("------WebKitFormBoundary")) {
        var boundary = body.split("\n")[0] + "\n";
        var inputs = body.split(boundary);
        inputs.splice(0, 1);
        request.body = {};
        for (var i in inputs) {
          var args = inputs[i];
          args = args.replace(/\r\n\r\n/g, "; ").replace(/\r\n/g, "; ").split("; ");
          args.splice(0, 1);
          args.splice(args.length - 1, 1);
          if (i == inputs.length - 1)
            args.splice(args.length - 1, 1);

          var key = args[0].split("=")[1];
          key = key.slice(1, key.length - 1);
          var val = {};
          if (args[1].includes("filename")) {
            val = {};
            val.filename = args[1].split("=")[1];
            val.filename = val.filename.slice(1, val.filename.length - 1);
            val.contentType = args[args.length - 2].split(": ")[1];
            val.content = args[args.length - 1];
          } else {
            val = args[args.length - 1];
          }

          request.body[key] = val;
        }

        next(request, response);
      } else {
        var args = body.split("&");
        request.body = {};
        for (i in args) {
          var pair = args[i].split("=");
          pair[0] = decodeURIComponent(pair[0].replace("+", " "));
          pair[1] = decodeURIComponent(pair[1].replace("+", " "));
          request.body[pair[0]] = pair[1];
        }
        next(request, response);
      }
    });
  },
  function getGetParams(request, response, next) {
    var urlData = url.parse(request.url, true);
    request.params = urlData.query;
    request.pathname = urlData.pathname;
    next(request, response);
  }
];
