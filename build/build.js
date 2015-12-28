var fs = require("fs"),
  path = require('path'),
	uglify = {
		parser: require("./lib/parse-js.js"),
		processor: require("./lib/process.js")
	},

	// Set the config filename
	configfile = path.join(__dirname, "config"),

	output_full_latest, output_min_latest,
	config, version, source_dir, output_dir, output_full, output_min, head, filenames, foot, i,
	ast, minified_source,

	files = [],
	numFiles = 0,

	isRelease = process.argv[2] === "release",

	source = "";

// Get config file
console.log("Reading config file...");
config = fs.readFileSync(configfile, "UTF-8");

// Get variables from config file
version = /^version = (.*)$/m.exec(config)[1];
source_dir = path.join(__dirname, /^source_dir = (.*)$/m.exec(config)[1]);
output_dir = path.join(__dirname, isRelease ? 'dist' : 'dev');
output_full = path.join(output_dir, /^output_full = (.*)$/m.exec(config)[1].replace("{version}", version));
output_min = path.join(output_dir, /^output_min = (.*)$/m.exec(config)[1].replace("{version}", version));
output_full_latest = path.join(output_dir, 'latest', 'ocanvas.js');
output_min_latest = path.join(output_dir, 'latest', 'ocanvas.min.js');
head = /head\s-----\s([\s\S]*?)-----\s/g.exec(config)[1].replace("{version}", version).replace("{year}", "2011-" + (new Date()).getFullYear());
filenames = /files\s-----\s([\s\S]*?)\s-----/g.exec(config)[1].split(/\s/);
foot = /foot\s-----\s([\s\S]*?)\s-----/g.exec(config)[1].split(/\s/);
numFiles = filenames.length;
filenames = filenames.concat(foot);

// Get all the source files
for (i = 0; i < filenames.length; i++) {
	console.log("Reading file: " + filenames[i]);

	// Add current file
	files.push({
		name: filenames[i],
		content: fs.readFileSync(source_dir + filenames[i], "UTF-8")
	});
}

// Start the building process
console.log("Building source file...");

// Add the head code to the top of the file
source = head;

// Loop through all files and append the source
for (i = 0; i < numFiles; i++) {

	// Replace the self executing anonymous functions that wrap each file
	// Only the end of core will be removed, and added to the end of the new file
	if (files[i].name === "core.js") {
		files[i].content = files[i].content.replace(/\}(\s|)\)(\s|)\(window,(\s|)document(\s|)\);/, "");
	} else {
		files[i].content = files[i].content.replace(/\(function(\s|)\((\s|)oCanvas,(\s|)window,(\s|)document,(\s|)undefined(\s|)\)(\s|)\{/, "");
		files[i].content = files[i].content.replace(/\}(\s|)\)(\s|)\((\s|)oCanvas,(\s|)window,(\s|)document(\s|)\);/, "");
	}

	// Append the file to the full source
	source += "\n" + files[i].content;

	// Append the end of the core wrapper
	if (i === numFiles - 1) {
		source += "\n})(window, document);";
	}
}

// Loop through all foot files
for (i = numFiles; i < numFiles + foot.length; i++) {

	// Append the file to the full source
	source += "\n" + files[i].content;
}

// Create the output dir folder
// (if it already exists it will throw and we'll catch it to hide it)
try {
	fs.mkdirSync(output_dir);
} catch (error) {}

// Save source to output file
fs.writeFileSync(output_full, source, "UTF-8");
console.log("Source file saved as: " + output_full);

// Run UglifyJS to minify the source
console.log("Minifying source with UglifyJS...");
ast = uglify.parser.parse(source);
ast = uglify.processor.ast_mangle(ast);
ast = uglify.processor.ast_squeeze(ast);
ast = uglify.processor.ast_squeeze_more(ast);
minified_source = uglify.processor.gen_code(ast);

// Save minified source file
fs.writeFileSync(output_min, head + minified_source, "UTF-8");
console.log("Minified source file saved as: " + output_min);

// Save latest files for release mode
if (isRelease) {
	fs.writeFileSync(output_full_latest, source, "UTF-8");
	console.log("Source file for latest release saved as: " + output_full_latest);

	fs.writeFileSync(output_min_latest, head + minified_source, "UTF-8");
	console.log("Minified source file for latest release saved as: " + output_min_latest);
}
