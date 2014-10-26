var NodeCanvas = require('canvas');
var fs = require('fs');

var dirName = __dirname;

var backup = {};
var active = false;

function addMockForImage() {
  active = true;

  backup.HTMLCanvasElement = global.HTMLCanvasElement;
  backup.HTMLImageElement = global.HTMLImageElement;
  backup.Image = global.Image;
  backup.document = global.document;

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
      fs.readFile(dirName + '/' + src, function(error, imageFile) {
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
  active = false;

  global.HTMLCanvasElement = backup.HTMLCanvasElement;
  global.HTMLImageElement = backup.HTMLImageElement;
  global.Image = backup.Image;
  global.document = backup.document;
}

exports.on = function() {
  if (active) return;
  addMockForImage();
};

exports.off = function() {
  if (!active) return;
  removeMockForImage();
};

exports.setDirName = function(inputDirname) {
  dirName = inputDirname;
};
