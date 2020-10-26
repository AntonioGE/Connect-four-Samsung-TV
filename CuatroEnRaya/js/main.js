var counter = 0;
var coin_img;
var cell_img;

var cols = 7;
var rows = 6;
var numToWin = 4;


var scale = 0.55;
const tileSize = 200;

var tileGrid;
var gridImgArray;
var coinImgArray;

const CELL = 0;
const CORNER_L_T = 1;
const CORNER_R_T = 2;
const CORNER_L_B = 3;
const CORNER_R_B = 4;
const BORDER_L = 5;
const BORDER_R = 6;
const BORDER_T = 7;
const BORDER_B = 8;

const KEY_LEFT_ARROW = 37;
const KEY_RIGHT_ARROW = 39;
const KEY_OK = 13;

const STATE_WAIT_FOR_MOVE = 0;
const STATE_APPLYING_MOVE = 1;
const STATE_GAME_FINISHED = 2;
const STATE_DRAW = 3;
var gameState = STATE_WAIT_FOR_MOVE;

const PLAYER_1 = 0;
const PLAYER_2 = 1;
const EMPTY = -1;
var currentPlayer = PLAYER_1;
var playerColors = ['red', 'yellow'];

var grid;

var colSelected = 0;

var fallingCoinY = -0.5;
var fallingCoinDelta = 0.1;



var lineWinner = [];
var hueValue = 0.0;
var hueDelta = 0.001;

//Initialize function
var init = function() {
    // TODO:: Do your initialization job
    console.log('init() called');

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Something you want to do when hide or exit.
        } else {
            // Something you want to do when resume.
        }
    });

    // add eventListener for keydown
    document.addEventListener('keydown', function(e) {
        switch (gameState) {
            case STATE_WAIT_FOR_MOVE:
                switch (e.keyCode) {
                    case KEY_LEFT_ARROW:
                        if (colSelected > 0) {
                            colSelected--;
                        }
                        break;
                    case KEY_RIGHT_ARROW:
                        if (colSelected < cols - 1) {
                            colSelected++;
                        }
                        break;
                    case KEY_OK:
                        if (canPlaceCoin(colSelected)) {
                            gameState = STATE_APPLYING_MOVE;
                            fallingCoinY = -0.5;
                        }
                        break;
                }
                break;

            case STATE_GAME_FINISHED:
                switch (e.keyCode) {
                    case KEY_OK:
                        resetGame();
                        break;
                }
                break;
            case STATE_DRAW:
                switch (e.keyCode) {
                    case KEY_OK:
                        resetGame();
                        break;
                }
                break;
        }
        /*
           switch (e.keyCode) {
               case 37: //LEFT arrow
                   if(colSelected > 0){
                   	colSelected--;
                   }
                   break;
               case 38: //UP arrow
                   
                   break;
               case 39: //RIGHT arrow
               	if(colSelected > 0){
                   	colSelected++;
                   }
                   break;
               case 40: //DOWN arrow
                   
                   break;
               case 13: //OK button
                   break;
               case 10009: //RETURN button
                   tizen.application.getCurrentApplication().exit();

                   break;
               default:
                   console.log('Key code : ' + e.keyCode);
                   break;
           }*/
    });

    coin_img = document.getElementById('coin');
    cell_img = document.getElementById('cell');

    initGrid();
    initTileGrid();

    initImageArray();
    initCoinImgArray();

    currentPlayer = Math.floor(Math.random() * 2);

    loop();
};
// window.onload can work without <body onload="">
window.onload = init;

function resetGame() {
    initGrid();
    initTileGrid();
    currentPlayer = Math.floor(Math.random() * 2);
    gameState = STATE_WAIT_FOR_MOVE;
}

function loop() {

    tick();
    render();

    setTimeout(loop, 10);
}

