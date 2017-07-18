#! /usr/bin/env node

const fs = require('fs')
const ncp = require('ncp').ncp

const args = process.argv.slice(process.argv[0].includes('node.exe') ? 2 : 1)
if (args[0] == 'make' && args[1]) makeProject(args[1])

/**
 * Generates a boilerplate Fuffle project
 *
 * @param {string} name - The name of the project to generate.
 */
function makeProject(name) {
  let dir = process.cwd() + '/' + name
  if (fs.existsSync(dir) && fs.readdirSync(dir).length > 0) {
    console.log('That directory isn\'t empty, the project cannot be generated.')
    return
  }
  ncp(__dirname + '/make', dir, function(err) {
    let newContents = fs.readFileSync(dir + '/package.json').toString()
                        .replace('{{name}}', name)
    fs.writeFileSync(dir + '/package.json', newContents)
    console.log('Project created succesfully.')
  })
}
