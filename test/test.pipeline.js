'use strict';

// MODULES //

var tape = require( 'tape' );
var proxyquire = require( 'proxyquire' );
var copy = require( 'utils-copy' );
var pipeline = require( './../lib/pipeline.js' );


// FIXTURES //

var repos = require( './fixtures/repos.json' );
var ids = require( './fixtures/ids.json' );
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

tape( 'function returns an error to a provided callback if an error is encountered when attempting to sync', function test( t ) {
	var pipeline;
	var opts;

	pipeline = proxyquire( './../lib/pipeline.js', {
		'travis-ci-sync': mock,
		'travis-ci-repo-info': repoinfo( null, info ),
		'./put.js': request( null, copy(results) )
	});

	opts = getOpts();
	opts.sync = true;

	pipeline( copy(repos), opts, done );

	function mock( opts, clbk ) {
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

tape( 'function returns an error to a provided callback if an error is encountered when fetching repo information', function test( t ) {
	var pipeline;
	var opts;

	pipeline = proxyquire( './../lib/pipeline.js', {
		'travis-ci-sync': sync(),
		'travis-ci-repo-info': mock,
		'./put.js': request( null, copy(results) )
	});

	opts = getOpts();
	opts.sync = false;

	pipeline( copy(repos), opts, done );

	function mock( opts, clbk ) {
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

tape( 'function returns an error to a provided callback if an error is encountered when attempting to enable builds', function test( t ) {
	var pipeline;
	var opts;

	pipeline = proxyquire( './../lib/pipeline.js', {
		'travis-ci-sync': sync(),
		'travis-ci-repo-info': repoinfo( null, copy(info) ),
		'./put.js': mock
	});

	opts = getOpts();
	opts.sync = false;

	pipeline( copy(repos), opts, done );

	function mock( ids, opts, clbk ) {
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

tape( 'function handles the scenario where no repository information is available', function test( t ) {
	var pipeline;
	var expected;
	var repos;
	var opts;

	expected = {
		'meta': {
			'total': 2,
			'success': 0,
			'failure': 2
		},
		'data': {},
		'failures': {
			'unknown/repo': 'Not found',
			'no/permissions': 'Forbidden'
		}
	};

	pipeline = proxyquire( './../lib/pipeline.js', {
		'travis-ci-sync': sync(),
		'travis-ci-repo-info': repoinfo( null, expected ),
		'./put.js': request( null, {} )
	});

	repos = [
		'unknown/repo',
		'no/permissions'
	];

	opts = getOpts();
	opts.sync = false;

	pipeline( repos, opts, done );

	function done( error, results ) {
		if ( error ) {
			t.ok( false, error.message );
			return t.end();
		}
		t.deepEqual( results, expected, 'deep equal' );
		t.end();
	}
});

tape( 'function returns request results', function test( t ) {
	var pipeline;
	var expected;
	var info;
	var opts;
	var r;

	info = {
		'meta': {
			'total': 4,
			'success': 2,
			'failure': 2
		},
		'data': {
			'math-io/erf': copy( data[0] ),
			'math-io/erfc': copy( data[1] )
		},
		'failures': {
			'unknown/repo': 'Not found',
			'no/permissions': 'Forbidden'
		}
	};

	expected = {
		'meta': {
			'total': 4,
			'success': 2,
			'failure': 2
		},
		'data': {
			'math-io/erf': {
				'result': true
			},
			'math-io/erfc': {
				'result': true
			}
		},
		'failures': {
			'unknown/repo': 'Not found',
			'no/permissions': 'Forbidden'
		}
	};

	pipeline = proxyquire( './../lib/pipeline.js', {
		'travis-ci-sync': sync(),
		'travis-ci-repo-info': repoinfo( null, info ),
		'./put.js': request( null, copy(results) )
	});

	r = copy( repos );
	r.push( 'unknown/repo' );
	r.push( 'no/permissions' );

	opts = getOpts();
	opts.sync = false;

	pipeline( r, opts, done );

	function done( error, results ) {
		if ( error ) {
			t.ok( false, error.message );
			return t.end();
		}
		t.deepEqual( results, expected, 'deep equal' );
		t.end();
	}
});

tape( 'function returns request results (resolved info, but unable to enable)', function test( t ) {
	var pipeline;
	var expected;
	var opts;

	expected = {
		'meta': {
			'total': 2,
			'success': 0,
			'failure': 2
		},
		'data': {},
		'failures': {
			'math-io/erf': 'Forbidden',
			'math-io/erfc': 'Forbidden'
		}
	};

	pipeline = proxyquire( './../lib/pipeline.js', {
		'travis-ci-sync': sync(),
		'travis-ci-repo-info': repoinfo( null, info ),
		'./put.js': request( null, expected )
	});

	opts = getOpts();
	opts.sync = false;

	pipeline( copy(repos), opts, done );

	function done( error, results ) {
		if ( error ) {
			t.ok( false, error.message );
			return t.end();
		}
		t.deepEqual( results, expected, 'deep equal' );
		t.end();
	}
});