function tick() {
	hueValue += hueDelta;
    switch (gameState) {
        case STATE_WAIT_FOR_MOVE:
            break;
        case STATE_APPLYING_MOVE:
            fallingCoinY += fallingCoinDelta;
            var goalY = getTopCoinY(colSelected) - 1;
            if (fallingCoinY >= goalY) {
                //fallingCoinY = goalY;
                fallingCoinY = -0.5;
                grid[colSelected][goalY] = currentPlayer;

                lineWinner = getLineFormed(currentPlayer);
                if (lineWinner.length == numToWin) {
                    gameState = STATE_GAME_FINISHED;
                } else if (!canPlaceCoins()) {
                    gameState = STATE_DRAW;
                } else {
                    gameState = STATE_WAIT_FOR_MOVE;
                    changePlayer();
                }
            }
            break;
    }
}

function render() {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");

    
    //var canvasEffects = document.getElementById("effectsCanvas");
    //var ctxEffects = canvasEffects.getContext("2d");

    //Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctxEffects.clearRect(0, 0, canvasEffects.width, canvasEffects.height);


    //Draw background
    var rgb = HSVtoRGB(hueValue % 1.0, 0.5, 1.0);
    var grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, 'white');
    grd.addColorStop(1, rgbToHex(rgb.r, rgb.g, rgb.b));
    //grd.addColorStop(1, 'orange');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //Draw circle
    /*
    ctx.beginPath();
    counter += 0.1;
    ctx.arc(canvas.width / 2 + Math.sin(counter) * 200, canvas.height / 2, 100, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.stroke();*/

    var xOffsetGrid = (canvas.width - cols * tileSize * scale) / 2;
    var yOffsetGrid = (canvas.height - rows * tileSize * scale) / 2;

    var xOffset = (canvas.width - (cols + 2) * tileSize * scale) / 2;
    var yOffset = (canvas.height - (rows + 2) * tileSize * scale) / 2;

    switch (gameState) {
        case STATE_WAIT_FOR_MOVE:
            drawFallingCoin(ctx, xOffsetGrid, yOffsetGrid);
            break;
        case STATE_APPLYING_MOVE:
            drawFallingCoin(ctx, xOffsetGrid, yOffsetGrid);
            break;
        case STATE_GAME_FINISHED:
            break;
    }

    drawGrid(ctx, xOffsetGrid, yOffsetGrid);

    drawTileGrid(ctx, xOffset, yOffset);

    switch (gameState) {
        case STATE_WAIT_FOR_MOVE:
            //ctxEffects.filter = 'blur(10px)';
            //drawColumnBounds(ctxEffects, colSelected, xOffset, yOffset, tileSize / 6);

            //ctx.filter = 'blur(1px)';
            drawCurrentPlayerName(ctx);
            break;
        case STATE_APPLYING_MOVE:
            //ctxEffects.filter = 'blur(10px)';
            //drawColumnBounds(ctxEffects, colSelected, xOffset, yOffset, tileSize / 6);

        	//ctx.filter = 'blur(1px)';
            drawCurrentPlayerName(ctx);
            break;
        case STATE_GAME_FINISHED:
            drawLineWinner(ctx, xOffsetGrid, yOffsetGrid, playerColors[currentPlayer]);

            drawWinnerName(ctx);
            
            drawNewGameMsg(ctx, canvas);
            break;
        case STATE_DRAW:
            drawDrawName(ctx);
            
            drawNewGameMsg(ctx, canvas);
            break;
    }



}

function hasPlayerWon(player) {

}

function getLineFormed(player) {
    var line = getVerticalLineFormed(player);
    if (line.length == numToWin) {
        return line;
    }

    var line = getHorizontalLineFormed(player);
    if (line.length == numToWin) {
        return line;
    }

    var line = getDiagonalLineFormed1(player);
    if (line.length == numToWin) {
        return line;
    }

    var line = getDiagonalLineFormed2(player);
    if (line.length == numToWin) {
        return line;
    }

    return [];
}

function updateLineCounter(line, col, row, player) {
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
        if (grid[col][row] == player) {
            var point = [col, row];
            line.push(point);
            return line;
        }
    }
    return [];
}


function getVerticalLineFormed(player) {
    for (var i = 0; i < cols; i++) {
        var line = [];
        for (var j = 0; j < rows; j++) {
            line = updateLineCounter(line, i, j, player);
            if (line.length == numToWin) {
                return line;
            }
        }
    }
    return [];
}


