var expect = require('expect.js');
var NodeCanvas = require('canvas');
var getColor = require('../../utils/getColor');
var imageMock = require('../mocks/image');

var Scene = require('../../../classes/Scene');
var Canvas = require('../../../classes/Canvas');
var Camera = require('../../../classes/Camera');
var EllipticalCanvasObject = require('../../../shapes/base/EllipticalCanvasObject');
var Ellipse = require('../../../shapes/Ellipse');
var ImageTexture = require('../../../textures/ImageTexture');
var Texture = require('../../../textures/Texture');

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
      var x = object.x;
      var y = object.y;
      var rX = object.radiusX;
      var rY = object.radiusY;

      expect(getColor(context, x, y - rY + 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, x + rX - 2, y)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, x, y + rY - 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, x - rX + 2, y)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, x + rX - 5, y + rY - 5)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(context, 5, 5)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should handle ellipses with same radiusX and radiusY (circle)', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 150)
      });
      var object = new Ellipse({
        radiusX: 50, radiusY: 50,
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
      var x = object.x;
      var y = object.y;
      var rX = object.radiusX;
      var rY = object.radiusY;

      expect(getColor(context, x, y - rY + 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, x + rX - 2, y)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, x, y + rY - 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, x - rX + 2, y)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, x + rX - 5, y + rY - 5)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(context, 5, 5)).to.equal('rgba(0, 0, 0, 0)');
    });

  });

  describe('#renderColorFill()', function() {

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

      object.renderColorFill(canvas, object.fill);

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

    it('should not draw an ellipse with an empty string as a fill', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Ellipse({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        fill: ''
      });

      canvas.context.translate(object.x, object.y);

      object.renderColorFill(canvas, object.fill);

      var ctx = canvas.context;
      var rX = object.radiusX;
      var rY = object.radiusY;

      // Test all four edges of the ellipse (in default rotation)
      expect(getColor(ctx, rX, 2)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, rX * 2 - 2, rY)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, rX, rY * 2 - 2)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, 2, rY)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel outside the ellipse
      expect(getColor(ctx, rX * 2, rY * 2)).to.equal('rgba(0, 0, 0, 0)');
    });

  });

  describe('#renderColorStroke()', function() {

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

      object.renderColorStroke(canvas, 10, 'red');

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

    it('should not draw an ellipse with a stroke that has no color', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Ellipse({
        radiusX: 100, radiusY: 50,
        x: 110, y: 60,
        stroke: '10px'
      });

      canvas.context.translate(object.x, object.y);

      object.renderColorStroke(canvas, 10, '');

      var ctx = canvas.context;
      var stroke = 10;
      var rX = object.radiusX + stroke;
      var rY = object.radiusY + stroke;

      // Test all four edges of the ellipse (in default rotation)
      expect(getColor(ctx, rX, 2)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, rX * 2 - 2, rY)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, rX, rY * 2 - 2)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, 2, rY)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel inside the ellipse
      expect(getColor(ctx, rX, rY)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel outside the ellipse
      expect(getColor(ctx, rX * 2, rY * 2)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should not draw an ellipse with a stroke that is of zero width', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Ellipse({
        radiusX: 100, radiusY: 50,
        x: 110, y: 60,
        stroke: '0px red'
      });

      canvas.context.translate(object.x, object.y);

      object.renderColorStroke(canvas, 0, 'red');

      var ctx = canvas.context;
      var stroke = 10;
      var rX = object.radiusX + stroke;
      var rY = object.radiusY + stroke;

      // Test all four edges of the ellipse (in default rotation)
      expect(getColor(ctx, rX, 2)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, rX * 2 - 2, rY)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, rX, rY * 2 - 2)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, 2, rY)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel inside the ellipse
      expect(getColor(ctx, rX, rY)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel outside the ellipse
      expect(getColor(ctx, rX * 2, rY * 2)).to.equal('rgba(0, 0, 0, 0)');
    });

  });

  describe('#renderImageTextureFill()', function() {

    before(function() {
      imageMock.on();
      imageMock.setDirName(__dirname);
    });

    after(function() {
      imageMock.off();
    });

    it('should draw an ellipse with an image texture fill', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var texture = new ImageTexture({
        image: 'ocanvas-logo.png',
        size: 'stretch'
      });

      texture.on('load', function() {
        var object = new Ellipse({
          originX: -10, originY: -20,
          radiusX: 100, radiusY: 50,
          x: 100, y: 50,
          fill: texture
        });

        canvas.context.translate(object.x, object.y);

        object.renderImageTextureFill(canvas, object.fill);

        var ctx = canvas.context;
        var rX = object.radiusX;
        var rY = object.radiusY;
        var oX = -object.calculateOrigin('x');
        var oY = -object.calculateOrigin('y');

        // Test all four edges of the ellipse (in default rotation)
        expect(getColor(ctx, oX + rX, oY + 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, oX + rX * 2 - 3, oY + rY)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, oX + rX, oY + rY * 2 - 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, oX + 3, oY + rY)).to.equal('rgba(34, 34, 34, 255)');

        // Test some pixel outside the ellipse
        expect(getColor(ctx, oX + rX * 2, oY + rY * 2)).to.equal('rgba(0, 0, 0, 0)');

        done();
      });
    });

    it('should not draw anything if the image texture fill has no `imageElement`', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var texture = new ImageTexture({
        image: 'ocanvas-logo.png',
        size: 'stretch'
      });

      expect(texture.imageElement).to.equal(null);

      var object = new Ellipse({
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        fill: texture
      });

      canvas.context.translate(object.x, object.y);

      object.renderImageTextureFill(canvas, object.fill);

      var ctx = canvas.context;
      var rX = object.radiusX;
      var rY = object.radiusY;

      // Test all four edges of the ellipse (in default rotation)
      expect(getColor(ctx, rX, 2)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, rX * 2 - 2, rY)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, rX, rY * 2 - 2)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, 2, rY)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel outside the ellipse
      expect(getColor(ctx, rX * 2, rY * 2)).to.equal('rgba(0, 0, 0, 0)');
    });

  });

  describe('#renderTextureFill()', function() {

    before(function() {
      imageMock.on();
      imageMock.setDirName(__dirname);
    });

    after(function() {
      imageMock.off();
    });

    it('should draw an ellipse with an image texture fill', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var texture = new ImageTexture({
        image: 'ocanvas-logo.png',
        size: 'source'
      });

      texture.on('load', function() {
        var object = new Ellipse({
          originX: -10, originY: -20,
          radiusX: 100, radiusY: 50,
          x: 100, y: 50,
          fill: texture
        });

        canvas.context.translate(object.x, object.y);

        object.renderTextureFill(canvas, object.fill);

        var ctx = canvas.context;
        var rX = object.radiusX;
        var rY = object.radiusY;
        var oX = -object.calculateOrigin('x');
        var oY = -object.calculateOrigin('y');

        // Test all four edges of the ellipse (in default rotation)
        expect(getColor(ctx, oX + rX, oY + 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, oX + rX * 2 - 3, oY + rY)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, oX + rX, oY + rY * 2 - 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, oX + 3, oY + rY)).to.equal('rgba(34, 34, 34, 255)');

        // Test specific spots in the repeated image texture
        expect(getColor(ctx, 56, 48)).to.equal('rgba(30, 105, 130, 255)');
        expect(getColor(ctx, 56, 91)).to.equal('rgba(30, 105, 130, 255)');
        expect(getColor(ctx, 184, 48)).to.equal('rgba(30, 105, 130, 255)');
        expect(getColor(ctx, 184, 91)).to.equal('rgba(30, 105, 130, 255)');

        // Test some pixel outside the ellipse
        expect(getColor(ctx, oX + rX * 2, oY + rY * 2)).to.equal('rgba(0, 0, 0, 0)');

        done();
      });
    });

    it('should draw an ellipse with a texture fill', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var texture = new Texture({style: 'red'});

      expect(texture.style).to.equal('red');

      var object = new Ellipse({
        originX: -10, originY: -20,
        radiusX: 100, radiusY: 50,
        x: 100, y: 50,
        fill: texture
      });

      canvas.context.translate(object.x, object.y);

      object.renderTextureFill(canvas, object.fill);

      var ctx = canvas.context;
      var rX = object.radiusX;
      var rY = object.radiusY;
      var oX = -object.calculateOrigin('x');
      var oY = -object.calculateOrigin('y');

      // Test all four edges of the ellipse (in default rotation)
      expect(getColor(ctx, oX + rX, oY + 3)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, oX + rX * 2 - 3, oY + rY)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, oX + rX, oY + rY * 2 - 3)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, oX + 3, oY + rY)).to.equal('rgba(255, 0, 0, 255)');

      // Test some pixel outside the ellipse
      expect(getColor(ctx, oX + rX * 2, oY + rY * 2)).to.equal('rgba(0, 0, 0, 0)');
    });

  });

  describe('#renderCameraFill()', function() {

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

      object.renderCameraFill(canvas, object.fill);
    });

  });

});
