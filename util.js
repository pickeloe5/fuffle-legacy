const util = {}

/**
 * Checks if the given key exists in the given object
 *
 * @param  {Object}  obj - The object to check in
 * @param  {string}  key - The key to check for
 * @return {Boolean}     - True if the object has the specified key
 */
util.objectHasKey = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key) ||
          {}.hasOwnProperty.call(obj, key)
}

util.isFunction = (obj) => {
  return !!(obj && obj.constructor && obj.call && obj.apply)
}

util.isObject = (obj) => {
  return (obj !== null && typeof obj === 'object')
}

util.unpackArgs = (args) => {
  let arr = args
  if (arr.length == 1 && util.isObject(arr[0])) {
    arr = []
    let obj = args[0]
    for (let key in obj) if (key in obj) arr.push(obj[key])
  }
  return arr
}

module.exports = util
