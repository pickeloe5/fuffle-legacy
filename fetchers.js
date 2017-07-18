const util = require('./util.js')

module.exports = (fuffle) => {
  const env = fuffle.env

  return {

    /**
     * Fetches data from a database table based on given
     * paramaters from the model
     *
     * @param {Object} request - The request this data should pertain to
     * @param {Object} model   - The model to fetch data for
     * @param {Function} next  - Called to move on to the next fetcher
     */
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

    /**
     * Fetches data from the request body based on given
     * paramaters from the model
     *
     * @param {Object} request - The request this data should pertain to
     * @param {Object} model   - The model to fetch data for
     * @param {Function} next  - Called to move on to the next fetcher
     */
    post: (request, model, next) => {
      let result = {}
      for (let key in model) {
        if (util.objectHasKey(model, key)) {
          result[key] = request.body[model[key]]
        }
      }
      next(result)
    },

    /**
     * Fetches data from the url query based on given
     * paramaters from the model
     *
     * @param {Object} request - The request this data should pertain to
     * @param {Object} model   - The model to fetch data for
     * @param {Function} next  - Called to move on to the next fetcher
     */
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
