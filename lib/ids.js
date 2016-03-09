'use strict';

// MODULES //

var getKeys = require( 'object-keys' ).shim();


// IDS //

/**
* FUNCTION: ids( data )
*	Returns an object containing repository id:slug pairs.
*
* @param {Object} data - repository info
* @returns {Object} id:slug pairs
*/
function ids( data ) {
	var keys;
	var out;
	var d;
	var i;

	keys = getKeys( data );
	out = {};
	for ( i = 0; i < keys.length; i++ ) {
		d = data[ keys[ i ] ];
		out[ d.id ] = d.slug;
	}
	return out;
} // end FUNCTION ids()


// EXPORTS //

module.exports = ids;
