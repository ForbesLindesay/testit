# testit

Because the world needs a simpler testing framework.  Check out the travis build log for an example of test output and check out the test folder for an example test suite.

This module also works seamlessly with [istanbul](https://github.com/gotwarlost/istanbul) for code coverage (see package.json) and [sauce-test](https://github.com/ForbesLindesay/sauce-test) for browser testing via [browserify](http://browserify.org/).

[![Build Status](https://img.shields.io/travis/ForbesLindesay/testit/master.svg)](https://travis-ci.org/ForbesLindesay/testit)
[![Coverage Status](https://img.shields.io/coveralls/ForbesLindesay/testit/master.svg?style=flat)](https://coveralls.io/r/ForbesLindesay/testit?branch=master)
[![Dependency Status](https://img.shields.io/david/ForbesLindesay/testit.svg)](https://david-dm.org/ForbesLindesay/testit)
[![NPM version](https://img.shields.io/npm/v/testit.svg)](https://www.npmjs.com/package/testit)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/testit.svg)](https://saucelabs.com/u/testit)

## Installation

    npm install testit

## Sample test script

```javascript
var assert = require('assert')
var test = require('testit')

test('synchronous tests', function () {
  test('passes tests that do not fail', function () {
    assert(true)
  })
  test('fails tests that fail', function () {
    assert(false)
  })
})

test('asynchronous tests with callbacks', function () {
  test('passes some async tests', function (done) {
    setTimeout(done, 100)
  })
  test('fails some async tests', function (done) {
    setTimeout(function () {
      done(new Error('oh dear'))
    }, 100)
  })
  test('times out some tests', function (done) {
    setTimeout(function () {
      done()
    }, 99999999999)
  })
  test('supports custom timeouts', function (done) {
    setTimeout(done, 1000)
  }, {timeout: '1 second'})
})
test('supports promises just as well as callbacks', function () {
  return new Promise(function (resolve) {
    setTimeout(resolve, 100)
  })
})
```

## License

  MIT
