'use strict';

var {expect} = require('chai'); /* jshint ignore:line */
var xPh = require('../index.js');

describe('xcraft.placeholder', function () {
  describe('inject 1', function () {
    var ph = null;
    var data = '';

    beforeEach(function () {
      ph = new xPh.Placeholder();

      data = '';
      data += 'foobar <NS1.FOOBAR>\n';
      data += '<NS1.FOOBAR> foobar <NS1.FOOBAR>\n';
      data += 'foobar <NS1.BARFOO>\n';
      data += '<NS1.FOOBAR> foobar <NS2.FOOBAR>\n';
      data += '<NS2.FOOBAR> foobar\n';
      data += '<NS3.FOO.BAR> foobar <NS3.BAR.FOO>\n';
      data += '<NS3.FOO.BAR> foobar';
    });

    it('one value for one namespace', function () {
      var expected = '';
      expected += 'foobar raboof\n';
      expected += 'raboof foobar raboof\n';
      expected += 'foobar <NS1.BARFOO>\n';
      expected += 'raboof foobar <NS2.FOOBAR>\n';
      expected += '<NS2.FOOBAR> foobar\n';
      expected += '<NS3.FOO.BAR> foobar <NS3.BAR.FOO>\n';
      expected += '<NS3.FOO.BAR> foobar';

      expect(ph.set('FOOBAR', 'raboof').inject('NS1', data)).be.equal(expected);
    });

    it('two values for one namespace', function () {
      var expected = '';
      expected += 'foobar raboof\n';
      expected += 'raboof foobar raboof\n';
      expected += 'foobar foobar\n';
      expected += 'raboof foobar <NS2.FOOBAR>\n';
      expected += '<NS2.FOOBAR> foobar\n';
      expected += '<NS3.FOO.BAR> foobar <NS3.BAR.FOO>\n';
      expected += '<NS3.FOO.BAR> foobar';

      expect(
        ph.set('FOOBAR', 'raboof').set('BARFOO', 'foobar').inject('NS1', data)
      ).be.equal(expected);
    });

    it('one value for two namespaces', function () {
      var expected = '';
      expected += 'foobar raboof\n';
      expected += 'raboof foobar raboof\n';
      expected += 'foobar <NS1.BARFOO>\n';
      expected += 'raboof foobar raboof\n';
      expected += 'raboof foobar\n';
      expected += '<NS3.FOO.BAR> foobar <NS3.BAR.FOO>\n';
      expected += '<NS3.FOO.BAR> foobar';

      data = ph.set('FOOBAR', 'raboof').inject('NS1', data);
      expect(ph.inject('NS2', data)).be.equal(expected);
    });

    it('two values for two namespaces', function () {
      var expected = '';
      expected += 'foobar raboof\n';
      expected += 'raboof foobar raboof\n';
      expected += 'foobar foobar\n';
      expected += 'raboof foobar raboof\n';
      expected += 'raboof foobar\n';
      expected += '<NS3.FOO.BAR> foobar <NS3.BAR.FOO>\n';
      expected += '<NS3.FOO.BAR> foobar';

      data = ph
        .set('FOOBAR', 'raboof')
        .set('BARFOO', 'foobar')
        .inject('NS1', data);
      expect(ph.inject('NS2', data)).be.equal(expected);
    });

    it('a placeholder in a placeholder', function () {
      var expected = '';
      expected += 'foobar <NS1.FOOBAR>\n';
      expected += '<NS1.FOOBAR> foobar <NS1.FOOBAR>\n';
      expected += 'foobar <NS1.BARFOO>\n';
      expected += '<NS1.FOOBAR> foobar <NS2.FOOBAR>\n';
      expected += '<NS2.FOOBAR> foobar\n';
      expected += 'foobar foobar foobar\n';
      expected += 'foobar foobar';

      expect(
        ph
          .set('FOO.BAR', '<NS3.BAR.FOO>')
          .set('BAR.FOO', 'foobar')
          .inject('NS3', data)
      ).be.equal(expected);
    });

    it('a placeholder in itself', function () {
      var expected = '';
      expected += 'foobar <NS1.FOOBAR>\n';
      expected += '<NS1.FOOBAR> foobar <NS1.FOOBAR>\n';
      expected += 'foobar <NS1.BARFOO>\n';
      expected += '<NS1.FOOBAR> foobar <NS2.FOOBAR>\n';
      expected += '<NS2.FOOBAR> foobar\n';
      expected += '<NS3.FOO.BAR> foobar <NS3.BAR.FOO>\n';
      expected += '<NS3.FOO.BAR> foobar';

      expect(ph.set('FOO.BAR', '<NS3.FOO.BAR>').inject('NS3', data)).be.equal(
        expected
      );
    });

    it('an object', function () {
      let expected = '';
      expected += 'foobar <NS1.FOOBAR>\n';
      expected += '<NS1.FOOBAR> foobar <NS1.FOOBAR>\n';
      expected += 'foobar <NS1.BARFOO>\n';
      expected += '<NS1.FOOBAR> foobar <NS2.FOOBAR>\n';
      expected += '<NS2.FOOBAR> foobar\n';
      expected += '-Os -fPIC -g foobar <NS3.BAR.FOO>\n';
      expected += '-Os -fPIC -g foobar';

      expect(ph.set('FOO', {BAR: '-Os -fPIC -g'}).inject('NS3', data)).be.equal(
        expected
      );
    });
  });

  describe('inject 2', function () {
    var ph = null;
    var data = '';

    beforeEach(function () {
      ph = new xPh.Placeholder();

      data = '';
      data += 'foobar <NS1.FOOBAR>\n';
      data += '<NS1.FOOBAR[.,1]> foobar <NS1.FOOBAR[.,0]>\n';
    });

    it('with a splitter', function () {
      let expected = '';
      expected += 'foobar 1.2.3\n';
      expected += '2 foobar 1\n';

      expect(ph.set('FOOBAR', '1.2.3').inject('NS1', data)).be.equal(expected);
    });
  });

  describe('inject 3 - conditional placeholders', function () {
    let ph = null;

    beforeEach(function () {
      ph = new xPh.Placeholder();
    });

    it('resolves the true branch when the value matches', function () {
      const data = '<NS1.OS=darwin?osx:other>';
      expect(ph.set('OS', 'darwin').inject('NS1', data)).be.equal('osx');
    });

    it('resolves the false branch when the value does not match', function () {
      const data = '<NS1.OS=darwin?osx:other>';
      expect(ph.set('OS', 'linux').inject('NS1', data)).be.equal('other');
    });

    it('handles several occurrences of the same conditional placeholder', function () {
      const data = '<NS1.OS=darwin?osx:other> and <NS1.OS=linux?tux:unknown>';
      const expected = 'other and tux';
      expect(ph.set('OS', 'linux').inject('NS1', data)).be.equal(expected);
    });

    it('handles distinct conditional placeholders in the same string', function () {
      const data = '<NS1.OS=darwin?osx:other> / <NS1.ARCH=x64?64 bits:32 bits>';
      const expected = 'other / 64 bits';
      expect(
        ph.set('OS', 'linux').set('ARCH', 'x64').inject('NS1', data)
      ).be.equal(expected);
    });

    it('accepts spaces inside compared and result values', function () {
      const data = '<NS1.OS=mac os?it is mac:not mac>';
      expect(ph.set('OS', 'mac os').inject('NS1', data)).be.equal('it is mac');
    });

    it('leaves the placeholder untouched when the key is not set', function () {
      const data = '<NS1.MISSING=foo?bar:baz>';
      expect(ph.set('OS', 'linux').inject('NS1', data)).be.equal(data);
    });

    it('does not confuse conditional placeholders across namespaces', function () {
      const data = '<NS1.OS=darwin?osx:other> <NS2.OS=darwin?osx:other>';
      const expected = 'osx <NS2.OS=darwin?osx:other>';
      expect(ph.set('OS', 'darwin').inject('NS1', data)).be.equal(expected);
    });

    it('an escaped "\\:" is literal', function () {
      const data = '<NS1.TIME=12?heure\\: 12:autre>';
      expect(ph.set('TIME', '12').inject('NS1', data)).be.equal('heure: 12');
    });

    it('an escaped "\\:"', function () {
      const data = '<NS1.RATIO=1\\:1?egal:different>';
      const expectedTrue = ph.set('RATIO', '1:1').inject('NS1', data);
      expect(expectedTrue).be.equal('egal');
    });

    it('more escaped "\\:"', function () {
      const data = '<NS1.VAR=test?is\\:test\\:ok:is\\:test\\:bad>';
      const expectedTrue = ph.set('VAR', 'test').inject('NS1', data);
      expect(expectedTrue).be.equal('is:test:ok');
    });
  });

  describe('inject 4 - escape option', function () {
    let ph = null;

    beforeEach(function () {
      ph = new xPh.Placeholder();
    });

    it('doubles backslashes when escape is true', function () {
      const data = '<NS1.PATH>';
      const expected = 'C:\\\\Users\\\\test';
      expect(
        ph.set('PATH', 'C:\\Users\\test').inject('NS1', data, true)
      ).be.equal(expected);
    });

    it('keeps backslashes untouched when escape is false or omitted', function () {
      const data = '<NS1.PATH>';
      const expected = 'C:\\Users\\test';
      expect(ph.set('PATH', 'C:\\Users\\test').inject('NS1', data)).be.equal(
        expected
      );
    });

    it('does not try to escape non-string values', function () {
      const data = '<NS1.COUNT>';
      expect(ph.set('COUNT', 42).inject('NS1', data, true)).be.equal('42');
    });
  });

  describe('inject 5 - splitting syntax', function () {
    let ph = null;

    beforeEach(function () {
      ph = new xPh.Placeholder();
    });

    it('splits with a multi-character separator', function () {
      const data = '<NS1.LIST[::,2]>';
      expect(ph.set('LIST', 'a::b::c::d').inject('NS1', data)).be.equal('c');
    });

    it('works with the curly braces syntax too', function () {
      const data = '{NS1.LIST[|,1]}';
      expect(ph.set('LIST', 'a|b|c').inject('NS1', data)).be.equal('b');
    });

    it('mixes split and non-split placeholders in the same string', function () {
      const data = '<NS1.LIST> -> <NS1.LIST[|,0]>';
      const expected = 'a|b|c -> a';
      expect(ph.set('LIST', 'a|b|c').inject('NS1', data)).be.equal(expected);
    });

    it('returns "undefined" when the split index is out of range', function () {
      const data = '<NS1.LIST[|,10]>';
      expect(ph.set('LIST', 'a|b|c').inject('NS1', data)).be.equal('undefined');
    });

    it('handles several split placeholders referencing the same value', function () {
      const data = '<NS1.LIST[.,0]>.<NS1.LIST[.,1]>.<NS1.LIST[.,2]>';
      expect(ph.set('LIST', '1.2.3').inject('NS1', data)).be.equal('1.2.3');
    });
  });
});