function getHorizontalLineFormed(player) {
    for (var j = 0; j < rows; j++) {
        var line = [];
        for (var i = 0; i < cols; i++) {
            line = updateLineCounter(line, i, j, player);
            if (line.length == numToWin) {
                return line;
            }
        }
    }
    return [];
}

function getDiagonalLineFormed1(player) {
    for (var i = numToWin - rows; i <= cols - numToWin; i++) {
        var line = [];
        for (var j = 0; j < rows; j++) {
            line = updateLineCounter(line, i + j, j, player);
            if (line.length == numToWin) {
                return line;
            }
        }
    }
    return [];
}

function getDiagonalLineFormed2(player) {
    for (var i = numToWin - rows; i <= cols - numToWin; i++) {
        var line = [];
        for (var j = 0; j < rows; j++) {
            line = updateLineCounter(line, i + j, rows - 1 - j, player);
            if (line.length == numToWin) {
                return line;
            }
        }
    }
    return [];
}

function changePlayer() {
    currentPlayer = (currentPlayer + 1) % 2;
}

function getTopCoinY(colIndex) {
    for (var i = 0; i < rows; i++) {
        if (grid[colIndex][i] != EMPTY) {
            return i;
        }
    }
    return rows;
}

function canPlaceCoin(colIndex) {
    return grid[colIndex][0] == EMPTY;
}

function canPlaceCoins() {
    for (var i = 0; i < cols; i++) {
        if (canPlaceCoin(i)) {
            return true;
        }
    }
    return false;
}

function drawCurrentPlayerName(ctx) {
    var text = 'Turno del Jugador ' + (currentPlayer + 1);

    ctx.font = "bold 100px Comic Sans MS";
    ctx.textAlign = "center";
    ctx.fillStyle = playerColors[currentPlayer];
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.fillText(text, canvas.width / 2, tileSize * scale);
    ctx.strokeText(text, canvas.width / 2, tileSize * scale);
}

function drawWinnerName(ctx) {
    ctx.filter = 'blur(1px)';
    ctx.font = "bold 120px Comic Sans MS";
    ctx.textAlign = "center";
    ctx.fillStyle = playerColors[currentPlayer];
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.fillText('GANA EL JUGADOR ' + (currentPlayer + 1), canvas.width / 2, tileSize * scale);
    ctx.strokeText('GANA EL JUGADOR ' + (currentPlayer + 1), canvas.width / 2, tileSize * scale);
}

function drawDrawName(ctx) {
    var text = 'EMPATE'
    ctx.filter = 'blur(1px)';
    ctx.font = "bold 120px Comic Sans MS";
    ctx.textAlign = "center";
    ctx.fillStyle = playerColors[currentPlayer];
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.fillText(text, canvas.width / 2, tileSize * scale);
    ctx.strokeText(text, canvas.width / 2, tileSize * scale);
}

function drawNewGameMsg(ctx, canvas) {
    var text = 'Pulsa OK para volver a jugar';
    ctx.filter = 'blur(1px)';
    ctx.font = "bold 80px Comic Sans MS";
    ctx.textAlign = "center";
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.fillText(text, canvas.width / 2, canvas.height - tileSize * scale);
    ctx.strokeText(text, canvas.width / 2, canvas.height - tileSize * scale);
    //ctx.fillText(text, canvas.width / 2,  tileSize * scale);
    //ctx.strokeText(text, canvas.width / 2,  tileSize * scale);
}

function drawLineWinner(ctx, xOffset, yOffset, strokeStyle) {
    for (var i = 0; i < lineWinner.length; i++) {
        ctx.beginPath();
        ctx.strokeStyle = strokeStyle;
        ctx.arc(
            (lineWinner[i][0] + 0.5) * tileSize * scale + xOffset, (lineWinner[i][1] + 0.5) * tileSize * scale + yOffset,
            tileSize / 2 * scale, 0, 2 * Math.PI);
        ctx.lineWidth = 15;
        ctx.stroke();
    }
}

