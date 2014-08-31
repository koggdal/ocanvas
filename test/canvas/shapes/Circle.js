var expect = require('expect.js');
var NodeCanvas = require('canvas');
var getColor = require('../../utils/getColor');
var snapshot = require('../../utils/snapshot');

var Scene = require('../../../classes/Scene');
var Canvas = require('../../../classes/Canvas');
var Camera = require('../../../classes/Camera');
var EllipticalCanvasObject = require('../../../shapes/base/EllipticalCanvasObject');
var Circle = require('../../../shapes/Circle');

global.HTMLCanvasElement = NodeCanvas;

describe('Circle', function() {

  describe('#renderPath()', function() {

    it('should draw a path on the canvas context', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 150)
      });
      var object = new Circle({
        radius: 50,
        x: 50, y: 50
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
      var r = object.radius;

      expect(getColor(context, r, 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, r * 2 - 2, r)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, r, r * 2 - 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, 2, r)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, r * 2 - 5, r * 2 -5)).to.equal('rgba(0, 0, 0, 0)');
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

      var object = new Circle();
      object.render(canvas);
    });

    it('should draw a circle with a fill', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Circle({
        radius: 50,
        x: 50, y: 50,
        fill: 'red'
      });

      canvas.context.translate(object.x, object.y);

      object.render(canvas);

      var ctx = canvas.context;
      var r = object.radius;

      // Test all four edges of the ellipse (in default rotation)
      expect(getColor(ctx, r, 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, r * 2 - 2, r)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, r, r * 2 - 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 2, r)).to.equal('rgba(255, 0, 0, 255)');

      // Test some pixel outside the ellipse
      expect(getColor(ctx, r * 2, r * 2)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should draw a circle with a stroke', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Circle({
        radius: 50,
        x: 60, y: 60,
        stroke: '10px red'
      });

      canvas.context.translate(object.x, object.y);

      object.render(canvas);

      var ctx = canvas.context;
      var stroke = 10;
      var r = object.radius + stroke;

      // Test all four edges of the ellipse (in default rotation)
      expect(getColor(ctx, r, 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, r * 2 - 2, r)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, r, r * 2 - 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 2, r)).to.equal('rgba(255, 0, 0, 255)');

      // Test some pixel inside the ellipse
      expect(getColor(ctx, r, r)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel outside the ellipse
      expect(getColor(ctx, r * 2, r * 2)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should draw a circle with a stroke and a fill', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Circle({
        radius: 50,
        x: 60, y: 60,
        fill: 'blue',
        stroke: '10px red'
      });

      canvas.context.translate(object.x, object.y);

      object.render(canvas);

      var ctx = canvas.context;
      var stroke = 10;
      var r = object.radius + stroke;

      // Test all four edges of the ellipse (in default rotation)
      expect(getColor(ctx, r, 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, r * 2 - 2, r)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, r, r * 2 - 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 2, r)).to.equal('rgba(255, 0, 0, 255)');

      // Test some pixel inside the ellipse
      expect(getColor(ctx, r, r)).to.equal('rgba(0, 0, 255, 255)');

      // Test some pixel right inside the stroke
      expect(getColor(ctx, r, stroke + 2)).to.equal('rgba(0, 0, 255, 255)');

      // Test some pixel right outside the inside of the stroke
      expect(getColor(ctx, r, stroke - 2)).to.equal('rgba(255, 0, 0, 255)');

      // Test some pixel outside the ellipse
      expect(getColor(ctx, r * 2, r * 2)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should draw a circle with a camera fill', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var camera = new Camera();
      camera.render = function() {
        done();
      };

      var object = new Circle({
        radius: 100,
        x: 100, y: 50,
        fill: camera
      });

      object.render(canvas);
    });

  });

});
