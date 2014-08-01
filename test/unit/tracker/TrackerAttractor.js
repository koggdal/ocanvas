var expect = require('expect.js');

var TrackerAttractor = require('../../../tracker/TrackerAttractor');
var CanvasObject = require('../../../shapes/base/CanvasObject');

describe('TrackerAttractor', function() {

  describe('TrackerAttractor constructor', function() {

    it('should set the default value of `object` to null', function() {
      var attractor = new TrackerAttractor();
      expect(attractor.object).to.equal(null);
    });

    it('should set the default value of `range` to 0', function() {
      var attractor = new TrackerAttractor();
      expect(attractor.range).to.equal(0);
    });

    it('should set the default value of `priority` to 100', function() {
      var attractor = new TrackerAttractor();
      expect(attractor.priority).to.equal(100);
    });

    it('should set the provided value of `object`', function() {
      var myObject = new CanvasObject();
      var attractor = new TrackerAttractor({object: myObject});
      expect(attractor.object).to.equal(myObject);
    });

    it('should set the provided value of `range`', function() {
      var attractor = new TrackerAttractor({range: 150});
      expect(attractor.range).to.equal(150);
    });

    it('should set the provided value of `priority`', function() {
      var attractor = new TrackerAttractor({priority: 400});
      expect(attractor.priority).to.equal(400);
    });

    it('should set any provided property', function() {
      var attractor = new TrackerAttractor({myProperty: 800});
      expect(attractor.myProperty).to.equal(800);
    });

  });

  describe('#calculateTargetPosition()', function() {

    it('should return the position of the the attractor object', function() {
      var target = new CanvasObject({x: 100, y: 200});
      var object = new CanvasObject({x: 300, y: 600});

      var attractor = new TrackerAttractor({
        object: new CanvasObject({x: 400, y: 800}),
        range: 800
      });

      var position = attractor.calculateTargetPosition(object, target);

      expect(position).to.be.an('object');
      expect(position.x).to.equal(400);
      expect(position.y).to.equal(800);
    });

  });

});
