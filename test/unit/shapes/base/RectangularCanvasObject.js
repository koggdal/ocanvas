var expect = require('expect.js');
var CanvasObject = require('../../../../shapes/base/CanvasObject');
var RectangularCanvasObject = require('../../../../shapes/base/RectangularCanvasObject');

describe('RectangularCanvasObject', function() {

  it('should inherit from CanvasObject', function() {
    var object = new RectangularCanvasObject();
    expect(RectangularCanvasObject.prototype instanceof CanvasObject).to.equal(true);
    expect(object instanceof CanvasObject).to.equal(true);
    expect(object.renderTree).to.equal(CanvasObject.prototype.renderTree);
  });

  describe('RectangularCanvasObject constructor', function() {

    var object = new RectangularCanvasObject({name: 'RectangularCanvasObject'});

    it('should set any properties passed in', function() {
      expect(object.name).to.equal('RectangularCanvasObject');
    });

    it('should set the default value of property `width` to 0', function() {
      expect(object.width).to.equal(0);
    });

    it('should set the default value of property `height` to 0', function() {
      expect(object.height).to.equal(0);
    });

  });

  describe('#calculateOrigin', function() {

    var object = new RectangularCanvasObject({
      width: 200,
      height: 100
    });

    it('should return an object with x/y properties', function() {
      var origin = object.calculateOrigin();
      expect(origin.x).to.not.equal(undefined);
      expect(origin.y).to.not.equal(undefined);
    });

    it('should return x=0 for originX=left', function() {
      object.originX = 'left';
      var origin = object.calculateOrigin();
      expect(origin.x).to.equal(0);
    });

    it('should return x=width for originX=right', function() {
      object.originX = 'right';
      var origin = object.calculateOrigin();
      expect(origin.x).to.equal(object.width);
    });

    it('should return x=width/2 for originX=center', function() {
      object.originX = 'center';
      var origin = object.calculateOrigin();
      expect(origin.x).to.equal(object.width / 2);
    });

    it('should return x=37 for originX=37', function() {
      object.originX = 37;
      var origin = object.calculateOrigin();
      expect(origin.x).to.equal(37);
    });

    it('should return x=0 for originX=foo', function() {
      object.originX = 'foo';
      var origin = object.calculateOrigin();
      expect(origin.x).to.equal(0);
    });

    it('should return y=0 for originY=top', function() {
      object.originY = 'top';
      var origin = object.calculateOrigin();
      expect(origin.y).to.equal(0);
    });

    it('should return y=height for originY=bottom', function() {
      object.originY = 'bottom';
      var origin = object.calculateOrigin();
      expect(origin.y).to.equal(object.height);
    });

    it('should return y=height/2 for originY=center', function() {
      object.originY = 'center';
      var origin = object.calculateOrigin();
      expect(origin.y).to.equal(object.height / 2);
    });

    it('should return y=37 for originY=37', function() {
      object.originY = 37;
      var origin = object.calculateOrigin();
      expect(origin.y).to.equal(37);
    });

    it('should return y=0 for originY=foo', function() {
      object.originY = 'foo';
      var origin = object.calculateOrigin();
      expect(origin.y).to.equal(0);
    });

  });

});
