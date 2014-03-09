var fs = require('fs');
var path = require('path');

module.exports = function(canvas, filePath, opt_callback) {
  filePath = __dirname + '/../output/' + filePath;

  fs.mkdir(path.dirname(filePath), function() {

    var out = fs.createWriteStream(filePath);
    var stream = canvas.pngStream();

    stream.on('data', function(chunk) {
      out.write(chunk);
    });

    if (opt_callback) stream.on('end', opt_callback);

  });
};
