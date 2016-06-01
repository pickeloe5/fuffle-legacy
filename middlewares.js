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
        request.body[pair[0]] = pair[1];
      }
      next(request, response);
    });
  }
];
