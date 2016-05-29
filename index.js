var fs = require("fs");

if (require.main == module) {
  var args = process.argv.slice(process.argv[0].includes("node.exe") ? 2 : 1);
  if (args[0] == "make" && args[1]) makeProject(args[1]);
} else {
  module.exports = require("./fuffle-server.js");
}

function makeProject(name) {
  
}
