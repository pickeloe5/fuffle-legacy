# Fuffle
Fuffle is a light weight node.js web framework, built to minimize
backend development. Why take time to write controllers, models, and
views all separately when you can generate models and controllers from
your views? Well, that's exactly what Fuffle solves, write your views
and a json object for your model either in the view, or in a seperate file.
Your models can hold static values, or pull from a database, and you can
still write custom controllers if you want.

### Table of Contents
- [Routing](#Routing)
- [Views](#Views)
- [Models](#Models)
- [Middleware](#Middleware)
- [Fetchers](#Fetchers)
- [Database](#Database)

## Routing
Fuffle's main goal is to minimize backend development. To do this,
it uses built-in functions called response-makers. Use them like so:
```
fuffle.get("/path/to/url", fuffle.makeReader("viewName"));
```
This will make a route to "/path/to/url" that takes "get" requests,
and sends the 'viewName' view. These response-makers are based on
CRUD support, so there are only four:
```
fuffle.post("/create", fuffle.makeCreator("tableName", "modelName", "/path/to/redirect"));
fuffle.get("/read", fuffle.makeReader("viewName"));
fuffle.post("/update", fuffle.makeUpdater("tableName", "modelName", "/path/to/redirect"));
fuffle.post("/delete", fuffle.makeDeleter("tableName", "modelName", "/path/to/redirect"));
```

## Views
Views are loaded from the views directory by default, but this directory
can be set with `fuffle.setViewDir(dir)`. Views are written in [pug](https://github.com/pugjs/pug)
(formerly [jade](http://jade-lang.com/)).

## Models
Models are written in normal json, and can be stored with the same path
as the view, but in the models directory, or in the view file like so:
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

## Fetchers
Fetchers are name functions, which are called to parse models, for example:
```
// model.json
{
  "fetcher-name": {
    "key": "args"
  }
}
```

## Database
Fuffle uses [nedb](https://github.com/louischatriot/nedb) as a database
engine, so all data is stored in memory, and as json on the disk, making
database calls extremely fast and light. Load a table into memory using
`fuffle.loadTable("tableName");`. If the table doesn't exist, it will be created.
 You can then access the table using the "db" fetcher:
 ```
{
  "db": {
    "key": {
      "table": "tableName",
      "doc": {                    // only returns results that match this query
        "query": "parameters"
      },
      "single": true              // will return only the first result of the query
    }
  }
}
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

This model would call the fetcher-name function with the object `{"key": "args"}`
as a parameter. The fetcher-name function would parse this data, and return the
result, which is added to the model, for example:
```
// model.json
{
  "string-doubler": {
    "echo": "Hello, "
  }
}
// string-doubler({"echo": "Hello, "}) is called, which returns this:
{
  "echo": "Hello, Hello, "
}
```
You can create a fetcher with the putFetcher function:
```
fuffle.butFetcher("fetcher-name", function(request, tofetch, next) {
  for (var key in tofetch) {
    tofetch[key] = "fetched";
  }
  next(tofetch);
});
```
