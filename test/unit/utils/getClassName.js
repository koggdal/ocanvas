var expect = require('expect.js');
var getClassName = require('../../../utils/getClassName');

describe('getClassName', function() {

  it('should get the name of a class from the `className` property', function() {
    function MyClass() {}
    MyClass.className = 'MyClass2';
    expect(getClassName(MyClass)).to.equal('MyClass2');
  });

  it('should get the name of a class from the `name` property', function() {
    function MyClass() {}
    expect(getClassName(MyClass)).to.equal('MyClass');
  });

  it('should get the name of a class from the stringified function as a fallback when `name` doesn\'t exist', function() {
    var MyClass = {
      toString: function() {
        return 'function MyClass() {}';
      }
    };
    expect(getClassName(MyClass)).to.equal('MyClass');
  });

});
