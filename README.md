# rollup-plugin-entry-glob

This plugin is based on excellent, if limited, [rollup-plugin-multi-entry](https://github.com/rollup/rollup-plugin-multi-entry).

`rollup-plugin-entry-glob` allows you to specify globs as entry points (or `manualChunks`) for your rollup bundle. Unlike the afformention plugin, you can choose which entry points to combine and which ones to use code-splitting for.

This is achieved by changing the way includes/excludes work. If you need rollup to completely ignore some files matched by entry glob, specify another entry glob (or a regular path) matching only those files prefixed by `!`.

## Usage

This plugin requires at least v0.48.0 of rollup.

In `rollup.config.js`:
```javascript
import entryGlob from 'rollup-plugin-entry-glob';

module.exports = {
	input: 'src/**/*.js',
	output: {
		dir: 'dist/',
		format: 'es',
	},
	plugins: [
		entryGlob(),
	],
};
```

The entry above is the simplest form of using this plugin. It will include all the javascript files in your project source tree.

You can also pass:
```javascript
// A single path (like not using this plugin)
input: 'src/index.js',
// ...

// Array of paths
input: ['src/a.js', 'src/b.js', ...],
// ...

// Array of globs
input: ['src/**/*.js', 'src/**/*.html', ...],
// ...
// Note: to import files other than javascript you need other plugins

// Or a mixed array
input: ['src/index.js', 'src/subdir/*.js', ...],
// ...

// To include all files except boring.js
input: ['src/**/*.js', '!**/boring.js'],
// ...
```

`options.include` and `options.exclude` specify which entry points should
be combined into a single bundle. By default all entry points are combined. If you want to combine only specific files, specify them in
`options.include`. If you want to have separate bundle, put selected files in `options.exclude` and `manualChunks`.

For example:
```javascript
module.exports = {
	input: 'src/**/*.js',
	output: {
		dir: 'dist/',
		format: 'cjs',
		chunkFileNames: '[name].js',
	},
	manualChunks: {
		second: ['src/second/*.js'],
	},
	plugins: [
		entryGlob({
			fileName: 'first',
			exclude: 'src/second/*.js',
		}),
	],
};
```
With this config you'll have 2 bundles in the `dist/` directory, `first.js` containing all the code from `src/` except files in `src/second/` subdirectory and `second.js`, containing the rest of the code.


## Options
- `include (string | string[]; default: '**/*')`: A path/glob or an array of paths/globs to combine into a single bundle.
- `exclude (string | string[]; default: undefined)`: Like include, but files matching this pattern will be split into separate bundles. You can use `manualChunks` for additional combining rules.
- `fileName (string; default 'rollup-plugin-entry-glob:single-entry')`: A name for the final bundle.
- `exports (boolean; default: true)`: Weather the final bundle should export anything.
