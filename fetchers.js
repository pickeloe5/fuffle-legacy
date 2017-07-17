const env = require('./env.js')

/**
 * Checks if the given key exists in the given object
 *
 * @param {Object} obj - The object to check in
 * @param {string} key - The key to check for
 *
 * @return {Boolean} True if the object has the specified key
 */
function objectHasKey(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key) ||
          {}.hasOwnProperty.call(obj, key)
}

exports.db = function(request, model, next) {
  let result = {}
  check()

  /**
   * Fetches a value for the given key.
   *
   * @param {string} key - The key to fetch
   */
  function fetch(key) {
    let args = model[key]

    let table = args.table
    let doc = args.doc
    let single = args.single

    if (doc == null) doc = {}
    if (single == null) single = false

    env.db[table].find(doc).sort({'_inc': 1}).exec(function(err, docs) {
      if (single) docs = docs[0]
      result[key] = docs
      check()
    })
  }

  /**
   * Looks through the model to see if any key needs to be fetched
   */
  function check() {
    for (let key in model) {
      if (!result[key]) {
        fetch(key)
        return
      }
    }
    next(result)
  }
}

exports.post = function(request, model, next) {
  let result = {}
  for (let key in model) {
    if (objectHasKey(model, key)) {
      result[key] = request.body[model[key]]
    }
  }
  next(result)
}

exports.get = function(request, model, next) {
  let result = {}
  for (let key in model) {
    if (objectHasKey(model, key)) {
      result[key] = request.params[model[key]]
    }
  }
  next(result)
}
