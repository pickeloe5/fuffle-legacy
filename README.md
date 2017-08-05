# Fuffle
Fuffle is a light weight node.js web framework, built to minimize
backend development. Why take time to write controllers, models, and
views all separately when you can generate models and controllers from
your views? Well, that's exactly what Fuffle solves, write your views
and a json object for your model either in the view, or in a separate file.
Your models can hold static values, or pull from a database, and you can
still write custom controllers if you want.

Fuffle is a light weight node.js backend web framework built to minimize backend
development. Fuffle tries to write the common components of a controller for you
so you can focus on what's specific to your app. However, Fuffle does this in
a very unobtrusive way, allowing you to fall back to manually processing http
requests.

## Preface
Fuffle is currently under heavy development. Certain parts of fuffle are subject
to extreme change, or complete removal. If you see a feature disappear that you
liked, please open a github issue and we'll work on it. The same applies if
you don't see a feature that you wish was there. Really anything that should
be changed about the project, **PLEASE** open a github issue. If you'd like to
contact the developers, you can reach us at aboutthepickle@gmail.com.

### Table of Contents
- [Generator](#generator)
- [Routing](#routing)
- [Views](#views)
- [Models](#models)
- [Middleware](#middleware)
- [Fetchers](#fetchers)
- [Database](#database)

## Generator
You can generate a fuffle project by installing fuffle globally `npm install fuffle-cli -g`,
and running the command `fuffle make project-name`. This will create a folder
in the current working directory with a fuffle environment set up.

### Project Structure
The normal project structure of a Fuffle application looks as follows:
```
project-name
+-- data
|   +-- table.dat
|   +-- nedb data files...
+-- models
|   +-- index.json
|   +-- models...
+-- static
|   +-- css
|   |   +-- master.css
|   +-- js
|   |   +-- master.js
|   +-- static files...
+-- views
|   +-- index.pug
|   +-- views...
+-- app.js
+-- package.json
```

## Routing
Fuffle's main goal is to minimize backend development. To do this,
it uses built-in functions called response-makers. Use them like so:
```javascript
fuffle.routeCreator('/create', 'tableName', 'modelName', '/path/to/redirect');
```
This will make a route to "/path/to/url" that adds `modelName` to `tableName`,
and redirects to "/path/to/redirect". These response-makers are based on
CRUD support, so there are four:
```
fuffle.routeCreator('/create', 'tableName', 'modelName', '/path/to/redirect');
fuffle.routeReader('/read', 'viewName');
fuffle.routeUpdater('/update', 'tableName', 'modelName', '/path/to/redirect');
fuffle.routeDeleter('/delete', 'tableName', 'modelName', '/path/to/redirect');
```
If none of these response-makers match that page's needs, you can use the simple
routers to make your own routes.
```javascript
fuffle.get('/', (request, response) => {
  // handle get requests to the '/' url
})
fuffle.post('/', (request, response) => {
  // handle post requests to the '/' url
})
```

## Views
Views are loaded from the `views` directory by default, but this directory
can be set with `fuffle.setViewDir(dir)`. Views are written in
[pug](https://pugjs.org/) (formerly jade) by default. You can also use vash,
handlebars, or plain html using `fuffle.setViewEngine(engine, fileExtension)`.

### Built-in View Engines
| Engine | File Extension | Call |
| ------ | -------------- | ---- |
| [Vash](https://www.npmjs.com/package/vash) | .vash | `fuffle.setViewEngine('vash', 'vash')` |
| [Handlebars](https://www.npmjs.com/package/handlebars) | .hbs | `fuffle.setViewEngine('handlebars', 'hbs')` |
| Html | .html | `fuffle.setViewEngine('html', 'html')` |

### Other View Engines
We don't have every view engine built in, but you can add any one you'd like.
```javascript
const ejs = require('ejs')
const fs = require('fs')

fuffle.setViewEngine((path, data, cb) => {
  ejs.renderFile(path, data, (err, str) => {
    cb(str)
  })
})
```

## Models
Models are written in normal json, and can be stored with the same path
as the view, but in the models directory. This means the view 'views/index.pug'
will try to use the 'models/index.json' model. Views may also have there model
directly inline with the pug syntax, for example:
```
pug syntax...
//@{
    "key": "value",
    "key": {
      "value": "value-value"
    }
  }@
more pug syntax...
```
Or in other view engines
```
<!--@{
  "key": "value",
  "key": {
    "value": "value-value"
  }
}@-->
```

## Middleware
Middleware is called directly after the request is made, the route hasn't been
processed yet, and the model hasn't been fetched. You can add middleware with
the `addMiddleware` function:
```javascript
fuffle.addMiddleware((request, response, next) => {
  request.customMiddlewareDone = true;
  next(request, response);
});
```
### Current Middleware
 - Cookies: `request.cookies.cookieName`
 - Post data: `request.body.formName`
 - Get parameters: `request.params.paramName`

## Fetchers
Fetchers are called to parse models, for example:
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
### Built-in Fetchers
 - Database
   ```json
   {
     "db": {
       "user": { "_comment": "returns only John's user",
         "table": "users",
         "doc": {
           "name": "John"
         },
         "single": "true"
       },
       "redFish": { "_comment": "returns all fish with 'color': 'red'",
         "table": "fish",
         "doc": {
           "color": "red"
         }
       },
       "barrels": { "_comment": "returns all barrels",
         "table": "barrels"
       }
     }
   }
   ```
 - Form Data
   ```json
   {
     "post": { "_comment": "returns the value of the inputName field",
       "variable": "inputName"
     }
   }
   ```
 - URL Parameters
   ```json
   {
     "get": { "_comment": "returns the value of the url parameter keyName",
       "variable": "keyName"
     }
   }
   ```

## Custom Fetchers
You can create a fetcher with the putFetcher function:
```javascript
fuffle.putFetcher("string-doubler", (request, tofetch, next) => {
 for (var key in tofetch) {                         // loop through all keys in object to fetch
   var toBeDoubled = tofetch[key];                  // get the string to be doubled
   tofetch[key] = toBeDoubled + toBeDoubled;        // double the string
 }
 next(tofetch);                                     // proceed to the next fetcher
});
```

## Database
Fuffle uses [nedb](https://github.com/louischatriot/nedb) as a database
engine, so all data is stored in memory, and stored as json in the `data` directory, which makes
database calls extremely fast and light weight. Load a table into memory using
`fuffle.loadTable(tableName);`. If the table doesn't exist, it will be created.
You can then access the table using the ["db" fetcher](#fetchers). Or in code
with `fuffle.getTable(tableName)`.
