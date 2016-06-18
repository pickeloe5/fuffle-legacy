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
      var bodyBuffer = Buffer.concat(body);
      body = bodyBuffer.toString();
      if (body.startsWith("------WebKitFormBoundary")) {
        var boundary = body.split("\n")[0];
        var inputs = body.split(boundary + "\n");
        var last = inputs[inputs.length - 1];
        var lastLines = last.split("\r\n");
        last = last.replace("\r\n" + lastLines[lastLines.length - 1], "");
        inputs[inputs.length - 1] last;
        inputs.splice(0, 1);
        request.body = {};
        for (var i in inputs) {
          var args = inputs[i];
          var lines = args.split("\r\n");
          if (lines[0].includes("filename")) {
            var obj = {};
            var tags = lines[0].split(": ")[1].split("; ").slice(1);
            var name = tags[0].replace("name=\"", "").replace("\"", "");
            obj.filename = tags[1].replace("filename=\"", "").replace("\"", "");
            obj.payload = args.replace(lines[0] + "\r\n" + lines[1] + "\r\n\r\n", "");
            request.body[name] = obj;
          } else {
            var tags = lines[0].split(": ")[1].split("; ").slice(1);
            var name = tags[0].replace("name=\"", "").replace("\"", "");
            var val = args.replace(lines[0] + "\r\n\r\n", "");
            request.body[name] = val;
          }
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
