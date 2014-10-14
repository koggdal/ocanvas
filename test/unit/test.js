describe('Utilities', function() {
  require('./utils/defineProperties');
  require('./utils/getClassName');
  require('./utils/inherit');
  require('./utils/isInstanceOf');
  require('./utils/json');
  require('./utils/matrix');
  require('./utils/mixin');
});

describe('Classes', function() {
  require('./classes/Cache');
  require('./classes/Canvas');
  require('./classes/Camera');
  require('./classes/EventEmitter');
  require('./classes/ObjectEvent');
  require('./classes/ObjectEventEmitter');
  require('./classes/Collection');
  require('./classes/Pool');
  require('./classes/Scene');
});

describe('Pointers', function() {
  require('./pointers/PointerEvent');
  require('./pointers/private/PointerData');
  require('./pointers/private/scene');
  require('./pointers/private/state');
  require('./pointers/private/positions');
  require('./pointers/private/emitter');
  require('./pointers/private/controller');
  require('./pointers/private/normalizer');
  require('./pointers/index');
});

describe('Keyboard', function() {
  require('./keyboard/KeyboardEvent');
  require('./keyboard/private/keys');
  require('./keyboard/private/controller');
  require('./keyboard/index');
});

describe('Shapes', function() {
  require('./shapes/base/index');
  require('./shapes/base/CanvasObject');
  require('./shapes/base/RectangularCanvasObject');
  require('./shapes/base/EllipticalCanvasObject');
  require('./shapes/index');
  require('./shapes/Rectangle');
  require('./shapes/Ellipse');
  require('./shapes/Circle');
});

describe('Textures', function() {
  require('./textures/index');
  require('./textures/Texture');
  require('./textures/ColorTexture');
  require('./textures/ImageTexture');
});

describe('Tracker', function() {
  require('./tracker/TrackerAttractor');
  require('./tracker/TrackerRepeller');
  require('./tracker/TrackerPusher');
  require('./tracker/Tracker');
});

describe('Helpers', function() {
  require('./create');
});
