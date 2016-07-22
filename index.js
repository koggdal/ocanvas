/**
 * oCanvas v2.8.5
 * http://ocanvas.org/
 *
 * Copyright 2011-2016, Johannes Koggdal
 * Licensed under the MIT license
 * http://ocanvas.org/license
 *
 * Including Xccessors by Eli Grey
 * Including easing equations by Robert Penner
 */

require('./src/core');
require('./src/utils');
require('./src/timeline');
require('./src/keyboard');
require('./src/mouse');
require('./src/touch');
require('./src/tools');
require('./src/events');
require('./src/draw');
require('./src/background');
require('./src/scenes');
require('./src/style');
require('./src/animation');
require('./src/displayobject');
require('./src/displayobjects/rectangle');
require('./src/displayobjects/image');
require('./src/displayobjects/text');
require('./src/displayobjects/arc');
require('./src/displayobjects/ellipse');
require('./src/displayobjects/polygon');
require('./src/displayobjects/line');
require('./src/displayobjects/sprite');
require('./src/xccessors');

module.exports = global.oCanvas;
delete global.oCanvas;
