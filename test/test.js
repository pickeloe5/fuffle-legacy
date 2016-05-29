var fuffle = require("../index.js");

fuffle.get("/", fuffle.sendView("index"));
fuffle.start();
