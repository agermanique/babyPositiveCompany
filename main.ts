// import * as io from 'socket.io'
// import * as Matter from 'Matter-js'
window.onload = init;
var myscoreElem = document.getElementById('myscore');
var otherscoreElem = document.getElementById('otherscore');

class Gravity {
	engine: Matter.Engine;
	circle1: Matter.Body;
	circle2: Matter.Body;
	babies = []
	babiesPosition = []

	refresh() {
		this.babiesPosition = []
		for (let i = 0; i < this.babies.length; i++) {
			this.babiesPosition.push({ x: this.babies[i].position.x, y: this.babies[i].position.y })
		}
		// this.engine.world.gravity.x = Math.random() - 0.5;
		// this.engine.world.gravity.y = Math.random() - 0.5;
		socket.emit('sendInfo', {
			player1: {
				x: this.circle1.position.x,
				y: this.circle1.position.y
			},
			player2: {
				x: this.circle2.position.x,
				y: this.circle2.position.y
			},
			babies: this.babiesPosition
		})
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
	gravity.circle2 = boxB;
	boxB.label = "player"
	boxB.render.fillStyle = "green"
	boxB.frictionAir = 0
	var other1 = Bodies.circle(400, 300, 20, { isStatic: true });
	other1.label = "other"
	other1.render.fillStyle = "blue";

	var other2 = Bodies.circle(400, 300, 20, { isStatic: true });
	other2.label = "other"
	other2.render.fillStyle = "blue";
	var otherBabies: Matter.Body[] = [];
	socket.on('scoreOther', function (babyGame) {
		other1.position.x = babyGame.player1.x;
		other1.position.y = babyGame.player1.y;
		other2.position.x = babyGame.player2.x;
		other2.position.y = babyGame.player2.y;
		let oldNbr = otherBabies.length
		otherscoreElem.innerText = babyGame.babies.length.toString();

		if (babyGame.babies) {
			if (otherBabies.length < babyGame.babies.length) {
				for (let i = oldNbr; i < babyGame.babies.length; i++) {
					let newBaby = Bodies.circle(babyGame.babies[i].x, babyGame.babies[i].y, 10, { isStatic: true })
					newBaby.render.fillStyle = "blue"
					newBaby.label = 'otherBaby';
					otherBabies.push(newBaby)
					World.add(engine.world, newBaby);
				}
			}
			for (let i = 0; i < otherBabies.length; i++) {
				if (otherBabies[i] && babyGame.babies[i]) {
					otherBabies[i].position.x = babyGame.babies[i].x
					otherBabies[i].position.y = babyGame.babies[i].y
				}
			}
		}

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
	World.add(engine.world, [boxA, boxB, other1, other2]);
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
	engine.world.gravity.x = 0;
	engine.world.gravity.y = 0;
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
			gravity.babies.push(baby)
			myscoreElem.innerText = gravity.babies.length.toString();
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