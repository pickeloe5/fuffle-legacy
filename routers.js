module.exports = (fuffle) => {
  /**
   * Generates a route function for each method.
   */
  ((methods) => {
    for (const method of methods) {
      fuffle[method.toLowerCase()] = (url, callback) => {
        fuffle.env.routes.push({
          'url': url,
          'method': method.toUpperCase(),
          'callback': callback,
        })
      }
    }
  })(['get', 'post', 'put'])

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
