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
