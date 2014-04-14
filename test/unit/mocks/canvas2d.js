var defaultWidth = 300;
var defaultHeight = 150;

function CanvasRenderingContext2D() {
}

function HTMLCanvasElement() {
  this.width = defaultWidth;
  this.height = defaultHeight;
}
HTMLCanvasElement.prototype.constructor = HTMLCanvasElement;
HTMLCanvasElement.prototype.getContext = function() {
  if (!this._context) this._context = new global.CanvasRenderingContext2D();
  return this._context;
};

var doc = {
  createElement: function(tagName) {
    return tagName === 'canvas' ? new HTMLCanvasElement() : null;
  }
};

var original = {};

exports.on = function() {
  original.HTMLCanvasElement = global.HTMLCanvasElement;
  original.CanvasRenderingContext2D = global.CanvasRenderingContext2D;
  original.document = global.document;

  global.HTMLCanvasElement = HTMLCanvasElement;
  global.CanvasRenderingContext2D = CanvasRenderingContext2D;
  global.document = doc;
};

exports.off = function() {
  if (original.HTMLCanvasElement)
    global.HTMLCanvasElement = original.HTMLCanvasElement;
  if (original.CanvasRenderingContext2D)
    global.CanvasRenderingContext2D = original.CanvasRenderingContext2D;
  if (original.document)
    global.document = original.document;
};
