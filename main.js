"use strict";
exports.__esModule = true;
var io = require("socket.io");
var Matter = require("Matter-js");
// import Promise from "ts-promise";
window.onload = init;
var myscoreElem = document.getElementById('myscore');
var otherscoreElem = document.getElementById('otherscore');
var Gravity = (function () {
    function Gravity() {
        this.babies = [];
        this.babiesPosition = [];
    }
    Gravity.prototype.refresh = function () {
        this.babiesPosition = [];
        for (var i = 0; i < this.babies.length; i++) {
            this.babiesPosition.push({ x: this.babies[i].position.x, y: this.babies[i].position.y });
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
        });
    };
    return Gravity;
}());
function init() {
    var gravity = new Gravity();
    // module aliases
    var Engine = Matter.Engine, Render = Matter.Render, World = Matter.World, Bodies = Matter.Bodies, MouseConstraint = Matter.MouseConstraint, Events = Matter.Events, Mouse = Matter.Mouse;
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
    boxA.label = "player";
    boxA.render.fillStyle = "green";
    boxA.frictionAir = 0;
    var boxB = Bodies.circle(400, 0, 20);
    gravity.circle2 = boxB;
    boxB.label = "player";
    boxB.render.fillStyle = "green";
    boxB.frictionAir = 0;
    var other1 = Bodies.circle(400, 300, 20, { isStatic: true });
    other1.label = "other";
    other1.render.fillStyle = "blue";
    var other2 = Bodies.circle(400, 300, 20, { isStatic: true });
    other2.label = "other";
    other2.render.fillStyle = "blue";
    var otherBabies = [];
    socket.on('scoreOther', function (babyGame) {
        console.log("babyGame ", babyGame);
        other1.position.x = babyGame.player1.x;
        other1.position.y = babyGame.player1.y;
        other2.position.x = babyGame.player2.x;
        other2.position.y = babyGame.player2.y;
        var oldNbr = otherBabies.length;
        otherscoreElem.innerText = babyGame.babies.length.toString();
        if (babyGame.babies) {
            if (otherBabies.length < babyGame.babies.length) {
                for (var i = oldNbr; i < babyGame.babies.length; i++) {
                    var newBaby = Bodies.circle(babyGame.babies[i].x, babyGame.babies[i].y, 10, { isStatic: true });
                    newBaby.render.fillStyle = "blue";
                    newBaby.label = 'otherBaby';
                    otherBabies.push(newBaby);
                    World.add(engine.world, newBaby);
                }
            }
            for (var i = 0; i < otherBabies.length; i++) {
                if (otherBabies[i] && babyGame.babies[i]) {
                    otherBabies[i].position.x = babyGame.babies[i].x;
                    otherBabies[i].position.y = babyGame.babies[i].y;
                }
            }
        }
    });
    // mouse constraint
    var mouse = Mouse.create(render.canvas);
    var constraint = {};
    constraint.mouse = mouse;
    constraint.constraint = {};
    constraint.constraint.stiffness = 0.2;
    constraint.constraint.render = {};
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
    ]);
    // run the engine
    Engine.run(engine);
    // run the renderer
    render.options.wireframes = false;
    Render.run(render);
    Events.on(render, 'beforeRender', function () { gravity.refresh(); });
    render['mouse'] = mouse;
    engine.world.gravity.x = 0;
    engine.world.gravity.y = 0;
    var count = 0;
    Events.on(engine, 'collisionStart ', function (e) {
        var i, pair, length = e.pairs.length;
        for (i = 0; i < length; i++) {
            pair = e.pairs[i];
            // console.log(pair)
            if (pair.bodyA.label !== 'player' || pair.bodyB.label !== 'player') {
                break;
            }
            count++;
            console.log("count ", count);
            if (count > 4) {
                createBaby(pair);
                playSound('cry');
                count = 0;
            }
            else {
                playSound('kiss');
            }
            // var baby = Bodies.circle(pair.bodyA.position.x, pair.bodyA.position.y, 10);
            // baby.label = 'baby';
            // baby.frictionAir = 0;
            // World.add(engine.world, baby);
            // gravity.babies.push(baby)
            // myscoreElem.innerText = gravity.babies.length.toString();
            // console.log(baby)
            //Here body with label 'Player' is in the pair, do some stuff with it
        }
    });
    function createBaby(pair) {
        var baby = Bodies.circle(pair.bodyA.position.x, pair.bodyA.position.y, 10);
        baby.label = 'baby';
        baby.frictionAir = 0;
        World.add(engine.world, baby);
        gravity.babies.push(baby);
        myscoreElem.innerText = gravity.babies.length.toString();
    }
}
var infos = [{
        x: 10,
        y: 20,
        role: 'BM',
        radius: 50,
        children: true,
        id: 10
    }];
// var socket = io.connect('http://localhost:4200');
var socket = io.connect('https://baby-positive-company.herokuapp.com/');
socket.on('connect', function (data) {
    //sending the current user positions
    //socket.emit('sendInfo', infos);
});
// setInterval(function () {
// 	socket.emit('sendInfo', infos);
// }, 10000)
var hitSound = new Audio();
var backgroundSound = new Audio();
var backgroundSound = document.getElementById('backSound');
backgroundSound.currentTime = 0;
backgroundSound.play();
function playSound(type) {
    hitSound = document.getElementById(type);
    hitSound.currentTime = 0;
    hitSound.play();
}
function isPlaying() {
    return !hitSound.paused;
}
