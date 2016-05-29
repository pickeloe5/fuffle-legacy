# fuffle
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
@{
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
Where data is stored in /data/tableName.dat, then you can
get values from the table like so:
```
{
  "db:key": {
    "table": tableName,
    "doc": {
      "queryKey": "queryValue"
    }
  }
}
```

## Data Tables
Fuffle uses [nedb](https://github.com/louischatriot/nedb) as a database
engine, so check out their github if you need to.
