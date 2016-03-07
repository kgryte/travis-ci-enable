'use strict';

// MODULES //

var tape = require( 'tape' );
var proxyquire = require( 'proxyquire' );
var noop = require( '@kgryte/noop' );
var enable = require( './../lib/enable.js' );


// FIXTURES //

var repos = require( './fixtures/repos.json' );
var getOpts = require( './fixtures/opts.js' );
var data = require( './fixtures/data.json' );
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


// TESTS //

tape( 'file exports a function', function test( t ) {
	t.equal( typeof enable, 'function', 'export is a function' );
	t.end();
});

tape( 'function throws if provided a repos argument which is not a string array', function test( t ) {
	var values;
	var opts;
	var i;

	values = [
		'5',
		5,
		NaN,
		null,
		undefined,
		true,
		[],
		['5',null],
		{},
		function(){}
	];

	opts = getOpts();
	for ( i = 0; i < values.length; i++ ) {
		t.throws( badValue( values[i] ), TypeError, 'throws a type error when provided ' + values[i] );
	}
	t.end();

	function badValue( value ) {
		return function badValue() {
			enable( value, opts, noop );
		};
	}
});

tape( 'function throws an error if provided an invalid option', function test( t ) {
	t.throws( foo, TypeError, 'invalid options argument' );
	t.throws( bar, TypeError, 'invalid option' );
	t.end();

	function foo() {
		enable( repos, null, noop );
	}
	function bar() {
		enable( repos, {'token':null}, noop );
	}
});

tape( 'function throws if not provided a token', function test( t ) {
	t.throws( foo, Error, 'requires a token' );
	t.end();

	function foo() {
		enable( repos, {'hostname':'api.travis-ci.org'}, noop );
	}
});

tape( 'function throws if provided a callback argument which is not a function', function test( t ) {
	var values;
	var opts;
	var i;

	values = [
		'5',
		5,
		NaN,
		null,
		undefined,
		true,
		[],
		{}
	];

	opts = getOpts();
	for ( i = 0; i < values.length; i++ ) {
		t.throws( badValue( values[i] ), TypeError, 'throws a type error when provided ' + values[i] );
	}
	t.end();

	function badValue( value ) {
		return function badValue() {
			enable( repos, opts, value );
		};
	}
});

tape( 'function returns an error to a provided callback if an error is encountered when making a request', function test( t ) {
	var enable;
	var opts;

	enable = proxyquire( './../lib/enable.js', {
		'./factory.js': factory
	});

	opts = getOpts();
	enable( repos, opts, done );

	function factory( opts, clbk ) {
		return function enable() {
			setTimeout( onTimeout, 0 );
			function onTimeout() {
				clbk({
					'status': 403,
					'message': 'Forbidden'
				});
			}
		};
	}

	function done( error ) {
		t.equal( error.status, 403, 'equal status' );
		t.equal( error.message, 'Forbidden', 'equal message' );
		t.end();
	}
});

tape( 'functions returns a resource hash containing results to a provided callback', function test( t ) {
	var expected;
	var enable;
	var opts;

	enable = proxyquire( './../lib/enable.js', {
		'./factory.js': factory
	});

	expected = results;

	opts = getOpts();
	enable( repos, opts, done );

	function factory( opts, clbk ) {
		return function enable() {
			setTimeout( onTimeout, 0 );
			function onTimeout() {
				clbk( null, results );
			}
		};
	}

	function done( error, results ) {
		t.deepEqual( results, expected, 'deep equal' );
		t.end();
	}
});
