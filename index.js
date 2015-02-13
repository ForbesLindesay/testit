'use strict'

var Suite = require('./lib/suite');
var defaultSuite = new Suite();
defaultSuite.addLogging();
defaultSuite.addExit();

var runTriggered = false;
function it(name, fn, options) {
  defaultSuite.addTest(name, fn);
  if (!runTriggered) {
    runTriggered = true;
    setTimeout(function () {
      defaultSuite.run().done();
    }, 0);
  }
}
function run(fn, options) {
  defaultSuite.addCode(fn, options);
}
module.exports = it
module.exports.run = run;
module.exports.disableColors = function () {
  defaultSuite.disableColors();
};
module.exports.Suite = Suite;
