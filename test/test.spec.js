'use strict';

var {expect} = require('chai'); /* jshint ignore:line */
var xPh = require('../index.js');

describe('xcraft.placeholder', function () {
  describe('inject', function () {
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

      expect(
        ph
          .set('FOO', {
            BAR: '-Os -fPIC -g',
          })
          .inject('NS3', data)
      ).be.equal(expected);
    });
  });
});