function drawColumnBounds(ctx, colIndex, xOffset, yOffset, margin) {
    ctx.beginPath();
    ctx.strokeStyle = playerColors[currentPlayer];
    ctx.rect(
        ((colIndex + 1) * tileSize - margin) * scale + xOffset, (1 * tileSize - margin) * scale + yOffset, (tileSize + 2 * margin) * scale, (tileSize * rows + 2 * margin) * scale);
    ctx.lineWidth = 20;
    ctx.stroke();
}

function drawGrid(ctx, xOffset, yOffset) {
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            var value = grid[i][j];
            if (value != EMPTY) {
                ctx.drawImage(coinImgArray[value],
                    i * tileSize * scale + xOffset,
                    j * tileSize * scale + yOffset,
                    tileSize * scale,
                    tileSize * scale);
            }
        }
    }
}

function drawTileGrid(ctx, xOffset, yOffset) {
    for (var i = 0; i < tileGrid.length; i++) {
        for (var j = 0; j < tileGrid[i].length; j++) {
            ctx.drawImage(gridImgArray[tileGrid[i][j]],
                i * tileSize * scale + xOffset,
                j * tileSize * scale + yOffset,
                tileSize * scale,
                tileSize * scale);
        }
    }
}

function drawFallingCoin(ctx, xOffset, yOffset) {
    ctx.drawImage(coinImgArray[currentPlayer],
        colSelected * tileSize * scale + xOffset,
        fallingCoinY * tileSize * scale + yOffset,
        tileSize * scale,
        tileSize * scale);
}

function initGrid() {
    grid = [];
    for (var i = 0; i < cols; i++) {
        grid[i] = [];
        for (var j = 0; j < rows; j++) {
            grid[i][j] = EMPTY;
        }
    }
}

function initTileGrid() {
    var width = cols + 2;
    var height = rows + 2;

    //Init grid size
    tileGrid = [];
    for (var i = 0; i < width; i++) {
        tileGrid[i] = [];
        for (var j = 0; j < height; j++) {
            tileGrid[i][j] = 0;
        }
    }

    //Set corners
    tileGrid[0][0] = CORNER_L_T;
    tileGrid[width - 1][0] = CORNER_R_T;
    tileGrid[0][height - 1] = CORNER_L_B;
    tileGrid[width - 1][height - 1] = CORNER_R_B;

    //Set borders
    for (var i = 0; i < cols; i++) {
        tileGrid[i + 1][0] = BORDER_T;
    }
    for (var i = 0; i < cols; i++) {
        tileGrid[i + 1][height - 1] = BORDER_B;
    }
    for (var i = 0; i < rows; i++) {
        tileGrid[0][i + 1] = BORDER_L;
    }
    for (var i = 0; i < rows; i++) {
        tileGrid[width - 1][i + 1] = BORDER_R;
    }
}

function initImageArray() {
    gridImgArray = new Array(9);
    gridImgArray[CELL] = document.getElementById("cell");
    gridImgArray[CORNER_L_T] = document.getElementById("corner_l_t");
    gridImgArray[CORNER_R_T] = document.getElementById("corner_r_t");
    gridImgArray[CORNER_L_B] = document.getElementById("corner_l_b");
    gridImgArray[CORNER_R_B] = document.getElementById("corner_r_b");
    gridImgArray[BORDER_L] = document.getElementById("border_l");
    gridImgArray[BORDER_R] = document.getElementById("border_r");
    gridImgArray[BORDER_T] = document.getElementById("border_t");
    gridImgArray[BORDER_B] = document.getElementById("border_b");
}

function initCoinImgArray() {
    coinImgArray = new Array(2);
    coinImgArray[PLAYER_1] = document.getElementById("coin_red");
    coinImgArray[PLAYER_2] = document.getElementById("coin_yellow");
}



/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function componentToHex(c) {
	  var hex = c.toString(16);
	  return hex.length == 1 ? "0" + hex : hex;
	}

function rgbToHex(r, g, b) {
	 return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}