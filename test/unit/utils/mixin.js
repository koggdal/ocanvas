var expect = require('expect.js');
var mixin = require('../../../utils/mixin');

describe('mixin', function() {

  it('should put properties from a source object on a target object', function() {
    var target = {};
    var source = {
      foo: 'foo',
      bar: 'bar'
    };

    mixin(target, source);

    expect(target.foo).to.equal(source.foo);
    expect(target.bar).to.equal(source.bar);
  });

  it('should return the target object', function() {
    var target = {};
    var source = {foo: 'foo'};

    var returnedTarget = mixin(target, source);

    expect(target.foo).to.equal(source.foo);
    expect(returnedTarget).to.equal(target);
  });

  it('should put properties from many source objects on a target object', function() {
    var target = {};
    var source1 = {foo: 'foo'};
    var source2 = {bar: 'bar'};
    var source3 = {foobar: 'foobar'};
    var source4 = {bar: 'newbar'};

    mixin(target, source1, source2, source3, source4);

    expect(target.foo).to.equal(source1.foo);
    expect(target.bar).to.equal(source4.bar);
    expect(target.bar).to.not.equal(source2.bar);
    expect(target.foobar).to.equal(source3.foobar);
  });

  it('should only take properties from a source object\'s own properties, not from the prototype', function() {
    var target = {};
    var proto = {baz: 'baz'};
    var source = Object.create(proto);
    source.foo = 'foo';
    source.bar = 'bar';

    mixin(target, source);

    expect(target.foo).to.equal(source.foo);
    expect(target.bar).to.equal(source.bar);
    expect(target.baz).to.not.be.ok();
  });

});
