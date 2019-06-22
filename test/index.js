import { ok } from 'assert';
import { rollup } from 'rollup';
import entryGlob from '../dist/';


const fileName = 'index';


function includes(string, substring) {
	if (!string.includes(substring)) {
		ok(false, `expected ${JSON.stringify(string)} to include ${JSON.stringify(substring)}}`);
	}
}


function doesNotInclude(string, substring) {
	if (string.includes(substring)) {
		ok(false, `expected ${JSON.stringify(string)} NOT to include ${JSON.stringify(substring)}}`);
	}
}


function getOutput(entries, pluginOptions = { fileName }) {
	return rollup({ input: entries, plugins: [entryGlob(pluginOptions)]})
		.then((bundle) => bundle.generate({ format: 'cjs' }))
		.then((output) => {
			const ret = [];
			if (output.output) {
				for (let obj of output.output) {
					ret.push({
						fileName: obj.fileName,
						code: obj.code || '',
					});
				}
			} else{
				ret.push({
					fileName: output.fileName,
					code: output.code || '',
				});
			}
			return ret;
		});
}


describe('rollup-plugin-entry-glob', () => {
	it('Takes a single file as input', () => {
		getOutput('test/fixtures/a.js')
			.then((output) => output.map(({ code }) => includes(code, 'exports.a = a;')));
	});

	it('Takes an array of files as input', () => {
		getOutput(['test/fixtures/a.js', 'test/fixtures/b.js'])
			.then((output) => output.map(({ code }) => {
				includes(code, 'exports.a = a;');
				includes(code, 'exports.b = b;');
			}));
	});

	it('Allows empty array as input', () => {
		getOutput([]).then((output) => output.map(({ code }) => doesNotInclude(code, 'exports')));
	});

	it('Takes glob as input', () => {
		getOutput('test/fixtures/{a,}.js')
			.then((output) => output.map(({ code }) => includes(code, 'exports.a = a;')));
	});

	it('Takes array of globs as input', () => {
		getOutput(['test/fixtures/{a,}.js', 'test/fixtures/{b,}.js'])
			.then((output) => output.map(({ code }) => {
				includes(code, 'exports.a = a;');
				includes(code, 'exports.b = b;');
			}));
	});

	it('Allows to prevent exporting', () => {
		getOutput('test/fixtures/*.js', { fileName, exports: false })
			.then((output) => output.map(({ code }) => {
				includes(code, 'console.log("La la la!");');
				doesNotInclude(code, 'exports.a = a;');
				doesNotInclude(code, 'exports.b = b;');
				doesNotInclude(code, 'exports.c = c;');
			}));
	});

	it('Allows naming combined bundle', () => {
		getOutput('test/fixtures/*.js', { fileName: 'testing' })
			.then((output) => output.map(({ fileName }) => includes(fileName, 'testing')));
	});

	it('Allows for code splitting with include/exclude', () => {
		getOutput('test/fixtures/*.js', { exclude: '**/c.js', fileName })
			.then((output) => {
				const names = output.map(({ fileName }) => fileName);
				if (output.length !== 2) {
					ok(false, 'Expected 2 bundles');
				}
				if (!names.includes('c.js') || !names.includes('_index.js')) {
					ok(false, 'Bundle names don\'t match');
				}
			});
	});

	it('Allows to disable combining of entry points', () => {
		getOutput('test/fixtures/*.js', { fileName, exclude: '**/*' })
			.then((output) => {
				const names = output.map(({ fileName }) => fileName);
				if (output.length !== 4) {
					ok(false, 'Expected 3 bundles');
				}
				if (!names.includes('a.js') || !names.includes('b.js') || !names.includes('c.js')) {
					ok(false, 'Bundle names don\'t match');
				}
			});
	});
});
