'use strict';


function Placeholder () {
  this.holders = {};
}

Placeholder.prototype.set = function (key, value) {
  this.holders[key] = value;
  return this;
};

Placeholder.prototype.inject = function (namespace, data) {
  var self = this;

  Object.keys (self.holders).forEach (function (placeholder) {
    var regex = new RegExp ('<' + namespace + '\\.' + placeholder + '>', 'g');
    data = data.replace (regex, self.holders[placeholder]);
  });
  return data;
};

Placeholder.prototype.injectFile = function (namespace, fileIn, fileOut) {
  var fs = require ('fs');

  var data = fs.readFileSync (fileIn, 'utf8');
  data = this.inject (namespace, data);
  fs.writeFileSync (fileOut, data, 'utf8');
};

exports.global = new Placeholder ();
exports.Placeholder = Placeholder;
