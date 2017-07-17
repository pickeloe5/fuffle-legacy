let url = require('url')
let Busboy = require('busboy')

module.exports = [
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
  function getGetParams(request, response, next) {
    let urlData = url.parse(request.url, true)
    request.params = urlData.query
    request.pathname = urlData.pathname
    next(request, response)
  },
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
