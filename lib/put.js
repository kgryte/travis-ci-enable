'use strict';

// MODULES //

var debug = require( 'debug' )( 'travis-ci-enable:put' );
var getKeys = require( 'object-keys' );
var request = require( 'travis-ci-put' );


// VARIABLES //

var NUM_CONCURRENT_REQUESTS = 5; // FIXME: heuristic


// PUT //

/**
* FUNCTION: PUT( repos, opts, clbk )
*	Send PUT requests to an endpoint.
*
* @param {Object} repos - repo hash
* @param {Object} opts - options
* @param {Function} clbk - callback to invoke after completing requests
* @returns {Void}
*/
function put( repos, opts, clbk ) {
	var scount;
	var fcount;
	var count;
	var data;
	var eFLG;
	var ids;
	var out;
	var idx;
	var len;
	var i;

	// Output data store:
	out = {};
	out.meta = {};
	out.data = {};
	out.failures = {};

	// Number of completed requests:
	count = 0;
	scount = 0; // success
	fcount = 0; // failures

	// Request id:
	idx = 0;

	// Initialize request data:
	data = {
		'hook': {
			'id': null,
			'active': true
		}
	};

	// Extract a list of repository ids:
	ids = getKeys( repos );
	len = ids.length;

	debug( 'Number of repos: %d.', len );
	out.meta.total = len;

	debug( 'Beginning queries...' );
	for ( i = 0; i < NUM_CONCURRENT_REQUESTS; i++ ) {
		next();
	}
	/**
	* FUNCTION: next()
	*	Sends a request based on the next item in the queue. Once requests for all desired resources have completed, invokes the provided callback.
	*
	* @private
	* @returns {Void}
	*/
	function next() {
		var id;
		if ( count === len ) {
			debug( 'Finished all queries.' );
			out.meta.success = scount;
			out.meta.failure = fcount;
			return clbk( null, out );
		}
		if ( idx < len ) {
			id = ids[ idx ];
			debug( 'Querying for `%s` (%d).', repos[ id ], idx );
			data.hook.id = id;
			request( data, opts, onResponse( repos[ id ], idx ) );
			idx += 1;
		}
	} // end FUNCTION next()

	/**
	* FUNCTION: onResponse( slug, idx )
	*	Returns a response callback.
	*
	* @private
	* @param {String} slug - repository slug
	* @param {Number} idx - request index
	* @returns {Function} response callback
	*/
	function onResponse( slug, idx ) {
		/**
		* FUNCTION: onResponse( error, results )
		*	Callback invoked upon receiving a request response.
		*
		* @private
		* @param {Error|Null} error - error object
		* @param {Object} results - response data
		* @returns {Void}
		*/
		return function onResponse( error, results ) {
			if ( eFLG ) {
				return;
			}
			debug( 'Response received for `%s` (%d).', slug, idx );
			if ( error ) {
				if ( error.status === 500 ) {
					eFLG = true;
					debug( 'Encountered an application-level error for `%s` (%d): %s', slug, idx, error.message );
					return clbk( error );
				}
				debug( 'Failed to resolve `%s` (%d): %s', slug, idx, error.message );
				out.failures[ slug ] = error.message;
				fcount += 1;
			} else {
				debug( 'Successfully resolved `%s` (%d).', slug, idx );
				out.data[ slug ] = results;
				scount += 1;
			}
			count += 1;
			debug( 'Request %d of %d complete.', count, len );
			next();
		}; // end FUNCTION onResponse()
	} // end FUNCTION onResponse()
} // end FUNCTION put()


// EXPORTS //

module.exports = put;
