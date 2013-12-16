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
      }
    }
  });

  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('default', [
    'exec:quickstart-dev',
    'exec:quickstart-prod'
  ]);

};
