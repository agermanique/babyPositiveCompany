// import * as io from 'socket.io'
// import * as Matter from 'Matter-js'
window.onload = init;


class Gravity {
	engine: Matter.Engine;
	circle1: Matter.Body;
	refresh() {
		this.engine.world.gravity.x = Math.random() - 0.5;
		this.engine.world.gravity.y = Math.random() - 0.5;
		socket.emit('sendInfo', { x: this.circle1.position.x, y: this.circle1.position.y })
	}
}

function init() {
	let gravity = new Gravity()

	// module aliases
	var Engine = Matter.Engine,
		Render = Matter.Render,
		World = Matter.World,
		Bodies = Matter.Bodies,
		MouseConstraint = Matter.MouseConstraint,
		Events = Matter.Events,
		Mouse = Matter.Mouse;



	// create an engine
	var engine = Engine.create();
	gravity.engine = engine;
	// create a renderer
	var render = Render.create({
		element: document.body,
		engine: engine
	});

	// create two boxes and a ground
	var boxA = Bodies.circle(400, 300, 20);
	gravity.circle1 = boxA;

	boxA.label = "player"
	boxA.render.fillStyle = "green";
	boxA.frictionAir = 0
	var boxB = Bodies.circle(400, 0, 20);
	boxB.label = "player"
	boxB.render.fillStyle = "green"
	boxB.frictionAir = 0
	var other1 = Bodies.circle(400, 300, 20, { isStatic: true });
	other1.label = "other"
	other1.render.fillStyle = "blue";
	socket.on('scoreOther', function (babyGame) {
		other1.position.x = babyGame.x;
		other1.position.y = babyGame.y;
	});
	// mouse constraint
	var mouse = Mouse.create(render.canvas)
	let constraint: Matter.IMouseConstraintDefinition = {};
	constraint.mouse = mouse;
	constraint.constraint = {} as any;
	constraint.constraint.stiffness = 0.2;
	constraint.constraint.render = {} as any;
	constraint.constraint.render.visible = false;
	var mouseConstraint = MouseConstraint.create(engine, constraint);
	World.add(engine.world, mouseConstraint);

	// add all of the bodies to the world
	World.add(engine.world, [boxA, boxB, other1]);
	World.add(engine.world, [
		// walls
		Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
		Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
		Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
		Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
	])
	// run the engine
	Engine.run(engine);

	// run the renderer
	render.options.wireframes = false;
	Render.run(render);
	Events.on(render, 'beforeRender', () => { gravity.refresh() })

	render['mouse'] = mouse;

	Events.on(engine, 'collisionStart ', function (e) {
		var i, pair,
			length = e.pairs.length;
		for (i = 0; i < length; i++) {
			pair = e.pairs[i];
			// console.log(pair)
			if (pair.bodyA.label !== 'player' || pair.bodyB.label !== 'player') {
				break;
			}
			var baby = Bodies.circle(pair.bodyA.position.x, pair.bodyA.position.y, 10);
			baby.label = 'baby';
			baby.frictionAir = 0;
			World.add(engine.world, baby);
			// console.log(baby)
			//Here body with label 'Player' is in the pair, do some stuff with it
		}
	});
}
var infos = [{
	x: 10,
	y: 20,
	role: 'BM',
	radius: 50,
	children: true,
	id: 10
}]
var io
var socket = io.connect('http://localhost:4200');
socket.on('connect', function (data) {
	//sending the current user positions
	// socket.emit('sendInfo', infos);
});


// setInterval(function () {
// 	socket.emit('sendInfo', infos);
// }, 10000)