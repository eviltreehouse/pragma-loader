const path = require('path');

const BUILD_WITH_DEBUG = true;

const PLUGINS = [];

if (process.env['UGLIFY'] == 1) {
	const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
	PLUGINS.push(new UglifyJsPlugin({ 'test': /\.js$/ }));
}

module.exports = {
	entry: [ './test/src/main.js' ],
	output: {
		path: path.resolve('.'),
		filename: 'test.bundle.js'
	},
	resolveLoader: {
		alias: {
			'pragma-loader': path.join(__dirname, '..', 'src', 'pragma-loader')
		}
	},
	plugins: PLUGINS,
	module: { 
	  rules: [{
		test: /\.js$/,
		use: [ 
			{ loader: 'pragma-loader', 
			'options': { 
				'$delete': true,
				'$env': 'USER,PWD',
				'DEBUG': BUILD_WITH_DEBUG
			 } 
			} 
		]
	  }]
	}
};
