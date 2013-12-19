var expect = require('expect.js');
var RectangularCanvasObject = require('../../../shapes/base/RectangularCanvasObject');
var Rectangle = require('../../../shapes/Rectangle');

describe('Rectangle', function() {

  it('should inherit from RectangularCanvasObject', function() {
    var object = new Rectangle();
    expect(Rectangle.prototype instanceof RectangularCanvasObject).to.equal(true);
    expect(object instanceof RectangularCanvasObject).to.equal(true);
    expect(object.calculateOrigin).to.equal(RectangularCanvasObject.prototype.calculateOrigin);
  });

  describe('Rectangle constructor', function() {

    var object = new Rectangle({name: 'Rectangle'});

    it('should set any properties passed in', function() {
      expect(object.name).to.equal('Rectangle');
    });

  });

});
