# [oCanvas](http://ocanvas.org/) - Object-based canvas drawing
oCanvas makes canvas development easier to understand and do, by creating a bridge between the native pixel drawing approach and objects that are created and added to canvas. It is now possible to very easily create objects, change properties of these objects and add events to them — and everything just works because oCanvas handles the background stuff for you.

## Building your own oCanvas
The git repo contains a build directory with a build script. That will combine all modules specified in the config file and output one file with the full source and one file with the minified source.

The script uses [Node](http://nodejs.org/), so you need to install that first. The minification is done by [UglifyJS](https://github.com/mishoo/UglifyJS) which is included in the repo.

First you need to get your own copy of the source files, by running the following in the terminal:
`git clone git://github.com/koggdal/ocanvas.git`

Then navigate to the build directory by running:
`cd ocanvas/build`

Finally run the build command:
`node build.js`

You will now have two source files in the build directory: ocanvas-x.x.x.js and ocanvas-x.x.x.min.js

## Documentation
All the documentation can be found at the website, <http://ocanvas.org/>
