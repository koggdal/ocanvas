var expect = require('expect.js');
var positions = require('../../../pointers/positions');
var PointerData = require('../../../pointers/PointerData');
var Canvas = require('../../../classes/Canvas');
var Camera = require('../../../classes/Camera');
var World = require('../../../classes/World');
var CanvasObject = require('../../../shapes/base/CanvasObject');

describe('pointers/positions', function() {

  function createCanvas(opt_width, opt_height) {
    var width = opt_width || 300;
    var height = opt_height || 150;
    var canvas = new Canvas({
      width: width,
      height: height,
      element: {
        clientWidth: 300,
        clientHeight: 150,
        width: width,
        height: height,
        getBoundingClientRect: function() {
          return {
            top: 30, bottom: 50,
            left: 60, right: 80,
            width: this.clientWidth, height: this.clientHeight
          };
        }
      }
    });

    return canvas;
  }

  describe('.getForCanvasElement()', function() {

    it('should get the pointer position relative to the canvas element', function() {
      var pointer = new PointerData({x: 100, y: 75});
      var canvas = createCanvas(600, 300);
      var pos = positions.getForCanvasElement(pointer, canvas);

      expect(pos).to.be.an('object');
      expect(pos.x).to.equal(40);
      expect(pos.y).to.equal(45);
    });

  });

  describe('.getForCanvas()', function() {

    it('should get the pointer position relative to the scaled canvas surface', function() {
      var pointer = new PointerData({x: 100, y: 75});
      var canvas = createCanvas(600, 300);
      var pos = positions.getForCanvas(pointer, canvas);

      expect(pos).to.be.an('object');
      expect(pos.x).to.equal(80);
      expect(pos.y).to.equal(90);
    });

    it('should take an optional element position for speed optimizations', function() {
      var pointer = new PointerData({x: 100, y: 75});
      var canvas = createCanvas(600, 300);
      var elementPos = {x: 100, y: 50};
      var pos = positions.getForCanvas(pointer, canvas, elementPos);

      expect(pos).to.be.an('object');
      expect(pos.x).to.equal(200);
      expect(pos.y).to.equal(100);
    });

  });

  describe('.getForWorld()', function() {

    it('should get the pointer position relative to the world', function() {
      var canvas = createCanvas(600, 300);
      var world = new World();
      var camera = new Camera();
      canvas.camera = camera;
      world.cameras.add(camera);

      // Apply some transformations to the camera to make sure the code really
      // uses all the transformations without shortcuts.
      camera.x = 1000;
      camera.y = 500;
      camera.rotation = 90;

      var pointer = new PointerData({x: 100, y: 75});
      var pos = positions.getForWorld(pointer, canvas);

      expect(pos).to.be.an('object');
      expect(pos.x).to.equal(1060);
      expect(pos.y).to.equal(280);
    });

    it('should take an optional canvas position for speed optimizations', function() {
      var canvas = createCanvas(600, 300);
      var world = new World();
      var camera = new Camera();
      canvas.camera = camera;
      world.cameras.add(camera);

      // Apply some transformations to the camera to make sure the code really
      // uses all the transformations without shortcuts.
      camera.x = 1000;
      camera.y = 500;
      camera.rotation = 90;

      var pointer = new PointerData({x: 100, y: 75});
      var canvasPosition = {x: 100, y: 50};
      var pos = positions.getForWorld(pointer, canvas, canvasPosition);

      expect(pos).to.be.an('object');
      expect(pos.x).to.equal(1100);
      expect(pos.y).to.equal(300);
    });

  });

  describe('.getForTarget()', function() {

    it('should get the pointer position relative to the specified target', function() {
      var canvas = createCanvas(600, 300);
      var world = new World();
      var camera = new Camera();
      canvas.camera = camera;
      world.cameras.add(camera);

      // Apply some transformations to the camera to make sure the code really
      // uses all the transformations without shortcuts.
      camera.x = 1000;
      camera.y = 500;
      camera.rotation = 90;

      var target = new CanvasObject({x: 200, y: 100});
      world.objects.add(target);

      var pointer = new PointerData({x: 100, y: 75});
      var pos = positions.getForTarget(pointer, canvas, target);

      expect(pos).to.be.an('object');
      expect(pos.x).to.equal(860);
      expect(pos.y).to.equal(180);
    });

    it('should take an optional world position for speed optimizations', function() {
      var canvas = createCanvas(600, 300);
      var world = new World();
      var camera = new Camera();
      canvas.camera = camera;
      world.cameras.add(camera);

      var target = new CanvasObject({x: 200, y: 100});
      world.objects.add(target);

      var pointer = new PointerData({x: 100, y: 75});
      var worldPosition = {x: 100, y: 50};
      var pos = positions.getForTarget(pointer, canvas, target, worldPosition);

      expect(pos).to.be.an('object');
      expect(pos.x).to.equal(-100);
      expect(pos.y).to.equal(-50);
    });

  });

  describe('.get()', function() {

    var allPositions;

    before(function() {
      var canvas = createCanvas(600, 300);
      var world = new World();
      var camera = new Camera();
      canvas.camera = camera;
      world.cameras.add(camera);

      // Apply some transformations to the camera to make sure the code really
      // uses all the transformations without shortcuts.
      camera.x = 1000;
      camera.y = 500;
      camera.rotation = 90;

      var target = new CanvasObject({x: 200, y: 100});
      world.objects.add(target);

      var pointer = new PointerData({x: 100, y: 75});
      allPositions = positions.get(pointer, canvas, target);
    });

    it('should get an object with the four reference properties', function() {
      expect(allPositions.element).to.be.an('object');
      expect(allPositions.canvas).to.be.an('object');
      expect(allPositions.world).to.be.an('object');
      expect(allPositions.target).to.be.an('object');
    });

    it('should get the position in the element', function() {
      expect(allPositions.element).to.be.an('object');
      expect(allPositions.element.x).to.equal(40);
      expect(allPositions.element.y).to.equal(45);
    });

    it('should get the position in the canvas surface', function() {
      expect(allPositions.canvas).to.be.an('object');
      expect(allPositions.canvas.x).to.equal(80);
      expect(allPositions.canvas.y).to.equal(90);
    });

    it('should get the position in the world', function() {
      expect(allPositions.world).to.be.an('object');
      expect(allPositions.world.x).to.equal(1060);
      expect(allPositions.world.y).to.equal(280);
    });

    it('should get the position in the target', function() {
      expect(allPositions.target).to.be.an('object');
      expect(allPositions.target.x).to.equal(860);
      expect(allPositions.target.y).to.equal(180);
    });

    it('should set the target position to be the canvas position if target is canvas', function() {
      var canvas = createCanvas(600, 300);
      var world = new World();
      var camera = new Camera();
      canvas.camera = camera;
      world.cameras.add(camera);

      // Apply some transformations to the camera to make sure the code really
      // uses all the transformations without shortcuts.
      camera.x = 1000;
      camera.y = 500;
      camera.rotation = 90;

      var target = canvas;

      var pointer = new PointerData({x: 100, y: 75});
      var allPositions = positions.get(pointer, canvas, target);

      expect(allPositions.target).to.be.an('object');
      expect(allPositions.canvas).to.be.an('object');
      expect(allPositions.target.x).to.equal(allPositions.canvas.x);
      expect(allPositions.target.y).to.equal(allPositions.canvas.y);
      expect(allPositions.target.x).to.equal(80);
      expect(allPositions.target.y).to.equal(90);
    });

    it('should set the target position to be the world position if target is world', function() {
      var canvas = createCanvas(600, 300);
      var world = new World();
      var camera = new Camera();
      canvas.camera = camera;
      world.cameras.add(camera);

      // Apply some transformations to the camera to make sure the code really
      // uses all the transformations without shortcuts.
      camera.x = 1000;
      camera.y = 500;
      camera.rotation = 90;

      var target = world;

      var pointer = new PointerData({x: 100, y: 75});
      var allPositions = positions.get(pointer, canvas, target);

      expect(allPositions.target).to.be.an('object');
      expect(allPositions.world).to.be.an('object');
      expect(allPositions.target.x).to.equal(allPositions.world.x);
      expect(allPositions.target.y).to.equal(allPositions.world.y);
      expect(allPositions.target.x).to.equal(1060);
      expect(allPositions.target.y).to.equal(280);
    });

  });

});
