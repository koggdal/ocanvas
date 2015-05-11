module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    exec: {
      'quickstart-dev': 'mkdir -p ./builds && ./node_modules/.bin/quickstart --main browser.js > ./builds/ocanvas.js',
      'quickstart-prod': 'mkdir -p ./builds && ./node_modules/.bin/quickstart --main browser.js --compress > ./builds/ocanvas.min.js',
      'coverage': {
        cmd: function() {
          var mochaTests = [
            'test/unit/test.js',
            'test/canvas/test.js'
          ];
          var commands = [
            './node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha ' + mochaTests.join(' '),
            'echo "\nOpen coverage/lcov-report/index.html in your browser to see the full results for code coverage."'
          ];
          return commands.join(' && ');
        }
      },
      'test-unit': './node_modules/.bin/mocha test/unit/test.js -R spec',
      'test-canvas': {
        cmd: function() {
          var condition = '[ -e node_modules/canvas ]';
          var tests = './node_modules/.bin/mocha test/canvas/test.js -R spec';
          var canvasMessage = 'echo "\nNOTE: node-canvas is not installed, so no tests were run.\n"';
          return condition + ' && (' + tests + ' || echo "") || ' + canvasMessage;
        }
      },
      'test': {
        cmd: function() {
          var condition = '[ -e node_modules/canvas ]';
          var all = './node_modules/.bin/mocha test/unit/test.js test/canvas/test.js -R spec';
          var unit = './node_modules/.bin/mocha test/unit/test.js -R spec';
          var canvasMessage = 'echo "\nNOTE: node-canvas is not installed, so only normal unit tests were run.\n"';
          return condition + ' && (' + all + ' || echo "") || (' + unit + ' && ' + canvasMessage + ')';
        }
      },
      'test-simple': {
        cmd: function() {
          var condition = '[ -e node_modules/canvas ]';
          var all = './node_modules/.bin/mocha test/unit/test.js test/canvas/test.js -R dot';
          var unit = './node_modules/.bin/mocha test/unit/test.js -R dot';
          var canvasMessage = 'echo "\nNOTE: node-canvas is not installed, so only normal unit tests were run.\n"';
          return condition + ' && (' + all + ' || echo "") || (' + unit + ' && ' + canvasMessage + ')';
        }
      },
      'jsdoc': {
        cmd: function() {
          var commands = [
            'jsdoc -r classes shapes utils pointers create.js index.js -d docs',
            'echo "\nJSDoc Documentation is now created in docs/"',
            'echo "\nRun \\`http-server docs\\` and open your browser to localhost:<port>"'
          ];
          return commands.join(' && ');
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('default', [
    'exec:test-simple',
    'exec:quickstart-dev',
    'exec:quickstart-prod'
  ]);

  grunt.registerTask('build', [
    'exec:quickstart-dev',
    'exec:quickstart-prod'
  ]);

  grunt.registerTask('coverage', [
    'exec:coverage'
  ]);

  grunt.registerTask('test', [
    'exec:test'
  ]);

  grunt.registerTask('test-simple', [
    'exec:test-simple'
  ]);

  grunt.registerTask('test-unit', [
    'exec:test-unit'
  ]);

  grunt.registerTask('test-canvas', [
    'exec:test-canvas'
  ]);

  grunt.registerTask('jsdoc', [
    'exec:jsdoc'
  ]);

};
