const Resource = require('../Resource.js')

class Document extends Resource {

    get data() { return this.operation.then(() => this.document) }

    constructor(collection, operation, DocumentType) {

        super()

        this.collection = collection
        this.operation = Promise.resolve(operation)
            .then(document => this.document = document)
        this.DocumentType = DocumentType

        return Resource.wrap(this)

    }

    get(selector) {

        const documentType = !this.DocumentType ? {} : this.DocumentType.prototype
        
        if (documentType[selector] && selector !== 'constructor') {

            const bindFunction = (func, update = {}) => (...args) => {
    
                const proxy = new Proxy(update, {
                    get: (_, key) => {
                        if (documentType[key])
                            return documentType[key].bind(proxy)
                        if (update.hasOwnProperty(key))
                            return update[key]
                        return this.document[key]
                    },
                    set: (_, key, val) => {
                        update[key] = val
                        return true
                    }
                })
    
                return this.operation = this.operation.then(() => func.call(proxy, ...args))
                    .then(() => this.collection.set(this.document._id, update))
    
            }
    
            return bindFunction(this.DocumentType.prototype[selector])

        }

        return this.operation = this.operation.then(() => this.document[selector])


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