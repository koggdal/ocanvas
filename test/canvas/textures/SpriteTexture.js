var expect = require('expect.js');
var NodeCanvas = require('canvas');
var imageMock = require('../mocks/image');
var SpriteTexture = require('../../../textures/SpriteTexture');

describe('SpriteTexture', function() {

  before(function() {
    imageMock.on();
    imageMock.setDirName(__dirname);
  });

  after(function() {
    imageMock.off();
  });

  describe('SpriteTexture constructor', function() {

    it('should keep the `width` and `height` on load, if there are no frames', function(done) {
      var texture = new SpriteTexture({image: 'ocanvas-logo.png'});

      expect(texture.width).to.equal(0);
      expect(texture.height).to.equal(0);

      texture.on('load', function() {
        expect(texture.width).to.equal(0);
        expect(texture.height).to.equal(0);
        done();
      });
    });

    it('should keep the `width` and `height` on load, if there are frames', function(done) {
      var texture = new SpriteTexture({
        image: 'ocanvas-logo.png',
        frames: [{
          x: 0, y: 0,
          width: 20, height: 10
        }]
      });

      expect(texture.width).to.equal(20);
      expect(texture.height).to.equal(10);

      texture.on('load', function() {
        expect(texture.width).to.equal(20);
        expect(texture.height).to.equal(10);
        done();
      });
    });

    it('should keep the `width` and `height` on load, even after loading a second image', function(done) {
      var texture = new SpriteTexture({image: 'ocanvas-logo.png'});

      expect(texture.width).to.equal(0);
      expect(texture.height).to.equal(0);

      var calls = 0;
      texture.on('load', function() {
        calls++;
        expect(texture.width).to.equal(0);
        expect(texture.height).to.equal(0);

        if (calls === 1) {
          texture.image = 'ocanvas-logo2.png';
        }

        if (calls === 2) done();
      });
    });

  });

  describe('#generateFrames()', function() {

    it('should set frames with coordinates based on `sourceWidth` and `sourceHeight`', function(done) {
      var texture = new SpriteTexture({image: 'ocanvas-logo.png'});
      texture.on('load', function() {
        texture.generateFrames({columns: 2, rows: 2});
        var frames = texture.frames;

        expect(frames).to.be.an('array');
        expect(frames.length).to.be(4);
        expect(frames[0].x).to.be(0);
        expect(frames[0].y).to.be(0);
        expect(frames[0].width).to.be(64);
        expect(frames[0].height).to.be(21.5);
        expect(frames[1].x).to.be(64);
        expect(frames[1].y).to.be(0);
        expect(frames[1].width).to.be(64);
        expect(frames[1].height).to.be(21.5);
        expect(frames[2].x).to.be(0);
        expect(frames[2].y).to.be(21.5);
        expect(frames[2].width).to.be(64);
        expect(frames[2].height).to.be(21.5);
        expect(frames[3].x).to.be(64);
        expect(frames[3].y).to.be(21.5);
        expect(frames[3].width).to.be(64);
        expect(frames[3].height).to.be(21.5);

        done();
      });
    });

  });

  describe('#style', function() {

    it('should be `transparent` when not initalized', function() {
      var texture = new SpriteTexture();
      expect(texture.style).to.equal('transparent');
    });

    it('should be a CanvasPattern when initalized', function(done) {
      var texture = new SpriteTexture({image: 'ocanvas-logo.png'});
      texture.on('load', function() {
        expect(texture.style).to.be.ok();
        expect(texture.style.constructor).to.be.ok();
        expect(texture.style.constructor.name).to.equal('CanvasPattern');
        done();
      });
    });

    it('should be the same CanvasPattern instance when nothing has changed', function(done) {
      var texture = new SpriteTexture({image: 'ocanvas-logo.png'});
      texture.on('load', function() {
        expect(texture.style).to.equal(texture.style);
        done();
      });
    });

    it('should be a new CanvasPattern instance when frame has changed', function(done) {
      var texture = new SpriteTexture({image: 'ocanvas-logo.png', frame: 0});
      texture.on('load', function() {
        texture.generateFrames({
          rows: 2, columns: 2, amount: 4
        });

        var style1 = texture.style;
        texture.frame = 1;
        var style2 = texture.style;

        expect(style2).to.not.equal(style1);
        done();
      });
    });

    it('should not allow setting it', function(done) {
      var texture = new SpriteTexture({image: 'ocanvas-logo.png', frame: 0});
      texture.on('load', function() {
        texture.generateFrames({
          rows: 2, columns: 2, amount: 4
        });

        var style = texture.style;
        texture.style = {};
        expect(texture.style).to.equal(style);

        done();
      });
    });

  });

});
