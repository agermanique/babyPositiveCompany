window.onload = init;
var Gravity = (function () {
    function Gravity() {
    }
    Gravity.prototype.refresh = function () {
        this.engine.world.gravity.x = Math.random() - 0.5;
        this.engine.world.gravity.y = Math.random() - 0.5;
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
    boxA.render.fillStyle = "green";
    var boxB = Bodies.circle(400, 0, 20);
    boxB.render.fillStyle = "green";
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
    World.add(engine.world, [boxA, boxB]);
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
    Matter.Events.on(engine, 'collisionActive', function (e) {
        console.log(e);
    });
}
