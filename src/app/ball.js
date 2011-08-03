( Ball.prototype = new Actor ).constructor = Ball;
function Ball ( size ) {
	size && ( this.size = Vector( size, size ) );
}
$.extend( true, Ball.prototype, {
	size: Vector( 20, 20 ),
	tick: function ( dt ) {
		// device's acceleration vector is Y-inverted relative to canvas
		var a = this.engine.input.acceleration;
		if ( a ) {
			this.acceleration = a.mult( Vector( 50, -50 ) );
		}
		
		// crude collision detection against scene edge
		var hitNormal;
		if ( this.position.x < this.size.x ) {
			this.position.x = this.size.x;
			hitNormal = Vector(1,0);
		} else if ( this.position.x > this.scene.size.x - this.size.x ) {
			this.position.x = this.scene.size.x - this.size.x;
			hitNormal = Vector(-1,0);
		} else if ( this.position.y < this.size.y ) {
			this.position.y = this.size.y;
			hitNormal = Vector(0,1);
		} else if ( this.position.y > this.scene.size.y - this.size.y ) {
			this.position.y = this.scene.size.y - this.size.y;
			hitNormal = Vector(0,-1);
		}
		
		// reflect with 0.8 elasticity
		if ( hitNormal ) {
			this.velocity
				.subtractBy( hitNormal
					.mult( 1.8 )
					.mult( this.velocity.dot( hitNormal ) )
				)
			;
		}
	},
	render: function ( c ) {
		c.fillStyle = 'white';
		c.beginPath();
		c.arc( this.position.x, this.position.y, this.size.x, 0, 2*Math.PI );
		c.fill();
	}
});
