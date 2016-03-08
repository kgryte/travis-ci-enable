'use strict';

// MODULES //

var sync = require( 'travis-ci-sync' );
var repoinfo = require( 'travis-ci-repo-info' );


// PIPELINE //

/**
* FUNCTION: pipeline( repos, opts, clbk )
*	Sequence to enable builds for one or more repositories.
*
* @param {String[]} repos - repository slugs
* @param {Object} opts - query options
* @param {Function} clbk - callback to invoke after completing sequence
* @returns {Void}
*/
function pipeline( repos, opts, clbk ) {

} // end FUNCTION pipeline()


// EXPORTS //

module.exports = pipeline;
