const sass = require('node-sass')

module.exports = {
  css: (source, cb) => {
    cb(source)
  },

  sass: (source, cb) => {
    sass.render({data: source}, (err, result) => {
      cb(result.css)
    })
  },
}
