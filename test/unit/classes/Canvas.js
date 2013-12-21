var expect = require('expect.js');
var Canvas = require('../../../classes/Canvas');

// Mocks used because the constructor tries to create/validate a canvas element
var defaultWidth = 300;
var defaultHeight = 150;
global.CanvasRenderingContext2D = function() {};
global.HTMLCanvasElement = function() {
  this.width = defaultWidth;
  this.height = defaultHeight;
};
global.HTMLCanvasElement.prototype.constructor = global.HTMLCanvasElement;
global.HTMLCanvasElement.prototype.getContext = function() {
  return new global.CanvasRenderingContext2D();
};
global.document = {
  createElement: function(tagName) {
    return tagName === 'canvas' ? new HTMLCanvasElement() : null;
  }
};

var HTMLCanvasElement = global.HTMLCanvasElement;
var CanvasRenderingContext2D = global.CanvasRenderingContext2D;

describe('Canvas', function() {

  describe('Canvas constructor', function() {

    var canvas = new Canvas({name: 'Canvas'});

    it('should set any properties passed in', function() {
      expect(canvas.name).to.equal('Canvas');
    });

    it('should set the default value of property `width` to the canvas element width', function() {
      expect(canvas.width).to.equal(defaultWidth);
    });

    it('should set the default value of property `height` to the canvas element height', function() {
      expect(canvas.height).to.equal(defaultHeight);
    });

    it('should set the default value of property `background` to \'\' (transparent)', function() {
      expect(canvas.background).to.equal('');
    });

    it('should set the default value of property `camera` to null', function() {
      expect(canvas.camera).to.equal(null);
    });

    it('should set the default value of property `element` to new canvas element', function() {
      expect(canvas.element instanceof HTMLCanvasElement).to.equal(true);
    });

    it('should set the default value of property `context` to the context of the canvas element', function() {
      expect(canvas.context instanceof CanvasRenderingContext2D).to.equal(true);
    });

    it('should set the default value of property `viewMode` to \'fit\'', function() {
      expect(canvas.viewMode).to.equal('fit');
    });

    it('should set the default value of property `renderDepth` to 0', function() {
      expect(canvas.renderDepth).to.equal(0);
    });

    it('should set the default value of property `maxRenderDepth` to 5', function() {
      expect(canvas.maxRenderDepth).to.equal(5);
    });

  });

  describe('#setProperties()', function() {

    it('should set any properties passed in', function() {
      var canvas = new Canvas();
      expect(canvas.name).to.equal(undefined);
      canvas.setProperties({
        name: 'Canvas'
      });
      expect(canvas.name).to.equal('Canvas');
    });

  });

  describe('#_getViewModeValues()', function() {

    var canvas = new Canvas({width: 300, height: 150});

    it('should handle viewMode \'fit-x\' (for horizontal camera)', function() {
      canvas.viewMode = 'fit-x';
      canvas.camera = {width: 200, height: 50};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(1.5);
      expect(values.scaleY).to.equal(1.5);
      expect(values.x).to.equal(0);
      expect(values.y).to.equal(37.5);
    });

    it('should handle viewMode \'fit-x\' (for vertical camera)', function() {
      canvas.viewMode = 'fit-x';
      canvas.camera = {width: 50, height: 200};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(6);
      expect(values.scaleY).to.equal(6);
      expect(values.x).to.equal(0);
      expect(values.y).to.equal(-525);
    });

    it('should handle viewMode \'fit-y\' (for horizontal camera)', function() {
      canvas.viewMode = 'fit-y';
      canvas.camera = {width: 200, height: 50};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(3);
      expect(values.scaleY).to.equal(3);
      expect(values.x).to.equal(-150);
      expect(values.y).to.equal(0);
    });

    it('should handle viewMode \'fit-y\' (for vertical camera)', function() {
      canvas.viewMode = 'fit-y';
      canvas.camera = {width: 50, height: 200};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(0.75);
      expect(values.scaleY).to.equal(0.75);
      expect(values.x).to.equal(131.25);
      expect(values.y).to.equal(0);
    });

    it('should handle viewMode \'fit\' (for horizontal camera)', function() {
      canvas.viewMode = 'fit';
      canvas.camera = {width: 200, height: 50};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(1.5);
      expect(values.scaleY).to.equal(1.5);
      expect(values.x).to.equal(0);
      expect(values.y).to.equal(37.5);
    });

    it('should handle viewMode \'fit\' (for vertical camera)', function() {
      canvas.viewMode = 'fit';
      canvas.camera = {width: 50, height: 200};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(0.75);
      expect(values.scaleY).to.equal(0.75);
      expect(values.x).to.equal(131.25);
      expect(values.y).to.equal(0);
    });

    it('should handle viewMode \'stretch\' (for horizontal camera)', function() {
      canvas.viewMode = 'stretch';
      canvas.camera = {width: 200, height: 50};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(1.5);
      expect(values.scaleY).to.equal(3);
      expect(values.x).to.equal(0);
      expect(values.y).to.equal(0);
    });

    it('should handle viewMode \'stretch\' (for vertical camera)', function() {
      canvas.viewMode = 'stretch';
      canvas.camera = {width: 50, height: 200};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(6);
      expect(values.scaleY).to.equal(0.75);
      expect(values.x).to.equal(0);
      expect(values.y).to.equal(0);
    });

  });

});
