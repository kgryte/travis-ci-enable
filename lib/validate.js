'use strict';

// MODULES //

var isObject = require( 'validate.io-object' );
var isString = require( 'validate.io-string-primitive' );
var isBoolean = require( 'validate.io-boolean-primitive' );
var isStringArray = require( 'validate.io-string-primitive-array' );


// VALIDATE //

/**
* FUNCTION: validate( opts, options )
*	Validates function options.
*
* @param {Object} opts - destination object
* @param {Object} options - options to validate
* @param {String} options.token - access token
* @param {String[]} options.repos - Github repository slugs
* @param {String} [options.hostname] - endpoint hostname
* @param {String} [options.useragent] - user agent string
* @param {Boolean} [options.sync] - boolean indicating whether to sync Travis CI with Github before attempting to enable builds
* @returns {Error|Null} error or null
*/
function validate( opts, options ) {
	if ( !isObject( options ) ) {
		return new TypeError( 'invalid input argument. Options argument must be an object. Value: `' + options + '`.' );
	}
	opts.token = options.token;
	if ( !isString( opts.token ) ) {
		return new TypeError( 'invalid option. `token` option must be a string primitive. Option: `' + opts.token + '`.' );
	}
	opts.repos = options.repos;
	if ( !isStringArray( opts.repos ) ) {
		return new TypeError( 'invalid option. `repos` option must be a string array. Option: `' + opts.repos + '`.' );
	}
	if ( options.hasOwnProperty( 'hostname' ) ) {
		opts.hostname = options.hostname;
		if ( !isString( opts.hostname ) ) {
			return new TypeError( 'invalid option. `hostname` option must be a string primitive. Option: `' + opts.hostname + '`.' );
		}
	}
	if ( options.hasOwnProperty( 'useragent' ) ) {
		opts.useragent = options.useragent;
		if ( !isString( opts.useragent ) ) {
			return new TypeError( 'invalid option. `useragent` option must be a string primitive. Option: `' + opts.useragent + '`.' );
		}
	}
	if ( options.hasOwnProperty( 'sync' ) ) {
		opts.sync = options.sync;
		if ( !isBoolean( opts.sync ) ) {
			return new TypeError( 'invalid option. `sync` option must be a boolean primitive. Option: `' + opts.sync + '`.' );
		}
	}
	return null;
} // end FUNCTION validate()


// EXPORTS //

module.exports = validate;
