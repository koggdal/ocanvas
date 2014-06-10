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
  require('./pointers/PointerData');
  require('./pointers/scene');
  require('./pointers/state');
  require('./pointers/positions');
  require('./pointers/emitter');
  require('./pointers/controller');
  require('./pointers/normalizer');
  require('./pointers/index');
});

describe('Keyboard', function() {
  require('./keyboard/KeyboardEvent');
  require('./keyboard/private/keys');
  require('./keyboard/private/controller');
  require('./keyboard/index');
});

describe('Shapes', function() {
  require('./shapes/base/CanvasObject');
  require('./shapes/base/RectangularCanvasObject');
  require('./shapes/Rectangle');
});

describe('Helpers', function() {
  require('./create');
});
