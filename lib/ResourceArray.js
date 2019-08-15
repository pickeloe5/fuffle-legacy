const Resource = require('./Resource.js')
const { OPERATION_NOT_EXPECTED } = require('./responses.js')
const { makeTraps } = require('./utils.js')

class ResourceArray extends Resource {
    static wrap(resourceArray) {
        return new Proxy(()=>{}, makeTraps(resourceArray, true))
    }
    find(selector) {
        throw new Error(OPERATION_NOT_EXPECTED)
    }
    filter(selector) {
        throw new Error(OPERATION_NOT_EXPECTED)
    }
    map(value) {
        throw new Error(OPERATION_NOT_EXPECTED)
    }
    push(value) {
        throw new Error(OPERATION_NOT_EXPECTED)
    }
    concat(values) {
        throw new Error(OPERATION_NOT_EXPECTED)
    }
    slice(selector) {
        throw new Error(OPERATION_NOT_EXPECTED)
    }
    then(next) {
        throw new Error(OPERATION_NOT_EXPECTED)
    }
}

module.exports = ResourceArray