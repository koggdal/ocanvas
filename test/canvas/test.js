describe('Classes', function() {
  require('./classes/Camera');
  require('./classes/Canvas');
  require('./classes/Scene');
});

describe('Shapes', function() {
  require('./shapes/base/CanvasObject');
  require('./shapes/base/RectangularCanvasObject');
  require('./shapes/Rectangle');
  require('./shapes/Ellipse');
});

describe('Textures', function() {
  require('./textures/ImageTexture');
  require('./textures/SpriteTexture');
});
