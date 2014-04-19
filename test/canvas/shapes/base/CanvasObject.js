var expect = require('expect.js');
var NodeCanvas = require('canvas');
var getColor = require('../../../utils/getColor');

var create = require('../../../../create');
var World = require('../../../../classes/World');
var Canvas = require('../../../../classes/Canvas');
var Camera = require('../../../../classes/Camera');
var CanvasObject = require('../../../../shapes/base/CanvasObject');

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

      var world = new World();
      world.cameras.add(canvas.camera);

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
      world.objects.add(object);
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

      var world = new World();
      world.cameras.add(canvas.camera);

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
      world.objects.add(object);
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
      var world = new World();
      var camera = new Camera({width: 300, height: 300});
      world.cameras.add(camera);
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

      setup.world.objects.add(object1);
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

});
