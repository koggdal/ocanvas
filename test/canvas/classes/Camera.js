var expect = require('expect.js');
var NodeCanvas = require('canvas');
var getColor = require('../../utils/getColor');

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

    it('should rotate the context by the rotation of the camera', function() {
      var camera = new Camera({
        width: 300, height: 300,
        rotation: 20
      });
      var world = new World();
      world.cameras.add(camera);

      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: camera
      });
      var ctx = canvas.context;

      world.render = function() {
        ctx.translate(-camera.x, -camera.y);
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };

      ctx.translate(canvas.width / 2, canvas.height / 2);

      camera.render(canvas);

      var w = canvas.width - 1;
      var h = canvas.height - 1;

      expect(getColor(ctx, 0, 0)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, w, 0)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, w, h)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, 0, h)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, w / 2, h / 2)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, w, 110)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, w, 130)).to.equal('rgba(255, 0, 0, 255)');
    });

  });

});
