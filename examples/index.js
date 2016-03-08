'use strict';

var enable = require( './../lib' );

var repos = [
	'math-io/erf',
	'math-io/erfc',
	'math-io/erfinv'
];

var opts = {
	'token': 'tkjorjk34ek3nj4!'
};

enable( repos, opts, clbk );

function clbk( error, results ) {
	if ( error ) {
		throw new Error( error.message );
	}
	console.dir( results );
}
