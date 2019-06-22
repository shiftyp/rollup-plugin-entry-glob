import buble from 'rollup-plugin-buble';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';


import pkg from './package.json';


module.exports = {
	external: [...Object.keys(pkg.dependencies)],
	input: 'src/index.js',
	output: [
		{
			file: 'dist/index.js',
			format: 'cjs',
			sourcemap: true,
		},
		{
			file: 'dist/index.esm.js',
			format: 'esm',
			sourcemap: true,
		},
	],
	plugins: [
		buble({
			transforms: {
				asyncAwait: false,
			},
		}),
		terser({
			compress: true,
			mangle: true,
			sourcemap: true,
		}),
		filesize(),
	],
};
