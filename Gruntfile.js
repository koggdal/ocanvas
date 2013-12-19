module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    exec: {
      'quickstart-dev': {
        cmd: function() {
          return 'mkdir -p ./builds && ./node_modules/quickstart/quickstart > ./builds/ocanvas.js';
        }
      },
      'quickstart-prod': {
        cmd: function() {
          return 'mkdir -p ./builds && ./node_modules/quickstart/quickstart --compress > ./builds/ocanvas.min.js';
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
            'echo "\nOpen coverage.html in your browser to see results for code coverage."'
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

};
