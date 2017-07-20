let fs = require('fs')

const util = require('./util.js')
const viewEngines = require('./view-engines.js')

module.exports = (fuffle) => {
  const env = fuffle.env

  /**
   * Checks if the given obj is a function
   *
   * @param  {Object}  obj - The object to check
   * @return {Boolean}     - True if the object is a function
   */
  function isFunction(obj) {
    return obj && {}.toString.call(obj) === '[object Function]'
  }

  /**
   * Calls any fetchers that the model requires
   *
   * @param  {Object}   request - The request to fetch data from
   * @param  {Object}   model   - The model to fetch data for
   * @param  {Function} cb      - A callback to call upon completion
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
     * Returns a function to process the next fetcher
     *
     * @param  {Object}  request     - The request to fetch data from
     * @param  {Object}  model       - The model to fetch data for
     * @param  {string}  fetcherKey  - The key to fetch from the model
     * @return {Function}            - A function to continue to the next fetch
     */
    function nextFetch(request, model, fetcherKey) {
      return function(result) {
        delete model[fetcherKey]
        for (let key in result) {
          if (util.objectHasKey(result, key)) {
            model[key] = result[key]
          }
        }
        fetch(request, model, cb)
      }
    }
  }

  /**
   * Gets the json pertaining to the given view
   *
   * @param  {string} view - The name of the view to get json from
   * @param  {Function} cb - Called upon completion
   */
  function getJSON(view, cb) {
    const addGlobals = (model) => {
      fs.readFile(env.modelDir + 'globals.json', 'utf-8', (err, source) => {
        if (!err) {
          let globals = JSON.parse(source)
          for (let key in globals) {
            if (!(key in model)) {
              model[key] = globals[key]
            }
          }
        }
        cb(model)
      })
    }
    fs.readFile(env.modelDir + view + '.json', 'utf-8', (err, source) => {
      if (!err) {
        addGlobals(JSON.parse(fs.readFileSync(env.modelDir + view + '.json')))
      } else {
        fs.readFile(env.viewDir + view + '.' + env.viewExtension, 'utf-8',
            (err, viewSource) => {
          if (err) throw err
          let hitJson = false
          let json = ''
          for (let i = 0; i < viewSource.length; i++) {
            if (viewSource[i] == '@' && viewSource[i+1] == '{') {
              hitJson = true
              i++
              while (!(viewSource[i] == '@' && viewSource[i-1] == '}')) {
                json += viewSource[i]
                i++
              }
              break
            }
          }
          if (hitJson) addGlobals(JSON.parse(json))
          else addGlobals({})
        })
      }
    })
  }

  /**
   * Makes a function to insert an element into a database table
   *
   * @param  {string}   table    - The table to insert data to
   * @param  {Object}   model    - The pre-fetch model to insert into the table
   * @param  {string}   redirect - The url to redirect to after inserting
   * @return {Function}          - A function that inserts the pre-fetch
   *                               model and redirects to the specified url
   */
  //  fuffle.makeCreator = (table, model, redirect) => {
  fuffle.makeCreator = (...args) => {
    let [table, model, redirect] = util.unpackArgs(args)
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

  /**
   * Makes a function to send the specified view back to the client
   *
   * @param  {string}   view  - The view to send
   * @param  {Object}   model - The pre-fetch model to apply to the view
   * @return {Function}       - A function that sends the specified view
   */
  fuffle.makeReader = (...args) => {
    let [view, model] = util.unpackArgs(args)
    if (typeof model == 'string') {
      model = JSON.parse(fs.readFileSync(env.modelDir + model + '.json'))
    }
    return function(request, response) {
      const cb = (model) => {
        fetch(request, model, function(args) {
          if (env.viewEngine == viewEngines.pug) args.basedir = env.viewDir
          env.viewEngine(env.viewDir + view + '.' + env.viewExtension, args,
              (result) => {
            response.end(result)
          })
        })
      }
      if (!model) {
        getJSON(view, cb)
      } else {
        cb(model)
      }
    }
  }

  /**
   * Makes a function to update an element in a database table
   *
   * @param  {string}   table    - The table to update data in
   * @param  {Object}   model    - The pre-fetch model to update in the table
   * @param  {string}   redirect - The url to redirect to after updating
   * @return {Function}          - A function that updates the model and
   *                               redirects to the specified url
   */
  fuffle.makeUpdater = (...args) => {
    let [table, model, redirect] = util.unpackArgs(args)
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

  /**
   * Makes a function to delete an element from a database table
   *
   * @param  {string}   table    - The table to delete data from
   * @param  {Object}   model    - The pre-fetch model to delete in the table
   * @param  {string}   redirect - The url to redirect to after deleting
   * @return {Function}          - A function that delets the model and
   *                               redirects to the specified url
   */
  fuffle.makeDeleter = (...args) => {
    let [table, model, redirect] = util.unpackArgs(args)
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

  /**
   * Routes the given url to a creator for the given table, model, and redirect
   *
   * @param {string} url      - The url to route
   * @param {string} table    - The table to insert into
   * @param {Object} model    - The pre-fetch model to insert
   * @param {string} redirect - The url redirect to after inserting
   */
  fuffle.routeCreator = (...args) => {
    let [url, table, model, redirect] = util.unpackArgs(args)
    fuffle.post(url, fuffle.makeCreator({table, model, redirect}))
  }

  /**
   * Routes the given url to a reader for the given view and model
   *
   * @param {string} url   - The url to route
   * @param {string} view  - The view to send
   * @param {Object} model - The pre-fetch model to apply to the view
   */
  fuffle.routeReader = (...args) => {
    let [url, view, model] = util.unpackArgs(args)
    fuffle.get(url, fuffle.makeReader(view, model))
  }

  /**
   * Routes the given url to a updater for the given table, model, and redirect
   *
   * @param {string} url      - The url to route
   * @param {string} table    - The table to update in
   * @param {Object} model    - The pre-fetch model to update
   * @param {string} redirect - The url redirect to after updating
   */
  fuffle.routeUpdater = (...args) => {
    let [url, table, model, redirect] = util.unpackArgs(args)
    fuffle.post(url, fuffle.makeUpdater(table, model, redirect))
  }

  /**
   * Routes the given url to a deleter for the given table, model, and redirect
   *
   * @param {string} url      - The url to route
   * @param {string} table    - The table to delete from
   * @param {Object} model    - The pre-fetch model to delete
   * @param {string} redirect - The url redirect to after deleting
   */
  fuffle.routeDeleter = (...args) => {
    let [url, table, model, redirect] = util.unpackArgs(args)
    fuffle.get(url, fuffle.makeDeleter(table, model, redirect))
  }
}
