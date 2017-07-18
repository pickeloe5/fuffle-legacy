module.exports = (fuffle) => {
  fuffle.get = (url, callback) => {
    fuffle.env.routes.push({
      'url': url,
      'method': 'GET',
      'callback': callback,
    })
  }

  fuffle.post = (url, callback) => {
    fuffle.env.routes.push({
      'url': url,
      'method': 'POST',
      'callback': callback,
    })
  }

  fuffle.error = (code, callback) => {
    fuffle.env.error[code] = callback
  }
}
