var expect = require('expect.js');
var inherit = require('../../utils/inherit');

describe('inherit', function() {

  it('should make the subclass inherit from the base class', function() {
    function BaseClass() {}
    BaseClass.prototype.someMethod = function() {};

    function SubClass() {
      BaseClass.call();
    }
    inherit(SubClass, BaseClass);

    var subClassInstance = new SubClass();

    expect(SubClass.prototype instanceof BaseClass).to.equal(true);
    expect(subClassInstance instanceof BaseClass).to.equal(true);
    expect(subClassInstance.someMethod).to.equal(BaseClass.prototype.someMethod);
  });

  it('should only call the base constructor once when instantiating subclass', function() {
    var baseConstructorCalls = 0;
    function BaseClass() {
      baseConstructorCalls++;
    }
    BaseClass.prototype.someMethod = function() {};

    function SubClass() {
      BaseClass.call();
    }
    inherit(SubClass, BaseClass);

    var subClassInstance = new SubClass();

    expect(baseConstructorCalls).to.equal(1);
  });

});
