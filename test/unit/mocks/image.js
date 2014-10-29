var fs = require('fs');

var dirName = __dirname;

var backup = {};
var active = false;

function addMockForImage() {
  active = true;

  backup.HTMLImageElement = global.HTMLImageElement;
  backup.Image = global.Image;
  backup.document = global.document;

  global.HTMLImageElement = global.Image = Image;

  global.document = {
    createElement: function(tagName) {
      switch (tagName) {
        case 'img': return new Image();
      }
    }
  };
}

function removeMockForImage() {
  active = false;

  global.HTMLImageElement = backup.HTMLImageElement;
  global.Image = backup.Image;
  global.document = backup.document;
}

function Event(type) {
  this.type = type;
}

function Image(opt_width, opt_height) {
  this.width = opt_width || 0;
  this.height = opt_height || 0;
  this.onload = null;
  this.onerror = null;
  this.complete = true;
  this._handlers = {};

  var src = '';
  Object.defineProperties(this, {
    src: {
      get: function() { return src; },
      set: function(value) {
        src = value;
        this.complete = false;

        var self = this;
        fs.readFile(dirName + '/' + src, function(error, imageFile) {
          if (src !== value) return;
          self.complete = true;

          if (error) {
            self.dispatchEvent(new Event('error'));
          } else {
            self.dispatchEvent(new Event('load'));
          }
        });
      }
    }
  });
}

Image.prototype.dispatchEvent = function(event) {
  if (event.type === 'error' && this.onerror) this.onerror(event);
  if (event.type === 'load' && this.onload) this.onload(event);

  var handlers = this._handlers[event.type];
  if (!handlers) return;

  // Create a copy to handle cases when calling handlers removes handlers
  handlers = handlers.slice();

  for (var i = 0, l = handlers.length; i < l; i++) {
    handlers[i].call(this, event);
  }
};

Image.prototype.addEventListener = function(eventType, handler) {
  if (!this._handlers[eventType]) this._handlers[eventType] = [];
  this._handlers[eventType].push(handler);
};

Image.prototype.removeEventListener = function(eventType, handler) {
  var handlers = this._handlers[eventType];
  if (!handlers) return;

  for (var i = 0, l = handlers.length; i < l; i++) {
    if (handlers[i] === handler) {
      handlers.splice(i, 1);
      i--; l--;
    }
  }
};

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
