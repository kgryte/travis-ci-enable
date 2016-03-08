'use strict';

// MODULES //

var tape = require( 'tape' );
var proxyquire = require( 'proxyquire' );
var noop = require( '@kgryte/noop' );
var factory = require( './../lib/factory.js' );


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
	t.equal( typeof factory, 'function', 'export is a function' );
	t.end();
});

tape( 'function throws an error if provided an invalid option', function test( t ) {
	t.throws( foo, TypeError, 'invalid options argument' );
	t.throws( bar, TypeError, 'invalid option' );
	t.end();

	function foo() {
		factory( null, noop );
	}
	function bar() {
		factory( {'token':null}, noop );
	}
});

tape( 'function throws if not provided a token', function test( t ) {
	t.throws( foo, Error, 'requires a token' );
	t.end();

	function foo() {
		var opts = getOpts();
		delete opts.token;
		factory( opts, noop );
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
			factory( opts, value );
		};
	}
});

tape( 'function returns a function', function test( t ) {
	t.equal( typeof factory( getOpts(), noop ), 'function', 'returns a function' );
	t.end();
});

tape( 'function returns a function which throws if not provided a string array', function test( t ) {
	var values;
	var opts;
	var fcn;
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
	fcn = factory( opts, noop );
	for ( i = 0; i < values.length; i++ ) {
		t.throws( badValue( values[i] ), TypeError, 'throws a type error when provided ' + values[i] );
	}
	t.end();

	function badValue( value ) {
		return function badValue() {
			fcn( value );
		};
	}
});

tape( 'function returns a function which returns an error to a provided callback if an error is encountered when making a request', function test( t ) {
	var factory;
	var opts;
	var fcn;

	factory = proxyquire( './../lib/factory.js', {
		'./get.js': get
	});

	opts = getOpts();
	fcn = factory( opts, done );
	fcn( repos );

	function get( opts, clbk ) {
		setTimeout( onTimeout, 0 );
		function onTimeout() {
			clbk({
				'status': 403,
				'message': 'Forbidden'
			});
		}
	}

	function done( error ) {
		t.equal( error.status, 403, 'equal status' );
		t.equal( error.message, 'Forbidden', 'equal message' );
		t.end();
	}
});

tape( 'function returns a function which returns a resource hash containing results to a provided callback', function test( t ) {
	var expected;
	var factory;
	var opts;
	var fcn;

	factory = proxyquire( './../lib/factory.js', {
		'./get.js': get
	});

	expected = results;

	opts = getOpts();
	fcn = factory( opts, done );
	fcn( repos );

	function get( opts, clbk ) {
		setTimeout( onTimeout, 0 );
		function onTimeout() {
			clbk( null, results );
		}
	}

	function done( error, results ) {
		t.deepEqual( results, expected, 'deep equal' );
		t.end();
	}
});
