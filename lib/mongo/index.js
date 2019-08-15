const { Collection, ObjectID } = require('mongodb')
let Document, DocumentSet, FuffleCollection, DB

const filter = (selector = {}) => document => Object.entries(selector)
    .every(([ key, val ]) => document[key] === val)

function exposeCollection(name) {
    return function(ClassRef) {
        ClassRef.finisher = Class => {
            DB.defineResource('collections', name, Class)
        }
    }
}

function exposeDocument(name) {
    return function(ClassRef) {
        ClassRef.finisher = Class => {
            DB.defineResource('documents', name, Class)
        }
    }
}

function constructDocument(method) {
    const { value } = method.descriptor
    method.descriptor.value = function(obj, ...args) {
        const { collection } = this.collection instanceof Collection ? this : this.collection
        const name = collection.collectionName
        const DocumentType = (DB.resources.documents && DB.resources.documents[name])
        if (!DocumentType) return value.call(this, obj)
        const document = Object.assign({}, new DocumentType(obj, ...args))
        return value.call(this, document)
    }
    return method
}

function makeDocument(method) {
    const { value } = method.descriptor
    method.descriptor.value = function(...args) {
        const fuffleCollection = this.collection instanceof Collection ? this : this.collection
        const name = fuffleCollection.collection.collectionName
        const DocumentType = (DB.resources.documents && DB.resources.documents[name]) || Document
        return new Document(fuffleCollection, value.call(this, ...args), DocumentType)
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

function asyncOperation(method) {
    const { value } = method.descriptor
    method.descriptor.value = function(...args) {
        return this.operation = this.operation.then(() => value.call(this, ...args))
    }
    return method
}

module.exports = { asyncOperation, exposeCollection, exposeDocument, filter, constructDocument, makeDocument, documentSet, normalizeSelector }

Document = require('./Document.js')
DocumentSet = require('./DocumentSet.js')
FuffleCollection = require('./Collection.js')
DB = require('./DB.js')