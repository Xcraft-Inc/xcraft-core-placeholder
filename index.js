'use strict';

var holders = {};

exports.set = function (key, value) {
  holders[key] = value;
};

exports.inject = function (namespace, data) {
  Object.keys (holders).forEach (function (placeholder) {
    var regex = new RegExp ('<' + namespace + '\\.' + placeholder + '>', 'g');
    data = data.replace (regex, holders[placeholder]);
  });
  return data;
};
