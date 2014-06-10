var expect = require('expect.js');
var controller = require('../../../../keyboard/private/controller');
var Canvas = require('../../../../classes/Canvas');

describe('keyboard/controller', function() {

  var canvas;
  before(function() {
    canvas = new Canvas();
  });

  beforeEach(function() {
    for (var keyCode in controller.pressedKeys) {
      delete controller.pressedKeys[keyCode];
    }
  });

  describe('.handleKeyDown()', function() {

    it('should store the key as being pressed', function() {
      var event = new Event('keydown', 27);
      controller.handleKeyDown(event, canvas);
      expect(controller.pressedKeys[27]).to.equal(event);
    });

    it('should not replace the stored event of subsequent keydown events', function() {
      var event1 = new Event('keydown', 27);
      controller.handleKeyDown(event1, canvas);

      var event2 = new Event('keydown', 27);
      controller.handleKeyDown(event2, canvas);

      expect(controller.pressedKeys[27]).to.equal(event1);
    });

    it('should prevent the default action of subsequent keydown events if the first was prevented', function() {
      var event1 = new Event('keydown', 27);
      controller.handleKeyDown(event1, canvas);

      event1.preventDefault();

      var event2 = new Event('keydown', 27);
      controller.handleKeyDown(event2, canvas);

      expect(event2.defaultPrevented).to.equal(true);
    });

    it('should emit a `keydown` event on canvas', function(done) {
      canvas.on('keydown', function handler(event) {
        canvas.off('keydown', handler);
        expect(event.keyCode).to.equal(27);
        expect(event.key).to.equal('Escape');
        done();
      });

      controller.handleKeyDown(new Event('keydown', 27), canvas);
    });

    it('should not emit a `keydown` event if key is already pressed down', function() {
      controller.handleKeyDown(new Event('keydown', 27), canvas);

      var called = false;
      var handler = function(event) {
        called = true;
      };
      canvas.on('keydown', handler);

      controller.handleKeyDown(new Event('keydown', 27), canvas);

      canvas.off('keydown', handler);
      expect(called).to.equal(false);
    });

    it('should start emitting `keypress` events on canvas', function(done) {
      var count = 0;
      canvas.on('keypress', function handler(event) {
        expect(event.keyCode).to.equal(27);
        expect(event.key).to.equal('Escape');
        if (++count === 5) {
          canvas.off('keypress', handler);
          done();
        }
      });

      controller.handleKeyDown(new Event('keydown', 27), canvas);
    });

  });

  describe('.handleKeyUp()', function() {

    it('should remove the key from the internal state', function() {
      var event1 = new Event('keydown', 27);
      controller.handleKeyDown(event1, canvas);
      expect(controller.pressedKeys[27]).to.equal(event1);

      var event2 = new Event('keyup', 27);
      controller.handleKeyUp(event2, canvas);
      expect('27' in controller.pressedKeys).to.equal(false);
    });

    it('should emit a `keyup` event on canvas', function(done) {
      canvas.on('keyup', function handler(event) {
        canvas.off('keyup', handler);
        expect(event.keyCode).to.equal(27);
        expect(event.key).to.equal('Escape');
        done();
      });

      controller.handleKeyDown(new Event('keydown', 27), canvas);
      controller.handleKeyUp(new Event('keydown', 27), canvas);
    });

    it('should not emit a `keyup` event if key is not pressed down', function() {
      var called = false;
      var handler = function(event) {
        called = true;
      };
      canvas.on('keyup', handler);

      controller.handleKeyUp(new Event('keydown', 27), canvas);

      canvas.off('keydown', handler);
      expect(called).to.equal(false);
    });

    it('should release all keys (internal state and emit event) if keyCode is 224 (Meta)', function() {
      var keys = {
        224: false,
        65: false
      };
      var handler = function(event) {
        keys[event.keyCode] = true;
      };
      canvas.on('keyup', handler);

      controller.handleKeyDown(new Event('keydown', 224), canvas);
      controller.handleKeyDown(new Event('keydown', 65), canvas);

      expect(controller.pressedKeys[224]).to.be.ok();
      expect(controller.pressedKeys[65]).to.be.ok();

      controller.handleKeyUp(new Event('keyup', 224), canvas);

      expect(controller.pressedKeys[224]).to.not.be.ok();
      expect(controller.pressedKeys[65]).to.not.be.ok();

      expect(keys[224]).to.equal(true);
      expect(keys[65]).to.equal(true);

      canvas.off('keyup', handler);
    });

    it('should release all keys (internal state and emit event) if keyCode is 91 (OS Left)', function() {
      var keys = {
        91: false,
        65: false
      };
      var handler = function(event) {
        keys[event.keyCode] = true;
      };
      canvas.on('keyup', handler);

      controller.handleKeyDown(new Event('keydown', 91), canvas);
      controller.handleKeyDown(new Event('keydown', 65), canvas);

      expect(controller.pressedKeys[91]).to.be.ok();
      expect(controller.pressedKeys[65]).to.be.ok();

      controller.handleKeyUp(new Event('keyup', 91), canvas);

      expect(controller.pressedKeys[91]).to.not.be.ok();
      expect(controller.pressedKeys[65]).to.not.be.ok();

      expect(keys[91]).to.equal(true);
      expect(keys[65]).to.equal(true);

      canvas.off('keyup', handler);
    });

    it('should release all keys (internal state and emit event) if keyCode is 92 (OS Right)', function() {
      var keys = {
        92: false,
        65: false
      };
      var handler = function(event) {
        keys[event.keyCode] = true;
      };
      canvas.on('keyup', handler);

      controller.handleKeyDown(new Event('keydown', 92), canvas);
      controller.handleKeyDown(new Event('keydown', 65), canvas);

      expect(controller.pressedKeys[92]).to.be.ok();
      expect(controller.pressedKeys[65]).to.be.ok();

      controller.handleKeyUp(new Event('keyup', 92), canvas);

      expect(controller.pressedKeys[92]).to.not.be.ok();
      expect(controller.pressedKeys[65]).to.not.be.ok();

      expect(keys[92]).to.equal(true);
      expect(keys[65]).to.equal(true);

      canvas.off('keyup', handler);
    });

  });

  describe('.handleBlur()', function() {

    it('should release all keys (internal state and emit event)', function() {
      var keys = {
        65: false,
        66: false
      };
      var handler = function(event) {
        keys[event.keyCode] = true;
      };
      canvas.on('keyup', handler);

      controller.handleKeyDown(new Event('keydown', 65), canvas);
      controller.handleKeyDown(new Event('keydown', 66), canvas);

      expect(controller.pressedKeys[65]).to.be.ok();
      expect(controller.pressedKeys[66]).to.be.ok();

      controller.handleBlur(new Event('blur'), canvas);

      expect(controller.pressedKeys[65]).to.not.be.ok();
      expect(controller.pressedKeys[66]).to.not.be.ok();

      expect(keys[65]).to.equal(true);
      expect(keys[66]).to.equal(true);

      canvas.off('keyup', handler);
    });

  });

  describe('.handleEvent()', function() {

    it('should delegate handling to `handleKeyDown` for a `keydown` event', function(done) {
      var event = new Event('keydown', 27);

      var backup = controller.handleKeyDown;
      controller.handleKeyDown = function(_event, _canvas) {
        expect(_event).to.equal(event);
        expect(_canvas).to.equal(canvas);
        done();
      };

      controller.handleEvent(event, canvas);

      controller.handleKeyDown = backup;
    });

    it('should delegate handling to `handleKeyUp` for a `keyup` event', function(done) {
      var event = new Event('keyup', 27);

      var backup = controller.handleKeyUp;
      controller.handleKeyUp = function(_event, _canvas) {
        expect(_event).to.equal(event);
        expect(_canvas).to.equal(canvas);
        done();
      };

      controller.handleEvent(event, canvas);

      controller.handleKeyUp = backup;
    });

    it('should delegate handling to `handleBlur` for a `blur` event', function(done) {
      var event = new Event('blur');

      var backup = controller.handleBlur;
      controller.handleBlur = function(_event, _canvas) {
        expect(_event).to.equal(event);
        expect(_canvas).to.equal(canvas);
        done();
      };

      controller.handleEvent(event, canvas);

      controller.handleBlur = backup;
    });

  });

});

function Event(type, keyCode) {
  this.type = type;
  this.keyCode = keyCode;
  this.defaultPrevented = false;
}

Event.prototype.preventDefault = function() {
  this.defaultPrevented = true;
};
