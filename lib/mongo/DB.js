const { MongoClient } = require('mongodb')
const Resource = require('../Resource.js')
let Collection

const resources = {}

class DB extends Resource {

    get data() { return this.client }

    static get resources() {
        return resources
    }

    static defineResource(type, name, resource) {
        if (!resources[type]) resources[type] = {}
        resources[type][name] = resource
    }

    static connect(url, name, cb) {

        const client = new MongoClient(url, { useNewUrlParser: true })

        return client.connect()
            .then(() => {
                const db = client.db(name)
                cb(new DB(client, db))
            })

    }

    constructor(client, db) {

        super()

        this.client = client
        this.db = db
        this.resources = {}

        return Resource.wrap(this)
        
    }

    get(selector) {

        let CollectionType = (resources.collections && resources.collections[selector]) || Collection

        return new CollectionType(this.db.collection(selector))
        
    }

}

module.exports = DB

Collection = require('./Collection.js')