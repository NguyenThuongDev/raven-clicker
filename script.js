/** @type {HTMLCanvasElement} */

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCanvasCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let score = 0;
ctx.font = '50px Impact';

let timeToNextRaven = 0;
let ravenInterval = 2000;
let lastTime = 0;
let ravens = [];
let explosions = [];
let particles = [];
let isGamePause = false;
let isGameOver = false;

/*****************************************************/

const playNormalBtn = document.getElementById('playNormal');
const playCasualBtn = document.getElementById('playCasual');
const resumeBtn = document.getElementById('resumeBtn');
const menuBtn = document.getElementById('menuBtn');
const menuMain = document.getElementById('menuMain');
const menuPause = document.getElementById('menuPause');
const hudNode = document.getElementsByClassName('hud')[0];
let gameMode = 'menuBg';

playNormalBtn.addEventListener('click', () => {
    const countdownNode = document.createElement('div');
    countdownNode.classList.add('countdown');
    const menus = document.getElementsByClassName('menus')[0];
    menus.appendChild(countdownNode);
    menuMain.style.display = 'none';
    collisionCanvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];
    ravens = [];
    explosions = [];
    isGamePause = true;
    setTimeout(function () {
        countdownNode.remove();
        gameMode = 'normal';
        isGamePause = false;
        hudNode.style.display = 'block';
    }, 3000);
});

playCasualBtn.addEventListener('click', () => {
    const countdownNode = document.createElement('div');
    countdownNode.classList.add('countdown');
    const menus = document.getElementsByClassName('menus')[0];
    menus.appendChild(countdownNode);
    menuMain.style.display = 'none';
    collisionCanvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];
    ravens = [];
    explosions = [];
    isGamePause = true;
    setTimeout(function () {
        countdownNode.remove();
        gameMode = 'casual';
        isGamePause = false;
        hudNode.style.display = 'block';
    }, 3000);
});

hudNode.addEventListener('click', () => {
    if (isGamePause) {
        isGamePause = false;
        menuPause.style.display = 'none';
    } else {
        isGamePause = true;
        menuPause.style.display = 'flex';
    }
});

resumeBtn.addEventListener('click', () => {
    isGamePause = false;
    menuPause.style.display = 'none';
});

menuBtn.addEventListener('click', () => {
    menuMain.style.display = 'flex';
    menuPause.style.display = 'none';
    hudNode.style.display = 'none';
    collisionCanvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];
    ravens = [];
    explosions = [];
    gameMode = 'menuBg';
    isGamePause = false;

});

animate(0, gameMode);

/*****************************************************/





class Raven {
    constructor(gameMode) {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'assets/raven.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;
        this.gameMode = gameMode;
        this.alpha = (gameMode === 'menuBg') ? 0.5 : 1;
    }
    update(deltaTime) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceFlap += deltaTime;
        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;
            if (this.hasTrail) {
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x, this.y, this.width, this.color, this.alpha));
                }
            }
        }
        if (this.x < 0 - this.width && gameMode === 'normal') {
            isGameOver = true;
        };
    }
    draw() {
        ctx.globalAlpha = this.alpha;
        collisionCanvasCtx.fillStyle = this.color;
        collisionCanvasCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

class Explosion {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = 'assets/boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = 'assets/boom.wav';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
    }
    update(deltaTime) {
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) this.markedForDeletion = true;
        }
    }
    draw() {
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size / 4, this.size, this.size);
    }
}

class Particle {
    constructor(x, y, size, color) {
        this.size = size;
        this.x = x + this.size / 2 + Math.random() * 50 - 25;
        this.y = y + this.size / 3 + Math.random() * 50 - 25;
        this.radius = Math.random() * this.size / 10;
        this.maxRadius = Math.random() * 20 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
        this.color = color;
    }
    update() {
        this.x += this.speedX;
        this.radius += 0.3;
        if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = 1 - this.radius / this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// function drawScore() {
//     ctx.fillStyle = 'black';
//     ctx.fillText('Score: ' + score, 50, 75);
//     ctx.fillStyle = 'white';
//     ctx.fillText('Score: ' + score, 55, 80);
// }

// function drawGameOver() {
//     ctx.textAlign = 'center';
//     ctx.fillStyle = 'black';
//     ctx.fillText('GAME OVER, your score is ' + score, canvas.width / 2, canvas.height / 2);
//     ctx.fillStyle = 'white';
//     ctx.fillText('GAME OVER, your score is ' + score, canvas.width / 2, canvas.height / 2 + 5);
// }

window.addEventListener('click', function (e) {
    if (gameMode !== 'menuBg') {
        const detectPixelColor = collisionCanvasCtx.getImageData(e.x, e.y, 1, 1);
        const pc = detectPixelColor.data;
        ravens.forEach(object => {
            if (
                object.randomColors[0] === pc[0] &&
                object.randomColors[1] === pc[1] &&
                object.randomColors[2] === pc[2]
            ) {
                object.markedForDeletion = true;
                score++;
                explosions.push(new Explosion(object.x, object.y, object.width));
            }
        });
    }
})

function animate(timeStamp) {
    if (!isGamePause && !isGameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        collisionCanvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        let deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        timeToNextRaven += deltaTime;
        if (timeToNextRaven > ravenInterval) {
            ravens.push(new Raven(gameMode));
            timeToNextRaven = 0;
            ravens.sort(function (a, b) {
                return a.width - b.width;
            })
        };
        // drawScore();
        [...particles, ...ravens, ...explosions].forEach(object => object.update(deltaTime));
        [...particles, ...ravens, ...explosions].forEach(object => object.draw());
        ravens = ravens.filter(object => !object.markedForDeletion);
        explosions = explosions.filter(object => !object.markedForDeletion);
        particles = particles.filter(object => !object.markedForDeletion);
    }
    requestAnimationFrame(animate)
    // if (!gameOver) requestAnimationFrame(animate);
    // else drawGameOver();
}