import { createFilter } from 'rollup-pluginutils';
import matched from 'matched';


const name = 'entry-glob';
const entry = '\0rollup-plugin-entry-glob:single-entry';
const suppressed = '\0rollup-plugin-entry-glob:suppressed';


const sortArray = (arr) => {
	const scriptOrder = ['js', 'mjs', 'jsx', 'es', 'es6', 'ts', 'tsx', 'json'].reverse();
	const assetOrder = ['html', 'htm', 'php', 'css', 'scss', 'sass', 'less', 'png', 'jpg', 'jpeg', 'gif', 'svg'];
	return arr.sort((a, b) => {
		const aExt = a.split('.').pop();
		const bExt = b.split('.').pop();
		return (-scriptOrder.indexOf(aExt) + assetOrder.indexOf(aExt)) - (-scriptOrder.indexOf(bExt) + assetOrder.indexOf(bExt));
	});
};


export default function entryGlob(options) {
	const module = options.fileName
		? `\0${options.fileName}`
		: entry;
	const filter = options.include || options.exclude
		? createFilter(options.include, options.exclude)
		: createFilter('**/*');
	const imports = [];
	const chunked = [];
	const exporter = (path) => `export * from ${JSON.stringify(path)};`;
	const importer = (path) => `import ${JSON.stringify(path)};`;
	options.exports = options.exports === undefined || options.exports === true
		? true
		: false;

	return {
		name,

		options(config) {
			const ret = [module, suppressed];
			const chunks = {};
			if (config.manualChunks) {
				for (let [ chunk, patterns ] of Object.entries(config.manualChunks)) {
					chunks[chunk] = [];
					matched.sync(patterns, { realpath: true })
						.forEach((path) => {
							chunks[chunk].push(path);
							chunked.push(path);
						});
				}
			}
			if (config.input && config.input !== module) {
				matched.sync(config.input, { realpath: true })
					.forEach((path) => {
						if (!chunked.includes(path)) {
							if (filter(path)) imports.push(path);
							ret.push(path);
						}
					});
			}
			config.manualChunks = chunks;
			config.input = sortArray(ret);
		},

		resolveId(id) {
			if (id === module) return module;
			if (id === suppressed) return suppressed;
			return null;
		},

		async load(id) {
			if (id === module) {
				if (!imports.length) return Promise.resolve('');
				return Promise.resolve(options.exports
					? imports.map(exporter).join('\n')
					: imports.map(importer).join('\n'));
			} else if (id === suppressed) {
				if (!chunked.length) return Promise.resolve('');
				return Promise.resolve(chunked.map(exporter).join('\n'));
			}
		},

		async generateBundle(config, bundle) {
			const fileName = `${module.replace('\0', '_')}.js`;
			bundle[fileName].fileName = `${module.replace('\0', '')}.js`;
			if (!imports.length) delete bundle[fileName];
			delete bundle[`${suppressed.replace('\0', '_')}.js`];
			for (let [name, chunk] of Object.entries(bundle)) {
				if (imports.includes(chunk.facadeModuleId)
						&& (chunk.code === '\n' || chunk.code === '\r\n')
						&& chunk.isEntry) {
					delete bundle[name];
				}
			}
		},
	};
}
