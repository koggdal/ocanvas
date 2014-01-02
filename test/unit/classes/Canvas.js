var expect = require('expect.js');
var Canvas = require('../../../classes/Canvas');
var Camera = require('../../../classes/Camera');
var jsonHelpers = require('../../../utils/json');
var canvasMock = require('../mocks/canvas2d');

describe('Canvas', function() {

  before(function() {
    canvasMock.on();
  });

  after(function() {
    canvasMock.off();
  });

  describe('Canvas constructor', function() {

    var canvas;
    before(function() {
      canvas = new Canvas({name: 'Canvas'});
    });

    it('should set any properties passed in', function() {
      expect(canvas.name).to.equal('Canvas');
    });

    it('should set the default value of property `width` to the canvas element width', function() {
      expect(canvas.width).to.equal(canvas.element.width);
    });

    it('should set the default value of property `height` to the canvas element height', function() {
      expect(canvas.height).to.equal(canvas.element.height);
    });

    it('should set the default value of property `background` to \'\' (transparent)', function() {
      expect(canvas.background).to.equal('');
    });

    it('should set the default value of property `camera` to null', function() {
      expect(canvas.camera).to.equal(null);
    });

    it('should set the default value of property `element` to new canvas element', function() {
      expect(canvas.element instanceof HTMLCanvasElement).to.equal(true);
    });

    it('should set the default value of property `context` to the context of the canvas element', function() {
      expect(canvas.context instanceof CanvasRenderingContext2D).to.equal(true);
    });

    it('should set the default value of property `viewMode` to \'fit\'', function() {
      expect(canvas.viewMode).to.equal('fit');
    });

    it('should set the default value of property `renderDepth` to 0', function() {
      expect(canvas.renderDepth).to.equal(0);
    });

    it('should set the default value of property `maxRenderDepth` to 5', function() {
      expect(canvas.maxRenderDepth).to.equal(5);
    });

    it('should set the default value of property `boundingRectanglesEnabled` to false', function() {
      expect(canvas.boundingRectanglesEnabled).to.equal(false);
    });

    it('should set the default value of property `boundingRectanglesWrapChildren` to true', function() {
      expect(canvas.boundingRectanglesWrapChildren).to.equal(true);
    });

    it('should set the default value of property `boundingRectanglesWrapSelf` to true', function() {
      expect(canvas.boundingRectanglesWrapSelf).to.equal(true);
    });

    it('should set the default value of property `boundingRectanglesColor` to \'red\'', function() {
      expect(canvas.boundingRectanglesColor).to.equal('red');
    });

    it('should set the default value of property `boundingRectanglesThickness` to 2', function() {
      expect(canvas.boundingRectanglesThickness).to.equal(2);
    });

  });

  describe('.objectProperties', function() {

    it('should be an array of property names', function() {
      expect(Array.isArray(Canvas.objectProperties)).to.equal(true);
      expect(typeof Canvas.objectProperties[0]).to.equal('string');
    });

  });

  describe('.fromObject()', function() {

    jsonHelpers.registerClasses({
      'Canvas': Canvas,
      'Camera': Camera
    });

    var data = {
      __class__: 'Canvas',
      width: 300,
      height: 100,
      background: 'red',
      viewMode: 'fit-x',
      maxRenderDepth: 3,
      camera: {
        __class__: 'Camera',
        x: 35
      }
    };

    it('should create a Canvas instance from a data object', function() {
      var canvas = Canvas.fromObject(data);

      expect(canvas instanceof Canvas).to.equal(true);
      expect(canvas.element instanceof HTMLCanvasElement).to.equal(true);
      expect(canvas.context instanceof CanvasRenderingContext2D).to.equal(true);
      expect(canvas.width).to.equal(data.width);
      expect(canvas.height).to.equal(data.height);
      expect(canvas.background).to.equal(data.background);
      expect(canvas.viewMode).to.equal(data.viewMode);
      expect(canvas.maxRenderDepth).to.equal(data.maxRenderDepth);
      expect(canvas.camera instanceof Camera).to.equal(true);
      expect(canvas.camera.x).to.equal(35);
    });

    it('should create a Canvas instance and use the passed in canvas element', function() {
      var canvas = Canvas.fromObject(data, new HTMLCanvasElement());

      expect(canvas instanceof Canvas).to.equal(true);
      expect(canvas.element instanceof HTMLCanvasElement).to.equal(true);
      expect(canvas.context instanceof CanvasRenderingContext2D).to.equal(true);
    });

  });

  describe('.fromJSON()', function() {

    jsonHelpers.registerClasses({
      'Canvas': Canvas,
      'Camera': Camera
    });

    var data = {
      __class__: 'Canvas',
      width: 300,
      height: 100,
      background: 'red',
      viewMode: 'fit-x',
      maxRenderDepth: 3,
      camera: {
        __class__: 'Camera',
        x: 35
      }
    };
    var json = JSON.stringify(data);

    it('should create a Canvas instance from a JSON string representing a data object', function() {
      var canvas = Canvas.fromJSON(json);

      expect(canvas instanceof Canvas).to.equal(true);
      expect(canvas.width).to.equal(data.width);
      expect(canvas.height).to.equal(data.height);
      expect(canvas.background).to.equal(data.background);
      expect(canvas.viewMode).to.equal(data.viewMode);
      expect(canvas.maxRenderDepth).to.equal(data.maxRenderDepth);
      expect(canvas.camera instanceof Camera).to.equal(true);
      expect(canvas.camera.x).to.equal(35);
    });

    it('should create a Canvas instance and use the passed in canvas element', function() {
      var canvas = Canvas.fromJSON(json, new HTMLCanvasElement());

      expect(canvas instanceof Canvas).to.equal(true);
      expect(canvas.element instanceof HTMLCanvasElement).to.equal(true);
      expect(canvas.context instanceof CanvasRenderingContext2D).to.equal(true);
    });

  });

  describe('#toObject()', function() {

    it('should create a data object from all specified properties', function() {
      var canvas = new Canvas({
        width: 300,
        height: 100,
        background: 'red',
        viewMode: 'fit-x',
        maxRenderDepth: 3,
        camera: new Camera()
      });

      var data = canvas.toObject();

      var props = Canvas.objectProperties;
      for (var i = 0, l = props.length; i < l; i++) {
        if (data[props[i]] && data[props[i]].__class__) continue;
        expect(data[props[i]]).to.equal(canvas[props[i]]);
      }

      expect(data.__class__).to.equal('Canvas');
      expect(typeof data.camera).to.equal('object');
      expect(data.camera.__class__).to.equal('Camera');
    });

  });

  describe('#toJSON()', function() {

    it('should create a JSON string from all specified properties', function() {
      var canvas = new Canvas({
        width: 300,
        height: 100,
        background: 'red',
        viewMode: 'fit-x',
        maxRenderDepth: 3,
        camera: new Camera()
      });

      var json = canvas.toJSON();
      var data = JSON.parse(json);

      var props = Canvas.objectProperties;
      for (var i = 0, l = props.length; i < l; i++) {
        if (data[props[i]] && data[props[i]].__class__) continue;
        expect(data[props[i]]).to.equal(canvas[props[i]]);
      }

      expect(data.__class__).to.equal('Canvas');
      expect(typeof data.camera).to.equal('object');
      expect(data.camera.__class__).to.equal('Camera');
    });

  });

  describe('#setProperties()', function() {

    it('should set any properties passed in', function() {
      var canvas = new Canvas();
      expect(canvas.name).to.equal(undefined);
      canvas.setProperties({
        name: 'Canvas'
      });
      expect(canvas.name).to.equal('Canvas');
    });

  });

  describe('#_getViewModeValues()', function() {

    var canvas;
    before(function() {
      canvas = new Canvas({width: 300, height: 150});
    });

    it('should handle viewMode \'fit-x\' (for horizontal camera)', function() {
      canvas.viewMode = 'fit-x';
      canvas.camera = {width: 200, height: 50};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(1.5);
      expect(values.scaleY).to.equal(1.5);
      expect(values.x).to.equal(0);
      expect(values.y).to.equal(37.5);
    });

    it('should handle viewMode \'fit-x\' (for vertical camera)', function() {
      canvas.viewMode = 'fit-x';
      canvas.camera = {width: 50, height: 200};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(6);
      expect(values.scaleY).to.equal(6);
      expect(values.x).to.equal(0);
      expect(values.y).to.equal(-525);
    });

    it('should handle viewMode \'fit-y\' (for horizontal camera)', function() {
      canvas.viewMode = 'fit-y';
      canvas.camera = {width: 200, height: 50};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(3);
      expect(values.scaleY).to.equal(3);
      expect(values.x).to.equal(-150);
      expect(values.y).to.equal(0);
    });

    it('should handle viewMode \'fit-y\' (for vertical camera)', function() {
      canvas.viewMode = 'fit-y';
      canvas.camera = {width: 50, height: 200};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(0.75);
      expect(values.scaleY).to.equal(0.75);
      expect(values.x).to.equal(131.25);
      expect(values.y).to.equal(0);
    });

    it('should handle viewMode \'fit\' (for horizontal camera)', function() {
      canvas.viewMode = 'fit';
      canvas.camera = {width: 200, height: 50};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(1.5);
      expect(values.scaleY).to.equal(1.5);
      expect(values.x).to.equal(0);
      expect(values.y).to.equal(37.5);
    });

    it('should handle viewMode \'fit\' (for vertical camera)', function() {
      canvas.viewMode = 'fit';
      canvas.camera = {width: 50, height: 200};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(0.75);
      expect(values.scaleY).to.equal(0.75);
      expect(values.x).to.equal(131.25);
      expect(values.y).to.equal(0);
    });

    it('should handle viewMode \'stretch\' (for horizontal camera)', function() {
      canvas.viewMode = 'stretch';
      canvas.camera = {width: 200, height: 50};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(1.5);
      expect(values.scaleY).to.equal(3);
      expect(values.x).to.equal(0);
      expect(values.y).to.equal(0);
    });

    it('should handle viewMode \'stretch\' (for vertical camera)', function() {
      canvas.viewMode = 'stretch';
      canvas.camera = {width: 50, height: 200};
      var values = canvas._getViewModeValues();

      expect(values.scaleX).to.equal(6);
      expect(values.scaleY).to.equal(0.75);
      expect(values.x).to.equal(0);
      expect(values.y).to.equal(0);
    });

  });

});
