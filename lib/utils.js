const renderPromise = (obj, act) => {

    if (!obj || typeof obj !== 'object') return false

    const data = Object.assign({}, obj)
    for (const key in obj) delete obj[key]
    obj.data = data
    const p = act(data)
    obj.then = p.then.bind(p)
    obj.catch = p.catch.bind(p)

    return true
    
}

const makeTraps = (resource, promiseSet) => ({
    get: (_, key) => {
        if (resource.constructor.prototype[key]) {
            if (typeof resource[key] === 'function') {
                return resource[key].bind(resource)
            } else {
                return resource[key]
            }
        }
        return resource.get.call(resource, key)
    },
    set: (_, key, val) => {
        const call = data => resource.set.call(resource, key, data)
        if (promiseSet) {
            return renderPromise(val, call)
        } else {
            call(val)
            return true
        }
    },
    apply: (_, targ, args) => {
        return resource.data
    }
})

module.exports = { renderPromise, makeTraps }