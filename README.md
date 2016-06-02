# Fuffle
Fuffle is a light weight node.js web framework, built to minimize
backend development. Why take time to write controllers, models, and
views all separately when you can generate models and controllers from
your views? Well, that's exactly what Fuffle solves, write your views
and a json object for your model either in the view, or in a seperate file.
Your models can hold static values, or pull from a database, and you can
still write custom controllers if you want.

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
You can get database values by first loading them in app.js
```
fuffle.loadTable(tableName);
```
Fuffle uses additional functions to parse your models called fetchers, you
can use them like this:
```
{
  "fetcher-name": {
    "key": "fetcher-args"
  },
  "post": {
    "key": "post-data-key"
  }
}
```

## Data Tables
Fuffle uses [nedb](https://github.com/louischatriot/nedb) as a database
engine, so check out their github if you need to.

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
