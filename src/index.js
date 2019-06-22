import { createFilter } from 'rollup-pluginutils';
import matched from 'matched';


const name = 'entry-glob';
const entry = '\0rollup-plugin-entry-glob:single-entry';


export default function entryGlob(options) {
	const module = options.fileName
		? `\0${options.fileName}`
		: entry;
	const filter = options.include || options.exclude
		? createFilter(options.include, options.exclude)
		: createFilter('**/*');
	const imports = [];
	const exporter = (path) => `export * from ${JSON.stringify(path)};`;
	const importer = (path) => `import ${JSON.stringify(path)};`;
	options.exports = options.exports === undefined || options.exports === true
		? true
		: false;

	return {
		name,

		options(config) {
			const ret = [module];
			if (config.input && config.input !== module) {
				matched.sync(config.input, { realpath: true })
					.forEach((path) => {
						if (filter(path)) imports.push(path);
						else ret.push(path);
					});
			}
			config.input = ret;
		},

		resolveId(id) {
			if (id === module) return module;
			return null;
		},

		async load(id) {
			if (id === module) {
				if (!imports.length) return Promise.resolve('');
				return Promise.resolve(options.exports
					? imports.map(exporter).join('\n')
					: imports.map(importer).join('\n'));
			}
		},
	};
}
