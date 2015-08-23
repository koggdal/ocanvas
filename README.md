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

You will now have two source files in the build/dev/ directory: ocanvas-x.x.x.js and ocanvas-x.x.x.min.js

## Documentation
All the documentation can be found at the website, <http://ocanvas.org/>

## Issue reporting
Issues should be reported on GitHub, and every good issue should contain a good description, details about oCanvas version, operating system and browser. A test case of some sorts is also very much appreciated.

## Contributing
oCanvas is an open source project created and maintained by me (Johannes Koggdal). It would be great to get some more developers working on it, since I can't possibly make everything on my spare time. If you want to help out—reach out to me, so we can sync up to avoid double work. Then just send a pull request to get it in.

I have two main branches, `master` and `develop`, where `develop` is the branch where everything happens. When a new version is about to be released, it gets merged to `master`, where the version number is updated. So if you want to help out, make sure you're working on top of `develop`.
