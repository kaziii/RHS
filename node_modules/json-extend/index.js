(function ( GLOBAL ) {

    'use strict';

    if ( !Array.isArray ) {
        Array.isArray = function ( arg ) {
            return Object.prototype.toString.call( arg ) === '[object Array]';
        };
    }

    function isPrimitive( val ) {
        return val !== Object( val );
    }

    function copyValue( source ) {
        if ( isPrimitive( source ) ) {
            return source;
        }
        if ( Array.isArray( source ) ) {
            return mergeArray( source.slice( 0 ), source );
        }
        return mergeObject( {}, source );
    }

    function mergeArray( target, source ) {
        var i, len;
        for ( i = 0, len = source.length; i < len; i += 1 ) {
            target[i] = copyValue( source[i] );
        }
        return target;
    }

    function mergeObject( target, source ) {
        var prop;
        for ( prop in source ) {
            if ( source.hasOwnProperty( prop ) ) {
                target[prop] = copyValue( source[prop] );
            }
        }
        return target;
    }

    function extend( target /*, obj1, obj2, ... objN */ ) {
        var i, len, source;
        if ( !target || isPrimitive( target ) ) {
            return;
        }
        for ( i = 1, len = arguments.length; i < len; i += 1 ) {
            source = arguments[i];
            if ( !isPrimitive( source ) ) {
                if ( Array.isArray( source ) ) {
                    mergeArray( target, source );
                } else {
                    mergeObject( target, source );
                }
            }
        }
        return target;
    }

    if ( typeof module === 'undefined' ) {

        GLOBAL.extend = extend;

    } else {

        module.exports = extend;

    }

}( this ));
