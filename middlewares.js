let url = require('url')
let Busboy = require('busboy')

module.exports = [

  /**
   * Parses form fields from the request data
   *
   * @param  {type} request  - The request to parse fields from
   * @param  {type} response - A response to send information back to the client
   * @param  {type} next     - Called to move on to the next middleware
   */
  function getPostData(request, response, next) {
    if (request.method.toLowerCase() != 'post') {
      next(request, response)
      return
    }
    request.body = {}
    let busboy = new Busboy({headers: request.headers})
    busboy.on('field', function(fieldname, val) {
      request.body[fieldname] = val
    })
    busboy.on('file', function(fieldname, file, filename) {
      let buffers = []
      let totalSize = 0
      file.on('data', function(data) {
        buffers.push(data)
        totalSize += data.length
      })
      file.on('end', function() {
        let fileContents = Buffer.concat(buffers, totalSize)
        request.body[fieldname] = {
          'filename': filename,
          'contents': fileContents,
        }
      })
    })
    busboy.on('finish', function() {
      next(request, response)
    })
    request.pipe(busboy)
  },

  /**
   * Parses paramters from the url query
   *
   * @param  {type} request  - The request to parse parameters from
   * @param  {type} response - A response to send information back to the client
   * @param  {type} next     - Called to move on to the next middleware
   */
  function getGetParams(request, response, next) {
    let urlData = url.parse(request.url, true)
    request.params = urlData.query
    request.pathname = urlData.pathname
    next(request, response)
  },

  /**
   * Parses cookies from the request
   *
   * @param  {type} request  - The request to parse cookies from
   * @param  {type} response - A response to send information back to the client
   * @param  {type} next     - Called to move on to the next middleware
   */
  function getCookies(request, response, next) {
    if (!request.headers.cookie) {
      request.cookies = {}
      next(request, response)
      return
    }
    let raw = request.headers.cookie.split(';')
    let cookies = {}
    for (let i = 0; i < raw.length; i++) {
      let cookie = raw[i]
      let parts = cookie.split('=')
      cookies[parts.shift().trim()] = decodeURI(parts.join('='))
    }
    request.cookies = cookies
    next(request, response)
  },
]
