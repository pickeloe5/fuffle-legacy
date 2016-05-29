var fs = require("fs");
var ncp = require("ncp").ncp;

var args = process.argv.slice(process.argv[0].includes("node.exe") ? 2 : 1);
if (args[0] == "make" && args[1]) makeProject(args[1]);

function makeProject(name) {
  var dir = process.cwd() + "/" + name;
  if (fs.existsSync(dir) && fs.readdirSync(dir).length > 0) {
    console.log("That directory isn't empty, the project can not be generated");
    return;
  }
  ncp(__dirname + "/make", dir, function(err) {
    var newContents = fs.readFileSync(dir + "/package.json").toString().replace("{{name}}", name);
    fs.writeFileSync(dir + "/package.json", newContents);
    console.log("Project created succesfully.")
  });
}
