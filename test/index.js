'use strict';

var should = require ('should'); /* jshint ignore:line */
var xPh    = require ('../index.js');

describe ('xcraft-core-placeholder', function () {
  describe ('#inject ()', function () {
    var ph = null;
    var data = '';
    data += 'foobar <NS1.FOOBAR>\n';
    data += '<NS1.FOOBAR> foobar <NS1.FOOBAR>\n';
    data += 'foobar <NS1.BARFOO>\n';
    data += '<NS1.FOOBAR> foobar <NS2.FOOBAR>\n';
    data += '<NS2.FOOBAR> foobar';

    beforeEach (function () {
      ph = new xPh.Placeholder ();
    });

    it ('inject one value for one namespace', function () {
      var expected = '';
      expected += 'foobar raboof\n';
      expected += 'raboof foobar raboof\n';
      expected += 'foobar <NS1.BARFOO>\n';
      expected += 'raboof foobar <NS2.FOOBAR>\n';
      expected += '<NS2.FOOBAR> foobar';

      ph.set ('FOOBAR', 'raboof')
        .inject ('NS1', data).should.be.equal (expected);
    });

    it ('inject two values for one namespace', function () {
      var expected = '';
      expected += 'foobar raboof\n';
      expected += 'raboof foobar raboof\n';
      expected += 'foobar foobar\n';
      expected += 'raboof foobar <NS2.FOOBAR>\n';
      expected += '<NS2.FOOBAR> foobar';

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
      expected += 'raboof foobar';

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
      expected += 'raboof foobar';

      data = ph
        .set ('FOOBAR', 'raboof')
        .set ('BARFOO', 'foobar')
        .inject ('NS1', data);
      ph.inject ('NS2', data).should.be.equal (expected);
    });
  });
});
