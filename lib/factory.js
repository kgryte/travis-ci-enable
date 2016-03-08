'use strict';

// MODULES //

var isFunction = require( 'validate.io-function' );
var isStringArray = require( 'validate.io-string-primitive-array' );
var copy = require( 'utils-copy' );
var validate = require( './validate.js' );
var defaults = require( './defaults.json' );
var pipeline = require( './pipeline.js' );


// FACTORY //

/**
* FUNCTION: factory( options, clbk )
*	Returns a function for enabling builds for one or more repositories.
*
* @param {Object} options - function options
* @param {String} options.token - access token
* @param {String} [options.hostname] - endpoint hostname
* @param {String} [options.useragent] - user agent string
* @param {Boolean} [options.sync=false] - boolean indicating whether to sync Travis CI with Github before attempting to enable builds
* @param {Function} clbk - callback to invoke upon query completion
* @returns {Function} function for enabling builds
*/
function factory( options, clbk ) {
	var opts;
	var err;
	opts = copy( defaults );
	err = validate( opts, options );
	if ( err ) {
		throw err;
	}
	if ( !isFunction( clbk ) ) {
		throw new TypeError( 'invalid input argument. Callback argument must be a function. Value: `' + clbk + '`.' );
	}
	/**
	* FUNCTION: enable( repos )
	*	Enables builds for one or more repositories.
	*
	* @param {String[]} repos - repository slugs
	* @returns {Void}
	*/
	return function enable( repos ) {
		if ( !isStringArray( repos ) ) {
			throw new TypeError( 'invalid input argument. Must provide a string array. Value: `' + repos + '`.' );
		}
		pipeline( repos, opts, done );
	}; // end FUNCTION enable()

	/**
	* FUNCTION: done( error, results )
	*	Callback invoked after completing request.
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
		clbk( null, results );
	} // end FUNCTION done()
} // end FUNCTION factory()


// EXPORTS //

module.exports = factory;
