const DB = require('./mongo/DB.js')
const { BAD_REQUEST } = require('./responses.js')

const expressPromise = func => (req, res) => Promise.resolve(func(req, res))
    .then(data => {
        res.json({ data })
    })
    .catch(error => {
        res.send(error.message || error)
    })

class Fuffle {
    constructor(options) {
        this.options = options
        this.handleRequest = expressPromise(this.handleRequest.bind(this))
        return new Promise((resolve, reject) => {
            DB.connect(options.db.url, options.db.name, db => {
                this.db = db
                resolve(this)
            })
        })
    }
    handleRequest(req) {

        const { url, method, body } = req
    
        const parts = url.split('/')
        const lastPart = parts.pop()
    
        if (parts.length && !parts[0].length) parts.shift()
    
        if (parts.length && !parts[parts.length - 1].length) parts.pop()
    
        if (!parts.length) throw new Error(BAD_REQUEST)
    
        let selected = this.db
    
        for (const part of parts) selected = selected[part]

        let result
    
        switch (method.toLowerCase()) {
            case 'get':
                result = selected[lastPart]()
                break
            case 'post':
                result = selected[lastPart](...body.data)
                break
            case 'put':
                selected[lastPart] = body.data
                result = true
                break
        }

        if (result) return result
    
        throw new Error(BAD_REQUEST)
    }
}

module.exports = Fuffle