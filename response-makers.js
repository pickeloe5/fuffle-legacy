let fs = require('fs')
let pug = require('pug')

let env = require('./env.js')

/**
 * isFunction - Checks if the given obj is a function
 *
 * @param  {Object}  obj The object to check
 * @return {Boolean}     True if the object is a function
 */
function isFunction(obj) {
  return obj && {}.toString.call(obj) === '[object Function]'
}

/**
 * fetch - Calls any fetchers that the model requires
 *
 * @param  {Object}   request The request to fetch data from
 * @param  {Object}   model   The model to fetch data for
 * @param  {Function} cb      A callback to call upon completion
 */
function fetch(request, model, cb) {
  model = JSON.parse(JSON.stringify(model))
  for (let key in model) {
    if (typeof model[key] == 'object' && env.fetchers[key]) {
      env.fetchers[key](request, model[key], nextFetch(request, model, key))
      return
    }
  }
  cb(model)


  /**
   * nextFetch - Returns a functiont to process the next fetcher
   *
   * @param  {Object}  request     The request to fetch data from
   * @param  {Object}  model       The model to fetch data for
   * @param  {string}  fetcherKey  The key to fetch from the model
   * @return {Function}            A function to continue to the next fetch
   */
  function nextFetch(request, model, fetcherKey) {
    return function(result) {
      delete model[fetcherKey]
      for (let key in result) {
        if (objectHasKey(result, key)) {
          model[key] = result[key]
        }
      }
      fetch(request, model, cb)
    }
  }
}

/**
 * getJSON - description
 *
 * @param  {string} view The name of the view to get json from
 * @return {Object}      The json relating to the specified view
 */
function getJSON(view) {
  let model = {}
  if (fs.existsSync(env.modelDir + view + '.json')) {
    model = JSON.parse(fs.readFileSync(env.modelDir + view + '.json'))
  }
  let hitJson = false
  let source = fs.readFileSync(env.viewDir + view + '.pug').toString()
  let json = ''
  for (let i = 0; i < source.length; i++) {
    if (source[i] == '@' && source[i+1] == '{') {
      hitJson = true
      i += 2
      while (!(source[i] == '}' && source[i+1] == '@')) {
        json += source[i]
        i++
      }
      break
    }
  }
  if (hitJson) {
    model = JSON.parse(json)
  }
  if (fs.existsSync(env.modelDir + 'globals.json')) {
    let globals = JSON.parse(fs.readFileSync(env.modelDir + 'globals.json'))
    for (let key in globals) {
      if (!(key in model)) {
        model[key] = globals[key]
      }
    }
  }
  return model
}

exports.makers = function(fuffle) {
  fuffle.makeCreator = function(table, model, redirect) {
    if (typeof model == 'string') {
      model = JSON.parse(fs.readFileSync(env.modelDir + model + '.json'))
    }
    return function(request, response) {
      if (redirect == undefined) redirect = request.url
      fetch(request, model, function(doc) {
        env.db[table].find({}).sort({'_inc': -1}).exec(function(err, docs) {
          if (docs.length == 0) doc['_inc'] = 0
          else doc['_inc'] = parseInt(docs[0]['_inc']) + 1
          env.db[table].insert(doc, function(err, newdoc) {
            if (isFunction(redirect)) {
              redirect(request, response)
            } else {
              response.writeHead(302, {'Location': redirect})
              response.end()
            }
          })
        })
      })
    }
  }

  fuffle.makeReader = function(view, model) {
    if (typeof model == 'string') {
      model = JSON.parse(fs.readFileSync(env.modelDir + model + '.json'))
    }
    return function(request, response) {
      if (model == null) model = getJSON(view)
      fetch(request, model, function(args) {
        response.end(pug.renderFile(env.viewDir + view + '.pug', args))
      })
    }
  }

  fuffle.makeUpdater = function(table, model, redirect) {
    if (typeof model == 'string') {
      model = JSON.parse(fs.readFileSync(env.modelDir + model + '.json'))
    }
    return function(request, response) {
      fetch(request, model, function(doc) {
        env.db[table].find({'_id': doc['_id']}, function(err, preDoc) {
          doc['_inc'] = preDoc[0]['_inc']
          env.db[table].update({'_id': doc['_id']}, doc, {}, function(err) {
            if (isFunction(redirect)) {
              redirect(request, response)
            } else {
              response.writeHead(302, {'Location': redirect})
              response.end()
            }
          })
        })
      })
    }
  }

  fuffle.makeDeleter = function(table, model, redirect) {
    if (typeof model == 'string') {
      model = JSON.parse(fs.readFileSync(env.modelDir + model + '.json'))
    }
    return function(request, response) {
      fetch(request, model, function(doc) {
        env.db[table].remove(doc, {}, function(err, numRemoved) {
          if (isFunction(redirect)) {
            redirect(request, response)
          } else {
            response.writeHead(302, {'Location': redirect})
            response.end()
          }
        })
      })
    }
  }

  fuffle.routeCreator = function(url, table, model, redirect) {
    fuffle.post(url, fuffle.makeCreator(table, model, redirect))
  }

  fuffle.routeReader = function(url, view, model) {
    fuffle.get(url, fuffle.makeReader(view, model))
  }

  fuffle.routeUpdater = function(url, table, model, redirect) {
    fuffle.post(url, fuffle.makeUpdater(table, model, redirect))
  }

  fuffle.routeDeleter = function(url, table, model, redirect) {
    fuffle.get(url, fuffle.makeDeleter(table, model, redirect))
  }
}
