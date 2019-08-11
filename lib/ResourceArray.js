const Resource = require('./Resource.js')
const { OPERATION_NOT_EXPECTED } = require('./responses.js')

const isValidObjectID = string => typeof string === 'string' && !!/^[a-fA-F0-9]{24}$/.test(string)

class ResourceArray extends Resource {
    static wrap(resourceArray) {
        return new Proxy(()=>{}, {
            get: (_, key) => { // route: hit arr child w get(get)/post(call)
                if (isValidObjectID(key)) return resourceArray.get(key)
                else return resourceArray[key].bind(resourceArray)
            },
            set: (_, key, val) => { // route: hit arr child w put

                if (!val || typeof val !== 'object') return false

                const data = Object.assign({}, val)
                for (const prop in val) delete val[prop]
                val.data = data
                const p = resourceArray.set(key, data)
                val.then = p.then.bind(p)
                val.catch = p.catch.bind(p)

                return true

            },
            deleteProperty: (_, key) => { // route: hit arr child w delete
                resourceArray.pop(key)
                return true
            },
            apply: (_, targ, args) => {  // route: hit arr
                return resourceArray.data
            }
        })
    } // route: hitt arr/func w post
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