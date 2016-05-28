var fuffle = require("../index.js");

fuffle.addTable("data", "table.dat");
fuffle.get("/", fuffle.sendView("index", indexModel));
fuffle.start();
