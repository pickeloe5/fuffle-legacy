var fuffle = require("fuffle");

/*
 * Routing:
 * fuffle.method(url, callback);
 * method = get/post
 * url = url to be routed
 * callback = function(request, response) to be called when route is hit
 * - You can use fuffle.sendView(viewName) to generate a callback to send a view
 *
 * Views:
 * Views are loaded from the views directory, and filled with data from
 * a model. This model can be in the pug template:
 * @{
 * json...
 * }@
 * or it will be loaded from the models directory at models/viewName.json
 * Both the view directory, and the models directory, can be set:
 * fuffle.setViewDir(dir), and fuffle.setModelDir(dir)
*/
fuffle.get("/", fuffle.sendView("index"));

/*
 * This starts the fuffle server which, by default, uses the port 3000.
 * You can use fuffle.setPort(port) to change this
 * Note, you can modify many parts of th
*/
fuffle.start();
