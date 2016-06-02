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
      var args = body.split("&");
      request.body = {};
      for (i in args) {
        var pair = args[i].split("=");
        pair[0] = unescape(pair[0].replace(/\+/g, " "));
        pair[1] = unescape(pair[1].replace(/\+/g, " "));
        request.body[pair[0]] = pair[1];
      }
      next(request, response);
    });
  },
  function getGetParams(request, response, next) {
    var urlData = url.parse(request.url, true);
    request.params = urlData.query;
    request.pathname = urlData.pathname;
    next(request, response);
  }
];
