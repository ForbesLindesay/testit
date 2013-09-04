'use strict'

var assert = require('assert')
var Promise = require('promise')
var color = require('bash-color')
var ms = require('ms')

module.exports = it

var pending = Promise.from(null)
function it(description, fn, timeout) {
  assert(typeof description === 'string', 'The description must be a string')
  assert(typeof fn === 'function', 'The test must be a function')
  if (fn.length > 0) {
    fn = Promise.denodeify(fn)
  }
  var start
  function uncaught(err) {
    displayError(err)
    process.removeListener('uncaughtException', uncaught)
    console.error(color.red('Exiting prematurely because of uncaught exception!!!'))
    process.exit(1)
  }
  pending = pending.then(function () {
    process.on('uncaughtException', uncaught)
    start = new Date()
    if (timeout != Infinity) {
      return dotimeout(fn(), timeout || '20 seconds')
    } else {
      return fn()
    }
  })
  .then(function () {
    process.removeListener('uncaughtException', uncaught)
    console.info(color.green(' v ') + description)
  }, function (err) {
    process.removeListener('uncaughtException', uncaught)
    displayError(err)
    pending.done(function () {
      process.exit(1)
    })
  })
  pending.done()
  function displayError(err) {
    console.error(color.red(' x ') + description)
    if (err) {
      console.error()
      console.error((err.stack || err.message || err).toString().replace(/^/gm, '   '))
    }
    console.error()
  }
}

function catchall(val) {
  function handle(err) {
  }
}
function dotimeout(val, timeout) {
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () {
      reject(new Error('Operation timed out'))
    }, ms(timeout.toString()))
    Promise.from(val)
      .done(function (res) {
        clearTimeout(timer)
        resolve(res)
      }, function (err) {
        clearTimeout(timer)
        reject(err)
      })
  })
}