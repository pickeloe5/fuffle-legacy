const Fuffle = require('../lib')
const express = require('express')
const openCors = require('./open-cors.js')

const app = express()

app.use(express.json())

app.use(openCors)

module.exports = cb => new Fuffle({
    db: {
        url: 'mongodb://localhost:27017',
        name: 'fuffle-test'
    }
}).then(fuffle => {

    app.use(fuffle.handleRequest)

    const server = app.listen(8080, () => {
        console.log('listening on 8080')
    })

    Promise.resolve(cb(fuffle)).then(() => {
        server.close()
        fuffle.db().close()
    })

})