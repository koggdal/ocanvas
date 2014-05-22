/**
 * @module ocanvas/create
 */

var Camera = require('./classes/Camera');
var Canvas = require('./classes/Canvas');
var Scene = require('./classes/Scene');

/**
 * Create the instances needed for a basic scene.
 * This includes a Camera, Canvas and Scene, as well
 * as setting sizes to fit the camera in the canvas.
 *
 * @param {Object=} opt_options Options:
 *     <ul>
 *       <li><b>element:</b> A canvas element. A new will be created in the
 *         canvas instance if not provided.</li>
 *       <li><b>background:</b> A background color to set for the canvas.</li>
 *       <li><b>width:</b> The width to set for the canvas.</li>
 *       <li><b>height:</b> The height to set for the canvas.</li>
 *       <li><b>camera:</b> The Camera instance to use. A new will be created
 *         if not provided.</li>
 *       <li><b>canvas:</b> The Canvas instance to use. A new will be created
 *         if not provided.</li>
 *       <li><b>scene:</b> The Scene instance to use. A new will be created
 *         if not provided.</li>
 *     </ul>
 *
 * @return {Object} An object with three properties:
 *     `camera`, `canvas` and `scene`.
 *
 * @example
 * var create = require('ocanvas/create');
 *
 * var setup = create({
 *   element: document.getElementById('your-canvas'),
 *   background: '#000'
 * });
 *
 * var camera = setup.camera;
 * var canvas = setup.canvas;
 * var scene = setup.scene;
 *
 * @example
 * var create = require('ocanvas/create');
 *
 * var setup = create();
 * var camera = setup.camera;
 * var canvas = setup.canvas;
 * var scene = setup.scene;
 *
 * var element = canvas.element;
 * document.body.appendChild(element);
 */
module.exports = function(opt_options) {
  var options = opt_options || {};

  var canvasOptions = {};
  if (options.element) canvasOptions.element = options.element;
  if (options.background) canvasOptions.background = options.background;
  if (options.width) canvasOptions.width = options.width;
  if (options.height) canvasOptions.height = options.height;

  var canvas = options.canvas || new Canvas(canvasOptions);
  if (canvas === options.canvas) {
    canvas.setProperties(canvasOptions);
  }

  var cameraOptions = {};
  cameraOptions.width = canvas.width;
  cameraOptions.height = canvas.height;
  var camera = options.camera || new Camera(cameraOptions);
  if (camera === options.camera) {
    camera.setProperties(cameraOptions);
  }
  canvas.camera = camera;

  var scene = options.scene || new Scene();
  scene.cameras.add(camera);

  return {
    camera: camera,
    canvas: canvas,
    scene: scene
  };
};
