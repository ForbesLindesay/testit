'use strict'

var IS_BROWSER = require('is-browser');
if (!IS_BROWSER) {
  var r = require;
  var wtfnode = (r)('wtfnode');
}
var Suite = require('./lib/suite');
var defaultSuite = new Suite();
defaultSuite.addLogging();
defaultSuite.addExit();

var runTriggered = false;
function it(name, fn, options) {
  defaultSuite.addTest(name, fn, options);
  if (!runTriggered) {
    runTriggered = true;
    setTimeout(function () {
      defaultSuite.run().done(function () {
        if (!IS_BROWSER) {
          setTimeout(function () {
            wtfnode.dump();
          }, 5000).unref()
        }
      });
    }, 0);
  }
}
function run(fn, options) {
  defaultSuite.addCode(fn, options);
}
module.exports = it
module.exports.run = run;
module.exports.disableColors = defaultSuite.disableColors.bind(defaultSuite);
module.exports.on = defaultSuite.on.bind(defaultSuite);

module.exports.Suite = Suite;
