'use strict';

// MODULES //

var sync = require( 'travis-ci-sync' );
var repoinfo = require( 'travis-ci-repo-info' );
var merge = require( 'utils-merge2' );
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
	var failures;
	var opts;

	opts = {
		'token': options.token,
		'hostname': options.hostname
	};
	if ( options.sync ) {
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
			return clbk( error );
		}
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
			return clbk( error );
		}
		if ( results.meta.success === 0 ) {
			return clbk( null, results );
		}
		failures = results.failures;

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
			return clbk( error );
		}
		// Merge in the previous failed requests:
		merge( results.failures, failures );

		clbk( null, results );
	} // end FUNCTION done()
} // end FUNCTION pipeline()


// EXPORTS //

module.exports = pipeline;
