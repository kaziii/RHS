var test = require( 'tape' );
var extend = require( '../' );

var int1 = 0;
var int2 = 1;
var str1 = '';
var str2 = 'x';
var boolean1 = false;
var boolean2 = true;
var arr1 = [];
var obj1 = {};
var empty = null;
var arr2 = [int1, int2, str1, str2, boolean1, boolean2, empty, arr1, obj1];
var obj2 = {
    int1: int1,
    int2: int2,
    str1: str1,
    str2: str2,
    boolean1: boolean1,
    boolean2: boolean2,
    arr1: arr1,
    arr2: arr2,
    obj1: obj1,
    empty: empty
};

test( 'missing arguments', function ( t ) {
    t.plan( 9 );
    t.deepEqual( extend( {a: 1} ), {a: 1} );
    t.equal( extend( empty, {a: 1} ), undefined );
    t.equal( extend( str1, {a: 1} ), undefined );
    t.equal( extend( int1, {a: 1} ), undefined );
    t.equal( extend( boolean1, {a: 1} ), undefined );
    t.equal( extend( str2, {a: 1} ), undefined );
    t.equal( extend( int2, {a: 1} ), undefined );
    t.equal( extend( boolean2, {a: 1} ), undefined );
    t.equal( extend(), undefined );
    t.end();
} );

test( 'merge array with array', function ( t ) {
    var json = JSON.stringify( arr2 );
    var source = JSON.parse( json );
    var target = [];

    t.plan( 3 );
    t.deepEqual( extend( [], source ), source );
    t.notEqual( extend( [], source ), source );
    t.equal( extend( target, source ), target );
    t.end();
} );

test( 'merge object with array', function ( t ) {
    var target = [];

    t.plan( 3 );
    t.deepEqual( extend( {}, arr2 ), arr2 );
    t.notEqual( extend( {}, arr2 ), arr2 );
    t.equal( extend( target, arr2 ), target );
    t.end();
} );

test( 'merge object with object', function ( t ) {
    var target = {};

    t.plan( 3 );
    t.deepEqual( extend( {}, obj2 ), obj2 );
    t.notEqual( extend( {}, obj2 ), obj2 );
    t.equal( extend( target, obj2 ), target );
    t.end();
} );

test( 'several objects', function ( t ) {
    t.plan( 1 );
    t.deepEqual( extend( {}, {a:1}, {a:2, b:2}, {a:3,c:3,d:3} ), {a:3,b:2,c:3,d:3} );
    t.end();
} );
