const DB = require('./mongo/DB.js')
const { BAD_REQUEST } = require('./responses.js')

class Fuffle {
    constructor(options) {
        this.options = options

        return new Promise((resolve, reject) => {
            DB.connect(options.db.url, options.db.name, db => {
                this.db = db
                resolve(this)
            })
        })
    }
    handleRequest(req) {
        const { url, method } = req
    
        const parts = url.split('/')
        const lastPart = parts.pop()
    
        if (parts.length && !parts[0].length) parts.shift()
    
        if (parts.length && !parts[parts.length - 1].length) parts.pop()
    
        if (!parts.length) return
    
        let selected = this.db
    
        for (const part of parts) selected = selected[part]
    
        switch (method.toLowerCase()) {
            case 'get': return selected[lastPart]()
            case 'post': return selected[lastPart](...req.body.data)
            case 'put':
                selected[lastPart] = req.body.data
                return 'done'
        }
    
        throw new Error(BAD_REQUEST)
    }
}

module.exports = Fuffle