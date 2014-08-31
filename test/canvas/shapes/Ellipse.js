var expect = require('expect.js');
var NodeCanvas = require('canvas');
var getColor = require('../../utils/getColor');

var Scene = require('../../../classes/Scene');
var Canvas = require('../../../classes/Canvas');
var Camera = require('../../../classes/Camera');
var EllipticalCanvasObject = require('../../../shapes/base/EllipticalCanvasObject');
var Ellipse = require('../../../shapes/Ellipse');

global.HTMLCanvasElement = NodeCanvas;

describe('Ellipse', function() {

  describe('#renderPath()', function() {

    it('should draw a path on the canvas context', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 150)
      });
      var object = new Ellipse({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50
      });

      var context = canvas.context;

      context.translate(object.x, object.y);
      context.beginPath();

      object.renderPath(canvas);

      context.closePath();
      context.translate(-object.x, -object.y);

      context.clip();

      context.fillStyle = 'red';
      context.fillRect(0, 0, canvas.width, canvas.height);

      var ctx = canvas.context;
      var rX = object.radiusX;
      var rY = object.radiusY;

      expect(getColor(context, rX, 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, rX * 2 - 2, rY)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, rX, rY * 2 - 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, 2, rY)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, rX * 2 - 5, rY * 2 -5)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(context, 5, 5)).to.equal('rgba(0, 0, 0, 0)');
    });

  });

  describe('#render()', function() {

    it('should call the super render method', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var originalRender = EllipticalCanvasObject.prototype.render;
      EllipticalCanvasObject.prototype.render = function() {
        EllipticalCanvasObject.prototype.render = originalRender;
        done();
      };

      var object = new Ellipse();
      object.render(canvas);
    });

    it('should draw an ellipse with a fill', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Ellipse({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        fill: 'red'
      });

      canvas.context.translate(object.x, object.y);

      object.render(canvas);

      var ctx = canvas.context;
      var rX = object.radiusX;
      var rY = object.radiusY;

      // Test all four edges of the ellipse (in default rotation)
      expect(getColor(ctx, rX, 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, rX * 2 - 2, rY)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, rX, rY * 2 - 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 2, rY)).to.equal('rgba(255, 0, 0, 255)');

      // Test some pixel outside the ellipse
      expect(getColor(ctx, rX * 2, rY * 2)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should draw an ellipse with a stroke', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Ellipse({
        radiusX: 100, radiusY: 50,
        x: 110, y: 60,
        stroke: '10px red'
      });

      canvas.context.translate(object.x, object.y);

      object.render(canvas);

      var ctx = canvas.context;
      var stroke = 10;
      var rX = object.radiusX + stroke;
      var rY = object.radiusY + stroke;

      // Test all four edges of the ellipse (in default rotation)
      expect(getColor(ctx, rX, 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, rX * 2 - 2, rY)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, rX, rY * 2 - 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 2, rY)).to.equal('rgba(255, 0, 0, 255)');

      // Test some pixel inside the ellipse
      expect(getColor(ctx, rX, rY)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel outside the ellipse
      expect(getColor(ctx, rX * 2, rY * 2)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should draw an ellipse with a stroke and a fill', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Ellipse({
        radiusX: 100, radiusY: 50,
        x: 110, y: 60,
        fill: 'blue',
        stroke: '10px red'
      });

      canvas.context.translate(object.x, object.y);

      object.render(canvas);

      var ctx = canvas.context;
      var stroke = 10;
      var rX = object.radiusX + stroke;
      var rY = object.radiusY + stroke;

      // Test all four edges of the ellipse (in default rotation)
      expect(getColor(ctx, rX, 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, rX * 2 - 2, rY)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, rX, rY * 2 - 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 2, rY)).to.equal('rgba(255, 0, 0, 255)');

      // Test some pixel inside the ellipse
      expect(getColor(ctx, rX, rY)).to.equal('rgba(0, 0, 255, 255)');

      // Test some pixel right inside the stroke
      expect(getColor(ctx, rX, stroke + 2)).to.equal('rgba(0, 0, 255, 255)');

      // Test some pixel right outside the inside of the stroke
      expect(getColor(ctx, rX, stroke - 2)).to.equal('rgba(255, 0, 0, 255)');

      // Test some pixel outside the ellipse
      expect(getColor(ctx, rX * 2, rY * 2)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should draw an ellipse with a camera fill', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var camera = new Camera();
      camera.render = function() {
        done();
      };

      var object = new Ellipse({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        fill: camera
      });

      object.render(canvas);
    });

    it('should draw an ellipse the same radiusX and radiusY (circle)', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Ellipse({
        radiusX: 50, radiusY: 50,
        x: 50, y: 50,
        fill: 'red'
      });

      canvas.context.translate(object.x, object.y);

      object.render(canvas);

      var ctx = canvas.context;
      var rX = object.radiusX;
      var rY = object.radiusY;

      // Test all four edges of the ellipse (in default rotation)
      expect(getColor(ctx, rX, 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, rX * 2 - 2, rY)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, rX, rY * 2 - 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 2, rY)).to.equal('rgba(255, 0, 0, 255)');

      // Test some pixel outside the ellipse
      expect(getColor(ctx, rX * 2, rY * 2)).to.equal('rgba(0, 0, 0, 0)');
    });

  });

});
