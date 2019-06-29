/* eslint-disable no-undef */
import assert from 'better-assert';
import { rollup } from 'rollup';
import plugin from '../dist';


const fixtures = 'test/fixtures/';
const entryA = `${fixtures}a.js`;
const entryB = `${fixtures}b.js`;
// const entryC = `${fixtures}c.js`;
const globA = `${fixtures}{a,}.js`;
const globB = `${fixtures}{b,}.js`;
const globC = `${fixtures}{c,}.js`;
const globAB = `${fixtures}{a,b}.js`;
const globAll = `${fixtures}*.js`;

const outputA = 'exports.a = a;';
const outputB = 'exports.b = b;';
const outputC = 'console.log("La la la!");';


const onwarn = (warning) => {
	if (['EMPTY_BUNDLE'].includes(warning.code)) return;
	throw warning;
};
const codeIncludes = (output, string) => output.map(({ code }) => code.includes(string)).some((result) => result);
const codeDoesNotInclude = (output, string) => output.map(({ code }) => code.includes(string)).every((result) => !result);
const chunkIncludes = (output, chunkName, string) => output[output.map(({ name }) => name).indexOf(chunkName)].code.includes(string);
const fileNamesAre = (output, fileNames, length) => output.length === length && output.map(({ name }) => fileNames.includes(name)).every((result) => result);


const run = (entries = [], fileName, options = {}, chunks = {}) => rollup({
	input: entries,
	manualChunks: chunks,
	onwarn,
	plugins: [plugin({ fileName: fileName || 'bundle', ...options })],
}).then((bundle) => bundle.generate({ format: 'cjs', chunkFileNames: '[name].js' }))
	.then((output) => {
		const ret = [];
		if (output.output) {
			for (let obj of output.output) ret.push({ name: obj.fileName, code: obj.code });
		}
		else ret.push({ name: output.fileName, code: output.code });
		return ret;
	});


describe('rollup-plugin-entry-glob', () => {
	it('Takes a single file as input', async () => {
		assert(codeIncludes(await run(entryA), outputA));
	});

	it('Takes an array of files as input', async () => {
		assert(codeIncludes(await run([entryA, entryB]), outputA));
		assert(codeIncludes(await run([entryA, entryB]), outputB));
	});

	it('Allows an empty array as input', async () => {
		assert(codeDoesNotInclude(await run([]), 'exports'));
	});

	it('Takes a glob pattern as input', async () => {
		assert(codeIncludes(await run(globA), outputA));
	});

	it('Takes an array of glob patterns as input', async () => {
		assert(codeIncludes(await run([globA, globB]), outputA));
		assert(codeIncludes(await run([globA, globB]), outputB));
	});

	it('Allows to prevent exporting', async () => {
		assert(codeIncludes(await run(globAll, null, { exports: false }), outputC));
		assert(codeDoesNotInclude(await run(globAll, null, { exports: false }), outputA));
		assert(codeDoesNotInclude(await run(globAll, null, { exports: false }), outputB));
	});

	it('Allows to name combined bundle', async () => {
		assert(fileNamesAre(await run(globAll, 'test'), ['test.js'], 1));
	});

	it('Allows for code-splitting with include/exclude', async () => {
		assert(fileNamesAre(await run(globAll, 'test', { exclude: globC }), ['test.js', 'c.js'], 2));
	});

	it('Allows to disable combining of entry points', async () => {
		assert(fileNamesAre(await run(globAll, 'test', { exclude: '**/*' }), ['a.js', 'b.js', 'c.js'], 3));
	});

	it('Allows to selectively exclude files', async () => {
		assert(codeIncludes(await run([globAll, `!${globB}`]), outputA));
		assert(codeIncludes(await run([globAll, `!${globB}`]), outputC));
		assert(codeDoesNotInclude(await run([globAll, `!${globB}`]), outputB));
	});

	it('Works with manualChunks option', async () => {
		assert(fileNamesAre(await run(globAll, '1', { include: globC }, { '2': globAB }), ['1.js', '2.js'], 2));
		assert(chunkIncludes(await run(globAll, '1', { include: globC }, { '2': globAB }), '1.js', outputC));
		assert(chunkIncludes(await run(globAll, '1', { include: globC }, { '2': globAB }), '2.js', outputA));
		assert(chunkIncludes(await run(globAll, '1', { include: globC }, { '2': globAB }), '2.js', outputB));
	});
});
