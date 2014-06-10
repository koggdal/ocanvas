var expect = require('expect.js');
var normalizer = require('../../../../pointers/private/normalizer');

describe('pointers/normalizer', function() {

  describe('.normalizeType()', function() {

    it('should convert `mousedown` to `down`', function() {
      expect(normalizer.normalizeType('mousedown')).to.equal('down');
    });

    it('should convert `mouseup` to `up`', function() {
      expect(normalizer.normalizeType('mouseup')).to.equal('up');
    });

    it('should convert `mousemove` to `move`', function() {
      expect(normalizer.normalizeType('mousemove')).to.equal('move');
    });

    it('should convert `mouseout` to `out`', function() {
      expect(normalizer.normalizeType('mouseout')).to.equal('out');
    });

    it('should convert `dblclick` to `dblclick`', function() {
      expect(normalizer.normalizeType('dblclick')).to.equal('dblclick');
    });

    it('should convert `pointerdown` to `down`', function() {
      expect(normalizer.normalizeType('pointerdown')).to.equal('down');
    });

    it('should convert `pointerup` to `up`', function() {
      expect(normalizer.normalizeType('pointerup')).to.equal('up');
    });

    it('should convert `pointermove` to `move`', function() {
      expect(normalizer.normalizeType('pointermove')).to.equal('move');
    });

    it('should convert `pointerout` to `out`', function() {
      expect(normalizer.normalizeType('pointerout')).to.equal('out');
    });

    it('should convert `pointercancel` to `cancel`', function() {
      expect(normalizer.normalizeType('pointercancel')).to.equal('cancel');
    });

    it('should convert `MSPointerDown` to `down`', function() {
      expect(normalizer.normalizeType('MSPointerDown')).to.equal('down');
    });

    it('should convert `MSPointerUp` to `up`', function() {
      expect(normalizer.normalizeType('MSPointerUp')).to.equal('up');
    });

    it('should convert `MSPointerMove` to `move`', function() {
      expect(normalizer.normalizeType('MSPointerMove')).to.equal('move');
    });

    it('should convert `MSPointerOut` to `out`', function() {
      expect(normalizer.normalizeType('MSPointerOut')).to.equal('out');
    });

    it('should convert `MSPointerCancel` to `cancel`', function() {
      expect(normalizer.normalizeType('MSPointerCancel')).to.equal('cancel');
    });

    it('should convert `touchstart` to `down`', function() {
      expect(normalizer.normalizeType('touchstart')).to.equal('down');
    });

    it('should convert `touchend` to `up`', function() {
      expect(normalizer.normalizeType('touchend')).to.equal('up');
    });

    it('should convert `touchmove` to `move`', function() {
      expect(normalizer.normalizeType('touchmove')).to.equal('move');
    });

    it('should convert `touchcancel` to `cancel`', function() {
      expect(normalizer.normalizeType('touchcancel')).to.equal('cancel');
    });

    it('should convert an unknown type to an empty string', function() {
      expect(normalizer.normalizeType('myrandomtype')).to.equal('');
    });

  });

  describe('.genericHandler()', function() {

    it('should prevent the default action for a touchend event', function(done) {
      var event = {
        type: 'touchend',
        preventDefault: function() {
          done();
        }
      };
      normalizer.genericHandler(event);
    });

    it('should prevent the default action for a mousedown event that happened quickly after a touchstart', function(done) {
      normalizer.genericHandler({type: 'touchstart'});

      setTimeout(function() {
        normalizer.genericHandler({
          type: 'mousedown',
          preventDefault: function() {
            done();
          }
        });
      }, 50);
    });

    it('should not prevent the default action for a mousedown event that happened slightly longer after a touchstart', function(done) {
      normalizer.genericHandler({type: 'touchstart'});

      var called = false;

      setTimeout(function() {
        normalizer.genericHandler({
          type: 'mousedown',
          preventDefault: function() {
            called = true;
          }
        });
        setTimeout(function() {
          expect(called).to.equal(false);
          done();
        }, 10);
      }, 1000);
    });

    it('should return false for a mousedown event that happened quickly after a touchstart', function(done) {
      normalizer.genericHandler({type: 'touchstart'});

      setTimeout(function() {
        var returnValue = normalizer.genericHandler({
          type: 'mousedown',
          preventDefault: function() {}
        });
        expect(returnValue).to.equal(false);
        done();
      }, 50);
    });

    it('should return true for other events', function() {
      var returnValue = normalizer.genericHandler({type: 'touchstart'});
      expect(returnValue).to.equal(true);
    });

  });

  describe('.addListenersForType()', function() {

    it('should add a listener on the element for all event types for the specified pointer type', function(done) {
      var handler = function() {};
      var typeCounter = 0;
      var types = normalizer.eventTypes.mouse;
      var element = {
        addEventListener: function(type, eventHandler) {
          expect(type).to.equal(types[typeCounter]);
          expect(eventHandler).to.equal(handler);
          typeCounter++;
        }
      };
      normalizer.addListenersForType('mouse', element, handler);

      setTimeout(function() {
        expect(typeCounter).to.equal(types.length);
        done();
      }, 10);
    });

    it('should not do anything if an unrecognized pointer type was passed', function(done) {
      var typeCounter = 0;
      var element = {
        addEventListener: function() { typeCounter++; }
      };
      normalizer.addListenersForType('invalidpointer', element, function() {});

      setTimeout(function() {
        expect(typeCounter).to.equal(0);
        done();
      }, 10);
    });

  });

  describe('.removeListenersForType()', function() {

    it('should remove a listener on the element for all event types for the specified pointer type', function(done) {
      var handler = function() {};
      var typeCounter = 0;
      var types = normalizer.eventTypes.mouse;
      var element = {
        removeEventListener: function(type, eventHandler) {
          expect(type).to.equal(types[typeCounter]);
          expect(eventHandler).to.equal(handler);
          typeCounter++;
        }
      };
      normalizer.removeListenersForType('mouse', element, handler);

      setTimeout(function() {
        expect(typeCounter).to.equal(types.length);
        done();
      }, 10);
    });

    it('should not do anything if an unrecognized pointer type was passed', function(done) {
      var typeCounter = 0;
      var element = {
        removeEventListener: function() { typeCounter++; }
      };
      normalizer.removeListenersForType('invalidpointer', element, function() {});

      setTimeout(function() {
        expect(typeCounter).to.equal(0);
        done();
      }, 10);
    });

  });

  describe('.addListeners()', function() {

    beforeEach(function() {
      normalizer.elements.length = 0;
      normalizer.handlers.length = 0;
    });

    after(function() {
      normalizer.elements.length = 0;
      normalizer.handlers.length = 0;
    });

    it('should store the element for later', function() {
      var element = {addEventListener: function() {}};
      normalizer.addListeners(element, function() {});
      expect(normalizer.elements[0]).to.equal(element);
    });

    it('should store the handler for later', function() {
      var element = {addEventListener: function() {}};
      var handler = function() {};
      normalizer.addListeners(element, handler);
      expect(normalizer.handlers[0].handler).to.equal(handler);
    });

    it('should add a listener for dblclick', function(done) {
      var receivedTypes = [];
      var element = {
        addEventListener: function(type, handler) {
          receivedTypes.push(type);
        }
      };

      normalizer.addListeners(element, function() {});

      setTimeout(function() {
        expect(receivedTypes.indexOf('dblclick') > -1).to.equal(true);
        done();
      }, 10);
    });

    it('should add listeners for mouse and touch if Pointer Events are not available', function(done) {
      var mouseTypes = normalizer.eventTypes.mouse;
      var touchTypes = normalizer.eventTypes.touch;
      var types = mouseTypes.concat(touchTypes);

      var receivedTypes = [];

      var element = {
        addEventListener: function(type, handler) {
          receivedTypes.push(type);
        }
      };

      normalizer.addListeners(element, function() {});

      setTimeout(function() {
        types.forEach(function(type) {
          expect(receivedTypes.indexOf(type) > -1).to.equal(true);
        });
        done();
      }, 10);
    });

    it('should add listeners for Pointer Events if supported', function(done) {
      var types = normalizer.eventTypes.pointer;

      var receivedTypes = [];

      var element = {
        addEventListener: function(type, handler) {
          receivedTypes.push(type);
        }
      };

      global.PointerEvent = function() {};
      normalizer.addListeners(element, function() {});
      delete global.PointerEvent;

      setTimeout(function() {
        types.forEach(function(type) {
          expect(receivedTypes.indexOf(type) > -1).to.equal(true);
        });
        done();
      }, 10);
    });

    // MSHoldVisual is only available in IE10 and above, which is where
    // Pointer Events is implemented. Given that Pointer Events is becoming
    // a specification, Pointer Events might exist even when MSHoldVisual does
    // not, but there's no harm in still listening for it.
    it('should add a listener for MSHoldVisual if Pointer Events are supported', function(done) {
      var receivedTypes = [];

      var element = {
        addEventListener: function(type, handler) {
          receivedTypes.push(type);
        }
      };

      global.PointerEvent = function() {};
      normalizer.addListeners(element, function() {});
      delete global.PointerEvent;

      setTimeout(function() {
        expect(receivedTypes.indexOf('MSHoldVisual') > -1).to.equal(true);
        done();
      }, 10);
    });

    it('should not do anything if the element already has listeners', function() {
      var calls = 0;
      var element = {addEventListener: function() { calls++; }};

      normalizer.addListeners(element, function() {});
      expect(normalizer.elements.length).to.equal(1);

      var callsAfterFirst = calls;

      normalizer.addListeners(element, function() {});
      expect(normalizer.elements.length).to.equal(1);

      expect(calls).to.equal(callsAfterFirst);
    });

    it('should run the passed handler function if a touchstart event happens', function(done) {
      var event = {type: 'touchstart'};
      var pointerHandler;
      var element = {
        addEventListener: function(type, handler) {
          if (type === 'touchstart') {
            pointerHandler = handler;
          }
        }
      };
      normalizer.addListeners(element, function(normalizedType, eventObject) {
        expect(normalizedType).to.equal('down');
        expect(eventObject).to.equal(event);
        done();
      });

      setTimeout(function() {
        expect(pointerHandler).to.be.a('function');
        pointerHandler(event);
      }, 10);
    });

    it('should not run the passed handler function if a mousedown event happens quickly after a touchstart', function(done) {
      var pointerHandlerTouchstart;
      var pointerHandlerMousedown;
      var element = {
        addEventListener: function(type, handler) {
          if (type === 'touchstart') {
            pointerHandlerTouchstart = handler;
          }
          if (type === 'mousedown') {
            pointerHandlerMousedown = handler;
          }
        }
      };

      var called = false;
      normalizer.addListeners(element, function(normalizedType, eventObject) {
        if (eventObject.type === 'mousedown') {
          called = true;
        }
      });

      setTimeout(function() {
        expect(pointerHandlerTouchstart).to.be.a('function');
        expect(pointerHandlerMousedown).to.be.a('function');

        pointerHandlerTouchstart({type: 'touchstart'});

        setTimeout(function() {
          pointerHandlerMousedown({
            type: 'mousedown',
            preventDefault: function() {}
          });

          setTimeout(function() {
            expect(called).to.equal(false);
            done();
          }, 10);
        }, 50);
      }, 10);
    });

    it('should run the passed handler function if a mousedown event happens slightly longer after a touchstart', function(done) {
      var pointerHandlerTouchstart;
      var pointerHandlerMousedown;
      var element = {
        addEventListener: function(type, handler) {
          if (type === 'touchstart') {
            pointerHandlerTouchstart = handler;
          }
          if (type === 'mousedown') {
            pointerHandlerMousedown = handler;
          }
        }
      };

      normalizer.addListeners(element, function(normalizedType, eventObject) {
        if (eventObject.type === 'mousedown') {
          done();
        }
      });

      setTimeout(function() {
        expect(pointerHandlerTouchstart).to.be.a('function');
        expect(pointerHandlerMousedown).to.be.a('function');

        pointerHandlerTouchstart({type: 'touchstart'});

        setTimeout(function() {
          pointerHandlerMousedown({
            type: 'mousedown',
            preventDefault: function() {}
          });
        }, 1000);
      }, 10);
    });

    it('should prevent the default action of MSHoldVisual', function(done) {
      var holdHandler;
      var element = {
        addEventListener: function(type, handler) {
          if (type === 'MSHoldVisual') {
            holdHandler = handler;
          }
        }
      };

      global.PointerEvent = function() {};
      normalizer.addListeners(element, function() {});
      delete global.PointerEvent;

      setTimeout(function() {
        expect(holdHandler).to.be.a('function');
        var event = {
          type: 'MSHoldVisual',
          preventDefault: function() {
            done();
          }
        };
        holdHandler.call(element, event);
      }, 10);
    });

  });

  describe('.removeListeners()', function() {

    beforeEach(function() {
      normalizer.elements.length = 0;
      normalizer.handlers.length = 0;
    });

    after(function() {
      normalizer.elements.length = 0;
      normalizer.handlers.length = 0;
    });

    it('should remove the element from storage', function() {
      var element = {
        addEventListener: function() {},
        removeEventListener: function() {}
      };
      normalizer.addListeners(element, function() {});

      expect(normalizer.elements[0]).to.equal(element);

      normalizer.removeListeners(element);

      expect(normalizer.elements[0]).to.not.be.ok();
    });

    it('should remove the handler from storage', function() {
      var element = {
        addEventListener: function() {},
        removeEventListener: function() {}
      };

      var handler = function() {};
      normalizer.addListeners(element, handler);
      expect(normalizer.handlers[0].handler).to.equal(handler);

      normalizer.removeListeners(element);
      expect(normalizer.handlers[0]).to.not.be.ok();
    });

    it('should not do anything if the element was not found in storage', function() {
      normalizer.elements.length = 2;
      normalizer.handlers.length = 2;

      var element = {
        removeEventListener: function() {}
      };

      normalizer.removeListeners(element);

      expect(normalizer.elements.length).to.equal(2);
      expect(normalizer.handlers.length).to.equal(2);
    });

    it('should remove a listener for dblclick', function(done) {
      var receivedTypes = [];
      var element = {
        addEventListener: function() {},
        removeEventListener: function(type, handler) {
          receivedTypes.push(type);
        }
      };

      normalizer.addListeners(element, function() {});
      normalizer.removeListeners(element);

      setTimeout(function() {
        expect(receivedTypes.indexOf('dblclick') > -1).to.equal(true);
        done();
      }, 10);
    });

    it('should remove listeners for mouse and touch if Pointer Events are not available', function(done) {
      var mouseTypes = normalizer.eventTypes.mouse;
      var touchTypes = normalizer.eventTypes.touch;
      var types = mouseTypes.concat(touchTypes);

      var receivedTypes = [];

      var element = {
        addEventListener: function() {},
        removeEventListener: function(type, handler) {
          receivedTypes.push(type);
        }
      };

      normalizer.addListeners(element, function() {});
      normalizer.removeListeners(element);

      setTimeout(function() {
        types.forEach(function(type) {
          expect(receivedTypes.indexOf(type) > -1).to.equal(true);
        });
        done();
      }, 10);
    });

    it('should remove listeners for Pointer Events if supported', function(done) {
      var types = normalizer.eventTypes.pointer;

      var receivedTypes = [];

      var element = {
        addEventListener: function() {},
        removeEventListener: function(type, handler) {
          receivedTypes.push(type);
        }
      };

      global.PointerEvent = function() {};
      normalizer.addListeners(element, function() {});
      normalizer.removeListeners(element);
      delete global.PointerEvent;

      setTimeout(function() {
        types.forEach(function(type) {
          expect(receivedTypes.indexOf(type) > -1).to.equal(true);
        });
        done();
      }, 10);
    });

    // MSHoldVisual is only available in IE10 and above, which is where
    // Pointer Events is implemented. Given that Pointer Events is becoming
    // a specification, Pointer Events might exist even when MSHoldVisual does
    // not, but there's no harm in still listening for it.
    it('should remove a listener for MSHoldVisual if Pointer Events are supported', function(done) {
      var receivedTypes = [];

      var element = {
        addEventListener: function() {},
        removeEventListener: function(type, handler) {
          receivedTypes.push(type);
        }
      };

      global.PointerEvent = function() {};
      normalizer.addListeners(element, function() {});
      normalizer.removeListeners(element);
      delete global.PointerEvent;

      setTimeout(function() {
        expect(receivedTypes.indexOf('MSHoldVisual') > -1).to.equal(true);
        done();
      }, 10);
    });

  });

});