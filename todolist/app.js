var fuffle = require("../index.js");
var fs = require("fs");

fuffle.loadTable("items");

fuffle.get("/", fuffle.makeReader("index"));
fuffle.post("/add", function(request, response) {
  fs.writeFile("afile.png", request.body.body.contents, function() {
    response.end("uploaded");
  });
});

fuffle.start();
