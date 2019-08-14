const { OPERATION_NOT_EXPECTED } = require('./responses.js')

class Resource {

    static wrap(resource) {
        return new Proxy(()=>{}, {
            get: (_, key) => {
                if (key === 'then') return resource.then.bind(resource)
                if (key === 'catch') return resource.catch.bind(resource)
                return resource.get.call(resource, key)
            },
            set: (_, key, val) => {
                resource.set(key, val)
            },
            apply: (_, targ, args) => {
                return resource.data
            }
        })
    }

    get(selector) { // route: hit field w get(get)/post(call) req
        throw new Error(OPERATION_NOT_EXPECTED)
    }

    set(selector, value) { // route: hit field w put
        throw new Error(OPERATION_NOT_EXPECTED)
    }

    then(next) {
        return Promise.resolve(this.data).then(next)
    }

    catch(handle) {
        return Promise.resolve(this.data).then(handle)
    }

}

module.exports = Resource