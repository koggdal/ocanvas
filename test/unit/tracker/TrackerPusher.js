var expect = require('expect.js');

var TrackerPusher = require('../../../tracker/TrackerPusher');
var CanvasObject = require('../../../shapes/base/CanvasObject');

describe('TrackerPusher', function() {

  describe('TrackerPusher constructor', function() {

    it('should set the default value of `object` to null', function() {
      var pusher = new TrackerPusher();
      expect(pusher.object).to.equal(null);
    });

    it('should set the default value of `range` to 0', function() {
      var pusher = new TrackerPusher();
      expect(pusher.range).to.equal(0);
    });

    it('should set the default value of `priority` to 100', function() {
      var pusher = new TrackerPusher();
      expect(pusher.priority).to.equal(100);
    });

    it('should set the default value of `angle` to 0', function() {
      var pusher = new TrackerPusher();
      expect(pusher.angle).to.equal(0);
    });

    it('should set the provided value of `object`', function() {
      var myObject = new CanvasObject();
      var pusher = new TrackerPusher({object: myObject});
      expect(pusher.object).to.equal(myObject);
    });

    it('should set the provided value of `range`', function() {
      var pusher = new TrackerPusher({range: 150});
      expect(pusher.range).to.equal(150);
    });

    it('should set the provided value of `priority`', function() {
      var pusher = new TrackerPusher({priority: 400});
      expect(pusher.priority).to.equal(400);
    });

    it('should set the provided value of `angle`', function() {
      var pusher = new TrackerPusher({angle: 40});
      expect(pusher.angle).to.equal(40);
    });

    it('should set any provided property', function() {
      var pusher = new TrackerPusher({myProperty: 800});
      expect(pusher.myProperty).to.equal(800);
    });

  });

  describe('#calculateTargetPosition()', function() {

    it('should push the tracking object up and right when angle is set to 0', function() {
      var object = new CanvasObject({x: 200, y: 300});
      var pusherObject = new CanvasObject({x: 400, y: 600});
      var position = getPusherPositionForAngle(0, object, pusherObject);

      expect(position).to.be.an('object');
      expect(position.x === pusherObject.x).to.equal(true);
      expect(position.y < pusherObject.y).to.equal(true);
    });

    it('should push the tracking object up and right when angle is set to 45', function() {
      var object = new CanvasObject({x: 200, y: 300});
      var pusherObject = new CanvasObject({x: 400, y: 600});
      var position = getPusherPositionForAngle(45, object, pusherObject);

      expect(position).to.be.an('object');
      expect(position.x > pusherObject.x).to.equal(true);
      expect(position.y < pusherObject.y).to.equal(true);
    });

    it('should push the tracking object right when angle is set to 90', function() {
      var object = new CanvasObject({x: 200, y: 300});
      var pusherObject = new CanvasObject({x: 400, y: 600});
      var position = getPusherPositionForAngle(90, object, pusherObject);

      expect(position).to.be.an('object');
      expect(position.x > pusherObject.x).to.equal(true);
      expect(position.y === pusherObject.y).to.equal(true);
    });

    it('should push the tracking object down and right when angle is set to 135', function() {
      var object = new CanvasObject({x: 200, y: 300});
      var pusherObject = new CanvasObject({x: 400, y: 600});
      var position = getPusherPositionForAngle(135, object, pusherObject);

      expect(position).to.be.an('object');
      expect(position.x > pusherObject.x).to.equal(true);
      expect(position.y > pusherObject.y).to.equal(true);
    });

    it('should push the tracking object down when angle is set to 180', function() {
      var object = new CanvasObject({x: 200, y: 300});
      var pusherObject = new CanvasObject({x: 400, y: 600});
      var position = getPusherPositionForAngle(180, object, pusherObject);

      expect(position).to.be.an('object');
      expect(position.x === pusherObject.x).to.equal(true);
      expect(position.y > pusherObject.y).to.equal(true);
    });

    it('should push the tracking object down and left when angle is set to 225', function() {
      var object = new CanvasObject({x: 200, y: 300});
      var pusherObject = new CanvasObject({x: 400, y: 600});
      var position = getPusherPositionForAngle(225, object, pusherObject);

      expect(position).to.be.an('object');
      expect(position.x < pusherObject.x).to.equal(true);
      expect(position.y > pusherObject.y).to.equal(true);
    });

    it('should push the tracking object left when angle is set to 270', function() {
      var object = new CanvasObject({x: 200, y: 300});
      var pusherObject = new CanvasObject({x: 400, y: 600});
      var position = getPusherPositionForAngle(270, object, pusherObject);

      expect(position).to.be.an('object');
      expect(position.x < pusherObject.x).to.equal(true);
      expect(position.y === pusherObject.y).to.equal(true);
    });

    it('should push the tracking object up and left when angle is set to 315', function() {
      var object = new CanvasObject({x: 200, y: 300});
      var pusherObject = new CanvasObject({x: 400, y: 600});
      var position = getPusherPositionForAngle(315, object, pusherObject);

      expect(position).to.be.an('object');
      expect(position.x < pusherObject.x).to.equal(true);
      expect(position.y < pusherObject.y).to.equal(true);
    });

    it('should push the tracking object up and left when angle is set to 1035', function() {
      var object = new CanvasObject({x: 200, y: 300});
      var pusherObject = new CanvasObject({x: 400, y: 600});
      var position = getPusherPositionForAngle(1035, object, pusherObject);

      expect(position).to.be.an('object');
      expect(position.x < pusherObject.x).to.equal(true);
      expect(position.y < pusherObject.y).to.equal(true);
    });

  });

});

function getPusherPositionForAngle(angle, object, pusherObject) {
  var target = new CanvasObject({x: 100, y: 200});

  var pusher = new TrackerPusher({
    object: pusherObject,
    range: 600,
    angle: angle
  });

  return pusher.calculateTargetPosition(object, target);
}
