var expect = require('expect.js');
var PointerEvent = require('../../../classes/PointerEvent');
var ObjectEvent = require('../../../classes/ObjectEvent');

describe('PointerEvent', function() {

  it('should inherit from ObjectEvent', function() {
    var event = new PointerEvent();
    expect(PointerEvent.prototype instanceof ObjectEvent).to.equal(true);
    expect(event instanceof ObjectEvent).to.equal(true);
  });

  it('should have a list of known event types and their settings', function() {
    expect(typeof PointerEvent.TYPES).to.equal('object');
    expect(typeof PointerEvent.TYPES.pointerdown).to.equal('object');
    expect(typeof PointerEvent.TYPES.pointerup).to.equal('object');
    expect(typeof PointerEvent.TYPES.pointermove).to.equal('object');
    expect(typeof PointerEvent.TYPES.pointerdownmove).to.equal('object');
    expect(typeof PointerEvent.TYPES.pointerenter).to.equal('object');
    expect(typeof PointerEvent.TYPES.pointerleave).to.equal('object');
    expect(typeof PointerEvent.TYPES.pointerclick).to.equal('object');
  });

  describe('PointerEvent constructor', function() {

    it('should set the default value of property `position` to an object', function() {
      var event = new PointerEvent();
      expect(typeof event.position).to.equal('object');
    });

    it('should give the `position` object `element` coordinates', function() {
      var event = new PointerEvent();
      expect(typeof event.position.element).to.equal('object');
      expect(event.position.element.x).to.equal(0);
      expect(event.position.element.y).to.equal(0);
    });

    it('should give the `position` object `canvas` coordinates', function() {
      var event = new PointerEvent();
      expect(typeof event.position.canvas).to.equal('object');
      expect(event.position.canvas.x).to.equal(0);
      expect(event.position.canvas.y).to.equal(0);
    });

    it('should give the `position` object `world` coordinates', function() {
      var event = new PointerEvent();
      expect(typeof event.position.world).to.equal('object');
      expect(event.position.world.x).to.equal(0);
      expect(event.position.world.y).to.equal(0);
    });

    it('should give the `position` object `target` coordinates', function() {
      var event = new PointerEvent();
      expect(typeof event.position.target).to.equal('object');
      expect(event.position.target.x).to.equal(0);
      expect(event.position.target.y).to.equal(0);
    });

    it('should set the default value of property `bubbles` for known types', function() {
      var types = PointerEvent.TYPES;
      for (var type in types) {
        if (types.hasOwnProperty(type)) {
          var event = new PointerEvent(type);
          expect(event.bubbles).to.equal(types[type].bubbles);
        }
      }
    });

    it('should set the default value of property `targetPointerCount` to 0', function() {
      var event = new PointerEvent();
      expect(event.targetPointerCount).to.equal(0);
    });

    it('should set the `type` property if type is passed', function() {
      var event = new PointerEvent('some-event');
      expect(event.type).to.equal('some-event');
    });

    it('should set the `bubbles` property if passed', function() {
      var event = new PointerEvent({bubbles: false});
      expect(event.bubbles).to.equal(false);
    });

    it('should set the `targetPointerCount` property if passed', function() {
      var event = new PointerEvent({targetPointerCount: 5});
      expect(event.targetPointerCount).to.equal(5);
    });

    it('should set the `position` property if passed', function() {
      var position = {};
      var event = new PointerEvent({position: position});
      expect(event.position).to.equal(position);
    });

    it('should set the `buttons` property if passed', function() {
      var buttons = {};
      var event = new PointerEvent({buttons: buttons});
      expect(event.buttons).to.equal(buttons);
    });

    it('should set the `keys` property if passed', function() {
      var keys = {};
      var event = new PointerEvent({keys: keys});
      expect(event.keys).to.equal(keys);
    });

  });

});
