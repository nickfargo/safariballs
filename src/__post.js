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
