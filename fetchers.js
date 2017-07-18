const util = require('./util.js')

module.exports = (fuffle) => {
  const env = fuffle.env

  return {
    db: (request, model, next) => {
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
    },

    post: (request, model, next) => {
      let result = {}
      for (let key in model) {
        if (util.objectHasKey(model, key)) {
          result[key] = request.body[model[key]]
        }
      }
      next(result)
    },

    get: (request, model, next) => {
      let result = {}
      for (let key in model) {
        if (util.objectHasKey(model, key)) {
          result[key] = request.params[model[key]]
        }
      }
      next(result)
    },
  }
}
