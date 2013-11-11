'use strict'

var assert = require('assert')
var Promise = require('promise')
var it = require('../')

var exit = process.exit
process.exit = function (code) {
  if (code === 1) {
    exit(0)
  } else {
    exit(1)
  }
}

it('passes tests that do not fail', function () {
  assert(true)
})
it('fails tests that fail', function () {
  assert(false)
})
it('passes some async tests', function (done) {
  setTimeout(done, 100)
})
it('fails some async tests', function (done) {
  setTimeout(function () {
    done(new Error('oh dear'))
  }, 100)
})

it.run(function () {
  console.log('You can run things inline between tests\n')
})
it.run(function () {
  console.log('So half way through tests, such WOW!\n')
})
it('times out some tests', function (done) {
  setTimeout(function () {
    done()
  }, 999999)
}, '1 second')
it('supports promises just as well as callbacks', function () {
  return new Promise(function (resolve) {
    setTimeout(resolve, 100)
  })
})
it('supports failing promises just as well as callbacks', function () {
  return new Promise(function (resolve, reject) {
    setTimeout(reject.bind(this, new Error('oh dear')), 100)
  })
})
it('supports timing out promises just as well as callbacks', function () {
  return new Promise(function (resolve, reject) {
  })
}, '1 second')