var expect = require('expect.js');
var NodeCanvas = require('canvas');
var getColor = require('../../../utils/getColor');
var imageMock = require('../../mocks/image');

var create = require('../../../../create');
var Scene = require('../../../../classes/Scene');
var Canvas = require('../../../../classes/Canvas');
var Camera = require('../../../../classes/Camera');
var CanvasObject = require('../../../../shapes/base/CanvasObject');
var ImageTexture = require('../../../../textures/ImageTexture');

global.HTMLCanvasElement = NodeCanvas;

describe('CanvasObject', function() {

  describe('#render()', function() {

    it('should run with no problems (a subclass will call this function in the overriden method)', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });
      var object = new CanvasObject();
      object.render(canvas);
    });

    it('should handle clipping to a clipping mask (using a CanvasObject instance)', function() {
      var render = function(canvas) {
        CanvasObject.prototype.render.apply(this, arguments);
        canvas.context.fillStyle = this.fill;
        canvas.context.fillRect(0, 0, this.width, this.height);
      };
      var renderPath = function(canvas) {
        canvas.context.rect(0, 0, this.width, this.height);
      };
      var getVertices = function() {
        return [
          {x: this.x, y: this.y},
          {x: this.x + this.width, y: this.y},
          {x: this.x + this.width, y: this.y + this.height},
          {x: this.x, y: this.y + this.height}
        ];
      };

      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });
      var camera = new Camera({width: canvas.width, height: canvas.height});
      canvas.camera = camera;

      var scene = new Scene();
      scene.cameras.add(canvas.camera);

      var mask = new CanvasObject({
        fill: '#0f0',
        x: 25,
        y: 25,
        width: 50,
        height: 50,
        render: render,
        renderPath: renderPath,
        getVertices: getVertices,
        rotation: 20
      });
      var object = new CanvasObject({
        fill: '#f00',
        width: 100,
        height: 100,
        render: render,
        getVertices: getVertices,
        clippingMask: mask
      });
      scene.objects.add(object);
      canvas.render();

      var context = canvas.context;
      expect(getColor(context, 26, 30)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, 60, 30)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should handle clipping to a clipping mask (using a function)', function() {
      var render = function(canvas) {
        CanvasObject.prototype.render.apply(this, arguments);
        canvas.context.fillStyle = this.fill;
        canvas.context.fillRect(0, 0, this.width, this.height);
      };
      var getVertices = function() {
        return [
          {x: this.x, y: this.y},
          {x: this.x + this.width, y: this.y},
          {x: this.x + this.width, y: this.y + this.height},
          {x: this.x, y: this.y + this.height}
        ];
      };

      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });
      var camera = new Camera({width: canvas.width, height: canvas.height});
      canvas.camera = camera;

      var scene = new Scene();
      scene.cameras.add(canvas.camera);

      var object = new CanvasObject({
        fill: '#f00',
        width: 100,
        height: 100,
        render: render,
        getVertices: getVertices,
        clippingMask: function(canvas, context) {
          expect(canvas.context).to.equal(context);
          context.save();
          context.translate(25, 25);
          context.rotate(20 * Math.PI / 180);
          context.rect(0, 0, 50, 50);
          context.restore();
        }
      });
      scene.objects.add(object);
      canvas.render();

      var context = canvas.context;
      expect(getColor(context, 26, 30)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, 60, 30)).to.equal('rgba(0, 0, 0, 0)');
    });

  });

  describe('#renderTree()', function() {

    it('should call the render method', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });
      var object = new CanvasObject();
      object.render = function() {
        done();
      };
      object.renderTree(canvas);
    });

    it('should call the renderTree method of all children', function(done) {
      var scene = new Scene();
      var camera = new Camera({width: 300, height: 300});
      scene.cameras.add(camera);
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: camera
      });

      var getVertices = function() {
        return [{x: this.x, y: this.y}];
      };

      var object1 = new CanvasObject({getVertices: getVertices});
      var object2 = new CanvasObject({getVertices: getVertices});
      var object3 = new CanvasObject({getVertices: getVertices});

      var numObjectsRendered = 1;
      object2.renderTree = function(canvas) {
        expect(canvas instanceof Canvas).to.equal(true);
        if (++numObjectsRendered === 3) done();
      };
      object3.renderTree = function(canvas) {
        expect(canvas instanceof Canvas).to.equal(true);
        if (++numObjectsRendered === 3) done();
      };

      object1.children.add(object2);
      object1.children.add(object3);
      object1.renderTree(canvas);
    });

    it('should not render child objects that are not in view', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: new Camera({width: 300, height: 300})
      });

      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      object1.children.add(object2);

      var hasBeenCalled = false;
      object2.render = function() {
        hasBeenCalled = true;
      };
      object2.getVertices = function() {
        return [{x: 5000, y: this.y}];
      };

      object1.renderTree(canvas);

      setTimeout(function() {
        if (hasBeenCalled) done(new Error('The object was rendered even if it was not in view'));
        else done();
      }, 10);
    });

    it('should not render objects that have opacity set to 0', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: new Camera({width: 300, height: 300})
      });

      var object = new CanvasObject({opacity: 0});

      var hasBeenCalled = false;
      object.render = function() {
        hasBeenCalled = true;
      };

      object.renderTree(canvas);

      setTimeout(function() {
        if (hasBeenCalled) done(new Error('The object was rendered even if it had zero opacity'));
        else done();
      }, 10);
    });

    it('should render child objects that are not in view if the setting says so', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: new Camera({width: 300, height: 300}),
        boundingRectangleCulling: false
      });

      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      object1.children.add(object2);

      var hasBeenCalled = false;
      object2.render = function() {
        hasBeenCalled = true;
      };
      object2.getVertices = function() {
        return [{x: 5000, y: this.y}];
      };

      object1.renderTree(canvas);

      setTimeout(function() {
        if (hasBeenCalled) done();
        else done(new Error('The object was not rendered even if it was supposed to be'));
      }, 10);
    });

    it('should scale the canvas context for each child object', function() {
      var setup = create({
        element: new NodeCanvas(300, 300)
      });

      var getVertices = function() {
        return [{x: this.x, y: this.y}];
      };

      var object1 = new CanvasObject({
        getVertices: getVertices,
        width: 200, height: 150,
        fill: 'red'
      });
      var object2 = new CanvasObject({
        getVertices: getVertices,
        width: 100, height: 50,
        scalingX: 0.5, scalingY: 2,
        fill: 'lime'
      });
      var object3 = new CanvasObject({
        getVertices: getVertices,
        width: 50, height: 25,
        scalingX: 2, scalingY: 0.5,
        fill: 'blue'
      });

      setup.scene.objects.add(object1);
      object1.children.add(object2);
      object2.children.add(object3);

      var render = function(canvas) {
        canvas.context.fillStyle = this.fill;
        canvas.context.fillRect(0, 0, this.width, this.height);
      };
      object1.render = object2.render = object3.render = render;

      setup.canvas.render();

      var ctx = setup.canvas.context;

      expect(getColor(ctx, 199, 99)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 49, 99)).to.equal('rgba(0, 255, 0, 255)');
      expect(getColor(ctx, 50, 100)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 49, 24)).to.equal('rgba(0, 0, 255, 255)');
      expect(getColor(ctx, 50, 25)).to.equal('rgba(255, 0, 0, 255)');
    });

  });

  describe('#renderImageTextureSized()', function() {

    before(function() {
      imageMock.on();
      imageMock.setDirName(__dirname);
    });

    after(function() {
      imageMock.off();
    });

    it('should handle textures without an `imageElement` property without errors', function() {
      var canvas = new Canvas({element: new NodeCanvas(300, 300)});
      var fill = new ImageTexture();
      var object = new CanvasObject({fill: fill});

      // Mock a method it's using
      object.calculateOrigin = function(axis) { return axis ? 0 : {x: 0, y: 0}; };

      expect(fill.imageElement).to.equal(null);

      object.renderImageTextureSized(canvas, fill, 30, 30);
    });

    it('should render the texture correctly when size is set to `stretch`', function(done) {
      var canvas = new Canvas({element: new NodeCanvas(300, 300)});
      var texture = new ImageTexture({
        image: 'ocanvas-logo.png',
        size: 'stretch'
      });
      texture.on('load', function() {
        expect(texture.imageElement).to.be.ok();

        var object = new CanvasObject({fill: texture});

        // Mock a method it's using
        object.calculateOrigin = function(axis) { return axis ? 0 : {x: 0, y: 0}; };

        object.renderImageTextureSized(canvas, texture, 60, 90);

        var ctx = canvas.context;

        expect(getColor(ctx, 3, 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 57, 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 63, 3)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 3, 87)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 57, 87)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 63, 87)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 3, 93)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 57, 93)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 63, 93)).to.equal('rgba(0, 0, 0, 0)');

        done();
      });
    });

    it('should render the texture correctly when size is set to `cover` (horizontal image)', function(done) {
      var canvas = new Canvas({element: new NodeCanvas(300, 300)});
      var texture = new ImageTexture({
        image: 'ocanvas-logo.png',
        size: 'cover'
      });
      texture.on('load', function() {
        expect(texture.imageElement).to.be.ok();

        var object = new CanvasObject({fill: texture});

        // Mock a method it's using
        object.calculateOrigin = function(axis) { return axis ? 0 : {x: 0, y: 0}; };

        object.renderImageTextureSized(canvas, texture, 60, 90);

        var ctx = canvas.context;

        expect(getColor(ctx, 3, 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 162, 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 168, 3)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 3, 87)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 162, 87)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 168, 87)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 3, 93)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 162, 93)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 168, 93)).to.equal('rgba(0, 0, 0, 0)');

        done();
      });
    });

    it('should render the texture correctly when size is set to `cover` (vertical image)', function(done) {
      var canvas = new Canvas({element: new NodeCanvas(300, 300)});
      var texture = new ImageTexture({
        image: 'ocanvas-logo-vertical.png',
        size: 'cover'
      });
      texture.on('load', function() {
        expect(texture.imageElement).to.be.ok();

        var object = new CanvasObject({fill: texture});

        // Mock a method it's using
        object.calculateOrigin = function(axis) { return axis ? 0 : {x: 0, y: 0}; };

        object.renderImageTextureSized(canvas, texture, 60, 90);

        var ctx = canvas.context;

        expect(getColor(ctx, 3, 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 57, 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 63, 3)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 3, 132)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 57, 132)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 63, 132)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 3, 138)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 57, 138)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 63, 138)).to.equal('rgba(0, 0, 0, 0)');

        done();
      });
    });

    it('should render the texture correctly when size is set to `contain` (horizontal image)', function(done) {
      var canvas = new Canvas({element: new NodeCanvas(300, 300)});
      var texture = new ImageTexture({
        image: 'ocanvas-logo.png',
        size: 'contain'
      });
      texture.on('load', function() {
        expect(texture.imageElement).to.be.ok();

        var object = new CanvasObject({fill: texture});

        // Mock a method it's using
        object.calculateOrigin = function(axis) { return axis ? 0 : {x: 0, y: 0}; };

        object.renderImageTextureSized(canvas, texture, 60, 90);

        var ctx = canvas.context;

        expect(getColor(ctx, 3, 38)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 57, 38)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 63, 38)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 3, 52)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 57, 52)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 63, 52)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 3, 58)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 57, 58)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 63, 58)).to.equal('rgba(0, 0, 0, 0)');

        done();
      });
    });

    it('should render the texture correctly when size is set to `contain` (vertical image)', function(done) {
      var canvas = new Canvas({element: new NodeCanvas(300, 300)});
      var texture = new ImageTexture({
        image: 'ocanvas-logo-vertical.png',
        size: 'contain'
      });
      texture.on('load', function() {
        expect(texture.imageElement).to.be.ok();

        var object = new CanvasObject({fill: texture});

        // Mock a method it's using
        object.calculateOrigin = function(axis) { return axis ? 0 : {x: 0, y: 0}; };

        object.renderImageTextureSized(canvas, texture, 60, 90);

        var ctx = canvas.context;

        expect(getColor(ctx, 18, 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 41, 3)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 47, 3)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 18, 87)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 41, 87)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 47, 87)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 18, 93)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 41, 93)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 47, 93)).to.equal('rgba(0, 0, 0, 0)');

        done();
      });
    });

    it('should use the provided coordinates if provided', function(done) {
      var canvas = new Canvas({element: new NodeCanvas(300, 300)});
      var texture = new ImageTexture({
        image: 'ocanvas-logo.png',
        size: 'stretch'
      });
      texture.on('load', function() {
        expect(texture.imageElement).to.be.ok();

        var object = new CanvasObject({fill: texture});

        // Mock a method it's using
        var originCalled = false;
        object.calculateOrigin = function(axis) {
          originCalled = true;
          return axis ? 0 : {x: 0, y: 0};
        };

        object.renderImageTextureSized(canvas, texture, 60, 90, 50, 70);

        expect(originCalled).to.equal(false);

        var ctx = canvas.context;

        expect(getColor(ctx, 53, 73)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 107, 73)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 113, 73)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 53, 157)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 107, 157)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 113, 157)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 53, 163)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 107, 163)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 113, 163)).to.equal('rgba(0, 0, 0, 0)');

        done();
      });
    });

    it('should use the calculated origin as coordinates if not provided', function(done) {
      var canvas = new Canvas({element: new NodeCanvas(300, 300)});
      var texture = new ImageTexture({
        image: 'ocanvas-logo.png',
        size: 'stretch'
      });
      texture.on('load', function() {
        expect(texture.imageElement).to.be.ok();

        var object = new CanvasObject({fill: texture});

        // Mock a method it's using
        var originCalled = false;
        object.calculateOrigin = function(axis) {
          originCalled = true;
          if (axis === 'x') return -50;
          if (axis === 'y') return -70;
          if (!axis) return {x: -50, y: -70};
        };

        object.renderImageTextureSized(canvas, texture, 60, 90);

        expect(originCalled).to.equal(true);

        var ctx = canvas.context;

        expect(getColor(ctx, 53, 73)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 107, 73)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 113, 73)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 53, 157)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 107, 157)).to.equal('rgba(34, 34, 34, 255)');
        expect(getColor(ctx, 113, 157)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 53, 163)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 107, 163)).to.equal('rgba(0, 0, 0, 0)');
        expect(getColor(ctx, 113, 163)).to.equal('rgba(0, 0, 0, 0)');

        done();
      });
    });

  });

});
