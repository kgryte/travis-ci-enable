'use strict';

// MODULES //

var factory = require( './factory.js' );


// ENABLE //

/**
* FUNCTION: enable( repos, opts, clbk )
*	Enables Travis CI builds for one or more repositories.
*
* @param {String[]} repos - Github repository slugs
* @param {Object} opts - function options
* @param {String} opts.token - Travis CI access token
* @param {String} [opts.hostname] - endpoint hostname
* @param {String} [opts.useragent] - user agent string
* @param {Boolean} [opts.sync=false] - boolean indicating whether to sync Travis CI with Github before attempting to enable builds
* @param {Function} clbk - callback to invoke upon query completion
* @returns {Void}
*/
function enable( repos, opts, clbk ) {
	factory( opts, clbk )( repos );
} // end FUNCTION enable()


// EXPORTS //

module.exports = enable;
