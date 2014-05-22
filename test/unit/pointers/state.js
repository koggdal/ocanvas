var expect = require('expect.js');
var state = require('../../../pointers/state');
var PointerData = require('../../../pointers/PointerData');
var CanvasObject = require('../../../shapes/base/CanvasObject');
var Canvas = require('../../../classes/Canvas');
var Scene = require('../../../classes/Scene');

describe('pointers/state', function() {

  var id = 0;

  describe('.setFrontObject()', function() {

    it('should set an object as being the front object for a pointer', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();
      state.setFrontObject(pointer, object);

      expect(state.frontObjects[pointer.id]).to.equal(object);
    });

    it('should unset an object from being the front object for a pointer if no object is passed', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();

      state.setFrontObject(pointer, object);

      expect(state.frontObjects[pointer.id]).to.equal(object);

      state.setFrontObject(pointer);

      expect(state.frontObjects[pointer.id]).to.not.be.ok();
    });

  });

  describe('.getFrontObject()', function() {

    it('should return the object set as being the front object for a pointer', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();
      state.setFrontObject(pointer, object);

      expect(state.getFrontObject(pointer)).to.equal(object);
    });

    it('should return null if no object is set as the front object for a pointer', function() {
      var pointer = new PointerData({id: (++id).toString(36)});

      expect(state.getFrontObject(pointer)).to.equal(null);
    });

  });

  describe('.enterCanvas()', function() {

    it('should set a pointer to have entered the canvas', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      state.enterCanvas(pointer);

      expect(state.pointersEnteredCanvas[pointer.id]).to.equal(true);
    });

  });

  describe('.leaveCanvas()', function() {

    it('should set a pointer to have left the canvas', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      state.enterCanvas(pointer);

      expect(state.pointersEnteredCanvas[pointer.id]).to.equal(true);

      state.leaveCanvas(pointer);

      expect(state.pointersEnteredCanvas[pointer.id]).to.equal(undefined);
    });

  });

  describe('.hasEnteredCanvas()', function() {

    it('should return true if the pointer has entered the canvas', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      state.enterCanvas(pointer);

      expect(state.hasEnteredCanvas(pointer)).to.equal(true);
    });

    it('should return false if the pointer has not entered the canvas', function() {
      var pointer = new PointerData({id: (++id).toString(36)});

      expect(state.hasEnteredCanvas(pointer)).to.equal(false);
    });

    it('should return false if the pointer has entered the canvas and then left again', function() {
      var pointer = new PointerData({id: (++id).toString(36)});

      state.enterCanvas(pointer);
      state.leaveCanvas(pointer);

      expect(state.hasEnteredCanvas(pointer)).to.equal(false);
    });

  });

  describe('.getPointerCountForObject()', function() {

    it('should return the number of pointers that have the passed object as front object', function() {
      var pointer1 = new PointerData({id: (++id).toString(36)});
      var pointer2 = new PointerData({id: (++id).toString(36)});
      var pointer3 = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();

      state.setFrontObject(pointer1, object);
      state.setFrontObject(pointer2, object);
      state.setFrontObject(pointer3, object);

      expect(state.getPointerCountForObject(object)).to.equal(3);
    });

    it('should return the number of pointers that have the passed object as front object, if object is a canvas', function() {
      var pointer1 = new PointerData({id: (++id).toString(36)});
      var pointer2 = new PointerData({id: (++id).toString(36)});
      var canvas = new Canvas();

      state.setFrontObject(pointer1, canvas);
      state.setFrontObject(pointer2, canvas);

      expect(state.getPointerCountForObject(canvas)).to.equal(2);
    });

    it('should return the number of pointers that have the passed object as front object, if object is a scene', function() {
      var pointer1 = new PointerData({id: (++id).toString(36)});
      var pointer2 = new PointerData({id: (++id).toString(36)});
      var scene = new Scene();

      state.setFrontObject(pointer1, scene);
      state.setFrontObject(pointer2, scene);

      expect(state.getPointerCountForObject(scene)).to.equal(2);
    });

    it('should return the number of pointers that have a child of the passed object as front object', function() {
      var pointer1 = new PointerData({id: (++id).toString(36)});
      var pointer2 = new PointerData({id: (++id).toString(36)});
      var pointer3 = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();
      var child = new CanvasObject();

      object.children.add(child);

      state.setFrontObject(pointer1, child);
      state.setFrontObject(pointer2, child);
      state.setFrontObject(pointer3, child);

      expect(state.getPointerCountForObject(object)).to.equal(3);
    });

  });

  describe('.pressPointer()', function() {

    it('should set an object as being pressed by the pointer', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();
      state.pressPointer(pointer, object);

      expect(state.pressedObjects[pointer.id]).to.equal(object);
    });

  });

  describe('.releasePointer()', function() {

    it('should remove an object from being pressed by the pointer', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();

      state.pressPointer(pointer, object);
      expect(state.pressedObjects[pointer.id]).to.equal(object);

      state.releasePointer(pointer);
      expect(state.pressedObjects[pointer.id]).to.not.be.ok();
    });

  });

  describe('.getPressedObject()', function() {

    it('should return the object being pressed by the passed pointer', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();

      state.pressPointer(pointer, object);
      expect(state.getPressedObject(pointer)).to.equal(object);
    });

    it('should return null if the pointer is not pressed on any object', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      expect(state.getPressedObject(pointer)).to.equal(null);
    });

  });

  describe('.registerClick()', function() {

    it('should set the object as having been clicked', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();

      state.clickedObjects.length = 0;

      state.registerClick(pointer, object);
      expect(typeof state.clickedObjects[0]).to.equal('object');
      expect(state.clickedObjects[0].object).to.equal(object);
      expect(state.clickedObjects[0].counter).to.equal(1);
    });

    it('should increase the counter for an object if clicked within a certain interval', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();

      state.clickedObjects.length = 0;

      state.registerClick(pointer, object);
      expect(state.clickedObjects[0].counter).to.equal(1);

      state.registerClick(pointer, object);
      expect(state.clickedObjects[0].counter).to.equal(2);

      state.registerClick(pointer, object);
      expect(state.clickedObjects[0].counter).to.equal(3);
    });

    it('should automatically decrease the counter (and finally remove the object) after a certain interval', function(done) {
      var pointer = new PointerData({id: (++id).toString(36), type: 'touch'}); // touch will use a smaller timeout
      var object = new CanvasObject();

      state.clickedObjects.length = 0;

      state.registerClick(pointer, object);
      expect(state.clickedObjects[0].counter).to.equal(1);

      setTimeout(function() {
        state.registerClick(pointer, object);
        expect(state.clickedObjects[0].counter).to.equal(2);

        setTimeout(function() {
          expect(state.clickedObjects[0].counter).to.equal(1);

          setTimeout(function() {
            expect(state.clickedObjects[0]).to.not.be.ok();
            expect(state.clickedObjects.length).to.equal(0);
            done();
          }, 200);

        }, 400);

      }, 200);

    });

    it('should return the new click count for the object', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();

      state.clickedObjects.length = 0;

      var count = state.registerClick(pointer, object);
      expect(count).to.equal(1);
    });

  });

  describe('.getClickCount()', function() {

    it('should return the click count for an object', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();

      state.clickedObjects.length = 0;

      state.registerClick(pointer, object);

      expect(state.getClickCount(object)).to.equal(1);
    });

    it('should return zero for an object that has not been clicked', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();

      state.clickedObjects.length = 0;

      expect(state.getClickCount(object)).to.equal(0);
    });

  });

  describe('.clearClicks()', function() {

    it('should clear the clicks for the passed object', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();

      state.clickedObjects.length = 0;

      state.registerClick(pointer, object);

      expect(state.getClickCount(object)).to.equal(1);

      state.clearClicks(object);

      expect(state.getClickCount(object)).to.equal(0);
    });

    it('should keep the clicks for other objects', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();

      state.clickedObjects.length = 0;

      state.registerClick(pointer, object1);
      state.registerClick(pointer, object2);

      expect(state.getClickCount(object1)).to.equal(1);
      expect(state.getClickCount(object2)).to.equal(1);

      state.clearClicks(object1);

      expect(state.getClickCount(object1)).to.equal(0);
      expect(state.getClickCount(object2)).to.equal(1);
    });

  });

  describe('.reset()', function() {

    it('should reset all stored things', function() {
      var pointer = new PointerData({id: (++id).toString(36)});
      var object = new CanvasObject();

      state.enterCanvas(pointer);
      state.setFrontObject(pointer, object);
      state.pressPointer(pointer, object);
      state.registerClick(pointer, object);

      expect(state.hasEnteredCanvas(pointer)).to.equal(true);
      expect(state.getFrontObject(pointer)).to.equal(object);
      expect(state.getPressedObject(pointer)).to.equal(object);
      expect(state.getClickCount(object)).to.equal(1);

      state.reset(object);

      expect(state.hasEnteredCanvas(pointer)).to.equal(false);
      expect(state.getFrontObject(pointer)).to.equal(null);
      expect(state.getPressedObject(pointer)).to.equal(null);
      expect(state.getClickCount(object)).to.equal(0);
    });

  });

});
