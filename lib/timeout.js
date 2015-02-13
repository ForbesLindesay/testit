'use strict';

var Promise = require('promise');
var ms = require('ms');

module.exports = timeout;
function timeout(val, timeout) {
  if (timeout === Infinity || timeout === null) {
    return Promise.resolve(val);
  }
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () {
      reject(new Error('Operation timed out'))
    }, ms(timeout.toString()))
    Promise.resolve(val)
      .done(function (res) {
        clearTimeout(timer)
        resolve(res)
      }, function (err) {
        clearTimeout(timer)
        reject(err)
      })
  })
}
