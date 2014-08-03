var expect = require('expect.js');

var Tracker = require('../../../tracker/Tracker');
var TrackerAttractor = require('../../../tracker/TrackerAttractor');
var TrackerRepeller = require('../../../tracker/TrackerRepeller');
var TrackerPusher = require('../../../tracker/TrackerPusher');

var CanvasObject = require('../../../shapes/base/CanvasObject');
var RectangularCanvasObject = require('../../../shapes/base/RectangularCanvasObject');
var Scene = require('../../../classes/Scene');
var Camera = require('../../../classes/Camera');

describe('Tracker', function() {

  describe('Tracker constructor', function() {

    it('should set the default value of `object` to null', function() {
      var tracker = new Tracker();
      expect(tracker.object).to.equal(null);
    });

    it('should set the default value of `target` to null', function() {
      var tracker = new Tracker();
      expect(tracker.target).to.equal(null);
    });

    it('should set the default value of `window` to null', function() {
      var tracker = new Tracker();
      expect(tracker.window).to.equal(null);
    });

    it('should set the default value of `boundaries` to null', function() {
      var tracker = new Tracker();
      expect(tracker.boundaries).to.equal(null);
    });

    it('should set the default value of `softness` to 10', function() {
      var tracker = new Tracker();
      expect(tracker.softness).to.equal(10);
    });

    it('should set the default value of `axis` to `both`', function() {
      var tracker = new Tracker();
      expect(tracker.axis).to.equal('both');
    });

    it('should set the default value of `pushX` to 0', function() {
      var tracker = new Tracker();
      expect(tracker.pushX).to.equal(0);
    });

    it('should set the default value of `pushY` to 0', function() {
      var tracker = new Tracker();
      expect(tracker.pushY).to.equal(0);
    });

    it('should set the default value of `attractors` to an empty array', function() {
      var tracker = new Tracker();
      expect(tracker.attractors).to.be.an('array');
      expect(tracker.attractors.length).to.equal(0);
    });

    it('should set the default value of `repellers` to an empty array', function() {
      var tracker = new Tracker();
      expect(tracker.repellers).to.be.an('array');
      expect(tracker.repellers.length).to.equal(0);
    });

    it('should set the default value of `pushers` to an empty array', function() {
      var tracker = new Tracker();
      expect(tracker.pushers).to.be.an('array');
      expect(tracker.pushers.length).to.equal(0);
    });

    it('should set the default value of `active` to false', function() {
      var tracker = new Tracker();
      expect(tracker.active).to.equal(false);
    });

    it('should override properties that are passed in', function() {
      var tracker = new Tracker({softness: 100});
      expect(tracker.softness).to.equal(100);
    });

    it('should set any properties that are passed in', function() {
      var tracker = new Tracker({foo: 100});
      expect(tracker.foo).to.equal(100);
    });

  });

  describe('#lock()', function() {

    it('should set the axis to `none` if `both` is specified', function() {
      var tracker = new Tracker({axis: 'both'});
      tracker.lock('both');
      expect(tracker.axis).to.equal('none');
    });

    it('should set the axis to `none` if `x` is specified and `x` is the current axis', function() {
      var tracker = new Tracker({axis: 'x'});
      tracker.lock('x');
      expect(tracker.axis).to.equal('none');
    });

    it('should set the axis to `none` if `y` is specified and `y` is the current axis', function() {
      var tracker = new Tracker({axis: 'y'});
      tracker.lock('y');
      expect(tracker.axis).to.equal('none');
    });

    it('should set the axis to `y` if `x` is specified and `both` is the current axis', function() {
      var tracker = new Tracker({axis: 'both'});
      tracker.lock('x');
      expect(tracker.axis).to.equal('y');
    });

    it('should set the axis to `x` if `y` is specified and `both` is the current axis', function() {
      var tracker = new Tracker({axis: 'both'});
      tracker.lock('y');
      expect(tracker.axis).to.equal('x');
    });

  });

  describe('#unlock()', function() {

    it('should set the axis to `both` if `both` is specified', function() {
      var tracker = new Tracker({axis: 'none'});
      tracker.unlock('both');
      expect(tracker.axis).to.equal('both');
    });

    it('should set the axis to `both` if `x` is specified and `y` is the current axis', function() {
      var tracker = new Tracker({axis: 'y'});
      tracker.unlock('x');
      expect(tracker.axis).to.equal('both');
    });

    it('should set the axis to `both` if `y` is specified and `x` is the current axis', function() {
      var tracker = new Tracker({axis: 'x'});
      tracker.unlock('y');
      expect(tracker.axis).to.equal('both');
    });

    it('should set the axis to `x` if `x` is specified and `none` is the current axis', function() {
      var tracker = new Tracker({axis: 'none'});
      tracker.unlock('x');
      expect(tracker.axis).to.equal('x');
    });

    it('should set the axis to `y` if `y` is specified and `none` is the current axis', function() {
      var tracker = new Tracker({axis: 'none'});
      tracker.unlock('y');
      expect(tracker.axis).to.equal('y');
    });

  });

  describe('#isAxisLocked()', function() {

    it('should return true if `none` is specified and `both` is the current axis', function() {
      var tracker = new Tracker({axis: 'both'});
      expect(tracker.isAxisLocked('none')).to.equal(true);
    });

    it('should return false if `none` is specified and `x` is the current axis', function() {
      var tracker = new Tracker({axis: 'x'});
      expect(tracker.isAxisLocked('none')).to.equal(false);
    });

    it('should return false if `none` is specified and `y` is the current axis', function() {
      var tracker = new Tracker({axis: 'y'});
      expect(tracker.isAxisLocked('none')).to.equal(false);
    });

    it('should return false if `none` is specified and `none` is the current axis', function() {
      var tracker = new Tracker({axis: 'none'});
      expect(tracker.isAxisLocked('none')).to.equal(false);
    });

    it('should return true if `x` is specified and `y` is the current axis', function() {
      var tracker = new Tracker({axis: 'y'});
      expect(tracker.isAxisLocked('x')).to.equal(true);
    });

    it('should return true if `x` is specified and `none` is the current axis', function() {
      var tracker = new Tracker({axis: 'none'});
      expect(tracker.isAxisLocked('x')).to.equal(true);
    });

    it('should return false if `x` is specified and `x` is the current axis', function() {
      var tracker = new Tracker({axis: 'x'});
      expect(tracker.isAxisLocked('x')).to.equal(false);
    });

    it('should return false if `x` is specified and `both` is the current axis', function() {
      var tracker = new Tracker({axis: 'both'});
      expect(tracker.isAxisLocked('x')).to.equal(false);
    });

    it('should return true if `y` is specified and `x` is the current axis', function() {
      var tracker = new Tracker({axis: 'x'});
      expect(tracker.isAxisLocked('y')).to.equal(true);
    });

    it('should return true if `y` is specified and `none` is the current axis', function() {
      var tracker = new Tracker({axis: 'none'});
      expect(tracker.isAxisLocked('y')).to.equal(true);
    });

    it('should return false if `y` is specified and `y` is the current axis', function() {
      var tracker = new Tracker({axis: 'y'});
      expect(tracker.isAxisLocked('y')).to.equal(false);
    });

    it('should return false if `y` is specified and `both` is the current axis', function() {
      var tracker = new Tracker({axis: 'both'});
      expect(tracker.isAxisLocked('y')).to.equal(false);
    });

    it('should return true if `both` is specified and `none` is the current axis', function() {
      var tracker = new Tracker({axis: 'none'});
      expect(tracker.isAxisLocked('both')).to.equal(true);
    });

    it('should return false if `both` is specified and `x` is the current axis', function() {
      var tracker = new Tracker({axis: 'x'});
      expect(tracker.isAxisLocked('both')).to.equal(false);
    });

    it('should return false if `both` is specified and `y` is the current axis', function() {
      var tracker = new Tracker({axis: 'y'});
      expect(tracker.isAxisLocked('both')).to.equal(false);
    });

    it('should return false if `both` is specified and `both` is the current axis', function() {
      var tracker = new Tracker({axis: 'both'});
      expect(tracker.isAxisLocked('both')).to.equal(false);
    });

  });

  describe('#start()', function() {

    it('should set the `active` property to `true`', function() {
      var tracker = new Tracker({
        object: new CanvasObject({x: 100, y: 100}),
        target: new CanvasObject({x: 1000, y: 1000})
      });

      expect(tracker.active).to.equal(false);
      tracker.start();
      expect(tracker.active).to.equal(true);

      tracker.stop(); // To not keep the timer alive during other tests
    });

    it('should not start the tracker if there is no object set', function() {
      var tracker = new Tracker({
        target: new CanvasObject({x: 1000, y: 1000})
      });

      expect(tracker.active).to.equal(false);
      tracker.start();
      expect(tracker.active).to.equal(false);

      tracker.stop(); // To not keep the timer alive during other tests
    });

    it('should not start the tracker if there is no target set', function() {
      var tracker = new Tracker({
        object: new CanvasObject({x: 100, y: 100})
      });

      expect(tracker.active).to.equal(false);
      tracker.start();
      expect(tracker.active).to.equal(false);

      tracker.stop(); // To not keep the timer alive during other tests
    });

    it('should not start the tracker again if it is already started', function() {
      var tracker = new Tracker({
        object: new CanvasObject({x: 100, y: 100}),
        target: new CanvasObject({x: 1000, y: 1000})
      });

      tracker.start();
      var timerId1 = tracker._timerId;

      tracker.start();
      var timerId2 = tracker._timerId;

      expect(timerId1).to.equal(timerId2);

      tracker.stop(); // To not keep the timer alive during other tests
    });

    it('should start moving the object towards the target', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var tracker = new Tracker({object: object, target: target});

      var x1 = object.x;
      var y1 = object.y;

      tracker.start();

      setTimeout(function() {
        var x2 = object.x;
        var y2 = object.y;
        expect(x2 > x1).to.equal(true);
        expect(x2 < target.x).to.equal(true);
        expect(y2 > y1).to.equal(true);
        expect(y2 < target.y).to.equal(true);

        setTimeout(function() {
          var x3 = object.x;
          var y3 = object.y;
          expect(x3 > x2).to.equal(true);
          expect(x3 < target.x).to.equal(true);
          expect(y3 > y2).to.equal(true);
          expect(y3 < target.y).to.equal(true);

          tracker.stop(); // To not keep the timer alive during other tests
          done();
        }, 50);
      }, 50);
    });

    it('should reach the target position eventually', function(done) {
      var object = new CanvasObject({x: 10, y: 10});
      var target = new CanvasObject({x: 12, y: 12});
      var tracker = new Tracker({object: object, target: target});

      var x1 = object.x;
      var y1 = object.y;

      tracker.start();

      setTimeout(function() {
        var x2 = object.x;
        var y2 = object.y;
        expect(x2 > x1).to.equal(true);
        expect(x2 < target.x).to.equal(true);
        expect(y2 > y1).to.equal(true);
        expect(y2 < target.y).to.equal(true);

        setTimeout(function() {
          var x3 = object.x;
          var y3 = object.y;
          expect(x3 > x2).to.equal(true);
          expect(x3 < target.x).to.equal(true);
          expect(y3 > y2).to.equal(true);
          expect(y3 < target.y).to.equal(true);

          setTimeout(function() {
            var x4 = object.x;
            var y4 = object.y;
            expect(x4).to.equal(target.x);
            expect(y4).to.equal(target.y);

            tracker.stop(); // To not keep the timer alive during other tests
            done();
          }, 100);
        }, 50);
      }, 50);
    });

    it('should move the object directly to the target if softness is set to 0', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var tracker = new Tracker({object: object, target: target, softness: 0});

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(target.x);
        expect(object.y).to.equal(target.y);

        tracker.stop(); // To not keep the timer alive during other tests
        done();
      }, 50);
    });

    it('should handle moving a camera object', function(done) {
      var object = new Camera({width: 300, height: 150, x: 150, y: 75});
      var target = new CanvasObject({x: 1000, y: 1000});
      var tracker = new Tracker({object: object, target: target, softness: 0});

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(target.x);
        expect(object.y).to.equal(target.y);

        tracker.stop(); // To not keep the timer alive during other tests
        done();
      }, 50);
    });

    it('should handle having a camera as a target', function(done) {
      var object = new Camera({width: 300, height: 150, x: 150, y: 75});
      var target = new Camera({width: 300, height: 150, x: 1000, y: 1000});
      var tracker = new Tracker({object: object, target: target, softness: 0});

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(target.x);
        expect(object.y).to.equal(target.y);

        tracker.stop(); // To not keep the timer alive during other tests
        done();
      }, 50);
    });

    it('should update the target position when the target moves', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var tracker = new Tracker({object: object, target: target, softness: 0});

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(target.x);
        expect(object.y).to.equal(target.y);

        target.x = 2000;
        target.y = 2000;

        setTimeout(function() {
          expect(object.x).to.equal(target.x);
          expect(object.y).to.equal(target.y);

          tracker.stop(); // To not keep the timer alive during other tests
          done();
        }, 50);
      }, 50);
    });

    it('should not move the object in the X axis if the set axis is `y`', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var tracker = new Tracker({
        object: object,
        target: target,
        softness: 0,
        axis: 'y'
      });

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(100);
        expect(object.y).to.equal(1000);

        tracker.stop(); // To not keep the timer alive during other tests
        done();
      }, 50);
    });

    it('should not move the object in the Y axis if the set axis is `x`', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var tracker = new Tracker({
        object: object,
        target: target,
        softness: 0,
        axis: 'x'
      });

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(1000);
        expect(object.y).to.equal(100);

        tracker.stop(); // To not keep the timer alive during other tests
        done();
      }, 50);
    });

    it('should not move the object if the set axis is `none`', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var tracker = new Tracker({
        object: object,
        target: target,
        softness: 0,
        axis: 'none'
      });

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(100);
        expect(object.y).to.equal(100);

        tracker.stop(); // To not keep the timer alive during other tests
        done();
      }, 50);
    });

    it('should move the object when an axis is unlocked', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var tracker = new Tracker({
        object: object,
        target: target,
        softness: 0,
        axis: 'none'
      });

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(100);
        expect(object.y).to.equal(100);

        tracker.unlock('x');

        setTimeout(function() {
          expect(object.x).to.equal(1000);
          expect(object.y).to.equal(100);

          tracker.unlock('y');

          setTimeout(function() {
            expect(object.x).to.equal(1000);
            expect(object.y).to.equal(1000);

            tracker.stop(); // To not keep the timer alive during other tests
            done();
          }, 50);
        }, 50);
      }, 50);
    });

    it('should use the `pushX` and `pushY` values after target position is found', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var tracker = new Tracker({
        object: object,
        target: target,
        softness: 0
      });

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(1000);
        expect(object.y).to.equal(1000);

        tracker.pushX = 50;
        tracker.pushY = 25;

        setTimeout(function() {
          expect(object.x).to.equal(1050);
          expect(object.y).to.equal(1025);

          tracker.pushX = 0;
          tracker.pushY = 0;

          setTimeout(function() {
            expect(object.x).to.equal(1000);
            expect(object.y).to.equal(1000);

            tracker.stop(); // To not keep the timer alive during other tests
            done();
          }, 50);
        }, 50);
      }, 50);
    });

    it('should not move the object if the target is moved inside the specified window', function(done) {
      var object = new RectangularCanvasObject({x: 100, y: 100, width: 400, height: 400});
      var target = new RectangularCanvasObject({x: 800, y: 800, width: 40, height: 40});
      var windowObject = new RectangularCanvasObject({x: 900, y: 900, width: 200, height: 200});

      var scene = new Scene();
      scene.objects.add(object);
      scene.objects.add(target);
      scene.objects.add(windowObject);

      var tracker = new Tracker({
        object: object,
        target: target,
        window: windowObject,
        softness: 0
      });

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(800);
        expect(object.y).to.equal(800);

        target.x = 1000;
        target.y = 1000;

        setTimeout(function() {
          expect(object.x).to.equal(1000);
          expect(object.y).to.equal(1000);

          target.x = 1050;
          target.y = 1050;

          setTimeout(function() {
            expect(object.x).to.equal(1000);
            expect(object.y).to.equal(1000);

            tracker.stop(); // To not keep the timer alive during other tests
            done();
          }, 50);
        }, 50);
      }, 50);
    });

    it('should move the object if the target is moved outside the specified window', function(done) {
      var object = new RectangularCanvasObject({x: 100, y: 100, width: 400, height: 400});
      var target = new RectangularCanvasObject({x: 800, y: 800, width: 40, height: 40});
      var windowObject = new RectangularCanvasObject({x: 900, y: 900, width: 200, height: 200});

      var scene = new Scene();
      scene.objects.add(object);
      scene.objects.add(target);
      scene.objects.add(windowObject);

      var tracker = new Tracker({
        object: object,
        target: target,
        window: windowObject,
        softness: 0
      });

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(800);
        expect(object.y).to.equal(800);

        target.x = 1000;
        target.y = 1000;

        setTimeout(function() {
          expect(object.x).to.equal(1000);
          expect(object.y).to.equal(1000);

          target.x = 1200;

          setTimeout(function() {
            expect(object.x).to.equal(1200);
            expect(object.y).to.equal(1000);

            target.y = 1200;

            setTimeout(function() {
              expect(object.x).to.equal(1200);
              expect(object.y).to.equal(1200);

              target.x = 950;

              setTimeout(function() {
                expect(object.x).to.equal(950);
                expect(object.y).to.equal(1200);

                target.y = 950;

                setTimeout(function() {
                  expect(object.x).to.equal(950);
                  expect(object.y).to.equal(950);

                  tracker.stop(); // To not keep the timer alive during other tests
                  done();
                }, 50);
              }, 50);
            }, 50);
          }, 50);
        }, 50);
      }, 50);
    });

    it('should not move the object (camera) outside the specified boundaries', function(done) {
      var camera = new Camera({x: 200, y: 200, width: 200, height: 200});
      var target = new RectangularCanvasObject({x: 400, y: 400, width: 40, height: 40});
      var boundaries = new RectangularCanvasObject({x: 0, y: 0, width: 800, height: 800});

      var scene = new Scene();
      scene.cameras.add(camera);
      scene.objects.add(target);
      scene.objects.add(boundaries);

      var tracker = new Tracker({
        object: camera,
        target: target,
        boundaries: boundaries,
        softness: 0
      });

      tracker.start();

      setTimeout(function() {
        expect(camera.x).to.equal(400);
        expect(camera.y).to.equal(400);

        target.x = 1200;

        setTimeout(function() {
          expect(camera.x).to.equal(700); // bounds width - half camera width
          expect(camera.y).to.equal(400); // same as before

          target.y = 1200;

          setTimeout(function() {
            expect(camera.x).to.equal(700); // same as before
            expect(camera.y).to.equal(700); // bounds height - half camera height

            target.x = -200;

            setTimeout(function() {
              expect(camera.x).to.equal(100); // left of bounds, camera origin in center
              expect(camera.y).to.equal(700); // same as before

              target.y = -200;

              setTimeout(function() {
                expect(camera.x).to.equal(100); // same as before
                expect(camera.y).to.equal(100); // up of bounds, camera origin in center

                tracker.stop(); // To not keep the timer alive during other tests
                done();
              }, 50);
            }, 50);
          }, 50);
        }, 50);
      }, 50);
    });

    it('should not move the object (canvas object) outside the specified boundaries', function(done) {
      var object = new RectangularCanvasObject({x: 200, y: 200, width: 200, height: 200});
      var target = new RectangularCanvasObject({x: 400, y: 400, width: 40, height: 40});
      var boundaries = new RectangularCanvasObject({x: 0, y: 0, width: 800, height: 800});

      var scene = new Scene();
      scene.objects.add(object);
      scene.objects.add(target);
      scene.objects.add(boundaries);

      var tracker = new Tracker({
        object: object,
        target: target,
        boundaries: boundaries,
        softness: 0
      });

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(400);
        expect(object.y).to.equal(400);

        target.x = 1200;

        setTimeout(function() {
          expect(object.x).to.equal(600); // bounds width - object width
          expect(object.y).to.equal(400); // same as before

          target.y = 1200;

          setTimeout(function() {
            expect(object.x).to.equal(600); // same as before
            expect(object.y).to.equal(600); // bounds height - object height

            target.x = -200;

            setTimeout(function() {
              expect(object.x).to.equal(0); // left of bounds
              expect(object.y).to.equal(600); // same as before

              target.y = -200;

              setTimeout(function() {
                expect(object.x).to.equal(0); // same as before
                expect(object.y).to.equal(0); // up of bounds

                tracker.stop(); // To not keep the timer alive during other tests
                done();
              }, 50);
            }, 50);
          }, 50);
        }, 50);
      }, 50);
    });

    it('should make the object centered relative to the boundaries if it is larger', function(done) {
      var camera = new Camera({x: 200, y: 200, width: 200, height: 200});
      var target = new RectangularCanvasObject({x: 700, y: 700, width: 40, height: 40});
      var boundaries = new RectangularCanvasObject({x: 0, y: 0, width: 800, height: 800});

      var scene = new Scene();
      scene.cameras.add(camera);
      scene.objects.add(target);
      scene.objects.add(boundaries);

      var tracker = new Tracker({
        object: camera,
        target: target,
        boundaries: boundaries,
        softness: 0
      });

      tracker.start();

      setTimeout(function() {
        expect(camera.x).to.equal(700);
        expect(camera.y).to.equal(700);

        camera.zoom = 0.2;

        setTimeout(function() {
          expect(camera.x).to.equal(400); // center of bounds
          expect(camera.y).to.equal(400); // center of bounds

          camera.zoom = 1;

          setTimeout(function() {
            expect(camera.x).to.equal(700); // target pos
            expect(camera.y).to.equal(700); // target pos

            camera.width = 2000;
            camera.height = 2000;

            setTimeout(function() {
              expect(camera.x).to.equal(400); // center of bounds
              expect(camera.y).to.equal(400); // center of bounds

              tracker.stop(); // To not keep the timer alive during other tests
              done();
            }, 50);
          }, 50);
        }, 50);
      }, 50);
    });

    it('should take attractors into account when calculating the target position', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var attractors = [
        new TrackerAttractor({
          object: new CanvasObject({x: 300, y: 600}),
          range: 1000
        })
      ];

      var tracker = new Tracker({
        object: object,
        target: target,
        attractors: attractors,
        softness: 0
      });

      tracker.start();

      setTimeout(function() {
        // Between target and attractor
        expect(Math.round(object.x)).to.equal(886);
        expect(Math.round(object.y)).to.equal(935);

        tracker.stop(); // To not keep the timer alive during other tests
        done();
      }, 50);
    });

    it('should not take attractors that are out of range into account', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var attractors = [
        new TrackerAttractor({
          object: new CanvasObject({x: 300, y: 600}),
          range: 100
        })
      ];

      var tracker = new Tracker({
        object: object,
        target: target,
        attractors: attractors,
        softness: 0
      });

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(target.x);
        expect(object.y).to.equal(target.y);

        tracker.stop(); // To not keep the timer alive during other tests
        done();
      }, 50);
    });

    it('should take repellers into account when calculating the target position', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var repellers = [
        new TrackerRepeller({
          object: new CanvasObject({x: 300, y: 600}),
          range: 1000
        })
      ];

      var tracker = new Tracker({
        object: object,
        target: target,
        repellers: repellers,
        softness: 0
      });

      tracker.start();

      setTimeout(function() {
        // Repeller pushes the target position even further away
        expect(Math.round(object.x)).to.equal(1027);
        expect(Math.round(object.y)).to.equal(1016);

        tracker.stop(); // To not keep the timer alive during other tests
        done();

      // Timer needs to be higher, as the repeller takes some time to stabilize.
      // It will in the first frame calculate a new target position, and in the
      // next frame it will use the new position to calculate the next target
      // position which is then different. It needs a few frames to stabilize.
      }, 100);
    });

    it('should not take repellers that are out of range into account', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var repellers = [
        new TrackerRepeller({
          object: new CanvasObject({x: 300, y: 600}),
          range: 100
        })
      ];

      var tracker = new Tracker({
        object: object,
        target: target,
        repellers: repellers,
        softness: 0
      });

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(target.x);
        expect(object.y).to.equal(target.y);

        tracker.stop(); // To not keep the timer alive during other tests
        done();
      }, 50);
    });

    it('should take pushers into account when calculating the target position', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var pushers = [
        new TrackerPusher({
          object: new CanvasObject({x: 300, y: 600}),
          range: 1000,
          angle: 225 // down and left
        })
      ];

      var tracker = new Tracker({
        object: object,
        target: target,
        pushers: pushers,
        softness: 0
      });

      tracker.start();

      setTimeout(function() {
        // Pusher pushes the target position in the specified angle
        expect(Math.round(object.x)).to.equal(772);
        expect(Math.round(object.y)).to.equal(1050);

        tracker.stop(); // To not keep the timer alive during other tests
        done();
      }, 50);
    });

    it('should not take pushers that are out of range into account', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var pushers = [
        new TrackerPusher({
          object: new CanvasObject({x: 300, y: 600}),
          range: 100,
          angle: 225 // down and left
        })
      ];

      var tracker = new Tracker({
        object: object,
        target: target,
        pushers: pushers,
        softness: 0
      });

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(target.x);
        expect(object.y).to.equal(target.y);

        tracker.stop(); // To not keep the timer alive during other tests
        done();
      }, 50);
    });

    it('should take attractors, repellers and pushers into account at the same time', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});

      var attractors = [
        new TrackerAttractor({
          object: new CanvasObject({x: 900, y: 500}),
          range: 1000
        })
      ];
      var repellers = [
        new TrackerRepeller({
          object: new CanvasObject({x: 900, y: 1200}),
          range: 1000
        })
      ];
      var pushers = [
        new TrackerPusher({
          object: new CanvasObject({x: 500, y: 500}),
          range: 1000,
          angle: 135 // down and right
        })
      ];

      var tracker = new Tracker({
        object: object,
        target: target,
        attractors: attractors,
        repellers: repellers,
        pushers: pushers,
        softness: 0
      });

      tracker.start();

      setTimeout(function() {
        // Pusher pushes the target position in the specified angle.
        // Testing with not so exact numbers here because the target position is
        // moving between frames.
        expect(Math.floor(object.x / 10) * 10).to.equal(1070);
        expect(Math.floor(object.y / 10) * 10).to.equal(700);

        tracker.stop(); // To not keep the timer alive during other tests
        done();

      // Timer needs to be higher, as the repeller takes some time to stabilize.
      // It will in the first frame calculate a new target position, and in the
      // next frame it will use the new position to calculate the next target
      // position which is then different. It needs a few frames to stabilize.
      }, 200);
    });

    it('should take all priorities into account and weight the position accordingly', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});

      var attractors = [
        new TrackerAttractor({
          object: new CanvasObject({x: 900, y: 500}),
          range: 1000,
          priority: 100
        }),
        new TrackerAttractor({
          object: new CanvasObject({x: 300, y: 700}),
          range: 1000,
          priority: 300
        }),
        new TrackerAttractor({
          object: new CanvasObject({x: 500, y: 400}),
          range: 1000,
          priority: 10
        }),
        new TrackerAttractor({
          object: new CanvasObject({x: 500, y: 400}),
          range: 0, // Since range is 0, this attractor should not be in use
          priority: 500
        })
      ];

      var tracker = new Tracker({
        object: object,
        target: target,
        attractors: attractors,
        softness: 0
      });

      tracker.start();

      setTimeout(function() {
        expect(Math.round(object.x)).to.equal(748);
        expect(Math.round(object.y)).to.equal(788);

        tracker.stop(); // To not keep the timer alive during other tests
        done();
      }, 50);
    });

  });

  describe('#stop()', function() {

    it('should set the `active` property to `false`', function() {
      var tracker = new Tracker({
        object: new CanvasObject({x: 100, y: 100}),
        target: new CanvasObject({x: 1000, y: 1000})
      });

      expect(tracker.active).to.equal(false);
      tracker.start();
      expect(tracker.active).to.equal(true);
      tracker.stop();
      expect(tracker.active).to.equal(false);
    });

    it('should stop tracking the target', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var tracker = new Tracker({object: object, target: target, softness: 0});

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(target.x);
        expect(object.y).to.equal(target.y);

        tracker.stop();

        target.x = 2000;
        target.y = 2000;

        setTimeout(function() {
          expect(object.x).to.equal(1000);
          expect(object.y).to.equal(1000);

          done();
        }, 50);
      }, 50);
    });

  });

  describe('#update()', function() {

    it('should update the target position for the X axis if specified', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var tracker = new Tracker({
        object: object,
        target: target,
        softness: 0,
        axis: 'none'
      });

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(100);
        expect(object.y).to.equal(100);

        tracker.update('x');

        setTimeout(function() {
          expect(object.x).to.equal(1000);
          expect(object.y).to.equal(100);

          tracker.stop(); // To not keep the timer alive during other tests
          done();
        }, 50);
      }, 50);
    });

    it('should update the target position for the Y axis if specified', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var tracker = new Tracker({
        object: object,
        target: target,
        softness: 0,
        axis: 'none'
      });

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(100);
        expect(object.y).to.equal(100);

        tracker.update('y');

        setTimeout(function() {
          expect(object.x).to.equal(100);
          expect(object.y).to.equal(1000);

          tracker.stop(); // To not keep the timer alive during other tests
          done();
        }, 50);
      }, 50);
    });

    it('should update the target position for both axis if specified', function(done) {
      var object = new CanvasObject({x: 100, y: 100});
      var target = new CanvasObject({x: 1000, y: 1000});
      var tracker = new Tracker({
        object: object,
        target: target,
        softness: 0,
        axis: 'none'
      });

      tracker.start();

      setTimeout(function() {
        expect(object.x).to.equal(100);
        expect(object.y).to.equal(100);

        tracker.update('both');

        setTimeout(function() {
          expect(object.x).to.equal(1000);
          expect(object.y).to.equal(1000);

          tracker.stop(); // To not keep the timer alive during other tests
          done();
        }, 50);
      }, 50);
    });

  });

});
