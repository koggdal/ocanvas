var expect = require('expect.js');
var mixin = require('../../../utils/mixin');
var EventEmitter = require('../../../mixins/EventEmitter');

describe('EventEmitter', function() {

  describe('.listeners', function() {

    it('should be `null` initially', function() {
      var emitter = mixin({}, EventEmitter);
      expect(emitter.listeners).to.equal(null);
    });

  });

  describe('.on()', function() {

    it('should add a handler function to the listener storage', function() {
      var emitter = mixin({}, EventEmitter);

      var handler = function() {};
      emitter.on('some-event', handler);

      expect(emitter.listeners['some-event']).to.be.ok();
      expect(emitter.listeners['some-event'].length).to.equal(1);
      expect(emitter.listeners['some-event'][0]).to.equal(handler);
    });

    it('should not add a handler function to the listener storage if it is already added', function() {
      var emitter = mixin({}, EventEmitter);

      var handler = function() {};
      emitter.on('some-event', handler);
      emitter.on('some-event', handler);

      expect(emitter.listeners['some-event']).to.be.ok();
      expect(emitter.listeners['some-event'].length).to.equal(1);
      expect(emitter.listeners['some-event'][0]).to.equal(handler);
    });

    it('should add a handler function for an event', function(done) {
      var emitter = mixin({}, EventEmitter);

      emitter.on('some-event', function() {
        done();
      });

      emitter.emit('some-event');
    });

  });

  describe('.off()', function() {

    it('should remove a handler function from the listener storage', function() {
      var emitter = mixin({}, EventEmitter);

      var handler = function() {};
      emitter.on('some-event', handler);
      emitter.off('some-event', handler);

      expect(emitter.listeners['some-event']).to.be.ok();
      expect(emitter.listeners['some-event'].length).to.equal(0);
    });

    it('should handle removing a handler for an event type that has not been added', function() {
      var emitter = mixin({}, EventEmitter);

      expect(emitter.listeners).to.not.be.ok();
      emitter.off('some-event', function() {});
      expect(emitter.listeners).to.not.be.ok();

      emitter.on('some-other-event', function() {});
      expect(emitter.listeners['some-other-event']).to.be.ok();

      emitter.off('some-event', function() {});
      expect(emitter.listeners['some-event']).to.not.be.ok();
    });

    it('should handle removing a handler that has not been added', function() {
      var emitter = mixin({}, EventEmitter);

      var handler1 = function() {};
      var handler2 = function() {};
      emitter.on('some-event', handler1);
      emitter.off('some-event', handler2);

      expect(emitter.listeners['some-event']).to.be.ok();
      expect(emitter.listeners['some-event'].length).to.equal(1);
      expect(emitter.listeners['some-event'][0]).to.equal(handler1);
    });

    it('should remove a handler function for an event', function(done) {
      var emitter = mixin({}, EventEmitter);
      var hasBeenCalled = false;

      var handler = function() {
        hasBeenCalled = true;
      };

      emitter.on('some-event', handler);

      emitter.off('some-event', handler);

      emitter.emit('some-event');

      setTimeout(function() {
        if (hasBeenCalled) {
          done(new Error('The off method does not remove the handler.'));
        } else {
          done();
        }
      }, 10);

    });

  });

  describe('.emit()', function() {

    it('should call all handler functions for the event', function(done) {
      var emitter = mixin({}, EventEmitter);
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

    it('should call the handler function for the event with the passed event object', function(done) {
      var emitter = mixin({}, EventEmitter);

      emitter.on('some-event', function(event) {
        expect(event.property).to.equal('value');
        done();
      });

      emitter.emit('some-event', {property: 'value'});
    });

    it('should call the handler function for the event with an event object with a type property', function(done) {
      var emitter = mixin({}, EventEmitter);

      var numCalls = 0;
      function checkDone() {
        if (++numCalls === 2) done();
      }

      emitter.on('some-event', function(event) {
        expect(event.type).to.equal('some-event');
        checkDone();
      });
      emitter.on('some-other-event', function(event) {
        expect(event.type).to.equal('some-other-event');
        checkDone();
      });

      emitter.emit('some-event', {property: 'value'});
      emitter.emit('some-other-event');
    });

    it('should use a snapshot of the handlers added at the time of the emit call', function(done) {
      var emitter = mixin({}, EventEmitter);

      var calls = 0;
      var handler1 = function() {
        calls++;
        emitter.off('some-event', handler2);
      };
      var handler2 = function() { calls++; };
      var handler3 = function() { calls++; };

      emitter.on('some-event', handler1);
      emitter.on('some-event', handler2);
      emitter.on('some-event', handler3);

      emitter.emit('some-event');

      setTimeout(function() {
        expect(calls).to.equal(3);
        done();
      }, 10);
    });

  });

});
