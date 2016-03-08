'use strict';

// MODULES //

var tape = require( 'tape' );
var ids = require( './../lib/ids.js' );


// FIXTURES //

var info = require( './fixtures/info.json' );


// TESTS //

tape( 'main export is a function', function test( t ) {
	t.equal( typeof ids, 'function', 'main export is a function' );
	t.end();
});

tape( 'function returns an object of `id:slug` pairs', function test( t ) {
	var expected;
	var actual;

	expected = {
		'7353652': 'kgryte/travis-ci-enable',
		'7830739': 'kgryte/travis-ci-repo-info'
	};

	actual = ids( info );

	t.deepEqual( actual, expected, 'deep equal' );
	t.end();
});
