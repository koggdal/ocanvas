var expect = require('expect.js');
var NodeCanvas = require('canvas');

var World = require('../../../classes/World');
var Canvas = require('../../../classes/Canvas');
var Camera = require('../../../classes/Camera');
var RectangularCanvasObject = require('../../../shapes/base/RectangularCanvasObject');
var Rectangle = require('../../../shapes/Rectangle');

global.HTMLCanvasElement = NodeCanvas;

describe('Rectangle', function() {

  describe('#render()', function() {

    it('should call the super render method', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var originalRender = RectangularCanvasObject.prototype.render;
      RectangularCanvasObject.prototype.render = function() {
        RectangularCanvasObject.prototype.render = originalRender;
        done();
      };

      var object = new Rectangle();
      object.render(canvas);
    });

    it('should draw a rectangle with a fill', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Rectangle({
        width: 100,
        height: 100,
        fill: 'red'
      });

      object.render(canvas);

      var ctx = canvas.context;
      var w = object.width - 1;
      var h = object.height - 1;

      // Test all four corners of the rectangle
      expect(getColor(ctx, 0, 0)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, w, 0)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, w, h)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 0, h)).to.equal('rgba(255, 0, 0, 255)');

      // Test some pixel outside the rectangle
      expect(getColor(ctx, 290, 290)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should draw a rectangle with a stroke', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Rectangle({
        width: 100,
        height: 100,
        stroke: '10px red'
      });

      object.render(canvas);

      var ctx = canvas.context;
      var w = object.width - 1;
      var h = object.height - 1;
      var o = 2; // offset for stroke

      // Test bottom right corner of the rectangle (with offset for stroke)
      // The other corners are hidden outside the canvas area,
      // because positioning the rectangle is handled by other layers
      // of the rendering process.
      expect(getColor(ctx, w + o, h + o)).to.equal('rgba(255, 0, 0, 255)');

      // Test some pixel inside the rectangle
      expect(getColor(ctx, 50, 50)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel outside the rectangle
      expect(getColor(ctx, 290, 290)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should draw a rectangle with a stroke and a fill', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Rectangle({
        width: 100,
        height: 100,
        fill: 'blue',
        stroke: '10px red'
      });

      object.render(canvas);

      var ctx = canvas.context;
      var w = object.width - 1;
      var h = object.height - 1;
      var o = 2; // offset for stroke

      // Test all four corners of the rectangle
      expect(getColor(ctx, 0, 0)).to.equal('rgba(0, 0, 255, 255)');
      expect(getColor(ctx, w, 0)).to.equal('rgba(0, 0, 255, 255)');
      expect(getColor(ctx, w, h)).to.equal('rgba(0, 0, 255, 255)');
      expect(getColor(ctx, 0, h)).to.equal('rgba(0, 0, 255, 255)');

      // Test bottom right corner of the rectangle (with offset for stroke)
      // The other corners are hidden outside the canvas area,
      // because positioning the rectangle is handled by other layers
      // of the rendering process.
      expect(getColor(ctx, w + o, h + o)).to.equal('rgba(255, 0, 0, 255)');

      // Test some pixel inside the rectangle
      expect(getColor(ctx, 50, 50)).to.equal('rgba(0, 0, 255, 255)');

      // Test some pixel outside the rectangle
      expect(getColor(ctx, 290, 290)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should draw a rectangle with a camera fill', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var camera = new Camera();
      camera.render = function() {
        done();
      };

      var object = new Rectangle({
        width: 100,
        height: 100,
        fill: camera
      });

      object.render(canvas);
    });

  });

});

function getColor(context, x, y) {
  var data = context.getImageData(x, y, 1, 1).data;
  return 'rgba(' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + data[3] + ')';
}
