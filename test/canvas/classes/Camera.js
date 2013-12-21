var expect = require('expect.js');
var NodeCanvas = require('canvas');

var World = require('../../../classes/World');
var Canvas = require('../../../classes/Canvas');
var Camera = require('../../../classes/Camera');

global.HTMLCanvasElement = NodeCanvas;

describe('Camera', function() {

  describe('#render()', function() {

    it('should throw an error if a world is not set', function(done) {
      var camera = new Camera();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: camera
      });

      try {
        camera.render(canvas);
      } catch(error) {
        if (error.name === 'ocanvas-no-world') {
          done();
        } else {
          done(error);
        }
      }
    });

    it('should tell the world to render all objects', function(done) {
      var camera = new Camera();
      var world = new World();
      world.cameras.add(camera);

      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: camera
      });

      world.render = function() {
        done();
      };

      camera.render(canvas);
    });

  });

});
