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
    camera: new Camera()
  });
  var world = new World();
  world.cameras.add(canvas.camera);
  var object = new CanvasObject();
  world.objects.add(object);

  describe('#render', function() {

    it('should render all objects added to the world', function(done) {
      var originalRender = object.render;
      object.render = function() {
        originalRender.call(object, canvas);
        object.render = originalRender;
        done();
      };

      world.render(canvas);
    });

    it('should render recursively only the number of times specified', function(done) {
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
    });

  });

});
