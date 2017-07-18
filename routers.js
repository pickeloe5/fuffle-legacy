module.exports = (fuffle) => {
  /**
   * Routes the specified GET url to the given callback
   *
   * @param {string}   url      - The url to route
   * @param {Function} callback - The function(req, res) to handle the request
   */
  fuffle.get = (url, callback) => {
    fuffle.env.routes.push({
      'url': url,
      'method': 'GET',
      'callback': callback,
    })
  }

  /**
   * Routes the specified POST url to the given callback
   *
   * @param {string}   url      - The url to route
   * @param {Function} callback - The function(req, res) to handle the request
   */
  fuffle.post = (url, callback) => {
    fuffle.env.routes.push({
      'url': url,
      'method': 'POST',
      'callback': callback,
    })
  }

  /**
   * Routes the specified error code to the given callback
   *
   * @param {string}   code     - The error code to handle
   * @param {Function} callback - The function(req, res) to handle the error
   */
  fuffle.error = (code, callback) => {
    fuffle.env.error[code] = callback
  }
}
