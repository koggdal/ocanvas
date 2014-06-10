var expect = require('expect.js');
var PointerData = require('../../../../pointers/private/PointerData');

describe('PointerData', function() {

  describe('PointerData constructor', function() {

    it('should set the default value of property `id` to an empty string', function() {
      var data = new PointerData();
      expect(data.id).to.equal('');
    });

    it('should set the default value of property `type` to `unknown`', function() {
      var data = new PointerData();
      expect(data.type).to.equal('unknown');
    });

    it('should set the default value of property `interactionType` to `unknown`', function() {
      var data = new PointerData();
      expect(data.interactionType).to.equal('unknown');
    });

    it('should set the default value of property `x` to 0', function() {
      var data = new PointerData();
      expect(data.x).to.equal(0);
    });

    it('should set the default value of property `y` to 0', function() {
      var data = new PointerData();
      expect(data.y).to.equal(0);
    });

    it('should set the default value of property `keys` to an object with false values and count', function() {
      var data = new PointerData();
      expect(typeof data.keys).to.equal('object');
      expect(data.keys.ctrl).to.equal(false);
      expect(data.keys.alt).to.equal(false);
      expect(data.keys.shift).to.equal(false);
      expect(data.keys.meta).to.equal(false);
      expect(data.keys.count).to.equal(0);
    });

    it('should set the default value of property `buttons` to an object with false values and count', function() {
      var data = new PointerData();
      expect(typeof data.buttons).to.equal('object');
      expect(data.buttons.primary).to.equal(false);
      expect(data.buttons.secondary).to.equal(false);
      expect(data.buttons.auxiliary).to.equal(false);
      expect(data.buttons.extra1).to.equal(false);
      expect(data.buttons.extra2).to.equal(false);
      expect(data.buttons.extra3).to.equal(false);
      expect(data.buttons.count).to.equal(0);
    });

    it('should set the `id` property if passed', function() {
      var data = new PointerData({id: 'myid'});
      expect(data.id).to.equal('myid');
    });

    it('should set the `type` property if passed', function() {
      var data = new PointerData({type: 'mouse'});
      expect(data.type).to.equal('mouse');
    });

    it('should set the `interactionType` property if passed', function() {
      var data = new PointerData({interactionType: 'mouse'});
      expect(data.interactionType).to.equal('mouse');
    });

    it('should set the `x` property if passed', function() {
      var data = new PointerData({x: 50});
      expect(data.x).to.equal(50);
    });

    it('should set the `y` property if passed', function() {
      var data = new PointerData({y: 50});
      expect(data.y).to.equal(50);
    });

    it('should set the `keys` property if passed', function() {
      var keys = {};
      var data = new PointerData({keys: keys});
      expect(data.keys).to.equal(keys);
    });

    it('should set the `buttons` property if passed', function() {
      var buttons = {};
      var data = new PointerData({buttons: buttons});
      expect(data.buttons).to.equal(buttons);
    });

  });

  describe('#setProperties()', function() {

    it('should set any properties passed in', function() {
      var data = new PointerData();
      expect(data.name).to.equal(undefined);
      data.setProperties({
        name: 'Data'
      });
      expect(data.name).to.equal('Data');
    });

  });

  describe('#getTypeFromEvent()', function() {

    var data;
    before(function() {
      data = new PointerData();
    });

    it('should return `mouse` for a mouse event', function() {
      expect(data.getTypeFromEvent({type: 'mousedown'})).to.equal('mouse');
    });

    it('should return `mouse` for a click event', function() {
      expect(data.getTypeFromEvent({type: 'click'})).to.equal('mouse');
    });

    it('should return `mouse` for a double-click event', function() {
      expect(data.getTypeFromEvent({type: 'dblclick'})).to.equal('mouse');
    });

    it('should return `touch` for a touch event', function() {
      expect(data.getTypeFromEvent({type: 'touchstart'})).to.equal('touch');
    });

    it('should return `pointer` for a pointer event', function() {
      expect(data.getTypeFromEvent({type: 'pointerdown'})).to.equal('pointer');
    });

    it('should return `pointer` for a Microsoft pointer event', function() {
      expect(data.getTypeFromEvent({type: 'MSPointerDown'})).to.equal('pointer');
    });

    it('should return `unknown` for an event it cannot recognize', function() {
      expect(data.getTypeFromEvent({type: 'randomevent'})).to.equal('unknown');
    });

  });

  describe('#getInteractionTypeFromEvent()', function() {

    var data;
    before(function() {
      data = new PointerData();
    });

    it('should return `touch` for a touch event', function() {
      var type = data.getInteractionTypeFromEvent({type: 'touchstart'}, 'touch');
      expect(type).to.equal('touch');
    });

    it('should return `mouse` for a mouse event', function() {
      var type = data.getInteractionTypeFromEvent({type: 'mousedown'}, 'mouse');
      expect(type).to.equal('mouse');
    });

    it('should return `touch` for a pointer event of type touch', function() {
      var event = {type: 'pointerdown', pointerType: 'touch'};
      var type = data.getInteractionTypeFromEvent(event, 'pointer');
      expect(type).to.equal('touch');
    });

    it('should return `touch` for a pointer event of type pen', function() {
      var event = {type: 'pointerdown', pointerType: 'pen'};
      var type = data.getInteractionTypeFromEvent(event, 'pointer');
      expect(type).to.equal('touch');
    });

    it('should return `mouse` for a pointer event of type mouse', function() {
      var event = {type: 'pointerdown', pointerType: 'mouse'};
      var type = data.getInteractionTypeFromEvent(event, 'pointer');
      expect(type).to.equal('mouse');
    });

    it('should return `touch` for a pointer event (old spec) of type touch', function() {
      global.PointerEvent = function() {};
      global.PointerEvent.MSPOINTER_TYPE_TOUCH = 2;

      var event = {type: 'pointerdown', pointerType: global.PointerEvent.MSPOINTER_TYPE_TOUCH};
      var type = data.getInteractionTypeFromEvent(event, 'pointer');
      expect(type).to.equal('touch');

      delete global.PointerEvent;
    });

    it('should return `touch` for a pointer event (old spec) of type pen', function() {
      global.PointerEvent = function() {};
      global.PointerEvent.MSPOINTER_TYPE_PEN = 3;

      var event = {type: 'pointerdown', pointerType: global.PointerEvent.MSPOINTER_TYPE_PEN};
      var type = data.getInteractionTypeFromEvent(event, 'pointer');
      expect(type).to.equal('touch');

      delete global.PointerEvent;
    });

    it('should return `touch` for a pointer event (old spec) of type mouse', function() {
      global.PointerEvent = function() {};
      global.PointerEvent.MSPOINTER_TYPE_MOUSE = 4;

      var event = {type: 'pointerdown', pointerType: global.PointerEvent.MSPOINTER_TYPE_MOUSE};
      var type = data.getInteractionTypeFromEvent(event, 'pointer');
      expect(type).to.equal('mouse');

      delete global.PointerEvent;
    });

    it('should return `unknown` for an unknown event', function() {
      var type = data.getInteractionTypeFromEvent({type: 'randomevent'}, 'unknown');
      expect(type).to.equal('unknown');
    });

    it('should get the pointer type if not provided', function() {
      var type = data.getInteractionTypeFromEvent({type: 'touchstart'});
      expect(type).to.equal('touch');
    });

  });

  describe('#getKeysFromEvent()', function() {

    var data;
    before(function() {
      data = new PointerData();
    });

    it('should return an object with properties for all modifier keys', function() {
      var event = {
        ctrlKey: true,
        altKey: false,
        shiftKey: true,
        metaKey: false
      };
      var keys = data.getKeysFromEvent(event);
      expect(keys.ctrl).to.equal(true);
      expect(keys.alt).to.equal(false);
      expect(keys.shift).to.equal(true);
      expect(keys.meta).to.equal(false);
    });

    it('should return an object with a `count` property for the number of pressed modifier keys', function() {
      var event = {
        ctrlKey: true,
        altKey: false,
        shiftKey: true,
        metaKey: false
      };
      var keys = data.getKeysFromEvent(event);
      expect(keys.count).to.equal(2);
    });

  });

  describe('#normalizeButtonsFromEvent()', function() {

    var data;
    before(function() {
      data = new PointerData();
    });

    it('should return the passed bitmask if a `buttons` bitmask is available', function() {
      expect(data.normalizeButtonsFromEvent({buttons: 37})).to.equal(37);
    });

    it('should return 0 if a `which` is set to 0 (meaning no buttons are pressed)', function() {
      expect(data.normalizeButtonsFromEvent({which: 0})).to.equal(0);
    });

    it('should return 1 if `button` is set to 0 (meaning primary button)', function() {
      expect(data.normalizeButtonsFromEvent({button: 0})).to.equal(1);
    });

    it('should return 2 if `button` is set to 2 (meaning secondary button)', function() {
      expect(data.normalizeButtonsFromEvent({button: 2})).to.equal(2);
    });

    it('should return 4 if `button` is set to 1 (meaning auxiliary button)', function() {
      expect(data.normalizeButtonsFromEvent({button: 1})).to.equal(4);
    });

    it('should return 0 if there is no button data', function() {
      expect(data.normalizeButtonsFromEvent({})).to.equal(0);
    });

  });

  describe('#getButtonsFromEvent()', function() {

    var data;
    before(function() {
      data = new PointerData();
    });

    it('should return an object with properties for all buttons', function() {
      var buttons = data.getButtonsFromEvent({buttons: 37});
      expect(buttons.primary).to.equal(true);
      expect(buttons.secondary).to.equal(false);
      expect(buttons.auxiliary).to.equal(true);
      expect(buttons.extra1).to.equal(false);
      expect(buttons.extra2).to.equal(false);
      expect(buttons.extra3).to.equal(true);
    });

    it('should return an object with a `count` property for the number of pressed buttons', function() {
      var buttons = data.getButtonsFromEvent({buttons: 37});
      expect(buttons.count).to.equal(3);
    });

  });

  describe('#setDataFromEvent()', function() {

    it('should set the `id` property based on the `pointerId` property of the input object', function() {
      // The Pointer Events spec uses pointerId on PointerEvent interface
      var data = new PointerData();
      data.setDataFromEvent({pointerId: 563});
      expect(data.id).to.equal('563');
    });

    it('should set the `id` property based on the `identifier` property of the touch object', function() {
      // The Touch Events spec uses identifier on Touch interface
      var data = new PointerData();
      data.setDataFromEvent({}, {identifier: 458});
      expect(data.id).to.equal('458');
    });

    it('should set the `id` property to `mouse` for a mouse pointer', function() {
      // There can only be a single mouse pointer, so the identifier will then be set to 'mouse'
      // if it can't find `pointerId` or `identifier`.
      var data = new PointerData();
      data.setDataFromEvent({});
      expect(data.id).to.equal('mouse');
    });

    it('should set the `type` property to `mouse` for mouse events', function() {
      var data = new PointerData();
      data.setDataFromEvent({type: 'mousedown'});
      expect(data.type).to.equal('mouse');
    });

    it('should set the `type` property to `mouse` for click events', function() {
      var data = new PointerData();
      data.setDataFromEvent({type: 'click'});
      expect(data.type).to.equal('mouse');
    });

    it('should set the `type` property to `mouse` for dblclick events', function() {
      var data = new PointerData();
      data.setDataFromEvent({type: 'dblclick'});
      expect(data.type).to.equal('mouse');
    });

    it('should set the `type` property to `touch` for touch events', function() {
      var data = new PointerData();
      data.setDataFromEvent({type: 'touchstart'});
      expect(data.type).to.equal('touch');
    });

    it('should set the `type` property to `pointer` for pointer events', function() {
      var data = new PointerData();
      data.setDataFromEvent({type: 'pointerdown'});
      expect(data.type).to.equal('pointer');
    });

    it('should set the `interactionType` property to `mouse` for mouse events', function() {
      var data = new PointerData();
      data.setDataFromEvent({type: 'mousedown'});
      expect(data.interactionType).to.equal('mouse');
    });

    it('should set the `interactionType` property to `touch` for touch events', function() {
      var data = new PointerData();
      data.setDataFromEvent({type: 'touchstart'});
      expect(data.interactionType).to.equal('touch');
    });

    it('should set the `interactionType` property to `touch` for pointer events for touch pointers', function() {
      var data = new PointerData();
      data.setDataFromEvent({type: 'pointerdown', pointerType: 'touch'});
      expect(data.interactionType).to.equal('touch');
    });

    it('should set the `interactionType` property to `touch` for pointer events for pen pointers', function() {
      var data = new PointerData();
      data.setDataFromEvent({type: 'pointerdown', pointerType: 'pen'});
      expect(data.interactionType).to.equal('touch');
    });

    it('should set the `interactionType` property to `mouse` for pointer events for mouse pointers', function() {
      var data = new PointerData();
      data.setDataFromEvent({type: 'pointerdown', pointerType: 'mouse'});
      expect(data.interactionType).to.equal('mouse');
    });

    it('should set the `interactionType` property to `touch` for pointer events for touch pointers (old spec)', function() {
      global.PointerEvent = function() {};
      global.PointerEvent.MSPOINTER_TYPE_TOUCH = 2;

      var data = new PointerData();
      data.setDataFromEvent({type: 'pointerdown', pointerType: global.PointerEvent.MSPOINTER_TYPE_TOUCH});
      expect(data.interactionType).to.equal('touch');

      delete global.PointerEvent;
    });

    it('should set the `interactionType` property to `touch` for pointer events for pen pointers (old spec)', function() {
      global.PointerEvent = function() {};
      global.PointerEvent.MSPOINTER_TYPE_PEN = 3;

      var data = new PointerData();
      data.setDataFromEvent({type: 'pointerdown', pointerType: global.PointerEvent.MSPOINTER_TYPE_PEN});
      expect(data.interactionType).to.equal('touch');

      delete global.PointerEvent;
    });

    it('should set the `interactionType` property to `mouse` for pointer events for mouse pointers (old spec)', function() {
      global.PointerEvent = function() {};
      global.PointerEvent.MSPOINTER_TYPE_MOUSE = 4;

      var data = new PointerData();
      data.setDataFromEvent({type: 'pointerdown', pointerType: global.PointerEvent.MSPOINTER_TYPE_MOUSE});
      expect(data.interactionType).to.equal('mouse');

      delete global.PointerEvent;
    });

    it('should set the `x` property to the value of `pageX` of the input object', function() {
      var data = new PointerData();
      data.setDataFromEvent({pageX: 50});
      expect(data.x).to.equal(50);
    });

    it('should set the `y` property to the value of `pageY` of the input object', function() {
      var data = new PointerData();
      data.setDataFromEvent({pageY: 50});
      expect(data.y).to.equal(50);
    });

    it('should set the `keys` property to an object with values from the input object', function() {
      var data = new PointerData();
      data.setDataFromEvent({
        ctrlKey: true,
        altKey: true,
        shiftKey: true,
        metaKey: true
      });
      expect(typeof data.keys).to.equal('object');
      expect(data.keys.ctrl).to.equal(true);
      expect(data.keys.alt).to.equal(true);
      expect(data.keys.shift).to.equal(true);
      expect(data.keys.meta).to.equal(true);
      expect(data.keys.count).to.equal(4);
    });

    it('should set the `buttons` property to an object with values from the input object (mouse event with buttons)', function() {
      var data = new PointerData();
      data.setDataFromEvent({
        buttons: 37
      });
      expect(typeof data.buttons).to.equal('object');
      expect(data.buttons.primary).to.equal(true);
      expect(data.buttons.secondary).to.equal(false);
      expect(data.buttons.auxiliary).to.equal(true);
      expect(data.buttons.extra1).to.equal(false);
      expect(data.buttons.extra2).to.equal(false);
      expect(data.buttons.extra3).to.equal(true);
      expect(data.buttons.count).to.equal(3);
    });

    it('should set the `buttons` property to an object with values from the input object (mouse event with which set to 0)', function() {
      var data = new PointerData();
      data.setDataFromEvent({
        which: 0
      });
      expect(typeof data.buttons).to.equal('object');
      expect(data.buttons.primary).to.equal(false);
      expect(data.buttons.secondary).to.equal(false);
      expect(data.buttons.auxiliary).to.equal(false);
      expect(data.buttons.extra1).to.equal(false);
      expect(data.buttons.extra2).to.equal(false);
      expect(data.buttons.extra3).to.equal(false);
      expect(data.buttons.count).to.equal(0);
    });

    it('should set the `buttons` property to an object with values from the input object (mouse event with button)', function() {
      var data = new PointerData();
      data.setDataFromEvent({
        button: 1
      });
      expect(typeof data.buttons).to.equal('object');
      expect(data.buttons.primary).to.equal(false);
      expect(data.buttons.secondary).to.equal(false);
      expect(data.buttons.auxiliary).to.equal(true);
      expect(data.buttons.extra1).to.equal(false);
      expect(data.buttons.extra2).to.equal(false);
      expect(data.buttons.extra3).to.equal(false);
      expect(data.buttons.count).to.equal(1);
    });

    it('should accept a touch point as second argument', function() {
      var data = new PointerData();
      data.setDataFromEvent({
        ctrlKey: true,
        altKey: true,
        shiftKey: true,
        metaKey: true
      }, {pageX: 25, pageY: 40});

      expect(data.x).to.equal(25);
      expect(data.y).to.equal(40);

      expect(typeof data.keys).to.equal('object');
      expect(data.keys.ctrl).to.equal(true);
      expect(data.keys.alt).to.equal(true);
      expect(data.keys.shift).to.equal(true);
      expect(data.keys.meta).to.equal(true);
    });

  });

});
