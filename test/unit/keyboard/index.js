var expect = require('expect.js');
var keyboard = require('../../../keyboard');
var Canvas = require('../../../classes/Canvas');

describe('keyboard', function() {

  describe('.enableForCanvas()', function() {

    it('should add an event listener for keydown on the canvas element', function(done) {
      var added = false;
      var canvas = new Canvas({
        element: {
          addEventListener: function(type) {
            if (type === 'keydown') added = true;
          }
        }
      });

      keyboard.enableForCanvas(canvas);

      setTimeout(function() {
        expect(added).to.equal(true);
        done();
      }, 10);
    });

    it('should add an event listener for keyup on the canvas element', function(done) {
      var added = false;
      var canvas = new Canvas({
        element: {
          addEventListener: function(type) {
            if (type === 'keyup') added = true;
          }
        }
      });

      keyboard.enableForCanvas(canvas);

      setTimeout(function() {
        expect(added).to.equal(true);
        done();
      }, 10);
    });

    it('should add an event listener for blur on the canvas element', function(done) {
      var added = false;
      var canvas = new Canvas({
        element: {
          addEventListener: function(type) {
            if (type === 'blur') added = true;
          }
        }
      });

      keyboard.enableForCanvas(canvas);

      setTimeout(function() {
        expect(added).to.equal(true);
        done();
      }, 10);
    });

    it('should set the tabIndex property on the element if the current value is -1', function() {
      var canvas = new Canvas({
        element: {tabIndex: -1, addEventListener: function() {}}
      });

      keyboard.enableForCanvas(canvas);

      expect(canvas.element.tabIndex).to.equal(0);
    });

    it('should not set the tabIndex property on the element if the current value is not -1', function() {
      var canvas = new Canvas({
        element: {tabIndex: 5, addEventListener: function() {}}
      });

      keyboard.enableForCanvas(canvas);

      expect(canvas.element.tabIndex).to.equal(5);
    });

    it('should emit an event on the canvas when the DOM event happens', function(done) {
      var canvas = new Canvas({
        element: {
          addEventListener: function(type, handler) {
            handler(new Event('keydown', 27));
          }
        }
      });

      canvas.on('keydown', function handler(event) {
        canvas.off('keydown', handler);

        expect(event.keyCode).to.equal(27);
        expect(event.key).to.equal('Escape');
        done();
      });

      keyboard.enableForCanvas(canvas);
    });

    it('should not add event listeners again if called multiple times', function(done) {
      var added = 0;
      var canvas = new Canvas({
        element: {
          addEventListener: function(type) {
            if (type === 'keydown') added++;
          }
        }
      });

      keyboard.enableForCanvas(canvas);
      keyboard.enableForCanvas(canvas);

      setTimeout(function() {
        expect(added).to.equal(1);
        done();
      }, 10);
    });

  });

  describe('.disableForCanvas()', function() {

    it('should remove the event listener for keydown on the canvas element', function(done) {
      var removed = false;
      var addedHandlers = {};
      var canvas = new Canvas({
        element: {
          addEventListener: function(type, handler) {
            addedHandlers[type] = handler;
          },
          removeEventListener: function(type, handler) {
            if (type === 'keydown') {
              removed = true;
              expect(handler).to.be.ok();
              expect(handler).to.equal(addedHandlers.keydown);
            }
          }
        }
      });

      keyboard.enableForCanvas(canvas);
      keyboard.disableForCanvas(canvas);

      setTimeout(function() {
        expect(removed).to.equal(true);
        done();
      }, 10);
    });

    it('should remove the event listener for keyup on the canvas element', function(done) {
      var removed = false;
      var addedHandlers = {};
      var canvas = new Canvas({
        element: {
          addEventListener: function(type, handler) {
            addedHandlers[type] = handler;
          },
          removeEventListener: function(type, handler) {
            if (type === 'keyup') {
              removed = true;
              expect(handler).to.be.ok();
              expect(handler).to.equal(addedHandlers.keyup);
            }
          }
        }
      });

      keyboard.enableForCanvas(canvas);
      keyboard.disableForCanvas(canvas);

      setTimeout(function() {
        expect(removed).to.equal(true);
        done();
      }, 10);
    });

    it('should remove the event listener for blur on the canvas element', function(done) {
      var removed = false;
      var addedHandlers = {};
      var canvas = new Canvas({
        element: {
          addEventListener: function(type, handler) {
            addedHandlers[type] = handler;
          },
          removeEventListener: function(type, handler) {
            if (type === 'blur') {
              removed = true;
              expect(handler).to.be.ok();
              expect(handler).to.equal(addedHandlers.blur);
            }
          }
        }
      });

      keyboard.enableForCanvas(canvas);
      keyboard.disableForCanvas(canvas);

      setTimeout(function() {
        expect(removed).to.equal(true);
        done();
      }, 10);
    });

    it('should not remove event listeners if canvas is not enabled', function(done) {
      var removed = 0;
      var canvas = new Canvas({
        element: {
          addEventListener: function() {},
          removeEventListener: function(type) {
            if (type === 'keydown') removed++;
          }
        }
      });

      keyboard.disableForCanvas(canvas);
      keyboard.enableForCanvas(canvas);
      keyboard.disableForCanvas(canvas);
      keyboard.disableForCanvas(canvas);

      setTimeout(function() {
        expect(removed).to.equal(1);
        done();
      }, 10);
    });

  });

  describe('.getPressedKeys()', function() {

    it('should return an object with `codes` and `keys`', function() {
      expect(keyboard.getPressedKeys()).to.be.an('object');
      expect(keyboard.getPressedKeys().codes).to.be.an('array');
      expect(keyboard.getPressedKeys().keys).to.be.an('array');
    });

    it('should have the numeric key codes in the `codes` property', function() {
      var canvas = new Canvas({
        element: {
          addEventListener: function(type, handler) {
            handler(new Event('keydown', 27));
            handler(new Event('keydown', 65));
          }
        }
      });

      keyboard.enableForCanvas(canvas);

      var keys = keyboard.getPressedKeys();

      expect(keys.codes.length).to.equal(2);
      expect(keys.codes[0]).to.equal(27);
      expect(keys.codes[1]).to.equal(65);
    });

    it('should have the string name of the keys in the `keys` property', function() {
      var canvas = new Canvas({
        element: {
          addEventListener: function(type, handler) {
            handler(new Event('keydown', 27));
            handler(new Event('keydown', 65));
          }
        }
      });

      keyboard.enableForCanvas(canvas);

      var keys = keyboard.getPressedKeys();

      expect(keys.keys.length).to.equal(2);
      expect(keys.keys[0]).to.equal('Escape');
      expect(keys.keys[1]).to.equal('a');
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
