'use strict';

// MODULES //

var tape = require( 'tape' );
var proxyquire = require( 'proxyquire' );
var noop = require( '@kgryte/noop' );
var pipeline = require( './../lib/pipeline.js' );


// FIXTURES //

var repos = require( './fixtures/ids.json' );
var getOpts = require( './fixtures/opts.js' );
var data = require( './fixtures/data.json' );
var info = require( './fixtures/info.json' );
var results = {
	'meta': {
		'total': 2,
		'success': 2,
		'failure': 0
	},
	'data': {
		'math-io/erf': data[ 0 ],
		'math-io/erfc': data[ 1 ]
	},
	'failures': {}
};

function sync( error ) {
	return function sync( opts, clbk ) {
		setTimeout( onTimeout, 0 );
		function onTimeout() {
			if ( error ) {
				return clbk( error );
			}
			clbk();
		}
	};
}

function repoinfo( error, info ) {
	return function repoinfo( opts, clbk ) {
		setTimeout( onTimeout, 0 );
		function onTimeout() {
			if ( error ) {
				return clbk( error );
			}
			clbk( null, info );
		}
	};
}

function request( error, results ) {
	return function request( repos, opts, clbk ) {
		setTimeout( onTimeout, 0 );
		function onTimeout() {
			if ( error ) {
				return clbk( error );
			}
			clbk( null, results );
		}
	};
}


// TESTS //

tape( 'main export is a function', function test( t ) {
	t.equal( typeof pipeline, 'function', 'main export is a function' );
	t.end();
});
