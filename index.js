'use strict';

const escapeStringRegexp = require('escape-string-regexp');

function Placeholder() {
  this.holders = {};
  this._isResolved = false;
}

Placeholder.prototype._resolve = function (namespace) {
  var self = this;

  Object.keys(self.holders).forEach(function (placeholder) {
    var regex = new RegExp('<' + namespace + '\\.([^>]+)>', 'g');
    var res = null;
    while ((res = regex.exec(self.holders[placeholder]))) {
      if (res[1] === placeholder) {
        break;
      }

      if (!self.holders.hasOwnProperty(res[1])) {
        continue;
      }

      self.holders[placeholder] = self.holders[placeholder].replace(
        regex,
        self.holders[res[1]]
      );
    }
  });

  self._isResolved = true;
};

Placeholder.prototype.set = function (key, value) {
  if (value !== null && typeof value === 'object') {
    let itemUpperCase = false;
    if (process.platform === 'win32' && key === 'ENV') {
      itemUpperCase = true; /* Windows environment is case insensitive */
    }
    Object.keys(value).forEach((item) => {
      this.holders[`${key}.${itemUpperCase ? item.toUpperCase() : item}`] =
        value[item];
    });
  } else {
    this.holders[key] = value;
  }

  this._isResolved = false;
  return this;
};

Placeholder.prototype.inject = function (namespace, data, escape) {
  var self = this;

  if (!self._isResolved) {
    self._resolve(namespace);
  }

  /* Handle conditional placeholders like for example:
   * <PEON.OS=darwin?osx:other>
   */
  Object.keys(self.holders).forEach(function (placeholder) {
    let phValue = self.holders[placeholder];
    if (escape && typeof phValue === 'string') {
      phValue = phValue.replace(/\\/g, '\\\\');
    }

    var regexIf = new RegExp(
      '<' +
        namespace +
        '\\.' +
        escapeStringRegexp(placeholder) +
        '=((?:\\\\.|[^?])*)\\?((?:\\\\.|[^:])*):((?:\\\\.|[^>])*)>'
    );
    var res = null;
    while ((res = regexIf.exec(data))) {
      const rawCompare = res[1];
      const rawTrue = res[2];
      const rawFalse = res[3];

      const unescape = (s) => s.replace(/\\(.)/g, '$1');
      const compareValue = unescape(rawCompare);
      const value =
        compareValue === phValue ? unescape(rawTrue) : unescape(rawFalse);

      const regexRep = new RegExp(
        '<' +
          namespace +
          '\\.' +
          escapeStringRegexp(placeholder) +
          '=' +
          escapeStringRegexp(rawCompare) +
          '\\?[^>]*>'
      );
      data = data.replace(regexRep, value);
    }
  });

  /* Handle simple placeholders */
  Object.keys(self.holders).forEach(function (placeholder) {
    let phValue = self.holders[placeholder];
    if (escape && typeof phValue === 'string') {
      phValue = phValue.replace(/\\/g, '\\\\');
    }

    const regexes = ['<>', '{}'].map(
      (char) =>
        new RegExp(
          char[0] +
          namespace +
          '\\.' +
          escapeStringRegexp(placeholder) +
          '(\\[[^\\]]+\\])?' /* For special splitting syntax [<char>,<idx>] */ +
            char[1],
          'g'
        )
    );

    regexes.forEach((regex) => {
      data = data.replace(regex, (_ph) => {
        let sp = null;

        /* Look for splitting */
        if (/\[[^\]]+\]/.test(_ph)) {
          const it = _ph.indexOf('[');
          sp = _ph.substring(it);
          sp = sp.substring(1, sp.length - 2);
          sp = sp.split(',');
        }

        return sp ? phValue.split(sp[0])[sp[1]] : phValue;
      });
    });
  });

  return data;
};

Placeholder.prototype.injectFile = function (namespace, fileIn, fileOut) {
  var fs = require('fs');

  if (!this._isResolved) {
    this._resolve(namespace);
  }

  var data = fs.readFileSync(fileIn, 'utf8');
  data = this.inject(namespace, data);
  fs.writeFileSync(fileOut, data, 'utf8');
  return this;
};

exports.global = new Placeholder();
exports.Placeholder = Placeholder;
