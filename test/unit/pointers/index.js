var expect = require('expect.js');
var pointers = require('../../../pointers');
var PointerEvent = require('../../../pointers/PointerEvent');

var CanvasObject = require('../../../shapes/base/CanvasObject');
var Canvas = require('../../../classes/Canvas');
var Camera = require('../../../classes/Camera');
var Scene = require('../../../classes/Scene');

var domPointers = require('../../utils/dompointers');
var DOMMouseEvent = domPointers.DOMMouseEvent;
var DOMTouchEvent = domPointers.DOMTouchEvent;
var DOMPointerEvent = domPointers.DOMPointerEvent;

describe('pointers', function() {

  describe('.enableForCanvas()', function() {

    it('should set up DOM pointer event listeners and hook it up with oCanvas events', function(done) {
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();
      var target = createObject(0, 0, 300, 150);

      var mousedownHandler;
      canvas.element.addEventListener = function(type, handler) {
        if (type === 'mousedown') {
          mousedownHandler = handler;
        }
      };

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(target);

      target.on('pointerdown', function handler(event) {
        target.off('pointerdown', handler);

        expect(event.type).to.equal('pointerdown');
        expect(event.position.element.x).to.equal(40);
        expect(event.position.element.y).to.equal(45);

        done();
      });

      pointers.enableForCanvas(canvas);

      expect(mousedownHandler).to.be.a('function');

      var event = new DOMMouseEvent('mousedown', 100, 75);
      mousedownHandler.call(canvas.element, event);
    });

  });

  describe('.disableForCanvas()', function() {

    it('should remove DOM pointer event listeners and disconnect it from oCanvas events', function(done) {
      var canvas = createCanvas();
      var scene = new Scene();
      var camera = new Camera();
      var target = createObject(0, 0, 300, 150);

      canvas.element.addEventListener = function(type, handler) {};

      var removed = false;
      canvas.element.removeEventListener = function(type, handler) {
        removed = true;
      };

      canvas.camera = camera;
      scene.cameras.add(camera);
      scene.objects.add(target);

      // Enable
      pointers.enableForCanvas(canvas);

      // Disable
      pointers.disableForCanvas(canvas);

      setTimeout(function() {
        expect(removed).to.equal(true);
        done();
      }, 10);
    });

  });

  describe('.PointerEvent', function() {

    it('should be the PointerEvent class', function() {
      expect(pointers.PointerEvent).to.equal(PointerEvent);
      expect(pointers.PointerEvent).to.be.a('function');
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
