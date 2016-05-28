var fuffle = require("../index.js");

fuffle.loadTable("data", "table.dat");
fuffle.get("/", fuffle.sendView("index", {
  "db:guy": [
    "data",
    {
      "name": "nicky pie"
    }
  ]
}));
fuffle.start();
