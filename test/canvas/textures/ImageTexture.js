var fs = require('fs');
var expect = require('expect.js');
var NodeCanvas = require('canvas');
var ImageTexture = require('../../../textures/ImageTexture');

describe('ImageTexture', function() {

  before(function() {
    addMockForImage();
  });

  after(function() {
    removeMockForImage();
  });

  describe('#style', function() {

    it('should allow setting it to a CanvasPattern', function(done) {
      var canvas = new NodeCanvas(300, 300);
      var context = canvas.getContext('2d');
      var image = document.createElement('img');
      image.src = 'ocanvas-logo.png';
      image.addEventListener('error', function() {
        done(new Error('image couldn\'t load'));
      });
      image.addEventListener('load', function() {
        var pattern = context.createPattern(image, 'repeat');

        expect(pattern.constructor.name).to.equal('CanvasPattern');

        var texture = new ImageTexture();
        expect(texture.style).to.equal('transparent');
        texture.style = pattern;
        expect(texture.style).to.equal(pattern);

        done();
      });
    });

    it('should not allow setting it to something else than a CanvasPattern', function() {
      var texture = new ImageTexture();
      expect(texture.style).to.equal('transparent');
      texture.style = 'blue';
      expect(texture.style).to.equal('transparent');
    });

  });

  describe('#image', function() {

    it('should allow setting it to a string', function() {
      var texture = new ImageTexture();
      expect(texture.image).to.equal(null);
      texture.image = 'ocanvas-logo.png';
      expect(texture.image).to.equal('ocanvas-logo.png');
    });

    it('should allow setting it to an Image', function() {
      var texture = new ImageTexture();
      expect(texture.image).to.equal(null);
      var image = new Image();
      texture.image = image;
      expect(texture.image).to.equal(image);
    });

    it('should not allow setting it to something else than a string or Image', function() {
      var texture = new ImageTexture();
      expect(texture.image).to.equal(null);
      texture.image = [];
      expect(texture.image).to.equal(null);
    });

    it('should emit `load` when the image is loaded and the style is available', function(done) {
      var texture = new ImageTexture({
        image: 'ocanvas-logo.png'
      });
      texture.on('load', function() {
        expect(texture.style.constructor.name).to.equal('CanvasPattern');
        done();
      });
    });

    it('should emit `error` when the image failed to load', function(done) {
      var texture = new ImageTexture({
        image: 'non-existent-image.png'
      });
      texture.on('error', function() {
        done();
      });
    });

    it('should emit `load` instead of `error` if the image is swapped out before the image has failed loading', function(done) {
      var texture = new ImageTexture({
        image: 'non-existent-image.png'
      });
      texture.image = 'ocanvas-logo.png';

      var hasLoadBeenCalled = false;
      var hasErrorBeenCalled = false;
      texture.on('load', function() {
        hasLoadBeenCalled = true;
      });
      texture.on('error', function() {
        hasErrorBeenCalled = true;
      });
      setTimeout(function() {
        expect(hasLoadBeenCalled).to.equal(true);
        expect(hasErrorBeenCalled).to.equal(false);
        done();
      }, 10);
    });

    it('should emit `error` instead of `load` if the image is swapped out before the image has loaded', function(done) {
      var texture = new ImageTexture({
        image: 'ocanvas-logo.png'
      });
      texture.image = 'non-existent-image.png';

      var hasLoadBeenCalled = false;
      var hasErrorBeenCalled = false;
      texture.on('load', function() {
        hasLoadBeenCalled = true;
      });
      texture.on('error', function() {
        hasErrorBeenCalled = true;
      });
      setTimeout(function() {
        expect(hasLoadBeenCalled).to.equal(false);
        expect(hasErrorBeenCalled).to.equal(true);
        done();
      }, 10);
    });

    it('should set the `width` and `height` of the texture on load', function(done) {
      var texture = new ImageTexture({
        image: 'ocanvas-logo.png'
      });
      texture.on('load', function() {
        expect(texture.width).to.equal(128);
        expect(texture.height).to.equal(43);
        done();
      });
    });

    it('should set the `sourceWidth` and `sourceHeight` of the texture on load', function(done) {
      var texture = new ImageTexture({
        image: 'ocanvas-logo.png'
      });
      texture.on('load', function() {
        expect(texture.sourceWidth).to.equal(128);
        expect(texture.sourceHeight).to.equal(43);
        done();
      });
    });

  });

  describe('#repeat', function() {

    it('should update the `style` property when `repeat` is updated', function(done) {
      var texture = new ImageTexture({
        image: 'ocanvas-logo.png',
        repeat: 'both'
      });
      texture.on('load', function() {
        var initialPattern = texture.style;

        expect(initialPattern.constructor.name).to.equal('CanvasPattern');
        texture.repeat = 'x';

        var newPattern = texture.style;
        expect(newPattern).to.not.equal(initialPattern);

        done();
      });
    });

    it('should allow setting it to `x`', function() {
      var texture = new ImageTexture({repeat: 'both'});
      expect(texture.repeat).to.equal('both');
      texture.repeat = 'x';
      expect(texture.repeat).to.equal('x');
    });

    it('should allow setting it to `y`', function() {
      var texture = new ImageTexture({repeat: 'both'});
      expect(texture.repeat).to.equal('both');
      texture.repeat = 'y';
      expect(texture.repeat).to.equal('y');
    });

    it('should allow setting it to `none`', function() {
      var texture = new ImageTexture({repeat: 'both'});
      expect(texture.repeat).to.equal('both');
      texture.repeat = 'none';
      expect(texture.repeat).to.equal('none');
    });

    it('should allow setting it to `both`', function() {
      var texture = new ImageTexture({repeat: 'x'});
      expect(texture.repeat).to.equal('x');
      texture.repeat = 'both';
      expect(texture.repeat).to.equal('both');
    });

    it('should not allow setting it to something else', function() {
      var texture = new ImageTexture({repeat: 'both'});
      expect(texture.repeat).to.equal('both');
      texture.repeat = 'foo';
      expect(texture.repeat).to.equal('both');
    });

  });

  describe('#size', function() {

    it('should allow setting it to `cover`', function() {
      var texture = new ImageTexture({size: 'source'});
      expect(texture.size).to.equal('source');
      texture.size = 'cover';
      expect(texture.size).to.equal('cover');
    });

    it('should allow setting it to `contain`', function() {
      var texture = new ImageTexture({size: 'source'});
      expect(texture.size).to.equal('source');
      texture.size = 'contain';
      expect(texture.size).to.equal('contain');
    });

    it('should allow setting it to `stretch`', function() {
      var texture = new ImageTexture({size: 'source'});
      expect(texture.size).to.equal('source');
      texture.size = 'stretch';
      expect(texture.size).to.equal('stretch');
    });

    it('should allow setting it to `source`', function() {
      var texture = new ImageTexture({size: 'cover'});
      expect(texture.size).to.equal('cover');
      texture.size = 'source';
      expect(texture.size).to.equal('source');
    });

    it('should not allow setting it to something else', function() {
      var texture = new ImageTexture({size: 'source'});
      expect(texture.size).to.equal('source');
      texture.size = 'foo';
      expect(texture.size).to.equal('source');
    });

  });

});

function addMockForImage() {
  global.HTMLCanvasElement = NodeCanvas;
  global.HTMLImageElement = global.Image = NodeCanvas.Image;

  Image.prototype.addEventListener = function(eventName, handler) {
    if (!this._handlers) this._handlers = {};
    if (!this._handlers[eventName]) this._handlers[eventName] = [];
    this._handlers[eventName].push(handler);

    if (eventName === 'load' && !this._loading) {
      this._loading = true;

      var src = this.src;
      var self = this;
      fs.readFile(__dirname + '/' + src, function(error, imageFile) {
        if (!error) {
          self.src = imageFile;
        }

        setTimeout(function() {
          var handlerFunctions = self._handlers.load;
          if (error) {
            handlerFunctions = self._handlers.error;
          }

          if (handlerFunctions) {
            handlerFunctions.forEach(function(handler) {
              handler.call(self);
            });
          }
        }, 0);
      });
    }
  };

  global.document = {
    createElement: function(tagName) {
      switch (tagName) {
        case 'canvas': return new NodeCanvas(300, 150);
        case 'img': return new Image();
      }
    }
  };
}

function removeMockForImage() {
  delete global.HTMLCanvasElement;
  delete global.Image;
  delete global.HTMLImageElement;
  delete global.document;
}
