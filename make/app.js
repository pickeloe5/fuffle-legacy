var fuffle = require("fuffle");

// Loads the 'table' database into memory, and creates the file if it doesn't
// already exist.
fuffle.loadTable("table");

// Routes all get requests to '/' to a function that sends the 'index' view.
fuffle.routeReader('/', 'index');

// Routes all post requests to '/add' to a function that adds
// an object derived from the 'add' model to the 'table' database.
fuffle.routeCreator('/add', 'table', 'add', '/');

// Routes all get requests to '/delete' to a function that deletes
// an object derived from the 'delete' model from the database.
fuffle.routeDeleter('/delete', 'table', 'delete', '/');

// Routes all post requests to a function that updates an object in the
// database with an object derived from the 'update' model.
fuffle.routeUpdater('/update', 'table', 'update', '/');

// Starts the fuffle server on port 3000 by default, but you can use
// fuffle.setPort(port) to change this.
fuffle.start();
