module.exports = function(num, precision) {
  var factor = precision ? Math.pow(10, precision) : 1;
  return Math.round(num * factor) / factor;
};
