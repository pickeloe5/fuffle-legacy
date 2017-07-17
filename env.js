const path = require('path')
const Nedb = require('nedb')

const middlewares = require('./middlewares.js')
const fetchers = require('./fetchers.js')

exports.port = 3000
exports.projectDir = path.dirname(require.main.filename)
exports.viewDir = exports.projectDir + '/views/'
exports.dataDir = exports.projectDir + '/data/'
exports.modelDir = exports.projectDir + '/models/'
exports.staticDir = exports.projectDir + '/static'

exports.routes = []
exports.middlewares = middlewares
exports.fetchers = fetchers
exports.db = {}
exports.error = {}

exports.setters = function(fuffle) {
  fuffle.setViewDir = function(dir) {
    exports.viewsDir = dir
  }

  fuffle.setDataDir = function(dir) {
    exports.dataDir = dir
  }

  fuffle.setModelDir = function(dir) {
    exports.modelDir = dir
  }

  fuffle.setStaticDir = function(dir) {
    exports.staticDir = dir
  }

  fuffle.addMiddleware = function(middleware) {
    exports.middlewares.push(middleware)
  }

  fuffle.putFetcher = function(fetcherName, fetcher) {
    exports.fetchers[fetcherName] = fetcher
  }

  fuffle.loadTable = function(name) {
    exports.db[name] = new Nedb(exports.dataDir + name + '.dat')
    exports.db[name].loadDatabase()
  }

  fuffle.getTable = function(name) {
    return exports.db[name]
  }

  fuffle.setPort = function(p) {
    exports.port = p
  }
}
