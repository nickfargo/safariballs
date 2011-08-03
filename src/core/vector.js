function Vector ( x, y, z ) {
	if ( this === window ) {
		return new Vector( x, y, z );
	}
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}
$.extend( Vector.prototype, {
	x:0, y:0, z:0,
	size: function () {
		return Math.sqrt( this.x * this.x, this.y * this.y, this.z * this.z );
	},
	clone: function () {
		return Vector( this.x, this.y, this.z );
	},
	addBy: function ( v ) {
		if ( v instanceof Vector ) {
			this.x += v.x; this.y += v.y; this.z += v.z; return this;
		} else throw new Error();
	},
	add: function ( v ) {
		return this.clone().addBy( v );
	},
	subtractBy: function ( v ) {
		if ( v instanceof Vector ) {
			this.x -= v.x; this.y -= v.y; this.z -= v.z; return this;
		} else throw new Error();
	},
	subtract: function ( v ) {
		return this.clone().subtractBy( v );
	},
	multBy: function( o ) {
		if ( o instanceof Vector ) {
			this.x *= o.x; this.y *= o.y; this.z *= o.z; return this;
		} else if ( !isNaN(o) ) {
			this.x *= o; this.y *= o; this.z *= o; return this;
		} else throw new Error();
	},
	mult: function ( o ) {
		return this.clone().multBy(o);
	},
	dot: function ( v ) {
		if ( v instanceof Vector ) {
			return this.x*v.x + this.y*v.y + this.z*v.z;
		} else throw new Error();
	}
});
