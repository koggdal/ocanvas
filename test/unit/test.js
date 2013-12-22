describe('Utilities', function() {
  require('./utils/defineProperties');
  require('./utils/inherit');
  require('./utils/json');
  require('./utils/mixin');
});

describe('Classes', function() {
  require('./classes/Canvas');
  require('./classes/Camera');
  require('./classes/EventEmitter');
  require('./classes/Collection');
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
