var expect = require('expect.js');
var NodeCanvas = require('canvas');

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

      var camera = new Camera();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: camera
      });
      camera.width = canvas.width;
      camera.height = canvas.height;

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
        rotation: 20
      });
      var object = new CanvasObject({
        fill: '#f00',
        width: 100,
        height: 100,
        render: render,
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

      var camera = new Camera();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: camera
      });
      camera.width = canvas.width;
      camera.height = canvas.height;

      var world = new World();
      world.cameras.add(canvas.camera);

      var object = new CanvasObject({
        fill: '#f00',
        width: 100,
        height: 100,
        render: render,
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
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      var object3 = new CanvasObject();

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

    it('should scale the canvas context for each child object', function() {
      var setup = create({
        element: new NodeCanvas(300, 300)
      });

      var object1 = new CanvasObject({
        width: 200, height: 150,
        fill: 'red'
      });
      var object2 = new CanvasObject({
        width: 100, height: 50,
        scalingX: 0.5, scalingY: 2,
        fill: 'lime'
      });
      var object3 = new CanvasObject({
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

function getColor(context, x, y) {
  var data = context.getImageData(x, y, 1, 1).data;
  return 'rgba(' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + data[3] + ')';
}
