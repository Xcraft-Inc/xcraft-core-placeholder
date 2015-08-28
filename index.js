'use strict';


function Placeholder () {
  this.holders = {};
  this._isResolved = false;
}

Placeholder.prototype._resolve = function (namespace) {
  var self = this;

  Object.keys (self.holders).forEach (function (placeholder) {
    var regex = new RegExp ('<' + namespace + '\\.([^>]+)>', 'g');
    var res = null;
    while ((res = regex.exec (self.holders[placeholder]))) {
      if (res[1] === placeholder) {
        break;
      }

      if (!self.holders.hasOwnProperty (res[1])) {
        continue;
      }

      self.holders[placeholder] = self.holders[placeholder].replace (regex, self.holders[res[1]]);
    }
  });

  self._isResolved = true;
};

Placeholder.prototype.set = function (key, value) {
  this.holders[key] = value;
  this._isResolved  = false;
  return this;
};

Placeholder.prototype.inject = function (namespace, data) {
  var self = this;

  if (!self._isResolved) {
    self._resolve (namespace);
  }

  Object.keys (self.holders).forEach (function (placeholder) {
    var regex = new RegExp ('<' + namespace + '\\.' + placeholder + '>', 'g');
    data = data.replace (regex, self.holders[placeholder]);

    /* Handle conditional placeholders like for example:
     * <PEON.OS=darwin?osx:other>
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

  if (!this._isResolved) {
    this._resolve (namespace);
  }

  var data = fs.readFileSync (fileIn, 'utf8');
  data = this.inject (namespace, data);
  fs.writeFileSync (fileOut, data, 'utf8');
};

exports.global = new Placeholder ();
exports.Placeholder = Placeholder;
