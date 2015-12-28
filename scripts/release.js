var semver = require('semver');
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

var pkg = require('../package.json');

var PATH_BUILD_SCRIPT = path.join(__dirname, '../build/build.js');
var PATH_BUILD_CONFIG = path.join(__dirname, '../build/config');
var PATH_INDEX = path.join(__dirname, '../index.js');
var PATH_CORE = path.join(__dirname, '../src/core.js');
var PATH_PKG = path.join(__dirname, '../package.json');
var ROOTPATH_BUILD_CONFIG = path.relative(
  path.join(__dirname, '../'), PATH_BUILD_CONFIG
);
var ROOTPATH_INDEX = path.relative(path.join(__dirname, '../'), PATH_INDEX);
var ROOTPATH_CORE = path.relative(path.join(__dirname, '../'), PATH_CORE);
var ROOTPATH_PKG = path.relative(path.join(__dirname, '../'), PATH_PKG);

var args = process.argv.slice(2);

var releaseType = args[0];

var currentVersion = pkg.version;
var newVersion;

switch (releaseType) {
case 'major':
case 'minor':
case 'patch':
  newVersion = semver.inc(currentVersion, releaseType);
  break;
default:
  console.log('Please specify a release type (major|minor|patch).');
  process.exit(0);
}

console.log('##################################');
console.log('##    oCanvas Release Script    ##');
console.log('##################################');
console.log('');
console.log('Release Type:\t\t' + releaseType);
console.log('Current Version:\t' + currentVersion);
console.log('New Version:\t\t' + newVersion);
console.log('');

console.log('Updating build config: ' + ROOTPATH_BUILD_CONFIG);
var buildConfig = fs.readFileSync(PATH_BUILD_CONFIG, 'utf-8');
var newBuildConfig = buildConfig.replace(
  /^version = .*$/m, 'version = ' + newVersion
);
fs.writeFileSync(PATH_BUILD_CONFIG, newBuildConfig);

console.log('Updating index file: ' + ROOTPATH_INDEX);
var indexFile = fs.readFileSync(PATH_INDEX, 'utf-8');
var newIndexFile = indexFile.replace(
  /^(.*?oCanvas v).*$/m, '$1' + newVersion
).replace(
  /^(.*?Copyright \d+-)\d+/m, '$1' + new Date().getFullYear()
);
fs.writeFileSync(PATH_INDEX, newIndexFile);

console.log('Updating core file: ' + ROOTPATH_CORE);
var coreFile = fs.readFileSync(PATH_CORE, 'utf-8');
var newCoreFile = coreFile.replace(
  /^(\s+version: ").*?"/m, '$1' + newVersion + '"'
);
fs.writeFileSync(PATH_CORE, newCoreFile);

console.log('Updating package.json: ' + ROOTPATH_PKG);
var pkgFile = fs.readFileSync(PATH_PKG, 'utf-8');
var newPkgFile = pkgFile.replace(
  /^(\s+"version": ").*?"/m, '$1' + newVersion + '"'
);
fs.writeFileSync(PATH_PKG, newPkgFile);

console.log('');

console.log('Building oCanvas v' + newVersion + '...');
var buildCommand = 'node ' + PATH_BUILD_SCRIPT + ' release';
child_process.exec(buildCommand, function(error, stdout) {
  if (error) {
    console.log('Build failed!');
    console.error(error);
    process.exit(0);
  }

  console.log('');
  console.log(stdout);
  console.log('');
  console.log('Build done!');

  console.log('');
  console.log('Committing to git...');
  var commitCommand = 'git add -A && git commit -m "' + newVersion + '"';
  child_process.exec(commitCommand, function(error, stdout) {
    if (error) {
      console.log('Commit failed!');
      console.error(error);
      process.exit(0);
    }

    console.log('');
    console.log(stdout);
    console.log('');
    console.log('Commit done!');

    console.log('');
    console.log('Adding git tag...');
    child_process.exec('git tag v' + newVersion, function(error, stdout) {
      if (error) {
        console.log('Git tag failed!');
        console.error(error);
        process.exit(0);
      }

      console.log('');
      console.log(stdout);
      console.log('');
      console.log('Git tag: v' + newVersion);

      console.log('');

      console.log('###################');
      console.log('##    Results    ##');
      console.log('###################');
      console.log('');
      console.log('Version has been updated and committed to git.');
      console.log('Now:');
      console.log('');
      console.log('1. Update master branch:');
      console.log('   git checkout master');
      console.log('   git merge develop');
      console.log('');
      console.log('2. Push to GitHub:');
      console.log('   git push origin master');
      console.log('   git push origin develop');
      console.log('   git push --tags');
      console.log('');
      console.log('3. Publish to npm:');
      console.log('   npm publish');
      console.log('');
      console.log('4. Update website');
    });
  });
});
