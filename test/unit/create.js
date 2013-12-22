var expect = require('expect.js');
var Camera = require('../../classes/Camera');
var Canvas = require('../../classes/Canvas');
var World = require('../../classes/World');
var create = require('../../create');
var canvasMock = require('./mocks/canvas2d');

describe('create', function() {

  before(function() {
    canvasMock.on();
  });

  after(function() {
    canvasMock.off();
  });

  it('should create a base setup when no options are passed', function() {
    var setup = create();
    expect(setup.camera instanceof Camera).to.equal(true);
    expect(setup.canvas instanceof Canvas).to.equal(true);
    expect(setup.world instanceof World).to.equal(true);

    expect(setup.canvas.element).to.be.ok();
    expect(setup.camera.width).to.equal(setup.canvas.width);
    expect(setup.camera.height).to.equal(setup.canvas.height);
    expect(setup.world.cameras.length).to.equal(1);
    expect(setup.world.cameras.get(0)).to.equal(setup.camera);
    expect(setup.camera.world).to.equal(setup.world);
    expect(setup.camera.x).to.equal(setup.canvas.width / 2);
    expect(setup.camera.y).to.equal(setup.canvas.height / 2);
  });

  it('should use the passed in camera if provided', function() {
    var camera = new Camera();
    var setup = create({camera: camera});
    expect(setup.camera instanceof Camera).to.equal(true);

    expect(setup.camera).to.equal(camera);
    expect(setup.camera.width).to.equal(setup.canvas.width);
    expect(setup.camera.height).to.equal(setup.canvas.height);
    expect(setup.world.cameras.length).to.equal(1);
    expect(setup.world.cameras.get(0)).to.equal(setup.camera);
    expect(setup.camera.world).to.equal(setup.world);
    expect(setup.camera.x).to.equal(setup.canvas.width / 2);
    expect(setup.camera.y).to.equal(setup.canvas.height / 2);
  });

  it('should use the passed in canvas if provided', function() {
    var canvas = new Canvas();
    var setup = create({canvas: canvas});
    expect(setup.canvas instanceof Canvas).to.equal(true);

    expect(setup.canvas).to.equal(canvas);
  });

  it('should use the passed in world if provided', function() {
    var world = new World();
    var setup = create({world: world});
    expect(setup.world instanceof World).to.equal(true);

    expect(setup.world).to.equal(world);
    expect(setup.world.cameras.length).to.equal(1);
    expect(setup.world.cameras.get(0)).to.equal(setup.camera);
  });

  it('should use the passed in width', function() {
    var setup = create({width: 900});

    expect(setup.canvas.width).to.equal(900);
    expect(setup.camera.width).to.equal(900);
  });

  it('should use the passed in height', function() {
    var setup = create({height: 900});

    expect(setup.canvas.height).to.equal(900);
    expect(setup.camera.height).to.equal(900);
  });

  it('should use the passed in width/height with a passed in canvas', function() {
    var canvas = new Canvas();
    var setup = create({
      canvas: canvas,
      width: 900,
      height: 600
    });

    expect(setup.canvas.width).to.equal(900);
    expect(setup.camera.width).to.equal(900);
    expect(setup.canvas.height).to.equal(600);
    expect(setup.camera.height).to.equal(600);
  });

  it('should use the passed in width/height with a passed in camera', function() {
    var camera = new Camera();
    var setup = create({
      camera: camera,
      width: 900,
      height: 600
    });

    expect(setup.canvas.width).to.equal(900);
    expect(setup.camera.width).to.equal(900);
    expect(setup.canvas.height).to.equal(600);
    expect(setup.camera.height).to.equal(600);
  });

  it('should use the passed in element when creating the canvas', function() {
    var element = document.createElement('canvas');
    var setup = create({element: element});

    expect(setup.canvas.element instanceof HTMLCanvasElement).to.equal(true);
    expect(setup.canvas.element).to.equal(element);
    expect(setup.canvas.context instanceof CanvasRenderingContext2D).to.equal(true);
    expect(setup.canvas.context).to.equal(element.getContext('2d'));
  });

  it('should use the passed in background when creating the canvas', function() {
    var background = '#f00';
    var setup = create({background: background});

    expect(setup.canvas.background).to.equal(background);
  });

});
