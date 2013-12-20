module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    exec: {
      'quickstart-dev': {
        cmd: function() {
          return 'mkdir -p ./builds && ./node_modules/quickstart/quickstart --main browser.js > ./builds/ocanvas.js';
        }
      },
      'quickstart-prod': {
        cmd: function() {
          return 'mkdir -p ./builds && ./node_modules/quickstart/quickstart --main browser.js --compress > ./builds/ocanvas.min.js';
        }
      },
      'coverage': {
        cmd: function() {
          var mochaTests = [
            'test/unit',
            'test/canvas'
          ];
          var commands = [
            'mocha ' + mochaTests.join(' ') + ' --require blanket -R html-cov | sed \'s?\'`pwd`\'/??g\' > coverage.html',
            'echo "\nCoverage: `sed -n \'s/.*id="stats".*class="percentage">\\(.*\\)<.*<.*sloc.*/\\1/p\' coverage.html`"',
            'echo "\nOpen coverage.html in your browser to see the full results for code coverage."'
          ];
          return commands.join(' && ');
        }
      },
      'test-unit': {
        cmd: function() {
          return 'mocha test/unit -R spec';
        }
      },
      'test-canvas': {
        cmd: function() {
          var condition = '[ -e node_modules/canvas ]';
          var tests = 'mocha test/canvas -R spec';
          var canvasMessage = 'echo "\nNOTE: node-canvas is not installed, so no tests were run.\n"';
          return condition + ' && ' + tests + ' || ' + canvasMessage;
        }
      },
      'test': {
        cmd: function() {
          var condition = '[ -e node_modules/canvas ]';
          var all = 'mocha test/unit test/canvas -R spec';
          var unit = 'mocha test/unit -R spec';
          var canvasMessage = 'echo "\nNOTE: node-canvas is not installed, so only normal unit tests were run.\n"';
          return condition + ' && ' + all + ' || (' + unit + ' && ' + canvasMessage + ')';
        }
      },
      'test-simple': {
        cmd: function() {
          var condition = '[ -e node_modules/canvas ]';
          var all = 'mocha test/unit test/canvas';
          var unit = 'mocha test/unit';
          var canvasMessage = 'echo "\nNOTE: node-canvas is not installed, so only normal unit tests were run.\n"';
          return condition + ' && ' + all + ' || (' + unit + ' && ' + canvasMessage + ')';
        }
      },
      'jsdoc': {
        cmd: function() {
          var commands = [
            'jsdoc -r classes shapes utils index.js -d docs',
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
