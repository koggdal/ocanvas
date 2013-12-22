var expect = require('expect.js');
var NodeCanvas = require('canvas');

var Canvas = require('../../../../classes/Canvas');
var RectangularCanvasObject = require('../../../../shapes/base/RectangularCanvasObject');

global.HTMLCanvasElement = NodeCanvas;

describe('RectangularCanvasObject', function() {

  describe('#renderPath()', function() {

    it('should draw a path on the canvas context', function() {
      var canvas = new Canvas({
        element: new NodeCanvas(300, 150)
      });
      var object = new RectangularCanvasObject({
        width: 200,
        height: 100
      });

      var context = canvas.context;

      context.beginPath();
      object.renderPath(canvas);
      context.closePath();
      context.clip();

      context.fillStyle = 'red';
      context.fillRect(0, 0, canvas.width, canvas.height);

      var w = object.width - 1;
      var h = object.height - 1;
      expect(getColor(context, 0, 0)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, w, 0)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, w, h)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, 0, h)).to.equal('rgba(255, 0, 0, 255)');
      expect(getColor(context, w + 10, 0)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(context, 0, h + 10)).to.equal('rgba(0, 0, 0, 0)');
      expect(getColor(context, w + 10, h + 10)).to.equal('rgba(0, 0, 0, 0)');
    });

  });

});

function getColor(context, x, y) {
  var data = context.getImageData(x, y, 1, 1).data;
  return 'rgba(' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + data[3] + ')';
}
