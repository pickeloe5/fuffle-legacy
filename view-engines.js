const fs = require('fs')

const pug = require('pug')
const handlebars = require('handlebars')
const vash = require('vash')

module.exports = {
  pug: (path, data, cb) => {
    cb(pug.renderFile(path, data))
  },

  handlebars: (path, data, cb) => {
    fs.readFile(path, 'utf-8', (err, source) => {
      if (err) throw err
      let template = handlebars.compile(source)
      cb(template(data))
    })
  },

  vash: (path, data, cb) => {
    fs.readFile(path, 'utf-8', (err, source) => {
      if (err) throw err
      let template = vash.compile(source)
      cb(template(data))
    })
  },

  html: (path, data, cb) => {
    fs.readFile(path, 'utf-8', (err, source) => {
      if (err) throw err
      cb(source)
    })
  },
}
