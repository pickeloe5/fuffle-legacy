const path = require('path')
const Nedb = require('nedb')

const viewEngines = require('./view-engines.js')
const cssPreprocs = require('./css-preprocs.js')
const middlewares = require('./middlewares.js')
const util = require('./util.js')

let projectDir = path.dirname(require.main.filename)

module.exports = (fuffle) => {
  fuffle.env = {
    port: 3000,

    projectDir,
    viewDir: projectDir + '/views/',
    dataDir: projectDir + '/data/',
    modelDir: projectDir + '/models/',
    staticDir: projectDir + '/static',

    routes: [],
    middlewares,
    db: {},
    error: {},

    viewEngine: viewEngines.pug,
    viewExtension: 'pug',

    cssPreproc: cssPreprocs.sass,
    cssExtension: 'scss',
  }

  fuffle.setViewEngine = (engine, extension) => {
    fuffle.env.viewExtension = extension
    if (util.isFunction(engine)) {
      fuffle.env.viewEngine = engine
    } else {
      if (viewEngines[engine]) {
        fuffle.env.viewEngine = viewEngines[engine]
      } else {
        fuffle.env.viewEngine = viewEngines.html
        fuffle.env.viewExtension = 'html'
        console.err('Invalid view engine, falling back to html.')
      }
    }
  }

  /**
   * Sets the directory fuffle looks for views in
   *
   * @param {string} dir - The new directory relative to the project directory
   */
  fuffle.setViewDir = (dir) => {
    fuffle.env.viewsDir = dir
  }

  /**
   * Sets the directory fuffle looks for data in
   *
   * @param {string} dir - The new directory relative to the project directory
   */
  fuffle.setDataDir = (dir) => {
    fuffle.env.dataDir = dir
  }

  /**
   * Sets the directory fuffle looks for models in
   *
   * @param {string} dir - The new directory relative to the project directory
   */
  fuffle.setModelDir = (dir) => {
    fuffle.env.modelDir = dir
  }

  /**
   * Sets the directory fuffle looks for statis files in
   *
   * @param {string} dir - The new directory relative to the project directory
   */
  fuffle.setStaticDir = (dir) => {
    fuffle.env.staticDir = dir
  }

  /**
   * Adds a middleware function
   *
   * @param {Function} middleware - The middleware function(req, res, next)
   */
  fuffle.addMiddleware = (middleware) => {
    fuffle.env.middlewares.push(middleware)
  }

  /**
   * Adds a fetcher function with the specified name
   *
   * @param {string}   fetcherName - The name of the fetcher
   * @param {Function} fetcher     - The fetcher function(req, model, next)
   */
  fuffle.putFetcher = (fetcherName, fetcher) => {
    fuffle.env.fetchers[fetcherName] = fetcher
  }


  /**
   * Loads a table into memory. If the file doesn't exist, it's created.
   *
   * @param {string} name - The name of the table to lead
   */
  fuffle.loadTable = (name) => {
    fuffle.env.db[name] = new Nedb(fuffle.env.dataDir + name + '.dat')
    fuffle.env.db[name].loadDatabase()
  }


  /**
   * Gets a database table
   *
   * @param {string} name - The name of the desired table
   */
  fuffle.getTable = (name) => {
    fuffle.env.db[name]
  }


  /**
   * Sets the port for fuffle to listen on
   *
   * @param {Number} port - The port to listen on
   */
  fuffle.setPort = (port) => {
    fuffle.env.port = port
  }
}
