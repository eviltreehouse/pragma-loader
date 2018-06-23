const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const BUILD_WITH_DEBUG = true;

module.exports = {
	entry: [ './src/main.js' ],
	output: {
		path: path.resolve('.'),
		filename: 'bundle.js'
	},
	resolveLoader: {
		alias: {
			'custom-conditional-loader': path.join(__dirname, 'webpack-conditional-loader-custom')
		}
	},
	plugins: [
    		new UglifyJsPlugin({ 'test': /\.js$/ })
	],
	module: { 
	  rules: [{
		test: /\.js$/,
		use: [ 
			{ loader: 'custom-conditional-loader', 'options': { 'DEBUG': BUILD_WITH_DEBUG } } 
		]
	  }]
	}
};
