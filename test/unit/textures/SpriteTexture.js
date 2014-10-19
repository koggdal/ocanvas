var expect = require('expect.js');
var ImageTexture = require('../../../textures/ImageTexture');
var SpriteTexture = require('../../../textures/SpriteTexture');

describe('SpriteTexture', function() {

  it('should inherit from ImageTexture', function() {
    var object = new SpriteTexture();
    expect(SpriteTexture.prototype instanceof ImageTexture).to.equal(true);
    expect(object instanceof ImageTexture).to.equal(true);
  });

  describe('SpriteTexture constructor', function() {

    var texture = new SpriteTexture({name: 'SpriteTexture'});

    it('should set any properties passed in', function() {
      expect(texture.name).to.equal('SpriteTexture');
    });

    it('should set the default value of property `frames` to null', function() {
      expect(texture.frames).to.equal(null);
    });

    it('should set the default value of property `frame` to 0', function() {
      expect(texture.frame).to.equal(0);
    });

    it('should allow setting of `frames` to an array', function() {
      var texture = new SpriteTexture();

      expect(texture.frames).to.equal(null);
      var frames = [];
      texture.frames = frames;
      expect(texture.frames).to.equal(frames);
    });

    it('should not allow setting of `frames` to anything else than an array', function() {
      var texture = new SpriteTexture();

      expect(texture.frames).to.equal(null);
      texture.frames = {};
      expect(texture.frames).to.equal(null);
    });

    it('should allow setting of `frame` to a number', function() {
      var texture = new SpriteTexture();

      expect(texture.frame).to.equal(0);
      texture.frame = 5;
      expect(texture.frame).to.equal(5);
    });

    it('should not allow setting of `frame` to anything else than a number', function() {
      var texture = new SpriteTexture();

      expect(texture.frame).to.equal(0);
      texture.frame = {};
      expect(texture.frame).to.equal(0);
    });

  });

  describe('#className', function() {

    it('should set the `className` property', function() {
      expect(SpriteTexture.className).to.equal('SpriteTexture');
    });

  });

  describe('#frame', function() {

    it('should set the properties `sourceX`, `sourceY`, `width` and `height` when set', function() {
      var texture = new SpriteTexture();

      texture.frames = [{}, {
        x: 120, y: 50,
        width: 90, height: 70
      }];
      texture.frame = 1;

      expect(texture.frame).to.equal(1);
      expect(texture.sourceX).to.equal(120);
      expect(texture.sourceY).to.equal(50);
      expect(texture.width).to.equal(90);
      expect(texture.height).to.equal(70);
    });

    it('should set the properties `sourceX`, `sourceY`, `width` and `height` to 0 if the frame is not present', function() {
      var texture = new SpriteTexture();

      texture.frames = [{
        x: 120, y: 50,
        width: 90, height: 70
      }];

      expect(texture.frame).to.equal(0);
      expect(texture.sourceX).to.equal(120);
      expect(texture.sourceY).to.equal(50);
      expect(texture.width).to.equal(90);
      expect(texture.height).to.equal(70);

      texture.frame = 1;

      expect(texture.frame).to.equal(1);
      expect(texture.sourceX).to.equal(0);
      expect(texture.sourceY).to.equal(0);
      expect(texture.width).to.equal(0);
      expect(texture.height).to.equal(0);
    });

  });

  describe('#frames', function() {

    it('should set the properties `sourceX`, `sourceY`, `width` and `height` when set', function() {
      var texture = new SpriteTexture();

      texture.frame = 1;
      texture.frames = [{}, {
        x: 120, y: 50,
        width: 90, height: 70
      }];

      expect(texture.frame).to.equal(1);
      expect(texture.sourceX).to.equal(120);
      expect(texture.sourceY).to.equal(50);
      expect(texture.width).to.equal(90);
      expect(texture.height).to.equal(70);
    });

    it('should set the properties `sourceX`, `sourceY`, `width` and `height` to 0 if the frame is not present', function() {
      var texture = new SpriteTexture();

      texture.frames = [{
        x: 120, y: 50,
        width: 90, height: 70
      }];

      expect(texture.frame).to.equal(0);
      expect(texture.sourceX).to.equal(120);
      expect(texture.sourceY).to.equal(50);
      expect(texture.width).to.equal(90);
      expect(texture.height).to.equal(70);

      texture.frames = [];

      expect(texture.frame).to.equal(0);
      expect(texture.sourceX).to.equal(0);
      expect(texture.sourceY).to.equal(0);
      expect(texture.width).to.equal(0);
      expect(texture.height).to.equal(0);
    });

  });

  describe('#generateFrames()', function() {

    it('should set the `frames` property to an array with a single frame if called with an empty object', function() {
      var texture = new SpriteTexture();
      texture.generateFrames({});
      var frames = texture.frames;

      expect(frames).to.be.an('array');
      expect(frames.length).to.be(1);
      expect(frames[0].x).to.be(0);
      expect(frames[0].y).to.be(0);
      expect(frames[0].width).to.be(0);
      expect(frames[0].height).to.be(0);
    });

    it('should set the `frames` property to an array with a single frame if called with only an amount of frames', function() {
      var texture = new SpriteTexture();
      texture.generateFrames({amount: 2});
      var frames = texture.frames;

      expect(frames).to.be.an('array');
      expect(frames.length).to.be(2);
      expect(frames[0].x).to.be(0);
      expect(frames[0].y).to.be(0);
      expect(frames[0].width).to.be(0);
      expect(frames[0].height).to.be(0);
      expect(frames[1].x).to.be(0);
      expect(frames[1].y).to.be(0);
      expect(frames[1].width).to.be(0);
      expect(frames[1].height).to.be(0);
    });

    it('should set frames if called with columns', function() {
      var texture = new SpriteTexture();
      texture.generateFrames({columns: 2});
      var frames = texture.frames;

      expect(frames).to.be.an('array');
      expect(frames.length).to.be(2);
      expect(frames[0].x).to.be(0);
      expect(frames[0].y).to.be(0);
      expect(frames[0].width).to.be(0);
      expect(frames[0].height).to.be(0);
      expect(frames[1].x).to.be(0);
      expect(frames[1].y).to.be(0);
      expect(frames[1].width).to.be(0);
      expect(frames[1].height).to.be(0);
    });

    it('should set frames if called with rows', function() {
      var texture = new SpriteTexture();
      texture.generateFrames({rows: 2});
      var frames = texture.frames;

      expect(frames).to.be.an('array');
      expect(frames.length).to.be(2);
      expect(frames[0].x).to.be(0);
      expect(frames[0].y).to.be(0);
      expect(frames[0].width).to.be(0);
      expect(frames[0].height).to.be(0);
      expect(frames[1].x).to.be(0);
      expect(frames[1].y).to.be(0);
      expect(frames[1].width).to.be(0);
      expect(frames[1].height).to.be(0);
    });

    it('should set frames if called with columns and rows', function() {
      var texture = new SpriteTexture();
      texture.generateFrames({columns: 2, rows: 2});
      var frames = texture.frames;

      expect(frames).to.be.an('array');
      expect(frames.length).to.be(4);
      expect(frames[0].x).to.be(0);
      expect(frames[0].y).to.be(0);
      expect(frames[0].width).to.be(0);
      expect(frames[0].height).to.be(0);
      expect(frames[1].x).to.be(0);
      expect(frames[1].y).to.be(0);
      expect(frames[1].width).to.be(0);
      expect(frames[1].height).to.be(0);
      expect(frames[2].x).to.be(0);
      expect(frames[2].y).to.be(0);
      expect(frames[2].width).to.be(0);
      expect(frames[2].height).to.be(0);
      expect(frames[3].x).to.be(0);
      expect(frames[3].y).to.be(0);
      expect(frames[3].width).to.be(0);
      expect(frames[3].height).to.be(0);
    });

    it('should set frames if called with columns, rows and amount', function() {
      var texture = new SpriteTexture();
      texture.generateFrames({columns: 2, rows: 2, amount: 3});
      var frames = texture.frames;

      expect(frames).to.be.an('array');
      expect(frames.length).to.be(3);
      expect(frames[0].x).to.be(0);
      expect(frames[0].y).to.be(0);
      expect(frames[0].width).to.be(0);
      expect(frames[0].height).to.be(0);
      expect(frames[1].x).to.be(0);
      expect(frames[1].y).to.be(0);
      expect(frames[1].width).to.be(0);
      expect(frames[1].height).to.be(0);
      expect(frames[2].x).to.be(0);
      expect(frames[2].y).to.be(0);
      expect(frames[2].width).to.be(0);
      expect(frames[2].height).to.be(0);
    });

  });

});
