var expect = require('expect.js');
var defineProperties = require('../../../utils/defineProperties');

describe('defineProperties', function() {

  it('should define properties with a normal getter (no setter)', function() {
    var object = {};
    defineProperties(object, {
      foo: {
        value: 'foo'
      }
    });
    expect(object.foo).to.equal('foo');
    object.foo = 'bar';
    expect(object.foo).to.equal('foo');
  });

  it('should define properties with a normal getter and setter (using \'writable\')', function() {
    var object = {};
    defineProperties(object, {
      foo: {
        value: 'foo',
        writable: true
      }
    });
    expect(object.foo).to.equal('foo');
    object.foo = 'bar';
    expect(object.foo).to.equal('bar');
  });

  it('should define properties with a normal getter and setter (using true values)', function() {
    var object = {};
    defineProperties(object, {
      foo: {
        value: 'foo',
        get: true,
        set: true
      }
    });
    expect(object.foo).to.equal('foo');
    object.foo = 'bar';
    expect(object.foo).to.equal('bar');
  });

  it('should define properties with a normal getter and setter, but without initial value', function() {
    var object = {};
    defineProperties(object, {
      foo: {
        set: true
      },
      bar: {
        writable: true
      }
    });

    expect(object.foo).to.equal(undefined);
    object.foo = 'foo';
    expect(object.foo).to.equal('foo');

    expect(object.bar).to.equal(undefined);
    object.bar = 'bar';
    expect(object.bar).to.equal('bar');
  });

  it('should define properties with a custom getter', function() {
    var object = {};
    defineProperties(object, {
      foo: {
        value: 'foo',
        get: function() { return 'bar'; }
      }
    });
    expect(object.foo).to.equal('bar');
  });

  it('should define properties with a custom setter (that doesn\'t return anything)', function() {
    var object = {};
    var hasSetterBeenCalled = false;

    defineProperties(object, {
      foo: {
        value: 'foo',
        set: function() {
          hasSetterBeenCalled = true;
        }
      }
    });
    expect(object.foo).to.equal('foo');
    object.foo = 'bar';
    expect(object.foo).to.equal('bar');
    expect(hasSetterBeenCalled).to.equal(true);
  });

  it('should define properties with a custom setter (that returns something else)', function() {
    var object = {};

    defineProperties(object, {
      foo: {
        value: 'foo',
        set: function() {
          return 'something';
        }
      }
    });
    expect(object.foo).to.equal('foo');
    object.foo = 'bar';
    expect(object.foo).to.equal('something');
  });

  it('should define properties with a custom getter and setter', function() {
    var object = {};
    var hasSetterBeenCalled = false;

    defineProperties(object, {
      foo: {
        value: 'foo',
        get: function() {
          return 'anything';
        },
        set: function() {
          hasSetterBeenCalled = true;
          return 'something';
        }
      }
    });
    expect(object.foo).to.equal('anything');
    object.foo = 'bar';
    expect(hasSetterBeenCalled).to.equal(true);
    expect(object.foo).to.equal('anything');
  });

  it('should define properties and set the \'configurable\' setting to false by default', function() {
    var object = {};

    defineProperties(object, {
      foo: {
        value: 'foo'
      }
    });
    expect(object.foo).to.equal('foo');
    delete object.foo;
    expect(object.foo).to.equal('foo');
  });

  it('should define properties and set the \'configurable\' setting to what was specified', function() {
    var object = {};

    defineProperties(object, {
      foo: {
        value: 'foo',
        configurable: true
      },
      bar: {
        value: 'bar',
        configurable: false
      }
    });

    expect(object.foo).to.equal('foo');
    delete object.foo;
    expect(object.foo).to.equal(undefined);

    expect(object.bar).to.equal('bar');
    delete object.bar;
    expect(object.bar).to.equal('bar');
  });

  it('should define properties and set the \'enumerable\' setting to false by default', function() {
    var object = {};

    defineProperties(object, {
      foo: {
        value: 'foo'
      }
    });

    expect(object.foo).to.equal('foo');
    expect(findProperty('foo', object)).to.equal(false);
  });

  it('should define properties and set the \'enumerable\' setting to what was specified', function() {
    var object = {};

    defineProperties(object, {
      foo: {
        value: 'foo',
        enumerable: true
      },
      bar: {
        value: 'bar',
        enumerable: false
      }
    });

    expect(object.foo).to.equal('foo');
    expect(object.bar).to.equal('bar');
    expect(findProperty('foo', object)).to.equal(true);
    expect(findProperty('bar', object)).to.equal(false);
  });

  it('should define properties and set defaults if specified, but only if not specified in a specific property', function() {
    var object = {};

    defineProperties(object, {
      foo: {
        value: 'foo'
      },
      bar: {
        value: 'bar',
        enumerable: false
      }
    }, {enumerable: true});

    expect(object.foo).to.equal('foo');
    expect(object.bar).to.equal('bar');
    expect(findProperty('foo', object)).to.equal(true);
    expect(findProperty('bar', object)).to.equal(false);
  });

});

function findProperty(propertyName, object) {
  var wasFound = false;
  for (var prop in object) {
    if (prop === propertyName) {
      wasFound = true;
      break;
    }
  }
  return wasFound;
}
