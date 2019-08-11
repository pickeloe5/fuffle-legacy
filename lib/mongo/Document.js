const Resource = require('../Resource.js')

class Document extends Resource {

    get data() { return this.operation }

    constructor(collection, operation) {

        super()

        this.collection = collection
        this.operation = Promise.resolve(operation)
            .then(document => this.document = document)

        return Resource.wrap(this)

    }

    get(selector) {

        if (this[selector] && typeof this[selector] === 'function') {
            return (...args) => {

                const update = {}

                const proxy = new Proxy(update, {
                    get: (_, key) => {
                        if (update.hasOwnProperty(key))
                            return update[key]
                        return this.document[key]
                    },
                    set: (_, key, val) => {
                        update[key] = val
                        return true
                    }
                })

                return this.operation = this.operation
                    .then(this[selector].call(proxy, ...args))
                    .then(() => this.collection.set(document._id, update))
                
            }
        }

        return this.operation = this.operation
            .then(() => this.document[selector])

    }
    
    set(selector, value) {
        
    }

    then(next) {
        return this.operation = this.operation.then(() => next(this.document))
    }

    catch(handle) {
        return this.operation = this.operation.catch(handle)
    }

}

module.exports = Document