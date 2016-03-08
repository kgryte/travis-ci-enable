'use strict';

// MODULES //

var sync = require( 'travis-ci-sync' );
var repoinfo = require( 'travis-ci-repo-info' );


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
	var opts;
	if ( options.sync ) {
		opts = {
			'token': options.token,
			'hostname': options.hostname
		};
		return sync( opts, getInfo );
	}
	getInfo();

	/**
	* FUNCTION: getInfo( [error] )
	*	Get repository information.
	*
	* @private
	* @param {Error|Null} [error] - error object
	* @returns {Void}
	*/
	function getInfo( error ) {
		if ( error ) {
			return clbk( error );
		}
		opts.repos = repos;
		repoinfo( opts, onInfo );
	} // end FUNCTION getInfo()

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
		if ( error ) {
			return clbk( error );
		}
	} // end FUNCTION onInfo()
} // end FUNCTION pipeline()


// EXPORTS //

module.exports = pipeline;
