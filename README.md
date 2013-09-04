# testit

Because the world needs a simpler testing framework

[![Build Status](https://travis-ci.org/ForbesLindesay/testit.png?branch=master)](https://travis-ci.org/ForbesLindesay/testit)
[![Dependency Status](https://gemnasium.com/ForbesLindesay/testit.png)](https://gemnasium.com/ForbesLindesay/testit)
[![NPM version](https://badge.fury.io/js/testit.png)](http://badge.fury.io/js/testit)

## Installation

    npm install testit

## Sample test script

```javascript
var assert = require('assert')
var it = require('testit')

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
it('times out some tests', function (done) {
  setTimeout(function () {
    done()
  }, 99999999999)
})
it('supports promises just as well as callbacks', function () {
  return new Promise(function (resolve) {
    setTimeout(resolve, 100)
  })
})
it('supports custom timeouts', function (done) {
  setTimeout(done, 1000)
}, '1 second')
```

## License

  MIT