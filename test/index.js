'use strict'

var assert = require('assert')
var Promise = require('promise')
var result = require('test-result');
var test = require('../')
var Suite = require('../lib/suite')
var semver = require('semver')

// Prepare a boolean failure string.
var booleanErrorString = semver.gt(process.version, '10.0.0') ? 'The expression evaluated to a falsy value:' : 'false == true'

// Retrieve the name of an Assertion Error, as it differs on each platform.
var assertErrorString = 'AssertionError'
try {
  assert(false);
}
catch (err) {
  assertErrorString = err.name
}

// we are going to tamper with the `test-result` module
// so we wire things up here to make sure the result is
// definitely recorded
var originalResult = {
  pass: result.pass,
  fail: result.fail
};
test.on('suite-fail', function () {
  originalResult.fail('fallback test failer');
});

function captureLogs() {
  var logs = []
  var log = console.log
  var now = Suite.now
  var pass = result.pass
  var fail = result.fail

  console.log = function (str) {
    assert(arguments.length === 1)
    str = str.split('\n')[0];
    logs.push(str)
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
        '   ' + assertErrorString + ': ' + booleanErrorString,
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
        '     ' + assertErrorString + ': ' + booleanErrorString,
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
          '   ' + assertErrorString + ': ' + booleanErrorString,
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
        '     ' + assertErrorString + ': ' + booleanErrorString,
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
          '   ' + assertErrorString + ': ' + booleanErrorString,
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
          '     ' + assertErrorString + ': ' + booleanErrorString,
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
        '   ' + assertErrorString + ': ' + booleanErrorString,
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
