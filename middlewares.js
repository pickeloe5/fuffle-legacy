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
      var fileContents = "";
      file.on("data", function(data) {
        fileContents += data;
      });
      file.on("end", function() {
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
  }
];
