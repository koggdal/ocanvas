var expect = require('expect.js');
var ObjectEvent = require('../../../classes/ObjectEvent');

describe('ObjectEvent', function() {

  describe('ObjectEvent constructor', function() {

    it('should set the `type` property if type is passed', function() {
      var event = new ObjectEvent('some-event');
      expect(event.type).to.equal('some-event');
    });

    it('should set the default value of property `type` to null', function() {
      var event = new ObjectEvent();
      expect(event.type).to.equal(null);
    });

    it('should set the default value of property `bubbles` to true', function() {
      var event = new ObjectEvent();
      expect(event.bubbles).to.equal(true);
    });

    it('should set the default value of property `phase` to \'idle\'', function() {
      var event = new ObjectEvent();
      expect(event.phase).to.equal('idle');
    });

    it('should set the default value of property `target` to null', function() {
      var event = new ObjectEvent();
      expect(event.target).to.equal(null);
    });

    it('should set the default value of property `currentTarget` to null', function() {
      var event = new ObjectEvent();
      expect(event.currentTarget).to.equal(null);
    });

    it('should set the default value of property `isPropagationStopped` to false', function() {
      var event = new ObjectEvent();
      expect(event.isPropagationStopped).to.equal(false);
    });

    it('should set the default value of property `isImmediatePropagationStopped` to false', function() {
      var event = new ObjectEvent();
      expect(event.isImmediatePropagationStopped).to.equal(false);
    });

  });

  describe('#stopPropagation()', function() {

    it('should set the `isPropagationStopped` property to true', function() {
      var event = new ObjectEvent();
      expect(event.isPropagationStopped).to.equal(false);
      event.stopPropagation();
      expect(event.isPropagationStopped).to.equal(true);
    });

  });

  describe('#stopImmediatePropagation()', function() {

    it('should set the `isImmediatePropagationStopped` property to true', function() {
      var event = new ObjectEvent();
      expect(event.isImmediatePropagationStopped).to.equal(false);
      event.stopImmediatePropagation();
      expect(event.isImmediatePropagationStopped).to.equal(true);
    });

    it('should set the `isPropagationStopped` property to true', function() {
      var event = new ObjectEvent();
      expect(event.isPropagationStopped).to.equal(false);
      event.stopImmediatePropagation();
      expect(event.isPropagationStopped).to.equal(true);
    });

  });

});
