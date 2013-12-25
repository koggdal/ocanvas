var expect = require('expect.js');
var NodeCanvas = require('canvas');

var World = require('../../../classes/World');
var Canvas = require('../../../classes/Canvas');
var Camera = require('../../../classes/Camera');
var Rectangle = require('../../../shapes/Rectangle');

global.HTMLCanvasElement = NodeCanvas;

describe('Canvas', function() {

  describe('#clear()', function() {
    var canvas = new Canvas({
      element: new NodeCanvas(300, 300),
      camera: new Camera()
    });

    canvas.context.fillStyle = 'red';
    canvas.context.fillRect(0, 0, canvas.width, canvas.height);

    it('should clear the canvas', function() {
      var ctx = canvas.context;
      var w = canvas.width - 1;
      var h = canvas.height - 1;

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

  describe('#render()', function() {

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
        if (error.name === 'ocanvas-no-camera') {
          done();
        } else {
          done(error);
        }
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
      var w = canvas.width - 1;
      var h = canvas.height - 1;

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

  describe('#transformContextToObject()', function() {

    it('should transform the context to a specific object', function() {
      var camera = new Camera();
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300),
        camera: camera
      });
      camera.width = canvas.width;
      camera.height = canvas.height;

      var world = new World();
      world.cameras.add(canvas.camera);

      var obj1 = new Rectangle({width: 100, height: 100, fill: '#f00'});
      world.objects.add(obj1);
      var obj2 = new Rectangle({x: 10, y: 15, width: 50, height: 50, fill: '#0f0'});
      obj1.children.add(obj2);

      var obj3 = new Rectangle({x: 20, y: 25, width: 30, height: 30, fill: '#00f'});
      world.objects.add(obj3);
      var obj4 = new Rectangle({x: 30, y: 35, width: 30, height: 30, fill: '#0ff'});
      obj3.children.add(obj4);

      obj2render = obj2.render;
      obj2.render = function() {
        canvas.context.save();
        canvas.transformContextToObject(obj4, obj2);
        canvas.context.fillStyle = '#ff0';
        canvas.context.fillRect(0, 0, 40, 40);
        canvas.context.restore();
        obj2render.apply(this, arguments);
      };

      canvas.render();

      var context = canvas.context;

      // Object 1 and 2
      expect(getColor(context, 0, 0)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, 99, 99)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, 10, 15)).to.equal('rgba(0, 255, 0, 255)');

      // Object 3 and 4
      expect(getColor(context, 20, 25)).to.equal('rgba(0, 0, 255, 255)');
      expect(getColor(context, 50, 60)).to.equal('rgba(0, 255, 255, 255)');

      // The manually drawn area, drawn at the position of obj4, at the time of obj2 render
      expect(getColor(context, 85, 95)).to.equal('rgba(255, 255, 0, 255)');
    });

  });

});

function getColor(context, x, y) {
  var data = context.getImageData(x, y, 1, 1).data;
  return 'rgba(' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + data[3] + ')';
}