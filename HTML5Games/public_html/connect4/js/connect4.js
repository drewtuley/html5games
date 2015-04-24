/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var colour = 0;
var WIDTH = 7;
var HEIGHT = 6;
var EMPTY = 0;
var P1 = 1;
var P2 = 2;
var WHITE = '#ffffff';
var RED = '#ff0000';
var YELLOW = '#ffff00';
var player = P1;
var foundWinner = false;
var currentWinner = EMPTY;
var score = {p1: 0, p2: 0};

function initialise() {
    canvas = document.getElementById("myCanvas");
    canvas.addEventListener("click", doClick, true);
    ctx = canvas.getContext("2d");
    ctx.font = "8px arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    scale = {x: (canvas.width / WIDTH), y: (canvas.height / HEIGHT)};

    startUp();
}

function startUp() {
    resetBoard();
    
    score = {p1:0, p2:0};
    setInterval(animate, 250);
}

function resetBoard() {
    setupGrid();
    foundWinner = false;
    currentWinner = EMPTY;
    player = P1;
    document.getElementById("winner").innerHTML = "&nbsp;";
}

function animate() {
    drawBoard();
    if (!foundWinner) {
       foundWinner = findWinner();
    }
    
    showScores();
}
function setupGrid() {
    grid = [];
    for (row = 0; row < HEIGHT; row++) {
        for (col = 0; col < WIDTH; col++) {
            grid.push({piece: EMPTY});
        }
    }
}
function drawBoard() {
    // start with black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (row = 0; row < HEIGHT; row++) {
        for (col = 0; col < WIDTH; col++) {
            piece = grid[row * WIDTH + col];
            switch (piece.piece) {
                case EMPTY:
                    colour = WHITE;
                    break;
                case P1:
                    colour = RED;
                    break;
                case P2:
                    colour = YELLOW;
                    break;
            }
            ctx.fillStyle = colour;
            ctx.beginPath();
            ctx.arc((col * scale.x) + (scale.x / 2), (row * scale.y) + (scale.y / 2), scale.x / 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}
function showScores() {
    document.getElementById("p1").innerHTML = score.p1;
    document.getElementById("p2").innerHTML = score.p2;
    document.getElementById("winner").innerHTML = currentWinner;
}
function doClick(event) {
    //alert(event.clientX);
    if (!foundWinner) {
        var col = Math.round(event.clientX / scale.x) - 1;
        if (canPlace(col, player)) {
            addPieceToBoard(col, player);
            player = (player === P1) ? P2 : P1;
        }
    } else {
        resetBoard();
    }
}


function canPlace(column, player) {
    for (row = HEIGHT - 1; row > -1; row--) {
        piece = grid[row * WIDTH + column];
        if (piece.piece === EMPTY) {
            return true;
        }
    }
    return false;
}
function addPieceToBoard(column, player) {
    // start at the bottom
    for (row = HEIGHT - 1; row > -1; row--) {
        piece = grid[row * WIDTH + column];
        if (piece.piece === EMPTY) {
            piece.piece = player;
            break;
        }
    }
}

function testFromPos(row, col) {
    var winner = false;

    if (row - 4 >= -1 && grid[row * WIDTH + col].piece !== EMPTY) {
        // 4 up
        winner = grid[row * WIDTH + col].piece === grid[(row - 1) * WIDTH + col].piece
                && grid[row * WIDTH + col].piece === grid[(row - 2) * WIDTH + col].piece
                && grid[row * WIDTH + col].piece === grid[(row - 3) * WIDTH + col].piece;
    }
    if (!winner && col + 4 <= WIDTH && grid[row * WIDTH + col].piece !== EMPTY) {
        // 4 along
        winner = grid[row * WIDTH + col].piece === grid[row * WIDTH + col + 1].piece &&
                grid[row * WIDTH + col].piece === grid[row * WIDTH + col + 2].piece &&
                grid[row * WIDTH + col].piece === grid[row * WIDTH + col + 3].piece;
    }
    if (!winner && row - 4 >= -1 && col + 4 <= WIDTH && grid[row * WIDTH + col].piece !== EMPTY) {
        // 4 up and along
        winner = grid[row * WIDTH + col].piece === grid[(row - 1) * WIDTH + col + 1].piece &&
                grid[row * WIDTH + col].piece === grid[(row - 2) * WIDTH + col + 2].piece &&
                grid[row * WIDTH + col].piece === grid[(row - 3) * WIDTH + col + 3].piece;
    }
    if (!winner && row + 4 <= HEIGHT && col + 4 <= WIDTH && grid[row * WIDTH + col].piece !== EMPTY) {
        // 4 down and along
        winner = grid[row * WIDTH + col].piece === grid[(row + 1) * WIDTH + col + 1].piece &&
                grid[row * WIDTH + col].piece === grid[(row + 2) * WIDTH + col + 2].piece &&
                grid[row * WIDTH + col].piece === grid[(row + 3) * WIDTH + col + 3].piece;
    }
    if (winner) {
        return (grid[row * WIDTH + col].piece);
    } else {
        return EMPTY;
    }
}

function findWinner() {
    var found = false;
    for (row = HEIGHT - 1; !found && row > -1; row--) {
        for (col = 0; !found && col < WIDTH; col++) {
            winner = testFromPos(row, col);
            if (winner !== EMPTY) {
                currentWinner = winner;
                found = true;
                break;
            }
        }
    }
    if (found) {
        if (currentWinner === P1) {
            score.p1 += 1;
        } else {
            score.p2 += 1;
        }
    }
    return found;
}
