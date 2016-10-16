var url = require("url");
var Busboy = require("busboy");

module.exports = [
  function getPostData(request, response, next) {
    if (request.method.toLowerCase() != "post") {
      next(request, response);
      return;
    }
    request.body = {};
    var busboy = new Busboy({headers: request.headers});
    busboy.on("field", function(fieldname, val) {
      request.body[fieldname] = val;
    });
    busboy.on("file", function(fieldname, file, filename) {
      var buffers = [];
      var totalSize = 0;
      file.on("data", function(data) {
        buffers.push(data);
        totalSize += data.length;
      });
      file.on("end", function() {
        var fileContents = Buffer.concat(buffers, totalSize);
        request.body[fieldname] = {"filename": filename, "contents": fileContents};
      });
    });
    busboy.on("finish", function() {
      next(request, response);
    });
    request.pipe(busboy);
  },
  function getGetParams(request, response, next) {
    var urlData = url.parse(request.url, true);
    request.params = urlData.query;
    request.pathname = urlData.pathname;
    next(request, response);
  },
  function getCookies(request, response, next) {
    if (!request.headers.cookie) {
      request.cookies = {};
      next(request, response);
      return;
    }
    var raw = request.headers.cookie.split(';');
    var cookies = {};
    for (var i = 0; i < raw.length; i++) {
      var cookie = raw[i];
      var parts = cookie.split('=');
      cookies[parts.shift().trim()] = decodeURI(parts.join('='));
    }
    request.cookies = cookies;
    next(request, response);
  }
];
