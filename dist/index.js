'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rollupPluginutils = require('rollup-pluginutils');
var matched = _interopDefault(require('matched'));

var name = 'entry-glob';
var entry = '\0rollup-plugin-entry-glob:single-entry';
var suppressed = '\0rollup-plugin-entry-glob:suppressed';


var sortArray = function (arr) {
	var scriptOrder = ['js', 'mjs', 'jsx', 'es', 'es6', 'ts', 'tsx', 'json'].reverse();
	var assetOrder = ['html', 'htm', 'php', 'css', 'scss', 'sass', 'less', 'png', 'jpg', 'jpeg', 'gif', 'svg'];
	return arr.sort(function (a, b) {
		var aExt = a.split('.').pop();
		var bExt = b.split('.').pop();
		return (-scriptOrder.indexOf(aExt) + assetOrder.indexOf(aExt)) - (-scriptOrder.indexOf(bExt) + assetOrder.indexOf(bExt));
	});
};


function entryGlob(options) {
	if ( options === void 0 ) options = {};

	var module = options.fileName
		? ("\u0000" + (options.fileName))
		: entry;
	var filter = options.include || options.exclude
		? rollupPluginutils.createFilter(options.include, options.exclude)
		: rollupPluginutils.createFilter('**/*');
	var imports = [];
	var chunked = [];
	var exporter = function (path) { return ("export * from " + (JSON.stringify(path)) + ";"); };
	var importer = function (path) { return ("import " + (JSON.stringify(path)) + ";"); };
	options.exports = options.exports === undefined || options.exports === true
		? true
		: false;

	return {
		name: name,

		options: function options(config) {
			var ret = [];
			var chunks = {};
			if (config.manualChunks) {
				var loop = function () {
					var ref = list[i];
					var chunk = ref[0];
					var patterns = ref[1];

					chunks[chunk] = [];
					matched.sync(patterns, { realpath: true })
						.forEach(function (path) {
							chunks[chunk].push(path);
							chunked.push(path);
						});
				};

				for (var i = 0, list = Object.entries(config.manualChunks); i < list.length; i += 1) loop();
			}
			if (config.input && config.input !== module) {
				matched.sync(config.input, { realpath: true })
					.forEach(function (path) {
						if (!chunked.includes(path)) {
							if (filter(path)) { imports.push(path); }
							else { ret.push(path); }
						}
					});
			}
			config.manualChunks = chunks;
			config.input = Object.entries(chunks).length
				? [module, suppressed ].concat( sortArray(ret))
				: [module ].concat( sortArray(ret));
		},

		resolveId: function resolveId(id) {
			if (id === module) { return module; }
			if (id === suppressed) { return suppressed; }
			return null;
		},

		load: async function load(id) {
			if (id === module) {
				if (!imports.length) { return Promise.resolve(''); }
				return Promise.resolve(options.exports
					? imports.map(exporter).join('\n')
					: imports.map(importer).join('\n'));
			} else if (id === suppressed) {
				if (!chunked.length) { return Promise.resolve(''); }
				return Promise.resolve(chunked.map(exporter).join('\n'));
			}
		},

		generateBundle: async function generateBundle(config, bundle) {
			var fileName = (module.replace('\0', '_')) + ".js";
			if (bundle[fileName]) { bundle[fileName].fileName = (module.replace('\0', '')) + ".js"; }
			if (!imports.length) { delete bundle[fileName]; }
			// I'm pretty sure this test is only valid when using
			// rollup-plugin-iife
			if (bundle[fileName] && /^\s*\(function\s*\(\)\s*\{\s*\}\)\(\);\s*$/g.test(bundle[fileName].code)) { delete bundle[fileName]; }
			delete bundle[((suppressed.replace('\0', '_')) + ".js")];
			// Get rid of empty bundles when using non-javascript files
			// as entry points
			for (var i = 0, list = Object.entries(bundle); i < list.length; i += 1) {
				var ref = list[i];
				var name = ref[0];
				var chunk = ref[1];

				if (imports.includes(chunk.facadeModuleId) && chunk.isEntry) {
					delete bundle[name];
				}
			}
		},
	};
}

module.exports = entryGlob;
//# sourceMappingURL=index.js.map
