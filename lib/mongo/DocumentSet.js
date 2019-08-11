const ResourceArray = require('../ResourceArray.js')
const { filter, makeDocument, documentSet, normalizeSelector } = require('.')

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

    @normalizeSelector
    find(selector) {

        return this.operation = this.operation.then(() =>
            this.documents.find(filter(selector)))

    }

    @documentSet
    filter(selector) {

        return this.documents.filter(filter(selector))

    }

    @normalizeSelector
    set(selector, value) {

        const document = this.documents.find(filter(selector))

        if (!document) return 0

        return this.operation = this.operation.then(() =>
            this.collection.set({ _id: document._id }, value))

    }

    map(value) {

        const { collection } = this.collection

        return this.operation = this.operation.then(() => {
            const _ids = this.documents.map(({ _id }) => _id)
            return collection.updateMany({ _id: { $in: _ids } }, { $set: value })
                .then(({ modifiedCount }) => modifiedCount)
        })

    }

    push(value) {

        return this.operation = this.operation.then(() => this.collection.push(value)
            .then(document => {
                this.documents.push(document)
                return document
            }))

    }

    concat(values) {
        
        return this.operation = this.operation.then(() =>
                this.collection.concat(values)
            .then(documentSet => {
                this.documents.push(...documentSet.documents)
                return this
            }))
            
    }

    @normalizeSelector
    pop(selector) {

        const documentIndex = this.documents.findIndex(filter(selector))

        if (documentIndex < 0) return 0

        const document = this.documents[documentIndex]

        return this.operation = this.operation.then(() =>
                this.collection.pop({ _id: document._id })
            .then(deleted => {

                if (deleted === 0) return deleted

                this.documents.splice(documentIndex, 1)

                return deleted

            }))
        
    }

    @normalizeSelector
    slice(selector) {

        const documents = this.documents.filter(filter(selector))

        if (documents.length === 0) return 0

        const _ids = documents.map(({ _id }) => _id)

        return this.operation = this.operation.then(() =>
            this.collection.slice({ _id: { $in: _ids } }))
    }

    then(next) {
        return this.operation = this.operation.then(() => next(this.documents))
    }

    catch(handle) {
        return this.operation.catch(handle)
    }

}

module.exports = DocumentSet