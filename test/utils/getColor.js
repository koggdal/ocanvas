
module.exports = function(context, x, y) {
  var data = context.getImageData(x, y, 1, 1).data;
  return 'rgba(' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + data[3] + ')';
};
