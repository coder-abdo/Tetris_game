"use strict";
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
ctx.scale(20, 20);
function arenaSweap() {
    outer: for (let y = arena.length -1; y > 0; y--) {
            const element = arena[y];
            for (let x = 0; x < element.length; x++) {
                if(arena[y][x] === 0){
                    continue outer;
                }   
            }
           const row = arena.splice(y, 1)[0].fill(0);
           arena.unshift(row);
           ++y;
        }
}
function createPieces(type) {
    if(type === 'T'){
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ];
    }else if(type === 'O'){
        return [
            [2, 2],
            [2, 2]
        ];
    }else if(type === 'L'){
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ];
    }else if(type === 'J'){
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
        ];
    }else if(type === 'I'){
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    }else if(type === 'S'){
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0]
        ];
    }else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ];
    }
}
function createMatrix(w, h) {
    const matrixs = [];
    while (h--) {
        matrixs.push(new Array(w).fill(0));
    }
    return matrixs;
}
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                matrix[y][x],
                matrix[x][y]
            ];
        }  
    }
    if(dir > 0){
        matrix.forEach(row => row.reverse());
    }else {
        matrix.reverse();
    }
}
function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.height);
    drawMatrix(arena, {x:0, y:0});
    drawMatrix(player.matrix, player.pos);
}
function playerDrop() {
    player.pos.y++;
    if(collide(arena, player)){
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweap();
    }
    dropCounter = 0;
}
function playerMove(dir) {
    player.pos.x += dir;
    if(collide(arena, player)){
        player.pos.x -= dir;
    }
}
function playerReset() {
    const pieces = 'IJLOSTZ';
    player.matrix = createPieces(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if(collide(arena, player)){
        arena.forEach(row => row.fill(0));
    }
}
function playerRotate(dir){
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while(collide(arena, player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}
const colors = [
    null,
    '#49B1B0',
    '#1E2E46',
    '#DC3C6E',
    '#FEFDF5',
    '#2F1F42',
    '#FF530D'
];
let dropCounter, dropInterval, lastTime;
lastTime = 0;
dropCounter = 0;
dropInterval = 1000;
function update(time = 0) {
    const dtTime = time - lastTime;
    lastTime = time;
    dropCounter += dtTime;
    if(dropCounter > dropInterval){
       playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++) {
        const element = m[y];
        for (let x = 0; x < element.length; x++) {
            if(
                m[y][x] !== 0 &&
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0 ){
                    return true;
            }  
        }
    }
    return false;
}
function merge(arena, player){
    player.matrix.forEach((row, y) => {
        row.forEach((val, x) => {
            if(val !== 0){
                arena[y + player.pos.y][x + player.pos.x] = val;
            }
        });
    });
}
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((val, x) => {
            if(val !== 0){
                ctx.fillStyle = colors[val];
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}
const arena = createMatrix(12, 20);
const player = {
    pos: {x: 5, y: 5},
    matrix : createPieces('T'),
}
document.addEventListener('keydown', e => {
    if(e.keyCode === 37){
        playerMove(-1);
    }else if(e.keyCode === 39){
        playerMove(1);
    }else if(e.keyCode === 40){
        playerDrop();
    }else if(e.keyCode === 81){
        playerRotate(-1);
    }else if(e.keyCode === 87){
        playerRotate(1);
    }
});
update();