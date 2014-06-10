var expect = require('expect.js');
var emitter = require('../../../../pointers/private/emitter');
var state = require('../../../../pointers/private/state');
var PointerData = require('../../../../pointers/private/PointerData');
var CanvasObject = require('../../../../shapes/base/CanvasObject');
var Canvas = require('../../../../classes/Canvas');
var Camera = require('../../../../classes/Camera');
var Scene = require('../../../../classes/Scene');
var PointerEvent = require('../../../../pointers/PointerEvent');

describe('pointers/emitter', function() {

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

  beforeEach(function() {
    state.reset();
  });

  afterEach(function() {
    state.reset();
  });

  describe('.getPointerEventType()', function() {

    it('should convert `down`', function() {
      expect(emitter.getPointerEventType('down')).to.equal('pointerdown');
    });

    it('should convert `up`', function() {
      expect(emitter.getPointerEventType('up')).to.equal('pointerup');
    });

    it('should convert `move`', function() {
      expect(emitter.getPointerEventType('move')).to.equal('pointermove');
    });

    it('should convert `downmove`', function() {
      expect(emitter.getPointerEventType('downmove')).to.equal('pointerdownmove');
    });

    it('should convert `enter`', function() {
      expect(emitter.getPointerEventType('enter')).to.equal('pointerenter');
    });

    it('should convert `leave`', function() {
      expect(emitter.getPointerEventType('leave')).to.equal('pointerleave');
    });

    it('should convert `click`', function() {
      expect(emitter.getPointerEventType('click')).to.equal('pointerclick');
    });

    it('should convert `dblclick`', function() {
      expect(emitter.getPointerEventType('dblclick')).to.equal('pointerdblclick');
    });

    it('should return the input type if not recognized', function() {
      expect(emitter.getPointerEventType('randomtype')).to.equal('randomtype');
    });

  });

  describe('.emit()', function() {

    it('should emit an event with the specified type on the specified target', function(done) {
      var pointer = new PointerData({x: 100, y: 75});
      var target = new CanvasObject();
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(target);

      target.on('pointerdown', function handler(event) {
        target.off('pointerdown', handler);

        expect(event.type).to.equal('pointerdown');

        done();
      });

      emitter.emit('pointerdown', pointer, canvas, target);
    });

    it('should create a new event object that is passed with the event', function(done) {
      var pointer = new PointerData({x: 100, y: 75});
      var target = new CanvasObject();
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(target);

      target.on('pointerdown', function handler(event) {
        target.off('pointerdown', handler);

        expect(event).to.be.a(PointerEvent);

        done();
      });

      emitter.emit('pointerdown', pointer, canvas, target);
    });

    it('should set the correct pointer count in the event object', function(done) {
      var pointer1 = new PointerData({x: 100, y: 75, id: 'p1'});
      var pointer2 = new PointerData({x: 100, y: 75, id: 'p2'});
      var pointer3 = new PointerData({x: 100, y: 75, id: 'p3'});
      var target = new CanvasObject();
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(target);

      state.setFrontObject(pointer1, target);
      state.setFrontObject(pointer2, target);
      state.setFrontObject(pointer3, target);

      target.on('pointerdown', function handler(event) {
        target.off('pointerdown', handler);

        expect(event.targetPointerCount).to.equal(3);

        done();
      });

      emitter.emit('pointerdown', pointer1, canvas, target);
    });

    it('should set all position coordinates', function(done) {
      var pointer = new PointerData({x: 100, y: 75, id: 'p1'});
      var target = new CanvasObject({x: 60, y: 20});
      var canvas = createCanvas(600, 300);
      var scene = new Scene();
      var camera = new Camera({x: 350, y: 250});

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(target);

      state.setFrontObject(pointer, target);

      target.on('pointerdown', function handler(event) {
        target.off('pointerdown', handler);

        expect(event.position).to.be.an('object');
        expect(event.position.element).to.be.an('object');
        expect(event.position.canvas).to.be.an('object');
        expect(event.position.scene).to.be.an('object');
        expect(event.position.target).to.be.an('object');

        expect(event.position.element.x).to.equal(40);
        expect(event.position.element.y).to.equal(45);
        expect(event.position.canvas.x).to.equal(80);
        expect(event.position.canvas.y).to.equal(90);
        expect(event.position.scene.x).to.equal(130);
        expect(event.position.scene.y).to.equal(190);
        expect(event.position.target.x).to.equal(70);
        expect(event.position.target.y).to.equal(170);

        done();
      });

      emitter.emit('pointerdown', pointer, canvas, target);
    });

    it('should set all keys', function(done) {
      var pointer = new PointerData({x: 100, y: 75, id: 'p1'});
      var target = new CanvasObject();
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      pointer.keys.shift = true;
      pointer.keys.count = 1;

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(target);

      state.setFrontObject(pointer, target);

      target.on('pointerdown', function handler(event) {
        target.off('pointerdown', handler);

        expect(event.keys).to.be.an('object');
        expect(event.keys.ctrl).to.equal(false);
        expect(event.keys.alt).to.equal(false);
        expect(event.keys.shift).to.equal(true);
        expect(event.keys.meta).to.equal(false);
        expect(event.keys.count).to.equal(1);

        done();
      });

      emitter.emit('pointerdown', pointer, canvas, target);
    });

    it('should set all buttons', function(done) {
      var pointer = new PointerData({x: 100, y: 75, id: 'p1'});
      var target = new CanvasObject();
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      pointer.buttons.primary = true;
      pointer.buttons.count = 1;

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(target);

      state.setFrontObject(pointer, target);

      target.on('pointerdown', function handler(event) {
        target.off('pointerdown', handler);

        expect(event.buttons).to.be.an('object');
        expect(event.buttons.primary).to.equal(true);
        expect(event.buttons.secondary).to.equal(false);
        expect(event.buttons.auxiliary).to.equal(false);
        expect(event.buttons.extra1).to.equal(false);
        expect(event.buttons.extra2).to.equal(false);
        expect(event.buttons.extra3).to.equal(false);
        expect(event.buttons.count).to.equal(1);

        done();
      });

      emitter.emit('pointerdown', pointer, canvas, target);
    });

  });

  describe('.emitForTarget()', function() {

    it('should emit an event with the specified type on the specified target', function(done) {
      var pointer = new PointerData({x: 100, y: 75});
      var target = new CanvasObject();
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(target);

      target.on('pointerdown', function handler(event) {
        target.off('pointerdown', handler);

        expect(event.type).to.equal('pointerdown');

        done();
      });

      emitter.emitForTarget('down', pointer, canvas, target);
    });

  });

  describe('.emitForChain()', function() {

    it('should emit an event for each object in the provided chain', function(done) {
      var pointer = new PointerData({x: 100, y: 75});
      var chain = [new CanvasObject(), new CanvasObject()];
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(chain[0]);
      scene.objects.add(chain[1]);

      var count = 0;

      chain[0].on('pointerleave', function handler(event) {
        chain[0].off('pointerleave', handler);
        if (++count === 2) done();
      });

      chain[1].on('pointerleave', function handler(event) {
        chain[1].off('pointerleave', handler);
        if (++count === 2) done();
      });

      emitter.emitForChain('leave', pointer, canvas, chain);
    });

    it('should emit an event for each object in the ascending array order', function(done) {
      var pointer = new PointerData({x: 100, y: 75});
      var chain = [new CanvasObject(), new CanvasObject()];
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(chain[0]);
      scene.objects.add(chain[1]);

      var count = 0;

      chain[0].on('pointerleave', function handler(event) {
        chain[0].off('pointerleave', handler);
        count++;
      });

      chain[1].on('pointerleave', function handler(event) {
        chain[1].off('pointerleave', handler);
        count++;

        expect(count).to.equal(2);
        done();
      });

      emitter.emitForChain('leave', pointer, canvas, chain);
    });

    it('should emit an event for each object in the descending array order if it is an enter event', function(done) {
      var pointer = new PointerData({x: 100, y: 75});
      var chain = [new CanvasObject(), new CanvasObject()];
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(chain[0]);
      scene.objects.add(chain[1]);

      var count = 0;

      chain[0].on('pointerenter', function handler(event) {
        chain[0].off('pointerenter', handler);
        count++;

        expect(count).to.equal(2);
        done();
      });

      chain[1].on('pointerenter', function handler(event) {
        chain[1].off('pointerenter', handler);
        count++;
      });

      emitter.emitForChain('enter', pointer, canvas, chain);
    });

  });

  describe('.emitForCanvas()', function() {

    it('should emit an event for the scene and the canvas', function(done) {
      var pointer = new PointerData({x: 100, y: 75});
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);

      var count = 0;

      scene.on('pointerleave', function handler(event) {
        canvas.off('pointerleave', handler);
        count++;
      });

      canvas.on('pointerleave', function handler(event) {
        canvas.off('pointerleave', handler);
        count++;
        expect(count).to.equal(2);
        done();
      });

      emitter.emitForCanvas('leave', pointer, canvas);
    });

  });

  describe('.emitFromObject()', function() {

    it('should emit an event for an object and all objects in its parent chain, including scene and canvas', function(done) {
      var pointer = new PointerData({x: 100, y: 75});
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      var object3 = new CanvasObject();
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);
      object2.children.add(object3);

      var count = 0;

      object3.on('pointerleave', function handler(event) {
        object3.off('pointerleave', handler);
        count++;
      });

      object2.on('pointerleave', function handler(event) {
        object2.off('pointerleave', handler);
        count++;
      });

      object1.on('pointerleave', function handler(event) {
        object1.off('pointerleave', handler);
        count++;
      });

      scene.on('pointerleave', function handler(event) {
        scene.off('pointerleave', handler);
        count++;
      });

      canvas.on('pointerleave', function handler(event) {
        canvas.off('pointerleave', handler);
        count++;

        expect(count).to.equal(5);
        done();
      });

      emitter.emitFromObject('leave', pointer, canvas, object3);
    });

  });

  describe('.emitBetweenObjects()', function() {

    it('should emit an event for an object and all objects in its parent chain, up until the specified outer object (exclusive)', function(done) {
      var pointer = new PointerData({x: 100, y: 75});
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      var object3 = new CanvasObject();
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(object1);
      object1.children.add(object2);
      object2.children.add(object3);

      var count = 0;

      var handler = function() { count++; };

      object3.on('pointerleave', handler);
      object2.on('pointerleave', handler);
      object1.on('pointerleave', handler);
      scene.on('pointerleave', handler);
      canvas.on('pointerleave', handler);

      emitter.emitBetweenObjects('leave', pointer, canvas, object3, object1);

      setTimeout(function() {
        object3.off('pointerleave', handler);
        object2.off('pointerleave', handler);
        object1.off('pointerleave', handler);
        scene.off('pointerleave', handler);
        canvas.off('pointerleave', handler);

        expect(count).to.equal(2);
        done();
      }, 10);
    });

  });

});
