'use strict';

var should = require ('should'); /* jshint ignore:line */
var xPh    = require ('../index.js');

describe ('xcraft-core-placeholder', function () {
  describe ('#inject ()', function () {
    var ph = null;
    var data = '';

    beforeEach (function () {
      ph = new xPh.Placeholder ();

      data  = '';
      data += 'foobar <NS1.FOOBAR>\n';
      data += '<NS1.FOOBAR> foobar <NS1.FOOBAR>\n';
      data += 'foobar <NS1.BARFOO>\n';
      data += '<NS1.FOOBAR> foobar <NS2.FOOBAR>\n';
      data += '<NS2.FOOBAR> foobar\n';
      data += '<NS3.FOO.BAR> foobar <NS3.BAR.FOO>\n';
      data += '<NS3.FOO.BAR> foobar';
    });

    it ('inject one value for one namespace', function () {
      var expected = '';
      expected += 'foobar raboof\n';
      expected += 'raboof foobar raboof\n';
      expected += 'foobar <NS1.BARFOO>\n';
      expected += 'raboof foobar <NS2.FOOBAR>\n';
      expected += '<NS2.FOOBAR> foobar\n';
      expected += '<NS3.FOO.BAR> foobar <NS3.BAR.FOO>\n';
      expected += '<NS3.FOO.BAR> foobar';

      ph.set ('FOOBAR', 'raboof')
        .inject ('NS1', data).should.be.equal (expected);
    });

    it ('inject two values for one namespace', function () {
      var expected = '';
      expected += 'foobar raboof\n';
      expected += 'raboof foobar raboof\n';
      expected += 'foobar foobar\n';
      expected += 'raboof foobar <NS2.FOOBAR>\n';
      expected += '<NS2.FOOBAR> foobar\n';
      expected += '<NS3.FOO.BAR> foobar <NS3.BAR.FOO>\n';
      expected += '<NS3.FOO.BAR> foobar';

      ph.set ('FOOBAR', 'raboof')
        .set ('BARFOO', 'foobar')
        .inject ('NS1', data).should.be.equal (expected);
    });

    it ('inject one value for two namespaces', function () {
      var expected = '';
      expected += 'foobar raboof\n';
      expected += 'raboof foobar raboof\n';
      expected += 'foobar <NS1.BARFOO>\n';
      expected += 'raboof foobar raboof\n';
      expected += 'raboof foobar\n';
      expected += '<NS3.FOO.BAR> foobar <NS3.BAR.FOO>\n';
      expected += '<NS3.FOO.BAR> foobar';

      data = ph
        .set ('FOOBAR', 'raboof')
        .inject ('NS1', data);
      ph.inject ('NS2', data).should.be.equal (expected);
    });

    it ('inject two values for two namespaces', function () {
      var expected = '';
      expected += 'foobar raboof\n';
      expected += 'raboof foobar raboof\n';
      expected += 'foobar foobar\n';
      expected += 'raboof foobar raboof\n';
      expected += 'raboof foobar\n';
      expected += '<NS3.FOO.BAR> foobar <NS3.BAR.FOO>\n';
      expected += '<NS3.FOO.BAR> foobar';

      data = ph
        .set ('FOOBAR', 'raboof')
        .set ('BARFOO', 'foobar')
        .inject ('NS1', data);
      ph.inject ('NS2', data).should.be.equal (expected);
    });

    it ('inject a placeholder in a placeholder', function () {
      var expected = '';
      expected += 'foobar <NS1.FOOBAR>\n';
      expected += '<NS1.FOOBAR> foobar <NS1.FOOBAR>\n';
      expected += 'foobar <NS1.BARFOO>\n';
      expected += '<NS1.FOOBAR> foobar <NS2.FOOBAR>\n';
      expected += '<NS2.FOOBAR> foobar\n';
      expected += 'foobar foobar foobar\n';
      expected += 'foobar foobar';

      ph.set ('FOO.BAR', '<NS3.BAR.FOO>')
        .set ('BAR.FOO', 'foobar')
        .inject ('NS3', data).should.be.equal (expected);
    });

    it ('inject a placeholder in itself', function () {
      var expected = '';
      expected += 'foobar <NS1.FOOBAR>\n';
      expected += '<NS1.FOOBAR> foobar <NS1.FOOBAR>\n';
      expected += 'foobar <NS1.BARFOO>\n';
      expected += '<NS1.FOOBAR> foobar <NS2.FOOBAR>\n';
      expected += '<NS2.FOOBAR> foobar\n';
      expected += '<NS3.FOO.BAR> foobar <NS3.BAR.FOO>\n';
      expected += '<NS3.FOO.BAR> foobar';

      ph.set ('FOO.BAR', '<NS3.FOO.BAR>')
        .inject ('NS3', data).should.be.equal (expected);
    });
  });
});
