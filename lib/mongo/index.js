const { Collection, ObjectID } = require('mongodb')
let Document, DocumentSet, FuffleCollection, DB

const filter = (selector = {}) => document => Object.entries(selector)
    .every(([ key, val ]) => document[key] === val)

function expose(name) {
    return function(ClassRef) {
        ClassRef.finisher = Class => {
            let type
            if (Class.prototype instanceof Document) {
                type = 'documents'
            } else if (Class.prototype instanceof FuffleCollection) {
                type = 'collections'
            } else {
                return console.error('expose-bad-type', Class)
            }
            DB.defineResource(type, name, Class)
        }
    }
}

function makeDocument(method) {
    const { value } = method.descriptor
    method.descriptor.value = function(...args) {
        const fuffleCollection = this.collection instanceof Collection ? this : this.collection
        const name = fuffleCollection.collection.collectionName
        const DocumentType = (DB.resources.documents && DB.resources.documents[name]) || Document
        return new DocumentType(fuffleCollection, value.call(this, ...args))
    }
    return method
}

function documentSet(method) {
    const { value } = method.descriptor
    method.descriptor.value = function(...args) {
        const collection = this.collection instanceof Collection ? this : this.collection
        return new DocumentSet(collection, value.call(this, ...args))
    }
    return method
}

function normalizeSelector(method) {
    const { value } = method.descriptor
    method.descriptor.value = function(selector, ...args) {
        if (typeof selector === 'string') selector = { _id: new ObjectID(selector) }
        else if (selector instanceof ObjectID) selector = { _id: selector }
        return value.call(this, selector, ...args)
    }
    return method
}

module.exports = { expose, filter, makeDocument, documentSet, normalizeSelector }

Document = require('./Document.js')
DocumentSet = require('./DocumentSet.js')
FuffleCollection = require('./Collection.js')
DB = require('./DB.js')