const path = require('path')
const Nedb = require('nedb')

const middlewares = require('./middlewares.js')

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
  }

  fuffle.setViewDir = (dir) => fuffle.env.viewsDir = dir
  fuffle.setDataDir = (dir) => fuffle.env.dataDir = dir
  fuffle.setModelDir = (dir) => fuffle.env.modelDir = dir
  fuffle.setStaticDir = (dir) => fuffle.env.staticDir = dir

  fuffle.addMiddleware = (middleware) => fuffle.env.middlewares.push(middleware)
  fuffle.putFetcher = (fetcherName, fetcher) =>
    fuffle.env.fetchers[fetcherName] = fetcher

  fuffle.loadTable = (name) => {
    fuffle.env.db[name] = new Nedb(fuffle.env.dataDir + name + '.dat')
    fuffle.env.db[name].loadDatabase()
  }

  fuffle.getTable = (name) => fuffle.env.db[name]
  fuffle.setPort = (port) => fuffle.env.port = port
}
