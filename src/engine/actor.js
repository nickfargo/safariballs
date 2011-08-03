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
