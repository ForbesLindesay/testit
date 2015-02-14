'use strict';

var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var Promise = require('promise');
var chalk = require('chalk');
var ms = require('ms');
var result = require('test-result');
var timeout = require('./timeout');

module.exports = TestSuite;
function TestSuite(name) {
  this.name = name;
  this.colors = true;
  this._queue = [];
  this._stack = [];
  EventEmitter.call(this);
}
TestSuite.prototype = Object.create(EventEmitter.prototype);
TestSuite.constructor = TestSuite;
TestSuite.now = function () {
  return (new Date()).getTime();
};

TestSuite.prototype.addTest = function (name, fn, options) {
  assert(typeof name === 'string', 'The description must be a string')
  assert(typeof fn === 'function', 'The test must be a function')
  if (fn.length === 1) {
    fn = Promise.denodeify(fn);
  }
  this._queue.push(new TestCase(false, name, fn, options || {}));
};
TestSuite.prototype.addCode = function (fn, options) {
  this._queue.push(new TestCase(true, '', fn, options || {}));
};
TestSuite.prototype.run = function () {
  var index = 0;
  var self = this;
  return new Promise(function (resolve, reject) {
    function next() {
      while (index >= self._queue.length && self._stack.length) {
        var frame = self._stack.pop();
        index = frame.index;
        self._queue = frame.queue;
        self.emit('end-section', frame.name);
      }
      if (index >= self._queue.length) {
        self.emit('suite-pass');
        return resolve();
      }
      var test = self._queue[index];
      if (test.justRun) {
        self.emit('run-start');
        Promise.resolve(null).then(function () {
          return timeout(test.fn(), test.timeout);
        }).done(function () {
          self.emit('run-pass');
          self.emit('run-end');
          index++;
          next();
        }, function (err) {
          self.emit('run-fail', err);
          self.emit('run-end');
          self.emit('suite-fail');
          reject(err);
        });
        return;
      }
      self._stack.push(new StackFrame(index + 1, self._queue, test.name));
      index = 0;
      self._queue = [];
      self.emit('start', test.name);
      Promise.resolve(null).then(function () {
        return timeout(test.fn(), test.timeout)
      }).done(function () {
        if (self._queue.length) {
          self.emit('end', test.name);
          self.emit('start-section', test.name);
        } else {
          self.emit('pass', test.name);
          self.emit('end', test.name);
          var frame = self._stack.pop();
          index = frame.index;
          self._queue = frame.queue;
        }
        next();
      }, function (err) {
        self.emit('fail', test.name, err);
        self.emit('end', test.name);
        self.emit('suite-fail');
        reject(err);
      });
    }
    self.emit('suite-start');
    next();
  });
};

TestSuite.prototype.disableColors = function () {
  this.colors = false;
};
TestSuite.prototype.addLogging = function () {
  var self = this;
  function color(color, str) {
    return self.colors ? chalk[color](str) : str;
  }
  var indent = [];
  var start = TestSuite.now();
  this.on('start-section', function (name) {
    console.log(indent.join('') + color('magenta', ' \u2022 ') + name);
    indent.push('  ');
  });
  this.on('end-section', function (name) {
    indent.pop();
  });
  this.on('start', function () {
    start = TestSuite.now();
  });
  this.on('run-start', function () {
    start = TestSuite.now();
  });
  this.on('pass', function (name) {
    var end = TestSuite.now();
    var duration = end - start;
    console.log(indent.join('') +
                color('green', ' \u2713 ') +
                name +
                color('cyan', ' (' + ms(duration) + ')'));
  });
  this.on('fail', function (name, err) {
    var end = TestSuite.now();
    var duration = end - start;
    console.log(indent.join('') +
                color('red', ' \u2717 ') +
                name +
                color('cyan', ' (' + ms(duration) + ')'));
    console.log('');
    var errString = errorToString(err);
    console.log(errString.replace(/^/gm, indent.join('') + '   '));
  });
  this.on('run-fail', function (err) {
    var end = TestSuite.now();
    var duration = end - start;
    console.log(indent.join('') +
                color('red', ' \u2717 ') +
                'run' +
                color('cyan', ' (' + ms(duration) + ')'));
    console.log('');
    var errString = errorToString(err);
    console.log(errString.replace(/^/gm, indent.join('') + '   '));
  });
};
TestSuite.prototype.addExit = function () {
  var name = this.name || 'tests';
  var start = TestSuite.now();
  this.on('suite-start', function () {
    start = TestSuite.now();
  });
  this.on('suite-pass', function () {
    console.log('');
    console.log('Total duration ' + ms(TestSuite.now() - start));
    result.pass(name);
  });
  this.on('suite-fail', function () {
    console.log('');
    console.log('Total duration ' + ms(TestSuite.now() - start));
    result.fail(name);
  });
};

function TestCase(justRun, name, fn, options) {
  this.justRun = justRun;
  this.name = name;
  this.fn = fn;
  this.timeout = options.timeout || '20 seconds';
}
function StackFrame(index, queue, name) {
  this.index = index;
  this.queue = queue;
  this.name = name;
}

function errorToString(e) {
  var hasToString = e && typeof e.toString === 'function';
  var stack = e.stack;
  /* istanbul ignore else */
  if (stack && stack.indexOf(e.message) !== -1 && stack.indexOf(e.name) !== -1) return stack;
  else return hasToString ? e.toString() : '' + e;
}
