var expect = require('expect.js');
var ObjectEventEmitter = require('../../../classes/ObjectEventEmitter');
var ObjectEvent = require('../../../classes/ObjectEvent');

describe('ObjectEventEmitter', function() {

  describe('ObjectEventEmitter constructor', function() {

    it('should define an object that stores all listeners', function() {
      var emitter = new ObjectEventEmitter();
      expect(typeof emitter.listeners).to.equal('object');
    });

    it('should store listeners separated by their event phase', function() {
      var emitter = new ObjectEventEmitter();
      expect(typeof emitter.listeners.capture).to.equal('object');
      expect(typeof emitter.listeners.bubble).to.equal('object');
    });

  });

  describe('#on()', function() {

    it('should add a handler function to the listener storage for the bubble phase if not specified', function() {
      var emitter = new ObjectEventEmitter();

      var handler = function() {};
      emitter.on('some-event', handler);

      expect(emitter.listeners.bubble['some-event']).to.be.ok();
      expect(emitter.listeners.bubble['some-event'].length).to.equal(1);
      expect(emitter.listeners.bubble['some-event'][0]).to.equal(handler);
    });

    it('should add a handler function to the listener storage for the bubble phase if specified', function() {
      var emitter = new ObjectEventEmitter();

      var handler = function() {};
      emitter.on('some-event', handler, false);

      expect(emitter.listeners.bubble['some-event']).to.be.ok();
      expect(emitter.listeners.bubble['some-event'].length).to.equal(1);
      expect(emitter.listeners.bubble['some-event'][0]).to.equal(handler);
    });

    it('should add a handler function to the listener storage for the capture phase if specified', function() {
      var emitter = new ObjectEventEmitter();

      var handler = function() {};
      emitter.on('some-event', handler, true);

      expect(emitter.listeners.capture['some-event']).to.be.ok();
      expect(emitter.listeners.capture['some-event'].length).to.equal(1);
      expect(emitter.listeners.capture['some-event'][0]).to.equal(handler);
    });

    it('should not add a handler function to the listener storage if it is already added', function() {
      var emitter = new ObjectEventEmitter();

      var handler = function() {};
      emitter.on('some-event', handler);
      emitter.on('some-event', handler);

      expect(emitter.listeners.bubble['some-event']).to.be.ok();
      expect(emitter.listeners.bubble['some-event'].length).to.equal(1);
      expect(emitter.listeners.bubble['some-event'][0]).to.equal(handler);
    });

  });

  describe('#off()', function() {

    it('should remove a handler function from the listener storage for the bubble phase if not specified', function() {
      var emitter = new ObjectEventEmitter();

      var handler = function() {};
      emitter.on('some-event', handler);
      emitter.off('some-event', handler);

      expect(emitter.listeners.bubble['some-event']).to.be.ok();
      expect(emitter.listeners.bubble['some-event'].length).to.equal(0);
    });

    it('should remove a handler function from the listener storage for the bubble phase if specified', function() {
      var emitter = new ObjectEventEmitter();

      var handler = function() {};
      emitter.on('some-event', handler, false);
      emitter.off('some-event', handler, false);

      expect(emitter.listeners.bubble['some-event']).to.be.ok();
      expect(emitter.listeners.bubble['some-event'].length).to.equal(0);
    });

    it('should remove a handler function from the listener storage for the capture phase if specified', function() {
      var emitter = new ObjectEventEmitter();

      var handler = function() {};
      emitter.on('some-event', handler, true);
      emitter.off('some-event', handler, true);

      expect(emitter.listeners.capture['some-event']).to.be.ok();
      expect(emitter.listeners.capture['some-event'].length).to.equal(0);
    });

  });

  describe('#emit()', function() {

    it('should call all handler functions for the event', function(done) {
      var emitter = new ObjectEventEmitter();
      var numCalls = 0;

      emitter.on('some-event', function() {
        numCalls++;
      });

      emitter.on('some-event', function() {
        numCalls++;
        if (numCalls === 2) done();
        else done(new Error('Not all handlers were called (or they were called in the wrong order).'));
      });

      emitter.emit('some-event');
    });

    it('should call the handler function for the event with `this` set to the object', function(done) {
      var emitter = new ObjectEventEmitter();

      emitter.on('some-event', function() {
        expect(this).to.equal(emitter);
        done();
      });

      emitter.emit('some-event');
    });

    it('should call the handler function for the event with the passed event object', function(done) {
      var emitter = new ObjectEventEmitter();

      emitter.on('some-event', function(event) {
        expect(event.property).to.equal('value');
        done();
      });

      var event = new ObjectEvent('some-event');
      event.property = 'value';
      emitter.emit('some-event', event);
    });

    it('should call the handler function for the event with a new event object if one is not provided', function(done) {
      var emitter = new ObjectEventEmitter();

      emitter.on('some-event', function(event) {
        expect(event).to.be.ok();
        expect(event instanceof ObjectEvent).to.equal(true);
        expect(event.type).to.equal('some-event');
        done();
      });

      emitter.emit('some-event');
    });

    it('should invoke the handler functions for this object and all parent objects in the capture phase', function(done) {
      var object1 = new ObjectEventEmitter();
      var object2 = new ObjectEventEmitter();
      var object3 = new ObjectEventEmitter();

      object3.parent = object2;
      object2.parent = object1;

      var num = 0;
      function count(event) {
        expect(event.phase).to.equal('capture');
        num++;
        if (num === 3) {
          if (this === object3) {
            done();
          } else {
            done(new Error('All handlers were called, but in the wrong order.'));
          }
        }
      }

      object1.on('some-event', count, true);
      object2.on('some-event', count, true);
      object3.on('some-event', count, true);

      object3.emit('some-event');
    });

    it('should invoke the handler functions for this object and all parent objects in the bubble phase', function(done) {
      var object1 = new ObjectEventEmitter();
      var object2 = new ObjectEventEmitter();
      var object3 = new ObjectEventEmitter();

      object3.parent = object2;
      object2.parent = object1;

      var num = 0;
      function count(event) {
        expect(event.phase).to.equal('bubble');
        num++;
        if (num === 3) {
          if (this === object1) {
            done();
          } else {
            done(new Error('All handlers were called, but in the wrong order.'));
          }
        }
      }

      object1.on('some-event', count, false);
      object2.on('some-event', count, false);
      object3.on('some-event', count, false);

      object3.emit('some-event');
    });

    it('should invoke the handler functions for the target object in the bubble phase even if the event doesn\'t bubble', function(done) {
      var object1 = new ObjectEventEmitter();

      object1.on('some-event', function() {
        done();
      }, false);

      var event = new ObjectEvent('some-event');
      event.bubbles = false;

      object1.emit('some-event', event);
    });

    it('should not invoke the handler functions for the bubble phase if the event doesn\'t bubble', function(done) {
      var object1 = new ObjectEventEmitter();
      var object2 = new ObjectEventEmitter();

      object2.parent = object1;

      var has1BeenCalled = false;
      function handler1() { has1BeenCalled = true; }

      var has2BeenCalled = false;
      function handler2() { has2BeenCalled = true; }

      object1.on('some-event', handler1, false);
      object2.on('some-event', handler2, false);

      var event = new ObjectEvent('some-event');
      event.bubbles = false;

      setTimeout(function() {
        expect(has1BeenCalled).to.equal(false);
        expect(has2BeenCalled).to.equal(true);
        done();
      }, 16);
      object2.emit('some-event', event);
    });

    it('should invoke the handler functions for the capture phase even if the event doesn\'t bubble', function(done) {
      var object1 = new ObjectEventEmitter();
      var object2 = new ObjectEventEmitter();

      object2.parent = object1;

      var num = 0;
      function count(event) {
        expect(event.phase).to.equal('capture');
        num++;
        if (num === 2) {
          if (this === object2) {
            done();
          } else {
            done(new Error('All handlers were called, but in the wrong order.'));
          }
        }
      }

      object1.on('some-event', count, true);
      object2.on('some-event', count, true);

      var event = new ObjectEvent('some-event');
      event.bubbles = false;
      object2.emit('some-event', event);
    });

    it('should set the event phase to \'idle\' when the process is done', function(done) {
      var object1 = new ObjectEventEmitter();

      var event = new ObjectEvent('some-event');

      var handlerWasCalled = false;
      object1.on('some-event', function(event) {
        handlerWasCalled = true;
        expect(event.phase).to.equal('bubble');
      }, false);

      expect(event.phase).to.equal('idle');

      object1.emit('some-event', event);

      setTimeout(function() {
        expect(event.phase).to.equal('idle');
        expect(handlerWasCalled).to.equal(true);
        done();
      }, 16);
    });

    it('should invoke any handlers on the canvas instance if passed in', function(done) {
      var object1 = new ObjectEventEmitter();
      var canvas = new ObjectEventEmitter();

      canvas.on('some-event', function() {
        done();
      }, false);

      object1.emit('some-event', null, canvas);
    });

    it('should stop invoking handlers for any other objects if event.stopPropagation() was called', function(done) {
      var object1 = new ObjectEventEmitter();
      var object2 = new ObjectEventEmitter();
      var object3 = new ObjectEventEmitter();

      object3.parent = object2;
      object2.parent = object1;

      var num = 0;
      function count(event) {
        expect(event.phase).to.equal('bubble');
        num++;
        if (num === 2) {
          event.stopPropagation();
        }
      }

      object1.on('some-event', count, false);
      object2.on('some-event', count, false);
      object2.on('some-event', function(event) { count(event); }, false);
      object3.on('some-event', count, false);

      setTimeout(function() {
        expect(num).to.equal(3);
        done();
      }, 16);

      object3.emit('some-event');
    });

    it('should stop invoking any other handlers if event.stopImmediatePropagation() was called', function(done) {
      var object1 = new ObjectEventEmitter();
      var object2 = new ObjectEventEmitter();
      var object3 = new ObjectEventEmitter();

      object3.parent = object2;
      object2.parent = object1;

      var num = 0;
      function count(event) {
        expect(event.phase).to.equal('bubble');
        num++;
        if (num === 2) {
          event.stopImmediatePropagation();
        }
      }

      object1.on('some-event', count, false);
      object2.on('some-event', count, false);
      object2.on('some-event', function(event) { count(event); }, false);
      object3.on('some-event', count, false);

      setTimeout(function() {
        expect(num).to.equal(2);
        done();
      }, 16);

      object3.emit('some-event');
    });

  });

});
