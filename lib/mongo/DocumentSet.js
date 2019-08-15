const ResourceArray = require('../ResourceArray.js')
const { asyncOperation, filter, makeDocument, documentSet, normalizeSelector } = require('.')

class DocumentSet extends ResourceArray {

    get data() { return this.documents }

    constructor(collection, operation) {

        super()

        this.collection = collection
        this.operation = Promise.resolve(operation)
            .then(documents => this.documents = documents)

        return ResourceArray.wrap(this)

    }

    @normalizeSelector
    @makeDocument
    get(selector) {

        return this.find(selector)

    }

    @asyncOperation
    @normalizeSelector
    find(selector) {

        return this.documents.find(filter(selector))

    }

    @documentSet
    filter(selector) {

        return this.documents.filter(filter(selector))

    }

    @asyncOperation
    @normalizeSelector
    set(selector, value) {

        const document = this.documents.find(filter(selector))

        if (!document) return 0

        return this.collection.set(document._id, value)

    }

    @asyncOperation
    map(value) {

        const { collection } = this.collection
        const _ids = this.documents.map(({ _id }) => _id)

        return collection.updateMany({ _id: { $in: _ids } }, { $set: value })
            .then(({ modifiedCount }) => modifiedCount)

    }

    @asyncOperation
    push(value) {

        return this.collection.push(value)
            .then(document => {
                this.documents.push(document)
                return document
            })

    }

    @asyncOperation
    concat(values) {
        
        return this.collection.concat(values)
            .then(documentSet => {
                this.documents.push(...documentSet.documents)
                return this
            })
            
    }

    @asyncOperation
    @normalizeSelector
    pop(selector) {

        const documentIndex = this.documents.findIndex(filter(selector))

        if (documentIndex < 0) return 0

        const document = this.documents[documentIndex]

        return this.collection.pop(document._id)
            .then(deleted => {

                if (deleted === 1) this.documents.splice(documentIndex, 1)

                return deleted

            })
        
    }

    @asyncOperation
    @normalizeSelector
    slice(selector) {

        const documents = this.documents.filter(filter(selector))

        if (documents.length === 0) return 0

        const _ids = documents.map(({ _id }) => _id)

        return this.collection.slice({ _id: { $in: _ids } })
            .then(deleted => {
                if (deleted === documents.length) {
                    this.documents = this.documents.filter(({ _id }) =>
                        !_ids.some(_id2 => _id.equals(_id2)))
                }
                return deleted
            })
    }

    @asyncOperation
    then(next) {
        return next(this.documents)
    }

    catch(handle) {
        return this.operation.catch(handle)
    }

}

module.exports = DocumentSet