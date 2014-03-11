var expect = require('expect.js');
var inherit = require('../../../utils/inherit');
var isInstanceOf = require('../../../utils/isInstanceOf');

describe('isInstanceOf', function() {

  it('should return true if object is a direct instance of the class', function() {
    function MyClass() {}
    MyClass.className = 'MyClass';

    expect(isInstanceOf(new MyClass(), 'MyClass')).to.equal(true);
  });

  it('should return true if object is an instance of the class one step out', function() {
    function MyClass() {}
    MyClass.className = 'MyClass';

    function MyClass2() {}
    MyClass2.className = 'MyClass2';
    inherit(MyClass2, MyClass);

    expect(isInstanceOf(new MyClass2(), 'MyClass')).to.equal(true);
  });

  it('should return true if object is an instance of the class several steps out', function() {
    function MyClass() {}
    MyClass.className = 'MyClass';

    function MyClass2() {}
    MyClass2.className = 'MyClass2';
    inherit(MyClass2, MyClass);

    function MyClass3() {}
    MyClass3.className = 'MyClass3';
    inherit(MyClass3, MyClass2);

    expect(isInstanceOf(new MyClass3(), 'MyClass')).to.equal(true);
  });

  it('should return false if object is not an instance of the class', function() {
    function MyClass() {}
    MyClass.className = 'MyClass';

    expect(isInstanceOf(new MyClass(), 'MyClass2')).to.equal(false);
  });

  it('should return false if input is not a function or an object', function() {
    expect(isInstanceOf(undefined, 'Object')).to.equal(false);
    expect(isInstanceOf(null, 'Object')).to.equal(false);
    expect(isInstanceOf(false, 'Object')).to.equal(false);
    expect(isInstanceOf(true, 'Object')).to.equal(false);
    expect(isInstanceOf(42, 'Object')).to.equal(false);
    expect(isInstanceOf('string', 'Object')).to.equal(false);

    expect(isInstanceOf(function() {}, 'Object')).to.equal(true);
    expect(isInstanceOf({}, 'Object')).to.equal(true);
  });

  it('should return true if input is a function or an object and tests for Object', function() {
    expect(isInstanceOf(function() {}, 'Object')).to.equal(true);
    expect(isInstanceOf({}, 'Object')).to.equal(true);
  });

});
