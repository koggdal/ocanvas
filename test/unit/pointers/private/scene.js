var expect = require('expect.js');
var sceneUtils = require('../../../../pointers/private/scene');

var Camera = require('../../../../classes/Camera');
var Canvas = require('../../../../classes/Canvas');
var Scene = require('../../../../classes/Scene');
var CanvasObject = require('../../../../shapes/base/CanvasObject');
var Collection = require('../../../../classes/Collection');

describe('pointers/scene', function() {

  describe('.findFrontObject()', function() {

    it('should handle when there is only one object with no children', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      scene.cameras.add(camera);

      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });

      scene.objects.add(object1);

      addBoundingRectangle(object1, canvas);

      var frontObject = sceneUtils.findFrontObject(canvas, 100, 100, scene.objects);

      expect(frontObject).to.equal(object1);
    });

    it('should handle when there is one object with a child', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      scene.cameras.add(camera);

      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object2 = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });

      scene.objects.add(object1);
      object1.children.add(object2);

      addBoundingRectangle(object1, canvas);
      addBoundingRectangle(object2, canvas);

      var frontObject = sceneUtils.findFrontObject(canvas, 125, 125, scene.objects);

      expect(frontObject).to.equal(object2);
    });

    it('should handle when there is one object with a child, and the front object is the outer object', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      scene.cameras.add(camera);

      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object2 = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });

      scene.objects.add(object1);
      object1.children.add(object2);

      addBoundingRectangle(object1, canvas);
      addBoundingRectangle(object2, canvas);

      var frontObject = sceneUtils.findFrontObject(canvas, 90, 90, scene.objects);

      expect(frontObject).to.equal(object1);
    });

    it('should handle when there are many objects', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      scene.cameras.add(camera);

      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object2 = new CanvasObject({
        width: 100, height: 100,
        x: 70, y: 70
      });

      scene.objects.add(object1);
      scene.objects.add(object2);

      addBoundingRectangle(object1, canvas);
      addBoundingRectangle(object2, canvas);

      var frontObject = sceneUtils.findFrontObject(canvas, 110, 110, scene.objects);

      expect(frontObject).to.equal(object2);
    });

    it('should return null if there is no front object for the specified position', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      scene.cameras.add(camera);

      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });

      scene.objects.add(object1);

      addBoundingRectangle(object1, canvas);

      var frontObject = sceneUtils.findFrontObject(canvas, 40, 40, scene.objects);

      expect(frontObject).to.equal(null);
    });

  });

  describe('.findFrontObjectInCanvas()', function() {

    it('should handle when there is only one object with no children', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      scene.cameras.add(camera);

      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });

      scene.objects.add(object1);

      addBoundingRectangle(object1, canvas);

      var frontObject = sceneUtils.findFrontObjectInCanvas(canvas, 100, 100);

      expect(frontObject).to.equal(object1);
    });

    it('should handle when there is one object with a child', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      scene.cameras.add(camera);

      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object2 = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });

      scene.objects.add(object1);
      object1.children.add(object2);

      addBoundingRectangle(object1, canvas);
      addBoundingRectangle(object2, canvas);

      var frontObject = sceneUtils.findFrontObjectInCanvas(canvas, 125, 125);

      expect(frontObject).to.equal(object2);
    });

    it('should handle when there is one object with a child, and the front object is the outer object', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      scene.cameras.add(camera);

      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object2 = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });

      scene.objects.add(object1);
      object1.children.add(object2);

      addBoundingRectangle(object1, canvas);
      addBoundingRectangle(object2, canvas);

      var frontObject = sceneUtils.findFrontObjectInCanvas(canvas, 90, 90);

      expect(frontObject).to.equal(object1);
    });

    it('should handle when there are many objects', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      scene.cameras.add(camera);

      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });
      var object2 = new CanvasObject({
        width: 100, height: 100,
        x: 70, y: 70
      });

      scene.objects.add(object1);
      scene.objects.add(object2);

      addBoundingRectangle(object1, canvas);
      addBoundingRectangle(object2, canvas);

      var frontObject = sceneUtils.findFrontObjectInCanvas(canvas, 110, 110);

      expect(frontObject).to.equal(object2);
    });

    it('should return null if there is no front object for the specified position', function() {
      var camera = new Camera();
      var canvas = new Canvas({camera: camera});
      var scene = new Scene();
      scene.cameras.add(camera);

      var object1 = new CanvasObject({
        width: 100, height: 100,
        x: 50, y: 50
      });

      scene.objects.add(object1);

      addBoundingRectangle(object1, canvas);

      var frontObject = sceneUtils.findFrontObjectInCanvas(canvas, 40, 40);

      expect(frontObject).to.equal(null);
    });

  });

  describe('.isParentOf()', function() {

    it('should return true if the object is an immediate parent', function() {
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      object1.children.add(object2);

      expect(sceneUtils.isParentOf(object1, object2)).to.equal(true);
    });

    it('should return true if the object is a parent further out', function() {
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      var object3 = new CanvasObject();
      object1.children.add(object2);
      object2.children.add(object3);

      expect(sceneUtils.isParentOf(object1, object3)).to.equal(true);
    });

    it('should return false if the object is not a parent at any level', function() {
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();

      expect(sceneUtils.isParentOf(object1, object2)).to.equal(false);
    });

    it('should return false if the objects are the same', function() {
      var object1 = new CanvasObject();

      expect(sceneUtils.isParentOf(object1, object1)).to.equal(false);
    });

  });

  describe('.getParentChain()', function() {

    it('should return an array of all objects up to the scene, if no second object is passed', function() {
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      var object3 = new CanvasObject();
      object1.children.add(object2);
      object2.children.add(object3);

      expect(sceneUtils.getParentChain(object3)).to.eql([
        object3, object2, object1
      ]);
    });

    it('should return an array of all objects up to the specified object', function() {
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      var object3 = new CanvasObject();
      object1.children.add(object2);
      object2.children.add(object3);

      expect(sceneUtils.getParentChain(object3, object1)).to.eql([object3, object2]);
    });

    it('should return an array of only the passed object if there are no parents', function() {
      var object = new CanvasObject();

      expect(sceneUtils.getParentChain(object)).to.eql([object]);
    });

  });

  describe('.findSharedParent()', function() {

    it('should return a parent that both objects share, where the parent is the immediate parent', function() {
      var parent = new CanvasObject();
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      parent.children.add(object1);
      parent.children.add(object2);

      expect(sceneUtils.findSharedParent(object1, object2)).to.equal(parent);
    });

    it('should return a parent that both objects share, where the children are a few steps in', function() {
      var parent = new CanvasObject();
      var object1_1 = new CanvasObject();
      var object1_2 = new CanvasObject();
      var object2_1 = new CanvasObject();
      var object2_2 = new CanvasObject();
      parent.children.add(object1_1);
      parent.children.add(object2_1);
      object1_1.children.add(object1_2);
      object2_1.children.add(object2_2);

      expect(sceneUtils.findSharedParent(object1_2, object2_2)).to.equal(parent);
    });

    it('should return a parent that both objects share, where the parent branches are of different size', function() {
      var parent = new CanvasObject();
      var object1_1 = new CanvasObject();
      var object2_1 = new CanvasObject();
      var object2_2 = new CanvasObject();
      parent.children.add(object1_1);
      parent.children.add(object2_1);
      object2_1.children.add(object2_2);

      expect(sceneUtils.findSharedParent(object1_1, object2_2)).to.equal(parent);
    });

    it('should return null if the objects do not share a parent', function() {
      var parent = new CanvasObject();
      var object1 = new CanvasObject();
      var object2 = new CanvasObject();
      parent.children.add(object1);

      expect(sceneUtils.findSharedParent(object1, object2)).to.equal(null);
    });

  });

});

function addBoundingRectangle(object, reference, positions) {
  object.getBoundingRectangleForTree = function(opt_reference) {
    expect(opt_reference).to.equal(reference);

    var top = this.y;
    var right = this.x + this.width;
    var bottom = this.y + this.height;
    var left = this.x;
    var parent = object.parent;
    while (parent) {
      if (parent === reference || parent instanceof Scene) {
        break;
      }
      top += parent.y;
      right += parent.x + parent.width;
      bottom += parent.y + parent.height;
      left += parent.x;
      parent = parent.parent;
    }

    return {
      top: top,
      right: right,
      bottom: bottom,
      left: left,
      width: this.width,
      height: this.height
    };
  };
}
