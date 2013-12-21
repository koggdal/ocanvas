var expect = require('expect.js');
var NodeCanvas = require('canvas');

var World = require('../../../../classes/World');
var Canvas = require('../../../../classes/Canvas');
var Camera = require('../../../../classes/Camera');
var CanvasObject = require('../../../../shapes/base/CanvasObject');

global.HTMLCanvasElement = NodeCanvas;

describe('CanvasObject', function() {

  describe('#render()', function() {

    it('should run with no problems (a subclass will call this function in the overriden method)', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });
      var object = new CanvasObject();
      object.render(canvas);
    });

  });

  describe('#renderTree()', function() {

    it('should call the render method', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });
      var object = new CanvasObject();
      object.render = function() {
        done();
      };
      object.renderTree(canvas);
    });

    it('should call the renderTree method of all children', function(done) {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 300)
      });

      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      var object3 = new CanvasObject();

      var numObjectsRendered = 1;
      object2.renderTree = function(canvas) {
        expect(canvas instanceof Canvas).to.equal(true);
        if (++numObjectsRendered === 3) done();
      };
      object3.renderTree = function(canvas) {
        expect(canvas instanceof Canvas).to.equal(true);
        if (++numObjectsRendered === 3) done();
      };

      object1.children.add(object2);
      object1.children.add(object3);
      object1.renderTree(canvas);
    });

  });

});
