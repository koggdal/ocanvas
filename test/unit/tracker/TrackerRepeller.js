var expect = require('expect.js');

var TrackerRepeller = require('../../../tracker/TrackerRepeller');
var CanvasObject = require('../../../shapes/base/CanvasObject');

describe('TrackerRepeller', function() {

  describe('TrackerRepeller constructor', function() {

    it('should set the default value of `object` to null', function() {
      var repeller = new TrackerRepeller();
      expect(repeller.object).to.equal(null);
    });

    it('should set the default value of `range` to 0', function() {
      var repeller = new TrackerRepeller();
      expect(repeller.range).to.equal(0);
    });

    it('should set the default value of `priority` to 100', function() {
      var repeller = new TrackerRepeller();
      expect(repeller.priority).to.equal(100);
    });

    it('should set the provided value of `object`', function() {
      var myObject = new CanvasObject();
      var repeller = new TrackerRepeller({object: myObject});
      expect(repeller.object).to.equal(myObject);
    });

    it('should set the provided value of `range`', function() {
      var repeller = new TrackerRepeller({range: 150});
      expect(repeller.range).to.equal(150);
    });

    it('should set the provided value of `priority`', function() {
      var repeller = new TrackerRepeller({priority: 400});
      expect(repeller.priority).to.equal(400);
    });

    it('should set any provided property', function() {
      var repeller = new TrackerRepeller({myProperty: 800});
      expect(repeller.myProperty).to.equal(800);
    });

  });

  describe('#calculateTargetPosition()', function() {

    it('should repel the tracking object up and left when object is up and left from the repeller', function() {
      var target = new CanvasObject({x: 100, y: 200});
      var object = new CanvasObject({x: 200, y: 300});

      var repeller = new TrackerRepeller({
        object: new CanvasObject({x: 400, y: 600}),
        range: 600
      });

      var position = repeller.calculateTargetPosition(object, target);

      // Should be these values for the set range
      expect(position).to.be.an('object');
      expect(position.x < repeller.object.x).to.equal(true);
      expect(position.y < repeller.object.y).to.equal(true);
    });

    it('should repel the tracking object up and right when object is up and right from the repeller', function() {
      var target = new CanvasObject({x: 100, y: 200});
      var object = new CanvasObject({x: 600, y: 300});

      var repeller = new TrackerRepeller({
        object: new CanvasObject({x: 400, y: 600}),
        range: 600
      });

      var position = repeller.calculateTargetPosition(object, target);

      // Should be these values for the set range
      expect(position).to.be.an('object');
      expect(position.x > repeller.object.x).to.equal(true);
      expect(position.y < repeller.object.y).to.equal(true);
    });

    it('should repel the tracking object down and right when object is down and right from the repeller', function() {
      var target = new CanvasObject({x: 100, y: 200});
      var object = new CanvasObject({x: 600, y: 800});

      var repeller = new TrackerRepeller({
        object: new CanvasObject({x: 400, y: 600}),
        range: 600
      });

      var position = repeller.calculateTargetPosition(object, target);

      // Should be these values for the set range
      expect(position).to.be.an('object');
      expect(position.x > repeller.object.x).to.equal(true);
      expect(position.y > repeller.object.y).to.equal(true);
    });

    it('should repel the tracking object down and left when object is down and left from the repeller', function() {
      var target = new CanvasObject({x: 100, y: 200});
      var object = new CanvasObject({x: 200, y: 800});

      var repeller = new TrackerRepeller({
        object: new CanvasObject({x: 400, y: 600}),
        range: 600
      });

      var position = repeller.calculateTargetPosition(object, target);

      // Should be these values for the set range
      expect(position).to.be.an('object');
      expect(position.x < repeller.object.x).to.equal(true);
      expect(position.y > repeller.object.y).to.equal(true);
    });

  });

});
