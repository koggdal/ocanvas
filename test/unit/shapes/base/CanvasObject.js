var expect = require('expect.js');
var CanvasObject = require('../../../../shapes/base/CanvasObject');
var Collection = require('../../../../classes/Collection');

describe('CanvasObject', function() {

  describe('CanvasObject constructor', function() {

    var object = new CanvasObject({name: 'CanvasObject'});

    it('should set any properties passed in', function() {
      expect(object.name).to.equal('CanvasObject');
    });

    it('should set the default value of property `x` to 0', function() {
      expect(object.x).to.equal(0);
    });

    it('should set the default value of property `y` to 0', function() {
      expect(object.y).to.equal(0);
    });

    it('should set the default value of property `originX` to 0', function() {
      expect(object.originX).to.equal(0);
    });

    it('should set the default value of property `originY` to 0', function() {
      expect(object.originY).to.equal(0);
    });

    it('should set the default value of property `rotation` to 0', function() {
      expect(object.rotation).to.equal(0);
    });

    it('should set the default value of property `fill` to \'\' (transparent)', function() {
      expect(object.fill).to.equal('');
    });

    it('should set the default value of property `stroke` to \'\' (transparent, no thickness)', function() {
      expect(object.stroke).to.equal('');
    });

    it('should set the default value of property `opacity` to 1', function() {
      expect(object.opacity).to.equal(1);
    });

    it('should set the default value of property `children` to a new collection', function() {
      expect(object.children instanceof Collection).to.equal(true);
    });

    it('should set up an insert event listener for the children collection (to set the parent property)', function() {
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      object1.children.add(object2);
      expect(object2.parent).to.equal(object1);
    });

    it('should set up a remove event listener for the children collection (to unset the parent property)', function() {
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      object1.children.add(object2);
      object1.children.remove(object2);
      expect(object2.parent).to.equal(null);
    });

  });

  describe('#calculateOrigin', function() {

    it('should be defined but throw an error (needs subclass implementation)', function(done) {
      var object = new CanvasObject();

      try {
        object.calculateOrigin();
      } catch(error) {
        if (error.name === 'ocanvas-needs-subclass') {
          done();
        } else {
          done(error);
        }
      }
    });

  });

  describe('#setProperties', function() {

    it('should set any properties passed in', function() {
      var object = new CanvasObject();
      expect(object.name).to.equal(undefined);
      object.setProperties({
        name: 'CanvasObject'
      });
      expect(object.name).to.equal('CanvasObject');
    });

  });

});
