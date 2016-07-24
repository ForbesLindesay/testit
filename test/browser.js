'use strict';
var run = require('sauce-test');
var testResult = require('test-result');

var LOCAL = !process.env.CI && process.argv[2] !== 'sauce';
var USER = 'testit';
var ACCESS_KEY = '9b702258-86c3-4691-97d3-5edff9fb5504';

if (process.env.CI && process.version.indexOf('v6') !== 0) {
  // only run the browser tests once
  process.exit(0);
}
run(__dirname + '/index.js', LOCAL ? 'chromedriver' : 'saucelabs', {
  username: USER,
  accessKey: ACCESS_KEY,
  browserify: true,
  disableSSL: true,
  filterPlatforms: function (platform, defaultFilter) {
    // these platforms don't support Object.keys, which is
    // required for colors to work
    if (platform.browserName === 'internet explorer') {
      return (+platform.version) > 8 && defaultFilter(platform);
    }
    if (platform.browserName === 'firefox') {
      return (+platform.version) > 4 && defaultFilter(platform);
    }
    if (platform.browserName === 'iphone') {
      return (+platform.version) > 5.1 && defaultFilter(platform);
    }
    if (platform.browserName === 'ipad') {
      return (+platform.version) > 5.1 && defaultFilter(platform);
    }
    return defaultFilter(platform);
  },
  bail: true,
  timeout: '15s'
}).done(function (result) {
  if (result.passed) {
    testResult.pass('browser tests');
  } else {
    testResult.fail('browser tests');
  }
});
