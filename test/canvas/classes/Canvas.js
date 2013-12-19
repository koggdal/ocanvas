var expect = require('expect.js');
var NodeCanvas = require('canvas');

var World = require('../../../classes/World');
var Canvas = require('../../../classes/Canvas');
var Camera = require('../../../classes/Camera');

global.HTMLCanvasElement = NodeCanvas;

describe('Canvas', function() {

  describe('#clear', function() {
    var canvas = new Canvas({
      element: new NodeCanvas(300, 300),
      camera: new Camera()
    });

    canvas.context.fillStyle = 'red';
    canvas.context.fillRect(0, 0, canvas.width, canvas.height);

    it('should clear the canvas', function() {
      var ctx = canvas.context;
      var w = canvas.width;
      var h = canvas.height;

      expect(getColor(ctx, 0, 0)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, w, 0)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, w, h)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 0, h)).to.equal('rgba(255, 0, 0, 255)');

      canvas.clear();

      expect(getColor(ctx, 0, 0)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, w, 0)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, w, h)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(ctx, 0, h)).to.equal('rgba(0, 0, 0, 0)');
    });

  });

  describe('#render', function() {

    it('should first clear the canvas', function(done) {
      var world = new World();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: new Camera()
      });
      world.cameras.add(canvas.camera);
      var originalClear = canvas.clear;
      canvas.clear = function() {
        canvas.clear = originalClear;
        done();
      };
      canvas.render();
    });

    it('should throw an error if a camera is not set', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: null
      });

      try {
        canvas.render();
      } catch(error) {
        done();
      }
    });

    it('should draw the background color of the canvas', function() {
      var world = new World();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: new Camera(),
        background: 'red'
      });
      world.cameras.add(canvas.camera);

      canvas.render();

      var ctx = canvas.context;
      var w = canvas.width;
      var h = canvas.height;

      expect(getColor(ctx, 0, 0)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, w, 0)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, w, h)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(ctx, 0, h)).to.equal('rgba(255, 0, 0, 255)');
    });

    it('should tell the camera to render what it sees to the canvas', function(done) {
      var camera = new Camera();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: camera
      });

      camera.render = function(canvas) {
        if (canvas) done();
        else done(new Error('Camera#render was called, but with no canvas instance'));
      };

      canvas.render();
    });

  });

});

function getColor(context, x, y) {
  var data = context.getImageData(0, 0, 1, 1).data;
  return 'rgba(' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + data[3] + ')';
}