class Fuffle {
    static get baseUrl() { return 'http://localhost:8080' }
    static request(method, url, data) {
        return new Promise((resolve, reject) => {

            const req = new XMLHttpRequest()

            req.responseType = 'json'

            req.addEventListener('load', () => {
                resolve(req.response)
            })

            req.open(method, Fuffle.baseUrl + url)

            if (data) {
                req.setRequestHeader('Content-Type', 'application/json')
                req.send(JSON.stringify({ data }))
            } else {
                req.send()
            }
            
        })
    }
    static resolve(operation) {
        const method = {
            get: 'GET', set: 'PUT', call: 'POST'
        }[operation.type]
        const url = `/${operation.parts.join('/')}`
        return Fuffle.request(method, url, operation.data)
    }
    constructor() {
        return new Proxy({}, {
            get: (_, key) => new Fuffle.Operation(key)
        })
    }
}

Fuffle.Operation = class Operation {
    constructor(part) {
        this.parts = [ part ]
        const proxy = new Proxy(() => {}, {
            get: (_, key) => {
                const push = () => {
                    this.parts.push(key)
                    return proxy
                }

                if (key === 'get') return _key => push(key)

                if (key === 'then') {
                    this.type = 'get'
                    return Fuffle.resolve(this)
                }

                return push()
            },
            set: (_, key, val) => {

                this.parts.push(key)
                this.data = val
                this.type = 'set'

                Fuffle.resolve(this)

                return true
            },
            apply: (_, targ, args) => {

                this.data = args
                this.type = 'call'

                return Fuffle.resolve(this)
            }
        })
        return proxy
    }
}