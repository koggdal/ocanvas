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
  require('./classes/PointerEvent');
  require('./classes/Pool');
  require('./classes/World');
});

describe('Shapes', function() {
  require('./shapes/base/CanvasObject');
  require('./shapes/base/RectangularCanvasObject');
  require('./shapes/Rectangle');
});

describe('Helpers', function() {
  require('./create');
});
