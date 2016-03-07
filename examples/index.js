'use strict';

var enable = require( './../lib' );

var opts = {
	'repos': [
		'math-io/erf',
		'math-io/erfc',
		'math-io/erfinv'
	],
	'token': 'tkjorjk34ek3nj4!'
};

enable( opts, clbk );

function clbk( error, results ) {
	if ( error ) {
		throw new Error( error.message );
	}
	console.dir( results );
}
