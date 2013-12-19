describe('Utilities', function() {
  require('./utils/defineProperties');
  require('./utils/inherit');
  require('./utils/mixin');
});

describe('Classes', function() {
  require('./classes/Canvas');
  require('./classes/Camera');
  require('./classes/EventEmitter');
  require('./classes/Collection');
  require('./classes/World');
});

describe('Shapes', function() {
  require('./shapes/base/CanvasObject');
});