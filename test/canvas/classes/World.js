var expect = require('expect.js');
var NodeCanvas = require('canvas');

var World = require('../../../classes/World');
var Canvas = require('../../../classes/Canvas');
var Camera = require('../../../classes/Camera');
var CanvasObject = require('../../../shapes/base/CanvasObject');

global.HTMLCanvasElement = NodeCanvas;

describe('World', function() {

  var canvas = new Canvas({
    element: new NodeCanvas(300, 300),
    camera: new Camera({width: 300, height: 300})
  });
  var world = new World();
  world.cameras.add(canvas.camera);

  describe('#render()', function() {

    it('should render all objects added to the world', function(done) {
      var object = new CanvasObject();
      world.objects.add(object);

      var originalRender = object.render;
      object.render = function() {
        originalRender.call(object, canvas);
        object.render = originalRender;
        done();
      };
      object.getVertices = function() {
        return [{x: this.x, y: this.y}];
      };

      world.render(canvas);

      world.objects.remove(object);
    });

    it('should not render objects that are not in view', function(done) {
      var object = new CanvasObject();
      world.objects.add(object);

      var hasBeenCalled = false;
      object.render = function() {
        hasBeenCalled = true;
      };
      object.getVertices = function() {
        return [{x: 5000, y: this.y}];
      };

      world.render(canvas);

      setTimeout(function() {
        if (hasBeenCalled) done(new Error('The object was rendered even if it was not in view'));
        else done();
      }, 10);

      world.objects.remove(object);
    });

    it('should render objects that are not in view if the setting says so', function(done) {
      var object = new CanvasObject();
      world.objects.add(object);

      canvas.boundingRectangleCulling = false;

      var hasBeenCalled = false;
      object.render = function() {
        hasBeenCalled = true;
      };
      object.getVertices = function() {
        return [{x: 5000, y: this.y}];
      };

      world.render(canvas);

      setTimeout(function() {
        if (hasBeenCalled) done();
        else done(new Error('The object was not rendered even if it was supposed to be'));
      }, 10);

      canvas.boundingRectangleCulling = true;
      world.objects.remove(object);
    });

    it('should render recursively only the number of times specified', function(done) {
      var object = new CanvasObject({
        getVertices: function() {
          return [{x: this.x, y: this.y}];
        }
      });
      world.objects.add(object);

      var originalRender = object.render;
      var numCalls = 0;

      var originalFill = object.fill;
      object.fill = canvas.camera;

      var timer;

      object.render = function() {
        originalRender.call(object, canvas);
        numCalls++;

        clearTimeout(timer);
        timer = setTimeout(function() {
          if (numCalls === canvas.maxRenderDepth) {
            object.render = originalRender;
            object.fill = originalFill;
            done();
          } else if (numCalls > canvas.maxRenderDepth) {
            done(new Error('The world is rendered too many times recursively.'));
          }
        }, 30);

        world.render(canvas);
      };

      world.render(canvas);

      world.objects.remove(object);
    });

  });

});
