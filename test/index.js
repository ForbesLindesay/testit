'use strict'

var assert = require('assert')
var Promise = require('promise')
var result = require('test-result');
var test = require('../')
var Suite = require('../lib/suite')

function captureLogs() {
  var logs = []
  var log = console.log
  var now = Suite.now
  var pass = result.pass
  var fail = result.fail
  console.log = function (str) {
    assert(arguments.length === 1)
    logs.push(str.split('\n')[0])
  }
  Suite.now = function () {
    return 0
  }
  result.pass = function () {
    logs.push('<pass>')
  }
  result.fail = function () {
    logs.push('<fail>')
  }
  return function () {
    console.log = log
    Suite.now = now
    result.pass = pass
    result.fail = fail
    return logs
  }
}

test('synchronous', function () {
  test('passing tests', function () {
    var logs = captureLogs()
    var suite = new Suite()
    suite.disableColors()
    suite.addLogging()
    suite.addExit()
    suite.addTest('passes tests that do not fail', function () {
      assert(true)
    })
    return suite.run().then(function () {
      assert.deepEqual(logs(), [
        ' ✓ passes tests that do not fail (0ms)',
        '',
        'Total duration 0ms',
        '<pass>'
      ])
    })
  })
  test('nested passing tests', function () {
    var logs = captureLogs()
    var suite = new Suite()
    suite.disableColors()
    suite.addLogging()
    suite.addExit()
    suite.addTest('passes tests that do not fail', function () {
      suite.addTest('even when they are nested', function () {
        assert(true)
      })
    })
    return suite.run().then(function () {
      assert.deepEqual(logs(), [
        ' • passes tests that do not fail',
        '   ✓ even when they are nested (0ms)',
        '',
        'Total duration 0ms',
        '<pass>'
      ])
    })
  })
  test('failing tests', function () {
    var logs = captureLogs()
    var suite = new Suite()
    suite.disableColors()
    suite.addLogging()
    suite.addExit()
    suite.addTest('fails tests that fail', function () {
      assert(false)
    })
    return suite.run().then(function () {
      throw new Error('expected failure');
    }, function (err) {
      assert.deepEqual(logs(), [
        ' ✗ fails tests that fail (0ms)',
        '',
        '   AssertionError: false == true',
        '',
        'Total duration 0ms',
        '<fail>'
      ])
    })
  })
  test('nested failing tests', function () {
    var logs = captureLogs()
    var suite = new Suite()
    suite.disableColors()
    suite.addLogging()
    suite.addExit()
    suite.addTest('fails tests that fail', function () {
      suite.addTest('even when they are nested', function () {
        assert(false)
      })
    })
    return suite.run().then(function () {
      throw new Error('expected failure');
    }, function (err) {
      assert.deepEqual(logs(), [
        ' • fails tests that fail',
        '   ✗ even when they are nested (0ms)',
        '',
        '     AssertionError: false == true',
        '',
        'Total duration 0ms',
        '<fail>'
      ])
    })
  })
})

