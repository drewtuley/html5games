/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var count = 0;
var canvas, ctx;
var scale = {};

var turn = 0;
var quit = false;
var game_over = false;
var do_draw_debug = true;
var lives = 4;
var score = 0;
var delay = 250;
var timer;

var directions = [{dx: 10, dy: 0}, {dx: 0, dy: 10}, {dx: -10, dy: 0}, {dx: 0, dy: -10}];
var EAST = 0;           // direction indices
var SOUTH = 1;
var WEST = 2;
var NORTH = 3;
var next_dir;
var move_buffer = [];

var LEFT = -1;
var RIGHT = 1;

var snake = [];
var last_snake;
var add_to_snake = [];
var jewels = [];
var do_animate = true;
var GOLD = '#ffd700';
var GREEN = '#00ff00';

function initialise() {
    canvas = document.getElementById("myCanvas");
    window.addEventListener("keydown", doKeyDown, true);
    ctx = canvas.getContext("2d");
    ctx.font = "8px arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    scale = {x: (canvas.width / 10), y: (canvas.height / 10)};

    startUp();
    setFramerate();
    //timer = setInterval(animate, delay);
}

function doRestart() {
    game_over = false;
    quit = false;
    do_animate = true;
    delay = 250;
    makeSnake();
    generateJewels();

    drawSnake();
    drawJewels();
}
function startUp() {
    score = 0;
    lives = 3;

    doRestart();
}
function setFramerate() {
    if (timer) {
        clearInterval(timer);
    }
    timer = setInterval(animate, delay);
}
function animate() {
    if (do_animate && !quit && !game_over) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        moveSnake();
        hasEaten();
        drawSnake();
        drawJewels();
        if (do_draw_debug)
            drawDebug();
        if (turn !== 0) {
            makeTurn();
            turn = 0;
        } else {
            next_dir = snake[0].dir;
        }
        checkCollisions();
        houseKeep();
        if (snake.length>10) {
            delay = 150;
            setFramerate();
        }
    }
    updateData();
    if (quit) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "20px arial";
        ctx.fillStyle = "#000000";
        ctx.fillText("You Quit", canvas.width / 2, canvas.height / 2);
    }
    if (game_over) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "20px arial";
        ctx.fillStyle = "#000000";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    }
}
function drawDebug() {
    ctx.fillStyle = "#000000";
    ctx.font = "8px arial";
    ctx.fillText("jewel[]" + jewels.length.toString(), 20, 490);
    ctx.fillText("snake[]" + snake.length.toString(), 65, 490);
    ctx.fillText("deley="+delay.toString(), 120, 490);
}

function updateData() {
    document.getElementById("lives").innerHTML = lives.toString();
    document.getElementById("score").innerHTML = score.toString();
}

function checkCollisions() {
    if (snake[0].x + 10 > canvas.width || snake[0].x < 0 || snake[0].y + 10 > canvas.height || snake[0].y < 0) {
        game_over = true;
    }
    if (!game_over) {
        snake.forEach(function (segment, index) {
            if (index > 0) {
                if (segment.x === snake[0].x && segment.y === snake[0].y) {
                    game_over = true;
                }
            }
        });
    }
    if (game_over)
        lives -= 1;
}
function makeSnake() {
    snake = [];
    for (i = 0; i < 5; i++) {
        var sn = {x: 100 - (i * 10), y: 100, dir: EAST};
        snake.push(sn);
    }
    next_dir = snake[0].dir;
}
var START_JEWELS = 10;

function generateJewel() {
    var x = Math.round((Math.random() * scale.x)) * 10;
    var y = Math.round((Math.random() * scale.y)) * 10;
    var value = Math.round(Math.random() * 10) === 1 ? 100 : 10;        // 10% chance of GOLD
    var added = false;
    jewels.forEach(function (jewel) {
        if (!added && !jewel.active) {
            jewel.active = true;
            jewel.x = x;
            jewel.y = y;
            jewel.value = value;
            added = true;
        }
    });
    if (!added) {
        jewels.push({x: x, y: y, value: value, active: true});
    }
}
function generateJewels() {
    jewels = [];
    for (i = 0; i < START_JEWELS; i++) {
        generateJewel();
    }
}

function drawJewel(jewel) {
    if (jewel.active) {
        if (jewel.value === 100)
            ctx.fillStyle = GOLD;
        else
            ctx.fillStyle = GREEN;
        ctx.fillRect(jewel.x, jewel.y, 8, 8);
    }
}
function drawJewels() {
    jewels.forEach(drawJewel);
}

function doKeyDown(e) {
    switch (e.keyCode) {
        case 90:
            turn = LEFT;
            break;
        case 88:
            turn = RIGHT;
            break;
        case 80:        // P
            do_animate = !do_animate;
            break;
        case 81:        // Q
            quit = true;
            break;
        case 78:        // N
            startUp();
            break;
        case 68:        // D
            do_draw_debug = !do_draw_debug;
            break;
        case 32:        // space
            if (lives > 0)
                doRestart();
            break;
        default:
            alert(e.keyCode);
    }
}
function hasEaten() {
    var do_add = false;
    add_to_snake.forEach(function (addition) {
        if (addition.waiting && addition.x === last_snake.x && addition.y === last_snake.y) {
            addition.waiting = false;
            do_add = true;
        }
    });
    if (do_add) {
        snake.push(last_snake);
    }
    var add_new = false;
    jewels.forEach(function (jewel) {
        if (jewel.x === snake[0].x && jewel.y === snake[0].y) {
            jewel.active = false;
            score += jewel.value;
            add_to_snake.push({x: (jewel.x), y: (jewel.y), waiting: true});
            add_new = true;
        }
    });
    if (add_new) {
        generateJewel();
    }
}



function houseKeep() {
    no_zap = add_to_snake.some(function (add) {
        return add.waiting;
    });
    if (!no_zap) {
        add_to_snake = [];
    }
}

function makeTurn() {
    next_dir = snake[0].dir;
    next_dir += turn;

    if (next_dir < EAST) {
        next_dir = NORTH;
    } else if (next_dir > NORTH) {
        next_dir = EAST;
    }
}

function drawSegment(segment) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(segment.x, segment.y, 8, 8);
}
function drawSnake() {
    snake.forEach(drawSegment);
}

function moveSegment(segment) {
    move_buffer.push(segment.dir);
    segment.dir = move_buffer.shift();
    segment.x += directions[segment.dir].dx;
    segment.y += directions[segment.dir].dy;
}
function moveSnake() {
    move_buffer.push(next_dir);
    last_snake = jQuery.extend({}, snake[snake.length - 1]);

    snake.forEach(moveSegment);
    move_buffer = [];
}