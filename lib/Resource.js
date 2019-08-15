const { OPERATION_NOT_EXPECTED } = require('./responses.js')
const { makeTraps } = require('./utils.js')

class Resource {

    static wrap(resource) {
        return new Proxy(()=>{}, makeTraps(resource, false))
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