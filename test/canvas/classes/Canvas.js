var expect = require('expect.js');
var NodeCanvas = require('canvas');
var getColor = require('../../utils/getColor');

var Scene = require('../../../classes/Scene');
var Canvas = require('../../../classes/Canvas');
var Camera = require('../../../classes/Camera');
var Rectangle = require('../../../shapes/Rectangle');

global.HTMLCanvasElement = NodeCanvas;

describe('Canvas', function() {

  describe('#clear()', function() {
    var canvas = new Canvas({
      element: new NodeCanvas(300, 300),
      camera: new Camera()
    });

    canvas.context.fillStyle = 'red';
    canvas.context.fillRect(0, 0, canvas.width, canvas.height);

    it('should clear the canvas', function() {
      var ctx = canvas.context;
      var w = canvas.width - 1;
      var h = canvas.height - 1;

      expect(getColor(ctx, 0, 0)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, w, 0)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, w, h)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 0, h)).to.equal('rgba(255, 0, 0, 255)');

      canvas.clear();

      expect(getColor(ctx, 0, 0)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, w, 0)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, w, h)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, 0, h)).to.equal('rgba(0, 0, 0, 0)');
    });

  });

  describe('#renderBoundingRectangleForObject()', function() {

    it('should render the bounding rectangle for an object', function() {
      var scene = new Scene();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: new Camera({width: 300, height: 300})
      });
      scene.cameras.add(canvas.camera);

      var object = new Rectangle({
        x: 100, y: 100,
        width: 100, height: 50,
        originX: 'center',
        originY: 'center',
        fill: '#0f0',
        rotation: 45
      });
      scene.objects.add(object);

      canvas.context.strokeStyle = 'red';
      canvas.context.lineWidth = 2;
      canvas.renderBoundingRectangleForObject(object);

      var ctx = canvas.context;

      expect(getColor(ctx, 46, 46)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 153, 46)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 153, 153)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 46, 153)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 100, 100)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should render the bounding rectangle for an object and its children', function() {
      var scene = new Scene();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: new Camera({width: 300, height: 300})
      });
      scene.cameras.add(canvas.camera);

      var object1 = new Rectangle({
        x: 10, y: 10,
        width: 100, height: 50,
        fill: '#0f0'
      });
      var object2 = new Rectangle({
        x: 10, y: 10,
        width: 100, height: 50,
        fill: '#0f0'
      });
      scene.objects.add(object1);
      object1.children.add(object2);

      canvas.context.strokeStyle = 'red';
      canvas.context.lineWidth = 2;
      canvas.renderBoundingRectangleForObject(object1);

      var ctx = canvas.context;

      expect(getColor(ctx, 9, 9)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 19, 19)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 110, 60)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 120, 70)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 120, 9)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 9, 70)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 60, 30)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should render the bounding rectangle for an object, but not its children if not specified', function() {
      var scene = new Scene();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: new Camera({width: 300, height: 300})
      });
      scene.cameras.add(canvas.camera);

      var object1 = new Rectangle({
        x: 10, y: 10,
        width: 100, height: 50,
        fill: '#0f0'
      });
      var object2 = new Rectangle({
        x: 10, y: 10,
        width: 100, height: 50,
        fill: '#0f0'
      });
      scene.objects.add(object1);
      object1.children.add(object2);

      canvas.boundingRectanglesWrapChildren = false;
      canvas.context.strokeStyle = 'red';
      canvas.context.lineWidth = 2;
      canvas.renderBoundingRectangleForObject(object1);

      var ctx = canvas.context;

      expect(getColor(ctx, 9, 9)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 19, 19)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 110, 60)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 120, 70)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 120, 9)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, 9, 70)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, 60, 30)).to.equal('rgba(0, 0, 0, 0)');
    });

    it('should not render the bounding rectangle for an object, only its children, if specified', function() {
      var scene = new Scene();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: new Camera({width: 300, height: 300})
      });
      scene.cameras.add(canvas.camera);

      var object1 = new Rectangle({
        x: 10, y: 10,
        width: 100, height: 50,
        fill: '#0f0'
      });
      var object2 = new Rectangle({
        x: 10, y: 10,
        width: 100, height: 50,
        fill: '#0f0'
      });
      scene.objects.add(object1);
      object1.children.add(object2);

      canvas.boundingRectanglesWrapSelf = false;
      canvas.context.strokeStyle = 'red';
      canvas.context.lineWidth = 2;
      canvas.renderBoundingRectangleForObject(object1);

      var ctx = canvas.context;

      expect(getColor(ctx, 9, 9)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 19, 19)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 110, 60)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, 120, 70)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 120, 9)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 9, 70)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 60, 30)).to.equal('rgba(0, 0, 0, 0)');
    });

  });

  describe('#render()', function() {

    it('should first clear the canvas', function(done) {
      var scene = new Scene();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: new Camera()
      });
      scene.cameras.add(canvas.camera);
      var originalClear = canvas.clear;
      canvas.clear = function() {
        canvas.clear = originalClear;
        done();
      };
      canvas.render();
    });

    it('should throw an error if a camera is not set', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: null
      });

      try {
        canvas.render();
      } catch(error) {
        if (error.name === 'ocanvas-no-camera') {
          done();
        } else {
          done(error);
        }
      }
    });

    it('should draw the background color of the canvas', function() {
      var scene = new Scene();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: new Camera(),
        background: 'red'
      });
      scene.cameras.add(canvas.camera);

      canvas.render();

      var ctx = canvas.context;
      var w = canvas.width - 1;
      var h = canvas.height - 1;

      expect(getColor(ctx, 0, 0)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, w, 0)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, w, h)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 0, h)).to.equal('rgba(255, 0, 0, 255)');
    });

    it('should tell the camera to render what it sees to the canvas', function(done) {
      var camera = new Camera();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: camera
      });

      camera.render = function(canvas) {
        if (canvas) done();
        else done(new Error('Camera#render was called, but with no canvas instance'));
      };

      canvas.render();
    });

    it('should render the bounding rectangles for all objects if specified', function() {
      var scene = new Scene();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: new Camera({width: 300, height: 300})
      });
      scene.cameras.add(canvas.camera);

      var object = new Rectangle({
        x: 100, y: 100,
        width: 100, height: 50,
        originX: 'center',
        originY: 'center',
        fill: '#0f0',
        rotation: 45
      });
      scene.objects.add(object);

      canvas.boundingRectanglesEnabled = true;
      canvas.boundingRectanglesColor = '#00f';
      canvas.boundingRectanglesThickness = 10;
      canvas.render();

      var ctx = canvas.context;

      expect(getColor(ctx, 37, 37)).to.equal('rgba(0, 0, 255, 255)');
      expect(getColor(ctx, 46, 46)).to.equal('rgba(0, 0, 255, 255)');
      expect(getColor(ctx, 48, 48)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, 151, 151)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, 153, 153)).to.equal('rgba(0, 0, 255, 255)');
      expect(getColor(ctx, 162, 162)).to.equal('rgba(0, 0, 255, 255)');
      expect(getColor(ctx, 100, 100)).to.equal('rgba(0, 255, 0, 255)');
    });

  });

  describe('#transformContextToObject()', function() {

    it('should transform the context to a specific object', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });
      var camera = new Camera({width: canvas.width, height: canvas.height});
      canvas.camera = camera;

      var scene = new Scene();
      scene.cameras.add(canvas.camera);

      var obj1 = new Rectangle({
        width: 100, height: 100,
        fill: '#f00'
      });
      scene.objects.add(obj1);
      var obj2 = new Rectangle({
        x: 10, y: 15,
        width: 50, height: 50,
        fill: '#0f0'
      });
      obj1.children.add(obj2);

      var obj3 = new Rectangle({
        x: 20, y: 25,
        width: 30, height: 30,
        fill: '#00f'
      });
      scene.objects.add(obj3);
      var obj4 = new Rectangle({
        x: 30, y: 35,
        width: 30, height: 30,
        fill: '#0ff',
        rotation: 45,
        scalingX: 1.5,
        scalingY: 0.5
      });
      obj3.children.add(obj4);

      obj2render = obj2.render;
      obj2.render = function() {
        canvas.context.save();
        canvas.transformContextToObject(obj4, obj2);
        canvas.context.fillStyle = '#ff0';
        canvas.context.fillRect(0, 0, 40, 40);
        canvas.context.restore();
        obj2render.apply(this, arguments);
      };

      canvas.render();

      var context = canvas.context;

      // Object 1 and 2
      expect(getColor(context, 0, 0)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, 99, 99)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, 10, 15)).to.equal('rgba(0, 255, 0, 255)');

      // Object 3 and 4
      expect(getColor(context, 20, 25)).to.equal('rgba(0, 0, 255, 255)');
      expect(getColor(context, 71, 100)).to.equal('rgba(0, 255, 255, 255)');

      // The manually drawn area, drawn at the position of obj4, at the time of obj2 render
      expect(getColor(context, 78, 114)).to.equal('rgba(255, 255, 0, 255)');
    });

  });

});
