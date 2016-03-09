'use strict';

// MODULES //

var debug = require( 'debug' )( 'travis-ci-enable:pipeline' );
var sync = require( 'travis-ci-sync' );
var repoinfo = require( 'travis-ci-repo-info' );
var merge = require( 'utils-merge2' );
var getKeys = require( 'object-keys' ).shim();
var getIds = require( './ids.js' );
var request = require( './put.js' );


// PIPELINE //

/**
* FUNCTION: pipeline( repos, options, clbk )
*	Sequence to enable builds for one or more repositories.
*
* @param {String[]} repos - repository slugs
* @param {Object} options - query options
* @param {Function} clbk - callback to invoke after completing sequence
* @returns {Void}
*/
function pipeline( repos, options, clbk ) {
	var _results;
	var opts;

	opts = {
		'token': options.token,
		'hostname': options.hostname
	};
	if ( options.sync ) {
		debug( 'Syncing...' );
		return sync( opts, start );
	}
	start();

	/**
	* FUNCTION: start( [error] )
	*	Get repository information.
	*
	* @private
	* @param {Error|Null} [error] - error object
	* @returns {Void}
	*/
	function start( error ) {
		if ( error ) {
			debug( 'Encountered an error while attempting to sync: %s', error.message );
			return clbk( error );
		}
		debug( 'Fetching repository information...' );
		opts.repos = repos;
		repoinfo( opts, onInfo );
	} // end FUNCTION start()

	/**
	* FUNCTION: onInfo( error, results )
	*	Callback invoked upon receiving repository information.
	*
	* @private
	* @param {Error|Null} error - error object
	* @param {Object} results - repo info
	* @returns {Void}
	*/
	function onInfo( error, results ) {
		var ids;
		if ( error ) {
			debug( 'Encountered an error while attempting to fetch repository information: %s', error.message );
			return clbk( error );
		}
		if ( results.meta.failure ) {
			debug( 'Failed to resolve repository information for `%s`.', getKeys( results.failures ) );
		}
		if ( results.meta.success === 0 ) {
			debug( 'Could not enable builds as unable to resolve repository information.' );
			return clbk( null, results );
		}
		debug( 'Successfully resolved repository information for `%s`.', getKeys( results.data ) );
		debug( 'Enabling builds...' );

		// Cache the results:
		_results = results;

		// Extract a hash of repository ids:
		ids = getIds( results.data );

		// Query the API to enable builds:
		request( ids, options, done );
	} // end FUNCTION onInfo()

	/**
	* FUNCTION: done( error, results )
	*	Callback invoked enabling builds.
	*
	* @private
	* @param {Error|Null} error - error object
	* @param {Object} results - response results
	* @returns {Void}
	*/
	function done( error, results ) {
		if ( error ) {
			debug( 'Encountered an error while attempting to enable builds: %s', error.message );
			return clbk( error );
		}
		if ( results.meta.failure ) {
			debug( 'Failed to enable builds for `%s`.', getKeys( results.failures ) );
		}
		if ( results.meta.success ) {
			debug( 'Successfully enabled builds for `%s`.', getKeys( results.data ) );
		}
		// Merge in the previous results:
		results.meta.total = _results.meta.total;
		results.meta.failure += _results.meta.failure;
		merge( results.failures, _results.failures );

		clbk( null, results );
	} // end FUNCTION done()
} // end FUNCTION pipeline()


// EXPORTS //

module.exports = pipeline;
