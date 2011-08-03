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
