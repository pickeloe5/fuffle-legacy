/**
 * Checks if the given key exists in the given object
 *
 * @param  {Object}  obj - The object to check in
 * @param  {string}  key - The key to check for
 * @return {Boolean}     - True if the object has the specified key
 */
module.exports.objectHasKey = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key) ||
          {}.hasOwnProperty.call(obj, key)
}

module.exports.isFunction = (obj) => {
  return !!(obj && obj.constructor && obj.call && obj.apply)
}
