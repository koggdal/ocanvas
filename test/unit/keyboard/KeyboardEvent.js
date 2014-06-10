var expect = require('expect.js');
var KeyboardEvent = require('../../../keyboard/KeyboardEvent');
var ObjectEvent = require('../../../classes/ObjectEvent');

describe('KeyboardEvent', function() {

  it('should inherit from ObjectEvent', function() {
    var event = new KeyboardEvent();
    expect(KeyboardEvent.prototype instanceof ObjectEvent).to.equal(true);
    expect(event instanceof ObjectEvent).to.equal(true);
  });

  it('should have a list of known event types', function() {
    expect(KeyboardEvent.TYPES).to.be.an('object');
    expect(KeyboardEvent.TYPES.keydown).to.be.an('object');
    expect(KeyboardEvent.TYPES.keyup).to.be.an('object');
    expect(KeyboardEvent.TYPES.keypress).to.be.an('object');
  });

  describe('KeyboardEvent constructor', function() {

    it('should set the `type` property if passed', function() {
      var event = new KeyboardEvent({type: 'some-event'});
      expect(event.type).to.equal('some-event');
    });

    it('should set the `bubbles` property if passed', function() {
      var event = new KeyboardEvent({bubbles: false});
      expect(event.bubbles).to.equal(false);
    });

    it('should set the `keyCode` property if passed', function() {
      var event = new KeyboardEvent({keyCode: 27});
      expect(event.keyCode).to.equal(27);
    });

    it('should set the `key` property if passed', function() {
      var event = new KeyboardEvent({key: 'Escape'});
      expect(event.key).to.equal('Escape');
    });

    it('should set the `originalEvent` property if passed', function() {
      var originalEvent = {};
      var event = new KeyboardEvent({originalEvent: originalEvent});
      expect(event.originalEvent).to.equal(originalEvent);
    });

    it('should set a custom property if passed', function() {
      var event = new KeyboardEvent({myProperty: 'value'});
      expect(event.myProperty).to.equal('value');
    });

  });

  describe('#preventDefault()', function() {

    it('should prevent the default action of the original event', function(done) {
      var originalEvent = {
        preventDefault: function() {
          done();
        }
      };

      var event = new KeyboardEvent({originalEvent: originalEvent});

      event.preventDefault();
    });

    it('should handle events with no `originalEvent` property', function() {
      var event = new KeyboardEvent({});

      event.preventDefault();
    });

  });

});
