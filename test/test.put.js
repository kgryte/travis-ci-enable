'use strict';

// MODULES //

var tape = require( 'tape' );
var proxyquire = require( 'proxyquire' );
var put = require( './../lib/put.js' );


// FIXTURES //

var repos = require( './fixtures/ids.json' );
var results = require( './fixtures/data.json' );
var getOpts = require( './fixtures/opts.js' );


// TESTS //

tape( 'file exports a function', function test( t ) {
	t.equal( typeof put, 'function', 'export is a function' );
	t.end();
});

tape( 'function returns an error to a provided callback if an error is encountered when making requests', function test( t ) {
	var opts;
	var put;

	put = proxyquire( './../lib/put.js', {
		'travis-ci-put': request
	});

	opts = getOpts();
	put( {'1':'math-io/erfinv'}, opts, done );

	function request( data, opts, clbk ) {
		setTimeout( onTimeout, 0 );
		function onTimeout() {
			clbk({
				'status': 500,
				'message': 'bad request'
			});
		}
	}

	function done( error ) {
		t.equal( error.status, 500, 'equal status' );
		t.equal( error.message, 'bad request', 'equal message' );
		t.end();
	}
});

tape( 'function returns an error to a provided callback if an error is encountered when making requests (callback only called once)', function test( t ) {
	var opts;
	var put;

	put = proxyquire( './../lib/put.js', {
		'travis-ci-put': request
	});

	opts = getOpts();
	put( repos, opts, done );

	function request( data, opts, clbk ) {
		setTimeout( onTimeout, 0 );
		function onTimeout() {
			clbk({
				'status': 500,
				'message': 'bad request'
			});
		}
	}

	function done( error ) {
		t.equal( error.status, 500, 'equal status' );
		t.equal( error.message, 'bad request', 'equal message' );
		t.end();
	}
});

tape( 'the function returns a JSON object upon attempting to resolve all specified resources', function test( t ) {
	var opts;
	var put;

	put = proxyquire( './../lib/put.js', {
		'travis-ci-put': request
	});

	opts = getOpts();
	put( {'1':'math-io/erf'}, opts, done );

	function request( data, opts, clbk ) {
		setTimeout( onTimeout, 0 );
		function onTimeout() {
			clbk( null, results[ 0 ] );
		}
	}

	function done( error, data ) {
		if ( error ) {
			t.ok( false, error.message );
		} else {
			t.equal( typeof data, 'object', 'returns an object' );
		}
		t.end();
	}
});

tape( 'the returned JSON object has a `meta` field which contains meta data documenting how many resources were successfully resolved', function test( t ) {
	var expected;
	var opts;
	var put;

	put = proxyquire( './../lib/put.js', {
		'travis-ci-put': request
	});

	expected = {
		'meta': {
			'total': 1,
			'success': 1,
			'failure': 0
		},
		'data': {
			'math-io/erf': results[ 0 ]
		},
		'failures': {}
	};

	opts = getOpts();
	put( {'1':'math-io/erf'}, opts, done );

	function request( data, opts, clbk ) {
		setTimeout( onTimeout, 0 );
		function onTimeout() {
			clbk( null, results[ 0 ] );
		}
	}

	function done( error, data ) {
		if ( error ) {
			t.ok( false, error.message );
		} else {
			t.equal( data.meta.total, 1, 'returns total' );
			t.equal( data.meta.success, 1, 'returns number of successes' );
			t.equal( data.meta.failure, 0, 'returns number of failures' );
		}
		t.end();
	}
});

tape( 'the returned JSON object has a `data` field which contains a resource hash', function test( t ) {
	var expected;
	var opts;
	var put;

	put = proxyquire( './../lib/put.js', {
		'travis-ci-put': request
	});

	expected = {
		'meta': {
			'total': 1,
			'success': 1,
			'failure': 0
		},
		'data': {
			'math-io/erf': results[ 0 ]
		},
		'failures': {}
	};

	opts = getOpts();
	put( {'1':'math-io/erf'}, opts, done );

	function request( data, opts, clbk ) {
		setTimeout( onTimeout, 0 );
		function onTimeout() {
			clbk( null, results[ 0 ] );
		}
	}

	function done( error, data ) {
		if ( error ) {
			t.ok( false, error.message );
		} else {
			t.deepEqual( data, expected, 'deep equal' );
		}
		t.end();
	}
});

tape( 'when unable to resolve resources, the returned JSON object has a `failures` field which contains a resource hash with error messages', function test( t ) {
	var expected;
	var opts;
	var put;

	put = proxyquire( './../lib/put.js', {
		'travis-ci-put': request
	});

	expected = {
		'meta': {
			'total': 1,
			'success': 0,
			'failure': 1
		},
		'data': {},
		'failures': {
			'math-io/erf': 'Forbidden'
		}
	};

	opts = getOpts();
	put( {'1':'math-io/erf'}, opts, done );

	function request( data, opts, clbk ) {
		setTimeout( onTimeout, 0 );
		function onTimeout() {
			var err = {
				'status': 403,
				'message': 'Forbidden'
			};
			clbk( err );
		}
	}

	function done( error, data ) {
		if ( error ) {
			t.ok( false, error.message );
		} else {
			t.deepEqual( data, expected, 'deep equal' );
		}
		t.end();
	}
});

tape( 'the function resolves multiple resources', function test( t ) {
	var expected;
	var count;
	var repos;
	var opts;
	var put;

	put = proxyquire( './../lib/put.js', {
		'travis-ci-put': request
	});

	opts = getOpts();
	repos = {
		'1': 'math-io/erf',
		'2': 'math-io/erfc',
		'3': 'bad/repo'
	};
	count = -1;

	expected = {
		'meta': {
			'total': 3,
			'success': 2,
			'failure': 1
		},
		'data': {
			'math-io/erf': results[ 0 ],
			'math-io/erfc': results[ 1 ]
		},
		'failures': {
			'bad/repo': 'Forbidden'
		}
	};

	put( repos, opts, done );

	function request( data, opts, clbk ) {
		setTimeout( onTimeout, 0 );
		function onTimeout() {
			var err;
			count += 1;
			if ( count < 2 ) {
				return clbk( null, results[count] );
			}
			if ( count === 2 ) {
				err = {
					'status': 403,
					'message': 'Forbidden'
				};
				return clbk( err );
			}
		}
	}

	function done( error, data ) {
		if ( error ) {
			t.ok( false, error.message );
		} else {
			t.deepEqual( data, expected, 'deep equal' );
		}
		t.end();
	}
});
