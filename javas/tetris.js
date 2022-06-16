let lastTime = 0;
let dropInterval = 1000;
let dropCounter = 0;
let pause = false;

const canvas = document.getElementById("tetris");
const canvasNext = document.getElementById("nextPiece");
const context = canvas.getContext("2d");
const contextNext = canvasNext.getContext("2d");
const grid = createMatriz(10, 20);
const color = [
    null,
    'rgb(207, 100, 251)',
    'rgb(228, 150, 80)',
    'rgb(252, 88, 33)',
    'rgb(252, 163, 33)',
    'rgb(76, 242, 255)',
    'rgb(94, 255, 112)',
    'rgb(17, 209, 33)'
]
const player = {
    pos: { x: 0, y: 0 },
    matriz: null,
    next: null,
    score: 0,
    level: 0,
    lines: 0
};
context.scale(20, 20);
contextNext.scale(19, 19);

function createPiece(tipo) {
    switch (tipo) {
        case "T":
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]
            ];
            break;
        case "O":
            return [
                [2, 2],
                [2, 2],
            ];
            break;
        case "L":
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3]
            ];
            break;
        case "J":
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0]
            ];
            break;
        case "I":
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0]
            ];
            break;
        case "S":
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0]
            ];
            break;
        case "Z":
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0]
            ];
            break;
    };
}


function createMatriz(width, height) {
    const matriz = [];

    while (height--) {
        matriz.push(new Array(width).fill(0));
    }

    return matriz;
}

function colition(grid, player) {
    const matriz = player.matriz;
    const offset = player.pos;

    for (let y = 0; y < matriz.length; ++y) {
        for (let x = 0; x < matriz[y].length; ++x) {
            if (matriz[y][x] !== 0 && (grid[y + offset.y] && grid[y + offset.y][x + offset.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(grid, player) {
    player.matriz.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                grid[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
    console.table(grid);
}

function drawMatriz(matriz, offset) {
    matriz.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = color[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}
function drawMatrizNext(matriz, offset) {
    contextNext.fillStyle = "#000";
    contextNext.fillRect(0, 0, canvasNext.width, canvasNext.height);

    matriz.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                contextNext.fillStyle = color[value];
                contextNext.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });

}
function draw() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatriz(grid, { x: 0, y: 0 });
    drawMatriz(player.matriz, player.pos);
    drawMatrizNext(player.next, { x: 1, y: 1 });
}


function gridSweep() {
    let rowCount = 1;
    outer: for (let y = grid.length - 1; y > 0; --y) {
        for (let x = 0; x < grid[y].length; ++x) {
            if (grid[y][x] === 0) {
                continue outer;
            }

        }

        const row = grid.splice(y, 1)[0].fill(0);
        grid.unshift(row);
        ++y;

        player.score += rowCount * 10;
        player.lines++;
        rowCount *= 2;
        if (player.lines % 3 === 0) player.level++;
    }
};
function update(time = 0) {
    if (pause) return;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop()
    }
    draw();
    requestAnimationFrame(update);
}
function playerDrop() {
    player.pos.y++;
    if (colition(grid, player)) {
        player.pos.y--;
        merge(grid, player);
        playerReset();
        gridSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(direction) {
    player.pos.x += direction;
    if (colition(grid, player)) {
        player.pos.x -= direction;
    }
}
function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matriz);
    while (colition(grid, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matriz[0].length) {
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matriz) {
    for (let y = 0; y < matriz.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matriz[x][y], matriz[y][x]] = [matriz[y][x], matriz[x][y]];
        }
    }
    matriz.forEach(row => row.reverse());
}
function playerReset() {
    const pieces = 'ILJOTSZ';
    dropInterval = 1000 - (player.level * 100);
    if (player.next === null) {
        player.matriz = createPiece(pieces[pieces.length * Math.random() | 0]);
    } else {
        player.matriz = player.next;
    }
    player.next = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.x = (grid[0].length / 2 | 0) - (player.matriz[0].length / 2 | 0);
    player.pos.y = 0;
    if (colition(grid, player)) {
        grid.forEach(row => row.fill(0));
        player.score = 0;
        player.lines = 0;
        player.level = 0;
        updateScore();
    }
}
function fpause(pauser) {
    pause = pauser;
    if (pause) {
        document.getElementById("background_tetris").style.display = "block";
        document.getElementById("UI_pause").style.display="block";
        document.getElementById("music").pause();
    } else {
        document.getElementById("background_tetris").style.display = "none";
        document.getElementById("UI_pause").style.display="none";
        document.getElementById("music").play();
        update();
    }
}
function gameStart() {
    document.getElementById("background_tetris").style.display="none";
    document.getElementById("UI-mainMenu").style.display="none";
    document.getElementById("body").style.display="flex";
    document.getElementById("music").src="audio/lel.aiff";
    document.getElementById("music").play();
    pause=false;
    playerReset();
    updateScore();
    update();
}

function closeGame(){
    document.getElementById("body").style.display="none";
    document.getElementById("UI-mainMenu").style.display="block";
    document.getElementById("UI_pause").style.display="none";
    document.getElementById("background_tetris").style.display="block";
    document.getElementById("music").src="audio/kekw.wav";
    document.getElementById("music").play();
};

function updateScore() {

    document.getElementById("score").innerHTML = player.score;
    document.getElementById("level").innerHTML = player.level;
    document.getElementById("lines").innerHTML = player.lines;
}
document.addEventListener("keydown", event => {
    switch (event.keyCode) {
        case 40:
            playerDrop();
            break;
        case 37:
            playerMove(-1);
            break;
        case 39:
            playerMove(1);
            break;
        case 32:
            playerRotate();
            break;
    }
});

playerReset();
updateScore();
update();