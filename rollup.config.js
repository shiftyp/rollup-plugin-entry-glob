import buble from 'rollup-plugin-buble';
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
				dangerousForOf: true,
			},
		}),
		filesize(),
	],
};
