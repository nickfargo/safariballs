( function ( $, undefined ) {

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


function Engine ( canvas ) {
	// var engine = this;
	$.extend( this, {
		canvas: canvas,
		renderingContext: canvas.getContext('2d'),
		scene: $.extend( Actor.create( Scene, 'root' ), {
			engine: this,
			size: Vector( canvas.width, canvas.height )
		})
	});
}
$.extend( true, Engine.prototype, {
	canvas: null,
	renderingContext: null,
	scene: null,
	requestAnimationFrame: ( function () {
		var self = this;
		return (
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function ( fn ) {
				self.intervalID = window.setTimeout( fn, 1000 / 60 );
			}
		);
    })(),
	
	input: {
		acceleration: Vector(),
		orientation: Vector(),
		onDeviceMotion: function ( event ) {
			var a = event.originalEvent.accelerationIncludingGravity;
			this.acceleration = Vector( a.x, a.y, a.z );
		},
		onDeviceOrientation: function ( event ) {
			var e = event.originalEvent;
			this.orientation = Vector( e.alpha, e.beta, e.gamma );
		},
		onTouchStart: function ( event ) {
			// TODO: capture/bubble the event through the engine.scene graph
			$( document ).bind( 'touchmove', function ( event ) { event.preventDefault(); } );
		},
		onTouchEnd: function ( event ) {
			$( document ).unbind( 'touchmove' );
		}
	},
	
	active: false,
	intervalID: null,
	targetFPS: 60,
	fps: 0,
	deltaTime: 0,
	frameTimeStamp: new Date().getTime(),
	
	
	start: function () {
		var engine = this;
		// this.intervalID = setInterval( function() { engine.loop(); }, 1000 / this.targetFPS );
		// this.requestAnimationFrame( function () { engine.loop(); } );
		
		$( window )
			.bind( 'devicemotion', function( event ) { engine.input.onDeviceMotion( event ); } )
			.bind( 'deviceorientation', function( event ) { engine.input.onDeviceOrientation( event ); } )
		;
		$( document )
			.bind( 'touchstart', function( event ) { engine.input.onTouchStart( event ); } )
			.bind( 'touchend', function( event ) { engine.input.onTouchEnd( event ) } )
		;
		
		this.active = true;
		this.loop();
	},
	
	loop: function () {
		var	self = this,
			d = new Date().getTime();
		
		// timing
		this.deltaTime = 0.001 * ( d - this.frameTimeStamp );
		this.frameTimeStamp = d;
		this.fps = 1 + ( 1 - this.deltaTime ) * this.fps; // 1s moving average
		
		// physics
		this.scene._impel( this.deltaTime );
		
		// rendering
		this.renderingContext.clearRect( 0, 0, this.canvas.width, this.canvas.height );
		this.scene._render( this.renderingContext );
		
		// loop
		this.active && this.requestAnimationFrame.call( window, function () { self.loop(); } );
		// this.active && window.webkitRequestAnimationFrame( function () { self.loop(); } );
		// this.active && window.setTimeout( function () { self.loop(); }, 1000 / self.targetFPS );
	},
	
	stop: function () {
		// clearInterval( this.intervalID );
		this.active = false;
		$( window )
			.unbind( 'devicemotion', this.input.onDeviceMotion )
			.unbind( 'deviceorientation', this.input.onDeviceOrientation )
		;
	}
});


function Actor ( map ) {
	Actor.create = Actor.prototype.create; // TODO: this needs moved to a static area
	$.extend( this, map );
}
$.extend( true, Actor.prototype, {
	engine: null,
	scene: null,
	size: Vector(),
	position: Vector(),
	velocity: Vector(),
	acceleration: Vector(),
	orientation: Vector(),
	scale: Vector(1,1,1),
	opacity: 1,
	collisionModel: 'sphere',
	
	// scene graphing
	create: function ( actorType, id, position, velocity ) {
		var a = new actorType();
		a.id = actorType.name + '#' + id;
		a.position = position || Vector();
		a.velocity = velocity || Vector();
		return a;
	},
	appendTo: function ( scene ) {
		return scene.append(this);
	},
	destroy: function () {
	},
	
	// physics
	tick: function ( dt ) {},
	_impel: function ( dt ) {
		this.tick( dt );
		this.velocity.addBy( this.acceleration.mult( dt ) );
		this.position.addBy( this.velocity.mult( dt ) );
	},
	collide: function ( actor ) {
		
	},
	instigateCollision: function ( withActor ) {
		this.collide( withActor );
		withActor.receiveCollision( this );
	},
	receiveCollision: function ( fromActor ) {
		this.collide( fromActor );
	},
	
	// rendering
	render: function ( c ) {},
	_render: function ( c ) {
		this._prerender( c );
		this.render( c );
		this._postrender( c );
	},
	_prerender: function ( c ) {
		c.save();
		c.globalAlpha = this.opacity;
		//...
	},
	_postrender: function ( c ) {
		//...
		c.restore();
	}
});


( Scene.prototype = new Actor ).constructor = Scene;
function Scene ( map, actors ) {
	$.extend( this, map );
	// append actors to this.actors
}
$.extend( true, Scene.prototype, {
	actors: [],
	append: function ( actor ) {
		if ( actor ) {
			this.actors[ actor.id ] = actor;
			actor.engine = this.engine;
			actor.scene = this;
			return actor;
		}
		return false;
	},
	remove: function ( actor ) {
		// TODO
		return actor;
	},
	destroy: function () {
		$.each( this.actors, function ( i, actor ) {
			actor.scene = null;
		});
	},
	_impel: function ( dt ) {
		for ( var i in this.actors ) {
			this.actors[i]._impel( dt );
		}
	},
	_render: function ( c ) {
		this._prerender( c );
		// TODO: apply scene transform to context
		this.render( c );
		for ( var i in this.actors ) {
			this.actors[i]._render( c );
		}
		// TODO: release scene transform from context
		this._postrender( c );
	}
});


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


$( function() {
	
	var w = $( window ).width(),
		h = $( window ).height(),
		
		canvas = $('<canvas>').attr( { width: w, height: h } ).appendTo('body').get(0),
		engine = new Engine( canvas );
	
	$( document )
		.bind( 'touchstart', function ( event ) {
			var t = event.originalEvent.targetTouches[0];
			Actor.create( Ball, new Date().getTime().toString(), Vector( t.clientX, t.clientY ) ).appendTo( engine.scene );
		});
	
	engine.start();
	
});



})( jQuery );

