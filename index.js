const http = require('http')
const fs = require('fs')

let env = require('./env.js')
const responseMakers = require('./response-makers.js')
const fetchers = require('./fetchers.js')
const routers = require('./routers.js')

/**
 * Handles a request sent to the http server
 *
 * @param {Object} request  - The request to process
 * @param {Object} response - A response to send information back to the client
 */
function handleRequest(request, response) {
  request.middlewareIndex = 0
  if (env.middlewares[0]) {
    env.middlewares[0](request, response, nextMiddleware)
  }

  /**
   * Continues to the next middleware
   *
   * @param {Object} request  - The request to process
   * @param {Object} response - A response to send information back to the
   *                            client
   */
  function nextMiddleware(request, response) {
    request.middlewareIndex++
    if (env.middlewares[request.middlewareIndex]) {
      let mid = env.middlewares[request.middlewareIndex]
      mid(request, response, nextMiddleware)
    } else {
      route(request, response)
    }
  }

  /**
   * Routes the request to the correct route
   *
   * @param {Object} request  - The request to process
   * @param {Object} response - A response to send information back to the
   *                            client
   */
  function route(request, response) {
    let hit = false
    let url = rectifyUrl(request.pathname)
    for (let i in env.routes) {
      if (i < 0 || i >= env.routes.length) continue
      let route = env.routes[i]
      route.url = rectifyUrl(route.url)
      if (request.method.toLowerCase() == route.method.toLowerCase() &&
          url.toLowerCase() == route.url.toLowerCase()) {
        route.callback(request, response)
        hit = true
        break
      }
    }
    if (!hit) {
      let staticUrl = env.staticDir + url.substring(0, url.length - 1)
      if (fs.existsSync(staticUrl) && fs.statSync(staticUrl).isFile()) {
        if (staticUrl.endsWith('.html')) {
          response.setHeader('Content-Type', 'text/html')
        } else if (staticUrl.endsWith('.css')) {
          response.setHeader('Content-Type', 'text/css')
        } else if (staticUrl.endsWith('.js')) {
          response.setHeader('Content-Type', 'text/js')
        } else if (staticUrl.endsWith('.png')) {
          response.setHeader('Content-Type', 'image/png')
        } else if (staticUrl.endsWith('.jpg')) {
          response.setHeader('Content-Type', 'image/jpg')
        }
        response.end(fs.readFileSync(staticUrl))
      } else {
        if (env.error['404']) {
          env.error['404'](request, response)
        } else {
          response.writeHead(404)
          response.end()
        }
      }
    }
  }

  /**
   * Brings the url to a common state to make comparison easier
   *
   * @param  {string} url - The non-uniform url to be rectified
   * @return {string}     - The common form of the given url
   */
  function rectifyUrl(url) {
    if (url[0] != '/') url = '/' + url
    return url
  }
}

env(module.exports)
env = module.exports.env
env.fetchers = fetchers(module.exports)
responseMakers(module.exports)
routers(module.exports)


/**
 * Starts the server
 *
 * @param {Function} cb - A callback function to call upon completion
 */
module.exports.start = (cb) => {
  let port = module.exports.env.port
  if (!cb) {
    cb = () => {
      console.log('Fuffle listening on port ' + port)
    }
  }
  let server = http.createServer(handleRequest)
  server.listen(port, cb)
}