test('asynchronous', function () {
  test('promises', function () {
    test('passing tests', function () {
      var logs = captureLogs()
      var suite = new Suite()
      suite.disableColors()
      suite.addLogging()
      suite.addExit()
      suite.addTest('passes tests that do not fail', function () {
        return Promise.resolve(null).then(function () {
          assert(true)
        })
      })
      return suite.run().then(function () {
        assert.deepEqual(logs(), [
          ' ✓ passes tests that do not fail (0ms)',
          '',
          'Total duration 0ms',
          '<pass>'
        ])
      })
    })
    test('nested passing tests', function () {
      var logs = captureLogs()
      var suite = new Suite()
      suite.disableColors()
      suite.addLogging()
      suite.addExit()
      suite.addTest('passes tests that do not fail', function () {
        suite.addTest('even when they are nested', function () {
          return Promise.resolve(null).then(function () {
            assert(true)
          })
        })
      })
      return suite.run().then(function () {
        assert.deepEqual(logs(), [
          ' • passes tests that do not fail',
          '   ✓ even when they are nested (0ms)',
          '',
          'Total duration 0ms',
          '<pass>'
        ])
      })
    })
    test('failing tests', function () {
      var logs = captureLogs()
      var suite = new Suite()
      suite.disableColors()
      suite.addLogging()
      suite.addExit()
      suite.addTest('fails tests that fail', function () {
        return Promise.resolve(null).then(function () {
          assert(false)
        })
      })
      return suite.run().then(function () {
        throw new Error('expected failure');
      }, function (err) {
        assert.deepEqual(logs(), [
          ' ✗ fails tests that fail (0ms)',
          '',
          '   AssertionError: false == true',
          '',
          'Total duration 0ms',
          '<fail>'
        ])
      })
    })
    test('nested failing tests', function () {
    var logs = captureLogs()
    var suite = new Suite()
    suite.disableColors()
    suite.addLogging()
    suite.addExit()
    suite.addTest('fails tests that fail', function () {
      suite.addTest('even when they are nested', function () {
        return Promise.resolve(null).then(function () {
          assert(false)
        })
      })
    })
    return suite.run().then(function () {
      throw new Error('expected failure');
    }, function (err) {
      assert.deepEqual(logs(), [
        ' • fails tests that fail',
        '   ✗ even when they are nested (0ms)',
        '',
        '     AssertionError: false == true',
        '',
        'Total duration 0ms',
        '<fail>'
      ])
    })
  })
    test('failing because of timeout', function () {
      var logs = captureLogs()
      var suite = new Suite()
      suite.disableColors()
      suite.addLogging()
      suite.addExit()
      suite.addTest('eventually times out', function () {
        return new Promise(function () {});
      }, {timeout: '10ms'})
      return suite.run().then(function () {
        throw new Error('expected failure');
      }, function (err) {
        assert.deepEqual(logs(), [
          ' ✗ eventually times out (0ms)',
          '',
          '   Error: Operation timed out',
          '',
          'Total duration 0ms',
          '<fail>'
        ])
      })
    })
  })
  test('callbacks', function () {
    test('passing tests', function () {
      var logs = captureLogs()
      var suite = new Suite()
      suite.disableColors()
      suite.addLogging()
      suite.addExit()
      suite.addTest('passes tests that do not fail', function (cb) {
        Promise.resolve(null).then(function () {
          assert(true)
        }).nodeify(cb)
      })
      return suite.run().then(function () {
        assert.deepEqual(logs(), [
          ' ✓ passes tests that do not fail (0ms)',
          '',
          'Total duration 0ms',
          '<pass>'
        ])
      })
    })
    test('nested passing tests', function () {
      var logs = captureLogs()
      var suite = new Suite()
      suite.disableColors()
      suite.addLogging()
      suite.addExit()
      suite.addTest('passes tests that do not fail', function () {
        suite.addTest('even when they are nested', function (cb) {
          Promise.resolve(null).then(function () {
            assert(true)
          }).nodeify(cb)
        })
      })
      return suite.run().then(function () {
        assert.deepEqual(logs(), [
          ' • passes tests that do not fail',
          '   ✓ even when they are nested (0ms)',
          '',
          'Total duration 0ms',
          '<pass>'
        ])
      })
    })
    test('failing tests', function () {
      var logs = captureLogs()
      var suite = new Suite()
      suite.disableColors()
      suite.addLogging()
      suite.addExit()
      suite.addTest('fails tests that fail', function (cb) {
        Promise.resolve(null).then(function () {
          assert(false)
        }).nodeify(cb)
      })
      return suite.run().then(function () {
        throw new Error('expected failure');
      }, function (err) {
        assert.deepEqual(logs(), [
          ' ✗ fails tests that fail (0ms)',
          '',
          '   AssertionError: false == true',
          '',
          'Total duration 0ms',
          '<fail>'
        ])
      })
    })
    test('nested failing tests', function () {
      var logs = captureLogs()
      var suite = new Suite()
      suite.disableColors()
      suite.addLogging()
      suite.addExit()
      suite.addTest('fails tests that fail', function () {
        suite.addTest('even when they are nested', function (cb) {
          Promise.resolve(null).then(function () {
            assert(false)
          }).nodeify(cb)
        })
      })
      return suite.run().then(function () {
        throw new Error('expected failure');
      }, function (err) {
        assert.deepEqual(logs(), [
          ' • fails tests that fail',
          '   ✗ even when they are nested (0ms)',
          '',
          '     AssertionError: false == true',
          '',
          'Total duration 0ms',
          '<fail>'
        ])
      })
    })
    test('failing because of timeout', function () {
      var logs = captureLogs()
      var suite = new Suite()
      suite.disableColors()
      suite.addLogging()
      suite.addExit()
      suite.addTest('eventually times out', function (cb) {
      }, {timeout: '10ms'})
      return suite.run().then(function () {
        throw new Error('expected failure');
      }, function (err) {
        assert.deepEqual(logs(), [
          ' ✗ eventually times out (0ms)',
          '',
          '   Error: Operation timed out',
          '',
          'Total duration 0ms',
          '<fail>'
        ])
      })
    })
  })
})

test('run', function () {
  test.run(function () {
    console.log('using test.run to run some code in between tests');
  });
  test('run success', function () {
    var logs = captureLogs()
    var suite = new Suite()
    suite.disableColors()
    suite.addLogging()
    suite.addExit()
    suite.addCode(function () {
      assert(true)
    })
    return suite.run().then(function () {
      assert.deepEqual(logs(), [
        '',
        'Total duration 0ms',
        '<pass>'
      ])
    })
  })
  test('run fail', function () {
    var logs = captureLogs()
    var suite = new Suite()
    suite.disableColors()
    suite.addLogging()
    suite.addExit()
    suite.addCode(function () {
      assert(false)
    })
    return suite.run().then(function () {
      throw new Error('expected failure');
    }, function () {
      assert.deepEqual(logs(), [
        ' ✗ run (0ms)',
        '',
        '   AssertionError: false == true',
        '',
        'Total duration 0ms',
        '<fail>'
      ])
    })
  })
})

test('infinite timeout', function () {
  var logs = captureLogs()
  var suite = new Suite()
  suite.disableColors()
  suite.addLogging()
  suite.addExit()
  suite.addTest('passes tests that do not fail', function () {
    assert(true)
  }, {timeout: Infinity})
  return suite.run().then(function () {
    assert.deepEqual(logs(), [
      ' ✓ passes tests that do not fail (0ms)',
      '',
      'Total duration 0ms',
      '<pass>'
    ])
  })
});

/*
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
*/
