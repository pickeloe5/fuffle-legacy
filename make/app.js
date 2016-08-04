var fuffle = require("fuffle");

// Loads that 'table' database into memory.
fuffle.loadTable("table");

// Routes all get requests to '/' to a function then sends the 'index' view.
fuffle.routeReader('/', 'index');

// Routes all post requests to '/add' to a functino that adds
// an object derived from the 'add' model to the 'table' database.
fuffle.routeCreator('/add', 'table', 'add', '/');

// Routes all get requests to '/delete' to a function that deletes
// an object derived from the 'delete' model from the database.
fuffle.routeDeleter('/delete', 'table', 'delete', '/');

// Routes all post requests to a function that updates an object in the
// database with an object derived from the 'update' model.
fuffle.routeUpdater('/update', 'table', 'update', '/');

// Starts the fuffle server on port 300 defaultly
// Use fuffle.setPort(port) to change this.
fuffle.start();
