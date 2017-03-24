# Fuffle
Fuffle is a light weight node.js web framework, built to minimize
backend development. Why take time to write controllers, models, and
views all separately when you can generate models and controllers from
your views? Well, that's exactly what Fuffle solves, write your views
and a json object for your model either in the view, or in a separate file.
Your models can hold static values, or pull from a database, and you can
still write custom controllers if you want.

### Table of Contents
- [Generator](#generator)
- [Routing](#routing)
- [Views](#views)
- [Models](#models)
- [Middleware](#middleware)
- [Fetchers](#fetchers)
- [Database](#database)

## Generator
You can generate a fuffle project by installing fuffle globally `npm install fuffle -g`,
 and running the command `fuffle make projectName`. This will create a folder
in the current working directory with a fuffle environment set up.

## Routing
Fuffle's main goal is to minimize backend development. To do this,
it uses built-in functions called response-makers. Use them like so:
```
fuffle.routeCreator('/create', 'tableName', 'modelName', '/path/to/redirect');
```
This will make a route to "/path/to/url" that adds `modelName` to `tableName`,
and redirects to "/path/to/redirect". These response-makers are based on
CRUD support, so there are only four:
```
fuffle.routeCreator('/create', 'tableName', 'modelName', '/path/to/redirect');
fuffle.routeReader('/read', 'viewName');
fuffle.routeUpdater('/update', 'tableName', 'modelName', '/path/to/redirect');
fuffle.routeDeleter('/delete', 'tableName', 'modelName', '/path/to/redirect');
```
If none of these response-makers match that page's needs, you can use the simple
routers to make your own routes.
```
fuffle.get('/', function(request, response) {
  // handle get requests to the '/' url
})
fuffle.post('/', function(request, response) {
  // handle post requests to the '/' url
})
```

## Views
Views are loaded from the views directory by default, but this directory
can be set with `fuffle.setViewDir(dir)`. Views are written in [pug](https://github.com/pugjs/pug)
(formerly [jade](http://jade-lang.com/)).

## Models
Models are written in normal json, and can be stored with the same path
as the view, but in the models directory. This means the view 'views/index.pug'
will try to use the 'models/index.json' model. Views may also have there model
directly inline with the pug syntax, for example:
```
pug syntax...
//@{
    {
      "key": "value",
      "key": {
        "value": "value-value"
      }
    }
  }@
more pug syntax...
```

## Middleware
Middleware is called directly after the request is made, the route hasn't been
processed yet, and the model hasn't been fetched. You can add a middleware with
the addMiddleware function:
```
fuffle.addMiddleware(function(request, response, next) {
 request.middlewareDone = true;
 next(request, response);
});
```
### Current Middleware
 - Cookies: `request.cookies.cookieName`
 - `Post` data: `request.body.formName`
 - `Get` parameters: `request.params.paramName`

## Fetchers
Fetchers are named functions, which are called to parse models, for example:
```
// model.json
{
  "string-doubler": {
    "doubled": "a string."
  }
}
```
In this example, Fuffle would call the fetcher named "string-doubler" with the object
`{ "doubled": "a string." }`. The "string-doubler" function would then process this string
and add `"doubled": "a string.a string."` to the model, which ends up being:
```
{
  "doubled": "a string.a string.
}
```
### Current Fetchers
 - Database
   ```
   {
     "db": {
       "user": { // returns only John's user
         "table": "users",
         "doc": {
           "name": "John"
         },
         "single": "true"
       },
       "redFish": { // returns all fish with "color": "red"
         "table": "fish",
         "doc": {
           "color": "red"
         }
       },
       "barrels": { // returns all barrels
         "table": "barrels"
       }
     }
   }
   ```
 - Form Data
   ```
   {
     "post": { // returns the value of the inputName field
       "variable": "inputName"
     }
   }
   ```
 - URL Parameters
   ```
   {
     "get": { // returns the value of the url parameter keyName
       "variable": "keyName"
     }
   }
   ```

You can create a fetcher with the putFetcher function:
```
fuffle.putFetcher("string-doubler", function(request, tofetch, next) {
 for (var key in tofetch) {                         // loop through all keys in object to fetch
   tofetch[key] = tofetch[key] + tofetch[key];      // double the string
 }
 next(tofetch);                                     // proceed to the next fetcher
});
```

## Database
Fuffle uses [nedb](https://github.com/louischatriot/nedb) as a database
engine, so all data is stored in memory, and as json in storage, making
database calls extremely fast and light weight. Load a table into memory using
`fuffle.loadTable("tableName");`. If the table doesn't exist, it will be created.
 You can then access the table using the ["db" fetcher](#fetchers).
