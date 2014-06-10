var expect = require('expect.js');
var controller = require('../../../../pointers/private/controller');
var state = require('../../../../pointers/private/state');
var PointerData = require('../../../../pointers/private/PointerData');
var CanvasObject = require('../../../../shapes/base/CanvasObject');
var Canvas = require('../../../../classes/Canvas');
var Camera = require('../../../../classes/Camera');
var Scene = require('../../../../classes/Scene');

var domPointers = require('../../../utils/dompointers');
var DOMMouseEvent = domPointers.DOMMouseEvent;
var DOMTouchEvent = domPointers.DOMTouchEvent;
var DOMPointerEvent = domPointers.DOMPointerEvent;

describe('pointers/controller', function() {

  beforeEach(function() {
    state.reset();
  });

  afterEach(function() {
    state.reset();
  });

  describe('.getPointers()', function() {

    it('should return an array of one instance of PointerData for a mouse event', function() {
      var event = new DOMMouseEvent('mousedown', 25, 30);
      var pointers = controller.getPointers(event);

      expect(pointers).to.be.an('array');
      expect(pointers.length).to.equal(1);
      expect(pointers[0]).to.be.a(PointerData);
      expect(pointers[0].type).to.equal('mouse');
      expect(pointers[0].x).to.equal(25);
      expect(pointers[0].y).to.equal(30);
    });

    it('should return an array of one instance of PointerData for a pointer event', function() {
      var event = new DOMPointerEvent('pointerdown', 25, 30);
      var pointers = controller.getPointers(event);

      expect(pointers).to.be.an('array');
      expect(pointers.length).to.equal(1);
      expect(pointers[0]).to.be.a(PointerData);
      expect(pointers[0].type).to.equal('pointer');
      expect(pointers[0].x).to.equal(25);
      expect(pointers[0].y).to.equal(30);
    });

    it('should return an array of two instances of PointerData for a touch event with multiple touch points', function() {
      var event = new DOMTouchEvent('touchstart', [{x: 25, y: 30}, {x: 40, y: 60}]);
      var pointers = controller.getPointers(event);

      expect(pointers).to.be.an('array');
      expect(pointers.length).to.equal(2);
      expect(pointers[0]).to.be.a(PointerData);
      expect(pointers[1]).to.be.a(PointerData);
      expect(pointers[0].type).to.equal('touch');
      expect(pointers[1].type).to.equal('touch');
      expect(pointers[0].x).to.equal(25);
      expect(pointers[0].y).to.equal(30);
      expect(pointers[1].x).to.equal(40);
      expect(pointers[1].y).to.equal(60);
    });

  });

  describe('.handlePointerDown()', function() {

    it('should set the pointer to be pressed down on the detected front object', function() {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      expect(state.getPressedObject(pointers[0])).to.equal(null);

      controller.handlePointerDown(pointers[0], canvas);

      expect(state.getPressedObject(pointers[0])).to.equal(object);
    });

    it('should set the pointer to be pressed down on the scene if no front object was detected', function() {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(100, 100, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      expect(state.getPressedObject(pointers[0])).to.equal(null);

      controller.handlePointerDown(pointers[0], canvas);

      expect(state.getPressedObject(pointers[0])).to.equal(scene);
    });

    it('should store the front object for the pointer', function() {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      expect(state.getFrontObject(pointers[0])).to.equal(null);

      controller.handlePointerDown(pointers[0], canvas);

      expect(state.getFrontObject(pointers[0])).to.equal(object);
    });

    it('should handle when the new front object is the same as the current front object', function() {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      expect(state.getFrontObject(pointers[0])).to.equal(null);

      controller.handlePointerDown(pointers[0], canvas);

      expect(state.getFrontObject(pointers[0])).to.equal(object);

      controller.handlePointerDown(pointers[0], canvas);

      expect(state.getFrontObject(pointers[0])).to.equal(object);
    });

    it('should store that the pointer has entered the canvas if not entered before', function() {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      expect(state.hasEnteredCanvas(pointers[0])).to.equal(false);

      controller.handlePointerDown(pointers[0], canvas);

      expect(state.hasEnteredCanvas(pointers[0])).to.equal(true);
    });

    it('should emit enter events if not entered before', function(done) {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      var count = 0;

      canvas.on('pointerenter', function handler() {
        canvas.off('pointerenter', handler);
        count++;
        expect(count).to.equal(1);
      });

      scene.on('pointerenter', function handler() {
        scene.off('pointerenter', handler);
        count++;
        expect(count).to.equal(2);
      });

      object.on('pointerenter', function handler() {
        object.off('pointerenter', handler);
        count++;
        expect(count).to.equal(3);
        done();
      });

      controller.handlePointerDown(pointers[0], canvas);
    });

    it('should emit enter events on scene and canvas if no front object was found and not entered before', function(done) {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(100, 100, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      var count = 0;

      var handler1 = function() {
        count++;
        expect(count).to.equal(1);
      };
      canvas.on('pointerenter', handler1);

      var handler2 = function() {
        count++;
        expect(count).to.equal(2);
      };
      scene.on('pointerenter', handler2);

      var handler3 = function() {
        count++;
      };
      object.on('pointerenter', handler3);

      controller.handlePointerDown(pointers[0], canvas);

      setTimeout(function() {
        canvas.off('pointerenter', handler1);
        scene.off('pointerenter', handler2);
        object.off('pointerenter', handler3);

        expect(count).to.equal(2);
        done();
      }, 10);
    });

    it('should emit enter events only on objects if already entered scene and canvas', function(done) {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object1 = createObject(0, 0, 300, 150);
      var object2 = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      state.enterCanvas(pointers[0]);

      var count = 0;

      var handler1 = function() { count++; };
      canvas.on('pointerenter', handler1);

      var handler2 = function() { count++; };
      scene.on('pointerenter', handler2);

      var handler3 = function() {
        count++;
        expect(count).to.equal(1);
      };
      object1.on('pointerenter', handler3);

      var handler4 = function() {
        count++;
        expect(count).to.equal(2);
      };
      object2.on('pointerenter', handler4);

      controller.handlePointerDown(pointers[0], canvas);

      setTimeout(function() {
        canvas.off('pointerenter', handler1);
        scene.off('pointerenter', handler2);
        object1.off('pointerenter', handler3);
        object2.off('pointerenter', handler4);

        expect(count).to.equal(2);
        done();
      }, 10);
    });

    it('should emit leave events on current front object and its parents if no front object was found', function(done) {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object1 = createObject(100, 100, 300, 150);
      var object2 = createObject(100, 100, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      state.setFrontObject(pointers[0], object2);

      var count = 0;

      var handler1 = function() {
        count++;
        expect(count).to.equal(1);
      };
      object2.on('pointerleave', handler1);

      var handler2 = function() {
        count++;
        expect(count).to.equal(2);
      };
      object1.on('pointerleave', handler2);

      controller.handlePointerDown(pointers[0], canvas);

      setTimeout(function() {
        object2.off('pointerleave', handler1);
        object1.off('pointerleave', handler2);

        expect(count).to.equal(2);
        done();
      }, 10);
    });

    it('should emit enter events on inner objects if the new front object is a child of the current front object', function(done) {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object1 = createObject(0, 0, 300, 150);
      var object2 = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object1);

      var count = 0;

      var handler1 = function() { count++; };
      canvas.on('pointerenter', handler1);

      var handler2 = function() { count++; };
      scene.on('pointerenter', handler2);

      var handler3 = function() { count++; };
      object1.on('pointerenter', handler3);

      var handler4 = function() {
        count++;
        expect(count).to.equal(1);
      };
      object2.on('pointerenter', handler4);

      controller.handlePointerDown(pointers[0], canvas);

      setTimeout(function() {
        canvas.off('pointerenter', handler1);
        scene.off('pointerenter', handler2);
        object1.off('pointerenter', handler3);
        object2.off('pointerenter', handler4);

        expect(count).to.equal(1);
        done();
      }, 10);
    });

    it('should emit leave events on inner objects if the new front object is a parent of the current front object', function(done) {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object1 = createObject(0, 0, 300, 150);
      var object2 = createObject(2000, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object2);

      var count = 0;

      var handler1 = function() { count++; };
      canvas.on('pointerleave', handler1);

      var handler2 = function() { count++; };
      scene.on('pointerleave', handler2);

      var handler3 = function() { count++; };
      object1.on('pointerleave', handler3);

      var handler4 = function() {
        count++;
        expect(count).to.equal(1);
      };
      object2.on('pointerleave', handler4);

      controller.handlePointerDown(pointers[0], canvas);

      setTimeout(function() {
        canvas.off('pointerleave', handler1);
        scene.off('pointerleave', handler2);
        object1.off('pointerleave', handler3);
        object2.off('pointerleave', handler4);

        expect(count).to.equal(1);
        done();
      }, 10);
    });

    it('should emit leave events on objects for current front object up to shared parent with the new front object', function(done) {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var parent = createObject(0, 0, 300, 150);
      var object1_1 = createObject(0, 0, 300, 150);
      var object1_2 = createObject(0, 0, 300, 150);
      var object2_1 = createObject(0, 0, 300, 150);
      var object2_2 = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(parent);
      parent.children.add(object1_1);
      object1_1.children.add(object1_2);
      parent.children.add(object2_1);
      object2_1.children.add(object2_2);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object1_2);

      var count = 0;

      var countHandler = function() { count++; };

      canvas.on('pointerleave', countHandler);
      scene.on('pointerleave', countHandler);
      parent.on('pointerleave', countHandler);
      object2_1.on('pointerleave', countHandler);
      object2_2.on('pointerleave', countHandler);

      var handler1 = function() {
        count++;
        expect(count).to.equal(2);
      };
      object1_1.on('pointerleave', handler1);

      var handler2 = function() {
        count++;
        expect(count).to.equal(1);
      };
      object1_2.on('pointerleave', handler2);

      controller.handlePointerDown(pointers[0], canvas);

      setTimeout(function() {
        canvas.off('pointerleave', countHandler);
        scene.off('pointerleave', countHandler);
        parent.off('pointerleave', countHandler);
        object2_1.off('pointerleave', countHandler);
        object2_2.off('pointerleave', countHandler);
        object1_1.off('pointerleave', handler1);
        object1_2.off('pointerleave', handler2);

        expect(count).to.equal(2);
        done();
      }, 10);
    });

    it('should emit enter events on objects for new front object up to shared parent with the current front object', function(done) {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var parent = createObject(0, 0, 300, 150);
      var object1_1 = createObject(0, 0, 300, 150);
      var object1_2 = createObject(0, 0, 300, 150);
      var object2_1 = createObject(0, 0, 300, 150);
      var object2_2 = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(parent);
      parent.children.add(object1_1);
      object1_1.children.add(object1_2);
      parent.children.add(object2_1);
      object2_1.children.add(object2_2);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object1_2);

      var count = 0;

      var countHandler = function() { count++; };

      canvas.on('pointerenter', countHandler);
      scene.on('pointerenter', countHandler);
      parent.on('pointerenter', countHandler);
      object1_1.on('pointerenter', countHandler);
      object1_2.on('pointerenter', countHandler);

      var handler1 = function() {
        count++;
        expect(count).to.equal(1);
      };
      object2_1.on('pointerenter', handler1);

      var handler2 = function() {
        count++;
        expect(count).to.equal(2);
      };
      object2_2.on('pointerenter', handler2);

      controller.handlePointerDown(pointers[0], canvas);

      setTimeout(function() {
        canvas.off('pointerenter', countHandler);
        scene.off('pointerenter', countHandler);
        parent.off('pointerenter', countHandler);
        object1_1.off('pointerenter', countHandler);
        object1_2.off('pointerenter', countHandler);
        object2_1.off('pointerenter', handler1);
        object2_2.off('pointerenter', handler2);

        expect(count).to.equal(2);
        done();
      }, 10);
    });

    it('should emit a down event for the front object', function(done) {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      object.on('pointerdown', function handler() {
        object.off('pointerdown', handler);
        done();
      });

      controller.handlePointerDown(pointers[0], canvas);
    });

    it('should emit a down event for the scene if no front object is found', function(done) {
      var event = new DOMMouseEvent('mousedown', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);

      scene.on('pointerdown', function handler() {
        scene.off('pointerdown', handler);
        done();
      });

      controller.handlePointerDown(pointers[0], canvas);
    });

  });

  describe('.handlePointerMove()', function() {

    it('should store the front object for the pointer', function() {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      expect(state.getFrontObject(pointers[0])).to.equal(null);

      controller.handlePointerMove(pointers[0], canvas);

      expect(state.getFrontObject(pointers[0])).to.equal(object);
    });

    it('should handle when the new front object is the same as the current front object', function() {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      expect(state.getFrontObject(pointers[0])).to.equal(null);

      controller.handlePointerMove(pointers[0], canvas);

      expect(state.getFrontObject(pointers[0])).to.equal(object);

      controller.handlePointerMove(pointers[0], canvas);

      expect(state.getFrontObject(pointers[0])).to.equal(object);
    });

    it('should store that the pointer has entered the canvas if not entered before', function() {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      expect(state.hasEnteredCanvas(pointers[0])).to.equal(false);

      controller.handlePointerMove(pointers[0], canvas);

      expect(state.hasEnteredCanvas(pointers[0])).to.equal(true);
    });

    it('should emit enter events if not entered before', function(done) {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      var count = 0;

      canvas.on('pointerenter', function handler() {
        canvas.off('pointerenter', handler);
        count++;
        expect(count).to.equal(1);
      });

      scene.on('pointerenter', function handler() {
        scene.off('pointerenter', handler);
        count++;
        expect(count).to.equal(2);
      });

      object.on('pointerenter', function handler() {
        object.off('pointerenter', handler);
        count++;
        expect(count).to.equal(3);
        done();
      });

      controller.handlePointerMove(pointers[0], canvas);
    });

    it('should emit enter events on scene and canvas if no front object was found and not entered before', function(done) {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(100, 100, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      var count = 0;

      var handler1 = function() {
        count++;
        expect(count).to.equal(1);
      };
      canvas.on('pointerenter', handler1);

      var handler2 = function() {
        count++;
        expect(count).to.equal(2);
      };
      scene.on('pointerenter', handler2);

      var handler3 = function() {
        count++;
      };
      object.on('pointerenter', handler3);

      controller.handlePointerMove(pointers[0], canvas);

      setTimeout(function() {
        canvas.off('pointerenter', handler1);
        scene.off('pointerenter', handler2);
        object.off('pointerenter', handler3);

        expect(count).to.equal(2);
        done();
      }, 10);
    });

    it('should emit enter events only on objects if already entered scene and canvas', function(done) {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object1 = createObject(0, 0, 300, 150);
      var object2 = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      state.enterCanvas(pointers[0]);

      var count = 0;

      var handler1 = function() { count++; };
      canvas.on('pointerenter', handler1);

      var handler2 = function() { count++; };
      scene.on('pointerenter', handler2);

      var handler3 = function() {
        count++;
        expect(count).to.equal(1);
      };
      object1.on('pointerenter', handler3);

      var handler4 = function() {
        count++;
        expect(count).to.equal(2);
      };
      object2.on('pointerenter', handler4);

      controller.handlePointerMove(pointers[0], canvas);

      setTimeout(function() {
        canvas.off('pointerenter', handler1);
        scene.off('pointerenter', handler2);
        object1.off('pointerenter', handler3);
        object2.off('pointerenter', handler4);

        expect(count).to.equal(2);
        done();
      }, 10);
    });

    it('should emit leave events on current front object and its parents if no front object was found', function(done) {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object1 = createObject(100, 100, 300, 150);
      var object2 = createObject(100, 100, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      state.setFrontObject(pointers[0], object2);

      var count = 0;

      var handler1 = function() {
        count++;
        expect(count).to.equal(1);
      };
      object2.on('pointerleave', handler1);

      var handler2 = function() {
        count++;
        expect(count).to.equal(2);
      };
      object1.on('pointerleave', handler2);

      controller.handlePointerMove(pointers[0], canvas);

      setTimeout(function() {
        object2.off('pointerleave', handler1);
        object1.off('pointerleave', handler2);

        expect(count).to.equal(2);
        done();
      }, 10);
    });

    it('should emit enter events on inner objects if the new front object is a child of the current front object', function(done) {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object1 = createObject(0, 0, 300, 150);
      var object2 = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object1);

      var count = 0;

      var handler1 = function() { count++; };
      canvas.on('pointerenter', handler1);

      var handler2 = function() { count++; };
      scene.on('pointerenter', handler2);

      var handler3 = function() { count++; };
      object1.on('pointerenter', handler3);

      var handler4 = function() {
        count++;
        expect(count).to.equal(1);
      };
      object2.on('pointerenter', handler4);

      controller.handlePointerMove(pointers[0], canvas);

      setTimeout(function() {
        canvas.off('pointerenter', handler1);
        scene.off('pointerenter', handler2);
        object1.off('pointerenter', handler3);
        object2.off('pointerenter', handler4);

        expect(count).to.equal(1);
        done();
      }, 10);
    });

    it('should emit leave events on inner objects if the new front object is a parent of the current front object', function(done) {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object1 = createObject(0, 0, 300, 150);
      var object2 = createObject(2000, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object2);

      var count = 0;

      var handler1 = function() { count++; };
      canvas.on('pointerleave', handler1);

      var handler2 = function() { count++; };
      scene.on('pointerleave', handler2);

      var handler3 = function() { count++; };
      object1.on('pointerleave', handler3);

      var handler4 = function() {
        count++;
        expect(count).to.equal(1);
      };
      object2.on('pointerleave', handler4);

      controller.handlePointerMove(pointers[0], canvas);

      setTimeout(function() {
        canvas.off('pointerleave', handler1);
        scene.off('pointerleave', handler2);
        object1.off('pointerleave', handler3);
        object2.off('pointerleave', handler4);

        expect(count).to.equal(1);
        done();
      }, 10);
    });

    it('should emit leave events on objects for current front object up to shared parent with the new front object', function(done) {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var parent = createObject(0, 0, 300, 150);
      var object1_1 = createObject(0, 0, 300, 150);
      var object1_2 = createObject(0, 0, 300, 150);
      var object2_1 = createObject(0, 0, 300, 150);
      var object2_2 = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(parent);
      parent.children.add(object1_1);
      object1_1.children.add(object1_2);
      parent.children.add(object2_1);
      object2_1.children.add(object2_2);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object1_2);

      var count = 0;

      var countHandler = function() { count++; };

      canvas.on('pointerleave', countHandler);
      scene.on('pointerleave', countHandler);
      parent.on('pointerleave', countHandler);
      object2_1.on('pointerleave', countHandler);
      object2_2.on('pointerleave', countHandler);

      var handler1 = function() {
        count++;
        expect(count).to.equal(2);
      };
      object1_1.on('pointerleave', handler1);

      var handler2 = function() {
        count++;
        expect(count).to.equal(1);
      };
      object1_2.on('pointerleave', handler2);

      controller.handlePointerMove(pointers[0], canvas);

      setTimeout(function() {
        canvas.off('pointerleave', countHandler);
        scene.off('pointerleave', countHandler);
        parent.off('pointerleave', countHandler);
        object2_1.off('pointerleave', countHandler);
        object2_2.off('pointerleave', countHandler);
        object1_1.off('pointerleave', handler1);
        object1_2.off('pointerleave', handler2);

        expect(count).to.equal(2);
        done();
      }, 10);
    });

    it('should emit enter events on objects for new front object up to shared parent with the current front object', function(done) {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var parent = createObject(0, 0, 300, 150);
      var object1_1 = createObject(0, 0, 300, 150);
      var object1_2 = createObject(0, 0, 300, 150);
      var object2_1 = createObject(0, 0, 300, 150);
      var object2_2 = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(parent);
      parent.children.add(object1_1);
      object1_1.children.add(object1_2);
      parent.children.add(object2_1);
      object2_1.children.add(object2_2);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object1_2);

      var count = 0;

      var countHandler = function() { count++; };

      canvas.on('pointerenter', countHandler);
      scene.on('pointerenter', countHandler);
      parent.on('pointerenter', countHandler);
      object1_1.on('pointerenter', countHandler);
      object1_2.on('pointerenter', countHandler);

      var handler1 = function() {
        count++;
        expect(count).to.equal(1);
      };
      object2_1.on('pointerenter', handler1);

      var handler2 = function() {
        count++;
        expect(count).to.equal(2);
      };
      object2_2.on('pointerenter', handler2);

      controller.handlePointerMove(pointers[0], canvas);

      setTimeout(function() {
        canvas.off('pointerenter', countHandler);
        scene.off('pointerenter', countHandler);
        parent.off('pointerenter', countHandler);
        object1_1.off('pointerenter', countHandler);
        object1_2.off('pointerenter', countHandler);
        object2_1.off('pointerenter', handler1);
        object2_2.off('pointerenter', handler2);

        expect(count).to.equal(2);
        done();
      }, 10);
    });

    it('should emit a move event for the front object', function(done) {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      object.on('pointermove', function handler() {
        object.off('pointermove', handler);
        done();
      });

      controller.handlePointerMove(pointers[0], canvas);
    });

    it('should emit a move event for the scene if no front object is found', function(done) {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);

      scene.on('pointermove', function handler() {
        scene.off('pointermove', handler);
        done();
      });

      controller.handlePointerMove(pointers[0], canvas);
    });

    it('should emit a downmove event for the front object if the pointer is pressed', function(done) {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.pressPointer(pointers[0], object);

      object.on('pointerdownmove', function handler() {
        object.off('pointerdownmove', handler);
        done();
      });

      controller.handlePointerMove(pointers[0], canvas);
    });

    it('should emit a downmove event for the scene if no front object is found and the pointer is pressed', function(done) {
      var event = new DOMMouseEvent('mousemove', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);

      state.pressPointer(pointers[0], scene);

      scene.on('pointerdownmove', function handler() {
        scene.off('pointerdownmove', handler);
        done();
      });

      controller.handlePointerMove(pointers[0], canvas);
    });

  });

  describe('.handlePointerDblClick()', function() {

    it('should not emit any dblclick events if there have been less clicks than two right before this', function(done) {
      var event = new DOMMouseEvent('dblclick', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.registerClick(pointers[0], object);

      var called = false;
      var handler = function() { called = true; };
      object.on('pointerdblclick', handler);

      controller.handlePointerDblClick(pointers[0], canvas);

      setTimeout(function() {
        object.off('pointerdblclick', handler);

        expect(called).to.equal(false);
        done();
      }, 10);
    });

    it('should emit a dblclick event if there have been two clicks right before this', function(done) {
      var event = new DOMMouseEvent('dblclick', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.registerClick(pointers[0], object);
      state.registerClick(pointers[0], object);

      object.on('pointerdblclick', function handler() {
        object.off('pointerdblclick', handler);
        done();
      });

      controller.handlePointerDblClick(pointers[0], canvas);
    });

    it('should clear the registered clicks when a dblclick is emitted', function() {
      var event = new DOMMouseEvent('dblclick', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.registerClick(pointers[0], object);
      state.registerClick(pointers[0], object);

      expect(state.getClickCount(object)).to.equal(2);

      controller.handlePointerDblClick(pointers[0], canvas);

      expect(state.getClickCount(object)).to.equal(0);
    });

    it('should not clear the registered clicks when less than two clicks happened right before this', function() {
      var event = new DOMMouseEvent('dblclick', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.registerClick(pointers[0], object);

      expect(state.getClickCount(object)).to.equal(1);

      controller.handlePointerDblClick(pointers[0], canvas);

      expect(state.getClickCount(object)).to.equal(1);
    });

    it('should use the provided front object if one is passed', function(done) {
      var event = new DOMMouseEvent('dblclick', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(2000, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.registerClick(pointers[0], object);
      state.registerClick(pointers[0], object);

      object.on('pointerdblclick', function handler() {
        object.off('pointerdblclick', handler);
        done();
      });

      controller.handlePointerDblClick(pointers[0], canvas, object);
    });

    it('should fall back to the scene if no front object is found', function(done) {
      var event = new DOMMouseEvent('dblclick', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);

      state.registerClick(pointers[0], scene);
      state.registerClick(pointers[0], scene);

      scene.on('pointerdblclick', function handler() {
        scene.off('pointerdblclick', handler);
        done();
      });

      controller.handlePointerDblClick(pointers[0], canvas);
    });

  });

  describe('.handlePointerUp()', function() {

    it('should release the pointer in the state module', function() {
      var event = new DOMMouseEvent('mouseup', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.pressPointer(pointers[0], object);

      expect(state.getPressedObject(pointers[0])).to.equal(object);

      controller.handlePointerUp(pointers[0], canvas);

      expect(state.getPressedObject(pointers[0])).to.equal(null);
    });

    it('should emit an up event for the front object', function(done) {
      var event = new DOMMouseEvent('mouseup', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object);
      state.pressPointer(pointers[0], object);

      object.on('pointerup', function handler() {
        object.off('pointerup', handler);
        done();
      });

      controller.handlePointerUp(pointers[0], canvas);
    });

    it('should emit an up event for the scene if no front object is found', function(done) {
      var event = new DOMMouseEvent('mouseup', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], null);
      state.pressPointer(pointers[0], scene);

      scene.on('pointerup', function handler() {
        scene.off('pointerup', handler);
        done();
      });

      controller.handlePointerUp(pointers[0], canvas);
    });

    it('should reset the front object if the pointer type is touch', function() {
      var event = new DOMTouchEvent('touchend', [{x: 100, y: 100}]);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object);
      state.pressPointer(pointers[0], object);

      expect(state.getFrontObject(pointers[0])).to.equal(object);

      controller.handlePointerUp(pointers[0], canvas);

      expect(state.getFrontObject(pointers[0])).to.equal(null);
    });

    it('should set the pointer to have left the canvas if the pointer type is touch', function() {
      var event = new DOMTouchEvent('touchend', [{x: 100, y: 100}]);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object);
      state.pressPointer(pointers[0], object);

      expect(state.hasEnteredCanvas(pointers[0])).to.equal(true);

      controller.handlePointerUp(pointers[0], canvas);

      expect(state.hasEnteredCanvas(pointers[0])).to.equal(false);
    });

    it('should emit leave events from the front object and out if the pointer type is touch', function(done) {
      var event = new DOMTouchEvent('touchend', [{x: 100, y: 100}]);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object);
      state.pressPointer(pointers[0], object);

      var count = 0;

      object.on('pointerleave', function handler() {
        object.off('pointerleave', handler);
        count++;
        expect(count).to.equal(1);
      });

      scene.on('pointerleave', function handler() {
        scene.off('pointerleave', handler);
        count++;
        expect(count).to.equal(2);
      });

      canvas.on('pointerleave', function handler() {
        canvas.off('pointerleave', handler);
        count++;
        expect(count).to.equal(3);
        done();
      });

      controller.handlePointerUp(pointers[0], canvas);
    });

    it('should emit leave events for the scene and canvas if the pointer type is touch and no front object', function(done) {
      var event = new DOMTouchEvent('touchend', [{x: 100, y: 100}]);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], null);
      state.pressPointer(pointers[0], scene);

      var count = 0;

      scene.on('pointerleave', function handler() {
        scene.off('pointerleave', handler);
        count++;
        expect(count).to.equal(1);
      });

      canvas.on('pointerleave', function handler() {
        canvas.off('pointerleave', handler);
        count++;
        expect(count).to.equal(2);
        done();
      });

      controller.handlePointerUp(pointers[0], canvas);
    });

    it('should emit a click event for the pressed object if it is the same as object where the pointer was released', function(done) {
      var event = new DOMPointerEvent('pointerup', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object);
      state.pressPointer(pointers[0], object);

      object.on('pointerclick', function handler() {
        object.off('pointerclick', handler);
        done();
      });

      controller.handlePointerUp(pointers[0], canvas);
    });

    it('should not emit a click event if the pressed object is different from the object where the pointer was released', function(done) {
      var event = new DOMPointerEvent('pointerup', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object1 = createObject(0, 0, 300, 150);
      var object2 = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object1);
      scene.objects.add(object2);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object1);
      state.pressPointer(pointers[0], object1);

      var count = 0;
      var handler = function() { count++; };
      object1.on('pointerclick', handler);
      object2.on('pointerclick', handler);

      controller.handlePointerUp(pointers[0], canvas);

      setTimeout(function() {
        object1.off('pointerclick', handler);
        object2.off('pointerclick', handler);
        expect(count).to.equal(0);
        done();
      }, 10);
    });

    it('should emit a click event if the pressed object is a parent of the object where the pointer was released', function(done) {
      var event = new DOMPointerEvent('pointerup', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object1 = createObject(0, 0, 300, 150);
      var object2 = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object1);
      state.pressPointer(pointers[0], object1);

      var called1 = false;
      var handler1 = function() { called1 = true; };
      object1.on('pointerclick', handler1);

      var called2 = false;
      var handler2 = function() { called2 = true; };
      object2.on('pointerclick', handler2);

      controller.handlePointerUp(pointers[0], canvas);

      setTimeout(function() {
        object1.off('pointerclick', handler1);
        object2.off('pointerclick', handler2);

        expect(called1).to.equal(true);
        expect(called2).to.equal(false);
        done();
      }, 10);
    });

    it('should emit a dblclick event if the click count for the object is two, and the event is a touch event', function(done) {
      var event = new DOMTouchEvent('touchend', [{x: 100, y: 100}]);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object);
      state.pressPointer(pointers[0], object);

      // Add first click. Second click will be set by the up handler.
      state.registerClick(pointers[0], object);

      object.on('pointerdblclick', function handler() {
        object.off('pointerdblclick', handler);
        done();
      });

      controller.handlePointerUp(pointers[0], canvas);
    });

  });

  describe('.handlePointerCancel()', function() {

    it('should release the pointer in the state module', function() {
      var event = new DOMPointerEvent('pointercancel', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.enterCanvas(pointers[0]);
      state.pressPointer(pointers[0], object);

      expect(state.getPressedObject(pointers[0])).to.equal(object);

      controller.handlePointerCancel(pointers[0], canvas);

      expect(state.getPressedObject(pointers[0])).to.equal(null);
    });

    it('should reset the front object for the pointer', function() {
      var event = new DOMPointerEvent('pointercancel', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object);

      expect(state.getFrontObject(pointers[0])).to.equal(object);

      controller.handlePointerCancel(pointers[0], canvas);

      expect(state.getFrontObject(pointers[0])).to.equal(null);
    });

    it('should set the pointer to have left the canvas', function() {
      var event = new DOMPointerEvent('pointercancel', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.enterCanvas(pointers[0]);

      expect(state.hasEnteredCanvas(pointers[0])).to.equal(true);

      controller.handlePointerCancel(pointers[0], canvas);

      expect(state.hasEnteredCanvas(pointers[0])).to.equal(false);
    });

    it('should emit leave events for scene and canvas', function(done) {
      var event = new DOMPointerEvent('pointercancel', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.enterCanvas(pointers[0]);

      var count = 0;

      scene.on('pointerleave', function handler() {
        scene.off('pointerleave', handler);
        count++;
        expect(count).to.equal(1);
      });

      canvas.on('pointerleave', function handler() {
        canvas.off('pointerleave', handler);
        count++;
        expect(count).to.equal(2);
        done();
      });

      controller.handlePointerCancel(pointers[0], canvas);
    });

    it('should emit leave events for objects, scene and canvas', function(done) {
      var event = new DOMPointerEvent('pointercancel', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object1 = createObject(0, 0, 300, 150);
      var object2 = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object2);

      var count = 0;

      object2.on('pointerleave', function handler() {
        object2.off('pointerleave', handler);
        count++;
        expect(count).to.equal(1);
      });

      object1.on('pointerleave', function handler() {
        object1.off('pointerleave', handler);
        count++;
        expect(count).to.equal(2);
      });

      scene.on('pointerleave', function handler() {
        scene.off('pointerleave', handler);
        count++;
        expect(count).to.equal(3);
      });

      canvas.on('pointerleave', function handler() {
        canvas.off('pointerleave', handler);
        count++;
        expect(count).to.equal(4);
        done();
      });

      controller.handlePointerCancel(pointers[0], canvas);
    });

  });

  describe('.handlePointerOut()', function() {

    it('should reset the front object for the pointer', function() {
      var event = new DOMMouseEvent('mouseout', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object);

      expect(state.getFrontObject(pointers[0])).to.equal(object);

      controller.handlePointerOut(pointers[0], canvas);

      expect(state.getFrontObject(pointers[0])).to.equal(null);
    });

    it('should set the pointer to have left the canvas', function() {
      var event = new DOMMouseEvent('mouseout', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.enterCanvas(pointers[0]);

      expect(state.hasEnteredCanvas(pointers[0])).to.equal(true);

      controller.handlePointerOut(pointers[0], canvas);

      expect(state.hasEnteredCanvas(pointers[0])).to.equal(false);
    });

    it('should emit leave events for scene and canvas', function(done) {
      var event = new DOMMouseEvent('mouseout', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object);

      state.enterCanvas(pointers[0]);

      var count = 0;

      scene.on('pointerleave', function handler() {
        scene.off('pointerleave', handler);
        count++;
        expect(count).to.equal(1);
      });

      canvas.on('pointerleave', function handler() {
        canvas.off('pointerleave', handler);
        count++;
        expect(count).to.equal(2);
        done();
      });

      controller.handlePointerOut(pointers[0], canvas);
    });

    it('should emit leave events for objects, scene and canvas', function(done) {
      var event = new DOMMouseEvent('mouseout', 100, 100);
      var pointers = controller.getPointers(event);
      var canvas = createCanvas();
      var object1 = createObject(0, 0, 300, 150);
      var object2 = createObject(0, 0, 300, 150);
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);

      state.enterCanvas(pointers[0]);
      state.setFrontObject(pointers[0], object2);

      var count = 0;

      object2.on('pointerleave', function handler() {
        object2.off('pointerleave', handler);
        count++;
        expect(count).to.equal(1);
      });

      object1.on('pointerleave', function handler() {
        object1.off('pointerleave', handler);
        count++;
        expect(count).to.equal(2);
      });

      scene.on('pointerleave', function handler() {
        scene.off('pointerleave', handler);
        count++;
        expect(count).to.equal(3);
      });

      canvas.on('pointerleave', function handler() {
        canvas.off('pointerleave', handler);
        count++;
        expect(count).to.equal(4);
        done();
      });

      controller.handlePointerOut(pointers[0], canvas);
    });

  });

  describe('.handleEvent()', function() {

    it('should delegate handling to `handlePointerCancel` for a `cancel` event', function(done) {
      var event = new DOMPointerEvent('pointercancel', 100, 100);
      var canvas = createCanvas();

      var backup = controller.handlePointerCancel;
      controller.handlePointerCancel = function(pointer, _canvas) {
        expect(pointer).to.be.a(PointerData);
        expect(_canvas).to.equal(canvas);
        done();
      };

      controller.handleEvent('cancel', event, canvas);

      controller.handlePointerCancel = backup;
    });

    it('should delegate handling to `handlePointerDown` for a `down` event', function(done) {
      var event = new DOMPointerEvent('pointerdown', 100, 100);
      var canvas = createCanvas();

      var backup = controller.handlePointerDown;
      controller.handlePointerDown = function(pointer, _canvas) {
        expect(pointer).to.be.a(PointerData);
        expect(_canvas).to.equal(canvas);
        done();
      };

      controller.handleEvent('down', event, canvas);

      controller.handlePointerDown = backup;
    });

    it('should delegate handling to `handlePointerUp` for an `up` event', function(done) {
      var event = new DOMPointerEvent('pointerup', 100, 100);
      var canvas = createCanvas();

      var backup = controller.handlePointerUp;
      controller.handlePointerUp = function(pointer, _canvas) {
        expect(pointer).to.be.a(PointerData);
        expect(_canvas).to.equal(canvas);
        done();
      };

      controller.handleEvent('up', event, canvas);

      controller.handlePointerUp = backup;
    });

    it('should delegate handling to `handlePointerMove` for a `move` event', function(done) {
      var event = new DOMPointerEvent('pointermove', 100, 100);
      var canvas = createCanvas();

      var backup = controller.handlePointerMove;
      controller.handlePointerMove = function(pointer, _canvas) {
        expect(pointer).to.be.a(PointerData);
        expect(_canvas).to.equal(canvas);
        done();
      };

      controller.handleEvent('move', event, canvas);

      controller.handlePointerMove = backup;
    });

    it('should delegate handling to `handlePointerOut` for an `out` event', function(done) {
      var event = new DOMPointerEvent('pointerout', 100, 100);
      var canvas = createCanvas();

      var backup = controller.handlePointerOut;
      controller.handlePointerOut = function(pointer, _canvas) {
        expect(pointer).to.be.a(PointerData);
        expect(_canvas).to.equal(canvas);
        done();
      };

      controller.handleEvent('out', event, canvas);

      controller.handlePointerOut = backup;
    });

    it('should delegate handling to `handlePointerDblClick` for a `dblclick` event', function(done) {
      var event = new DOMMouseEvent('dblclick', 100, 100);
      var canvas = createCanvas();

      var backup = controller.handlePointerDblClick;
      controller.handlePointerDblClick = function(pointer, _canvas) {
        expect(pointer).to.be.a(PointerData);
        expect(_canvas).to.equal(canvas);
        done();
      };

      controller.handleEvent('dblclick', event, canvas);

      controller.handlePointerDblClick = backup;
    });

    it('should delegate handling for all pointers in the event', function(done) {
      var event = new DOMTouchEvent('touchmove', [{x: 100, y: 120}, {x: 50, y: 70}]);
      var canvas = createCanvas();

      var count = 0;

      var backup = controller.handlePointerMove;
      controller.handlePointerMove = function(pointer, _canvas) {
        count++;

        expect(pointer).to.be.a(PointerData);
        expect(_canvas).to.equal(canvas);

        if (count === 1) {
          expect(pointer.x).to.equal(100);
          expect(pointer.y).to.equal(120);
        } else if (count === 2) {
          expect(pointer.x).to.equal(50);
          expect(pointer.y).to.equal(70);
        }

        if (count === 2) done();
      };

      controller.handleEvent('move', event, canvas);

      controller.handlePointerMove = backup;
    });

    it('should handle unknown event types without throwing errors', function(done) {
      var event = new DOMPointerEvent('pointersomething', 100, 100);

      controller.handleEvent('something', event, createCanvas());

      done();
    });

  });

});

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

function createObject(opt_x, opt_y, opt_width, opt_height) {
  var object = new CanvasObject();
  object.x = opt_x || 0;
  object.y = opt_y || 0;
  object.width = opt_width || 0;
  object.height = opt_height || 0;

  object.getVertices = function(canvas) {
    return [
      {x: this.x, y: this.y}, {x: this.x + this.width, y: this.y},
      {x: this.x + this.width, y: this.y + this.height}, {x: this.x, y: this.y + this.height}
    ];
  };

  return object;
}
