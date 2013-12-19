/**
 * @module ocanvas/classes/Canvas
 */
'use strict';

var defineProperties = require('../utils/defineProperties');

/**
 * @classdesc A Canvas instance is connected to a canvas DOM element. It will
 *     render what a connected camera sees in a world.
 *
 * @property {number} width The width of the canvas in pixels. This will be set
 *     automatically by the canvas element. If the property is provided in
 *     the properties object passed to the constructor, it will set the width
 *     to that value. The default width for a canvas element is 300 px.
 * @property {number} height The height of the canvas in pixels. This will be set
 *     automatically by the canvas element. If the property is provided in
 *     the properties object passed to the constructor, it will set the height
 *     to that value. The default height for a canvas element is 150 px.
 * @property {string} background Background color. Default value is '', which
 *     means transparent.
 * @property {Camera?} camera A camera instance. Default is null.
 * @property {HTMLElement} element The canvas DOM element. Will be created if
 *     not provided in the initial properties to the constructor.
 * @property {CanvasRenderingContext2D} context The canvas 2D context object.
 *     This will be fetched from the element that is either set or created
 *     at the time the constructor runs. Changing the element requires you to
 *     manually update the context property as well.
 * @property {string} viewMode Decides how the contents of the camera
 *     is fitted inside the canvas. This only matters when the size of the
 *     camera does not match the size of the canvas. The possible values are:
 *     <ul>
 *       <li><b>'fit' (default):</b> Fit the whole camera, might leave space in
 *         the top/bottom or left/right sides of the canvas.</li>
 *       <li><b>'fit-x':</b> Fit the camera horizontally. This might leave
 *         space in the top/bottom or hide parts of the top/bottom of the
 *         camera, depending on the size of the canvas.</li>
 *       <li><b>'fit-y':</b> Fit the camera vertically. This might leave space
 *         in the left/right sides or hide parts of the left/right of the
 *         camera, depending on the size of the canvas.</li>
 *       <li><b>'stretch':</b> The camera will be scaled to fit exactly in the
 *         canvas, but the content might lose the proportions as it stretches
 *         it.</li>
 *     </ul>
 * @property {number} renderDepth Current render depth in the rendering phase.
 * @property {number} maxRenderDepth The maximum number of times the world
 *     will be rendered recursively (a shape with a camera fill will trigger
 *     the world to be rendered recursively one step).
 *
 * @constructor
 *
 * @param {Object=} opt_properties Optional object with properties to set.
 *
 * @example
 * var canvas = new Canvas();
 * document.body.appendChild(canvas.element);
 */
function Canvas(opt_properties) {
  this.background = '';
  this.camera = null;
  this.viewMode = 'fit';
  this.renderDepth = 0;
  this.maxRenderDepth = 5;

  defineProperties(this, {
    width: {
      value: 0,
      set: function(value) {
        if (this.element) this.element.width = value;
      }
    },
    height: {
      value: 0,
      set: function(value) {
        if (this.element) this.element.height = value;
      }
    }
  });

  if (opt_properties) {
    this.setProperties(opt_properties);
  }

  this._createCanvas();
}

/**
 * Set multiple properties at the same time.
 *
 * @param {Object} properties Object with properties and their values.
 */
Canvas.prototype.setProperties = function(properties) {
  for (var prop in properties) {
    this[prop] = properties[prop];
  }
};

/**
 * Clear the canvas surface.
 */
Canvas.prototype.clear = function() {
  this.context.clearRect(0, 0, this.width, this.height);
};

/**
 * Render what the camera sees. It will 
 * Before doing so, it clears the canvas.
 */
Canvas.prototype.render = function() {
  this.clear();

  if (!this.camera) {
    throw new Error('You must set a camera on the canvas instance to render.');
  }

  var context = this.context;
  var camera = this.camera;

  context.save();

  // Draw the background for the canvas
  if (this.background && this.background !== 'transparent') {
    context.fillStyle = this.background;
    context.fillRect(0, 0, this.width, this.height);
  }

  // Get values based on the current view mode
  var viewModeValues = this._getViewModeValues();

  // Clip what is drawn to the box of the camera fitted inside
  // the camera view.
  var clipX = viewModeValues.x;
  var clipY = viewModeValues.y;
  var clipWidth = camera.width * viewModeValues.scaleX;
  var clipHeight = camera.height * viewModeValues.scaleY;
  context.beginPath();
  context.rect(clipX, clipY, clipWidth, clipHeight);
  context.closePath();
  context.clip();

  // Scale the context proportionally based on the view mode setting
  context.scale(viewModeValues.scaleX, viewModeValues.scaleY);

  camera.render(this);

  context.restore();
};

/**
 * Get the values for scaling the context to fit the camera
 * contents into the canvas, based on the viewMode property.
 *
 * @private
 *
 * @return {Object} Object with properties x, y, scaleX, scaleY.
 */
Canvas.prototype._getViewModeValues = function() {
  var camera = this.camera;
  var x = 0;
  var y = 0;
  var scaleX;
  var scaleY;

  switch (this.viewMode) {
    case 'fit-x':
      scaleX = scaleY = this.width / camera.width;
      y = (this.height - camera.height) * scaleY / 2;
      break;

    case 'fit-y':
      scaleX = scaleY = this.height / camera.height;
      x = (this.width - camera.width) * scaleX / 2;
      break;

    case 'stretch':
      scaleX = this.width / camera.width;
      scaleY = this.height / camera.height;
      break;

    case 'fit':
    default:

      // Use logic for fit-x
      if (this.width / camera.width * camera.height < this.height) {
        scaleX = scaleY = this.width / camera.width;
        y = (this.height - camera.height * scaleY) / 2;

      // Use logic for fit-y
      } else {
        scaleX = scaleY = this.height / camera.height;
        x = (this.width - camera.width * scaleX) / 2;
      }

      break;
  }

  return {
    x: x,
    y: y,
    scaleX: scaleX,
    scaleY: scaleY
  };
};

/**
 * Set up the canvas and context properties, either using
 * a provided canvas element, or a new canvas element. The provided
 * canvas element is read from the 'element' property.
 *
 * @private
 */
Canvas.prototype._createCanvas = function() {
  if (!this.element || !(this.element instanceof HTMLCanvasElement)) {
    this.element = document.createElement('canvas');
  }

  this.context = this.element.getContext('2d');

  // If width/height is already set on the object, set the canvas element
  // to that size. Otherwise, set the instance properties to the size of
  // the canvas element.
  if (this.width) this.element.width = this.width;
  else this.width = this.element.width;
  if (this.height) this.element.height = this.height;
  else this.height = this.element.height;
};

module.exports = Canvas;
