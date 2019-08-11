const Fuffle = require('../lib')
const express = require('express')

const logColors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
}

const logColor = (color, string) => `${logColors[color]}${string}${logColors.reset}`

const logTest = (name, test) => Promise.resolve(test)
    .then(() => {
        console.log(`${logColor('green', 'TEST PASSED')}: ${name}`)
    })
    .catch(error => {
        const message = error.message || error
        console.log(`${logColor('red', 'TEST FAILED')}: ${name}\r\n\t${message}`)
    })

const app = express()

app.use(express.json())

let fuffle

new Fuffle({
    db: {
        url: 'mongodb://localhost:27017',
        name: 'fuffle-test'
    }
}).then(_fuffle => {

    fuffle = _fuffle

    app.use(fuffle.handleRequest)

    const server = app.listen(3000, () => {
        console.log('listening on 3000')
    })

    Promise.all(tests(fuffle)).then(() => {
        server.close()
        fuffle.db().close()
    })
})

const fail = message => { throw new Error(message) }
const checkId = item => { if (!item._id) fail('item did not get id') }
const checkText = text => item => { if (item.text !== text) fail('item did not get text') }

const tests = ({ db }) => [

    logTest('insert one', db.items.push({ text: 'asdf' })
        .then(item => {
            checkId(item)
            checkText('asdf')(item, 'asdf')
        })),
    
    logTest('insert multiple', db.items.concat([ { text: 'abc' }, { text: 'def' } ])
        .then(items => {
            items.forEach(checkId)
            checkText('abc')(items[0])
            checkText('def')(items[1])
        })),
    
    logTest('read one', db.items.push({ text: 'asdf' })
        .then(item1 => {
            return db.items[item1._id]
                .then(item2 => {
                    if (!item1._id.equals(item2._id)) fail('got wrong id')
                    if (item1.text !== item2.text) fail('got wrong text')
                })
        })),
    
    logTest('read multiple', db.items.push({ text: 'asdf' })
        .then(() => db.items.filter({ text: 'asdf' }))
        .then(items => {
            if (!items.length) fail('got no items')
            items.forEach(checkText('asdf'))
        })),
    
    logTest('update one', db.items.push({ text: 'abc' })
        .then(item1 => {
            checkText('abc')(item1)
            ; (db.items[item1._id] = { text: 'def', flag: true })
                .then(item2 => {
                    if (!item1._id.equals(item2._id)) fail('updated wrong id')
                    if (!item2.flag) fail('item lost flag')
                    checkText('def')(item2)
                })
        })),
    
    logTest('update multiple', db.items.concat([{ text: 'abc', flag2: true }, { text: 'def', flag2: true }])
        .then(items1 => {
            const _ids1 = items1.map(item => item._id.toHexString())
            return db.items
                .filter({ flag2: true })
                .map({ text: 'asdf' })
                .then(n => {
                    if (n < 2) fail('did not update enough docs')
                    return db.items.filter({ flag2: true, text: 'asdf' })
                })
                .then(items2 => {
                    const _ids2 = items2.map(item => item._id.toHexString())
                    if (!_ids1.every(_id => _ids2.includes(_id))) fail('did not update all matched docs')
                })
        })),
    
    logTest('delete one', db.items.push({ text: 'asdf' })
        .then(item => db.items.pop(item._id)
        .then(n => {
            if (typeof n !== 'number') fail('delete count not number')
            if (n > 1) fail('deleted more than one')
            if (n < 1) fail('failed to delete')
        }))),
    
    logTest('delete multiple', db.items.concat([
            { text: 'abc', flag: true }, { text: 'def', flag: true } ])
        .then(items => db.items.slice({ flag: true }))
        .then(n => {
            if (typeof n !== 'number') fail('delete count not number')
            if (n < 2) fail('failed to delete')
        })),

]