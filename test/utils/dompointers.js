var pointerId = 0;

function DOMMouseEvent(type, x, y) {
  this.type = type;
  this.pageX = x;
  this.pageY = y;
  this.ctrlKey = false;
  this.altKey = false;
  this.shiftKey = false;
  this.metaKey = false;
  this.buttons = 1;
  this.button = 0;
  this.which = 1;
}

function DOMPointerEvent(type, x, y, opt_pointerType) {
  DOMMouseEvent.call(this, type, x, y);

  this.pointerId = (++pointerId).toString(36);
  this.pointerType = opt_pointerType || 'touch';
}

function DOMTouchEvent(type, points) {
  this.type = type;
  this.ctrlKey = false;
  this.altKey = false;
  this.shiftKey = false;
  this.metaKey = false;
  this.changedTouches = points.map(function(point) {
    return {
      identifier: (++pointerId).toString(36),
      pageX: point.x,
      pageY: point.y
    };
  });
}

exports.DOMMouseEvent = DOMMouseEvent;
exports.DOMTouchEvent = DOMTouchEvent;
exports.DOMPointerEvent = DOMPointerEvent;
