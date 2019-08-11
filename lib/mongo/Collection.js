const ResourceArray = require('../ResourceArray.js')
const { makeDocument, documentSet, normalizeSelector } = require('.')

class Collection extends ResourceArray {

    get data() { return this.collection }

    constructor(collection) {

        super()

        this.collection = collection
        
        return ResourceArray.wrap(this)

    }

    @normalizeSelector
    @makeDocument
    get(selector) {

        return this.find(selector)

    }

    @normalizeSelector
    find(selector) {

        return this.collection.findOne(selector)

    }

    @documentSet
    filter(selector) {

        return this.collection.find(selector).toArray()
        
    }

    @normalizeSelector
    set(selector, value) {

        return this.collection.findOneAndUpdate(selector, { $set: value }, { returnOriginal: false })
            .then(({ value }) => value)
        
    }

    map(value) {
        
        return this.collection.updateMany({}, { $set: value })
            .then(({ modifiedCount }) => modifiedCount)

    }

    @makeDocument
    push(value) {

        return this.collection.insertOne(value)
            .then(({ ops }) => ops[0])

    }

    @documentSet
    concat(values) {

        return this.collection.insertMany(values)
            .then(({ ops }) => ops)

    }

    @normalizeSelector
    pop(selector) {

        return this.collection.deleteOne(selector)
            .then(({ deletedCount }) => deletedCount)

    }

    @normalizeSelector
    slice(selector) {

        return this.collection.deleteMany(selector)
            .then(({ deletedCount }) => deletedCount)

    }

}

module.exports = Collection