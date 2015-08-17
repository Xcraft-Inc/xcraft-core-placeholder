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

    /* Handle conditional placeholders like for example:
     * <PEON.OS=darwin?osx:unix>
     */
    var regexIf = new RegExp ('<' + namespace + '\\.' + placeholder + '=([^?]*)\\?([^:]*):([^>]*)>');
    var res = null;
    while ((res = regexIf.exec (data))) {
      var value = res[1] === self.holders[placeholder] ? res[2] : res[3];
      var regexRep = new RegExp ('<' + namespace + '\\.' + placeholder + '=' + res[1] + '\\?[^>]*>', 'g');
      data = data.replace (regexRep, value);
    }
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
