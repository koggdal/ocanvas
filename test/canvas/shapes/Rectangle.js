var expect = require('expect.js');
var NodeCanvas = require('canvas');
var getColor = require('../../utils/getColor');
var imageMock = require('../mocks/image');

var Scene = require('../../../classes/Scene');
var Canvas = require('../../../classes/Canvas');
var Camera = require('../../../classes/Camera');
var RectangularCanvasObject = require('../../../shapes/base/RectangularCanvasObject');
var Rectangle = require('../../../shapes/Rectangle');
var ImageTexture = require('../../../textures/ImageTexture');
var Texture = require('../../../textures/Texture');

global.HTMLCanvasElement = NodeCanvas;

describe('Rectangle', function() {

  describe('#renderColorFill()', function() {

    it('should draw a rectangle with a fill', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Rectangle({
        width: 100,
        height: 100,
        fill: 'red'
      });

      object.renderColorFill(canvas, object.fill);

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

    it('should not draw a rectangle with an empty string as a fill', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Rectangle({
        width: 100,
        height: 100,
        fill: ''
      });

      object.renderColorFill(canvas, object.fill);

      var ctx = canvas.context;
      var w = object.width - 1;
      var h = object.height - 1;

      // Test all four corners of the rectangle
      expect(getColor(ctx, 0, 0)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, w, 0)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, w, h)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, 0, h)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel outside the rectangle
      expect(getColor(ctx, 290, 290)).to.equal('rgba(0, 0, 0, 0)');
    });

  });

  describe('#renderColorStroke()', function() {

    it('should draw a rectangle with a stroke', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Rectangle({
        width: 100,
        height: 100,
        stroke: '10px red'
      });

      object.renderColorStroke(canvas, 10, 'red');

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

    it('should not draw a rectangle with a stroke that has no color', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Rectangle({
        width: 100,
        height: 100,
        stroke: '5px'
      });

      object.renderColorStroke(canvas, 5, '');

      var ctx = canvas.context;
      var w = object.width - 1;
      var h = object.height - 1;
      var o = 2; // offset for stroke

      // Test bottom right corner of the rectangle (with offset for stroke)
      // The other corners are hidden outside the canvas area,
      // because positioning the rectangle is handled by other layers
      // of the rendering process.
      expect(getColor(ctx, w + o, h + o)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel inside the rectangle
      expect(getColor(ctx, 50, 50)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel outside the rectangle
      expect(getColor(ctx, 290, 290)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should not draw a rectangle with a stroke that is of zero width', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object = new Rectangle({
        width: 100,
        height: 100,
        stroke: '0px red'
      });

      object.renderColorStroke(canvas, 0, 'red');

      var ctx = canvas.context;
      var w = object.width - 1;
      var h = object.height - 1;
      var o = 2; // offset for stroke

      // Test bottom right corner of the rectangle (with offset for stroke)
      // The other corners are hidden outside the canvas area,
      // because positioning the rectangle is handled by other layers
      // of the rendering process.
      expect(getColor(ctx, w + o, h + o)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel inside the rectangle
      expect(getColor(ctx, 50, 50)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel outside the rectangle
      expect(getColor(ctx, 290, 290)).to.equal('rgba(0, 0, 0, 0)');
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

    it('should draw a rectangle with an image texture fill', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var texture = new ImageTexture({
        image: 'ocanvas-logo.png',
        size: 'stretch'
      });

      texture.on('load', function() {
        var object = new Rectangle({
          originX: -10, originY: -20,
          width: 200, height: 100,
          fill: texture
        });

        canvas.context.translate(object.x, object.y);

        object.renderImageTextureFill(canvas, object.fill);

        var ctx = canvas.context;
        var x = object.x - object.calculateOrigin('x');
        var y = object.y - object.calculateOrigin('y');
        var w = object.width - 1;
        var h = object.height - 1;

        // Test all four corners of the rectangle
        expect(getColor(ctx, x + 3, y + 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, x + w - 3, y + 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, x + w - 3, y + h - 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, x + 3, y + h - 3)).to.equal('rgba(34, 34, 34, 255)');

        // Test some pixel outside the rectangle
        expect(getColor(ctx, 290, 290)).to.equal('rgba(0, 0, 0, 0)');

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

      var object = new Rectangle({
        originX: -10, originY: -20,
        width: 100, height: 50,
        fill: texture
      });

      canvas.context.translate(object.x, object.y);

      object.renderImageTextureFill(canvas, object.fill);

      var ctx = canvas.context;
      var x = object.x - object.calculateOrigin('x');
      var y = object.y - object.calculateOrigin('y');
      var w = object.width - 1;
      var h = object.height - 1;

      // Test all four corners of the rectangle
      expect(getColor(ctx, x + 3, y + 3)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, x + w - 3, y + 3)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, x + w - 3, y + h - 3)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, x + 3, y + h - 3)).to.equal('rgba(0, 0, 0, 0)');

      // Test some pixel outside the rectangle
      expect(getColor(ctx, 290, 290)).to.equal('rgba(0, 0, 0, 0)');
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

    it('should draw a rectangle with an image texture fill', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var texture = new ImageTexture({
        image: 'ocanvas-logo.png',
        size: 'source'
      });

      texture.on('load', function() {
        var object = new Rectangle({
          originX: -10, originY: -20,
          width: 200, height: 100,
          fill: texture
        });

        canvas.context.translate(object.x, object.y);

        object.renderTextureFill(canvas, object.fill);

        var ctx = canvas.context;
        var x = object.x - object.calculateOrigin('x');
        var y = object.y - object.calculateOrigin('y');
        var w = object.width - 1;
        var h = object.height - 1;

        // Test all four corners of the rectangle
        expect(getColor(ctx, x + 3, y + 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, x + w - 3, y + 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, x + w - 3, y + h - 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, x + 3, y + h - 3)).to.equal('rgba(34, 34, 34, 255)');

        // Test specific spots in the repeated image texture
        expect(getColor(ctx, x + 20, y + 20)).to.equal('rgba(30, 105, 130, 255)');
        expect(getColor(ctx, x + 20, y + 20 + 43)).to.equal('rgba(30, 105, 130, 255)');
        expect(getColor(ctx, x + 20 + 128, y + 20)).to.equal('rgba(30, 105, 130, 255)');
        expect(getColor(ctx, x + 20 + 128, y + 20 + 43)).to.equal('rgba(30, 105, 130, 255)');

        // Test some pixel outside the rectangle
        expect(getColor(ctx, 290, 290)).to.equal('rgba(0, 0, 0, 0)');

        done();
      });
    });

    it('should draw a rectangle with a texture fill', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var texture = new Texture({style: 'red'});

      expect(texture.style).to.equal('red');

      var object = new Rectangle({
        originX: -10, originY: -20,
        width: 100, height: 50,
        fill: texture
      });

      canvas.context.translate(object.x, object.y);

      object.renderTextureFill(canvas, object.fill);

      var ctx = canvas.context;
      var x = object.x - object.calculateOrigin('x');
      var y = object.y - object.calculateOrigin('y');
      var w = object.width - 1;
      var h = object.height - 1;

      // Test all four corners of the rectangle
      expect(getColor(ctx, x + 3, y + 3)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, x + w - 3, y + 3)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, x + w - 3, y + h - 3)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, x + 3, y + h - 3)).to.equal('rgba(255, 0, 0, 255)');

      // Test some pixel outside the rectangle
      expect(getColor(ctx, 290, 290)).to.equal('rgba(0, 0, 0, 0)');
    });

  });

  describe('#renderCameraFill()', function() {

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
