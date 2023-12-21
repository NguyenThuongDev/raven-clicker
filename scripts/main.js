/** @type {HTMLCanvasElement} */

import { BackgroundLayer, BackgroundMusic } from "./background.js";
import { IntervalTimer } from "./intervalTime.js";
import { Explosion } from "./explosion.js";
import { Raven } from "./raven.js";
import './fireworks.js';

const canvas = document.getElementById('main-canvas');
const collisionCanvas = document.getElementById('collision-canvas');
const CANVAS_WIDTH = canvas.width = collisionCanvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = collisionCanvas.height = window.innerHeight;
export const ctx = canvas.getContext('2d');
export const cctx = collisionCanvas.getContext('2d');
const background = new BackgroundLayer('themeD', CANVAS_WIDTH, CANVAS_HEIGHT);
const backgroundSound = new BackgroundMusic();

let isGamePause = false;
let isGameOver = false;
let gameMode = undefined; // undefined | 'play-game' | 'time-challenge'
let lastTime = 0;
let timeToNextRaven = 0;
let ravenInterval = 2000;
let score = 0;
let enemyClicked = 0;
let ravens = [];
let explosions = [];
let isGameOverOneTime = true; // use for handle game over 1 times
let isStartCounter = true;
let time = 60;

const interval = new IntervalTimer(() => {
    let minutes = Math.floor(time % (1000 * 60 * 60) / 60);
    let seconds = Math.floor(time % 60);
    timeLeftNode.innerText = `Time left: ${minutes}m ${seconds}s`;
    time--;
}, 1000);

/********************** DOM **********************/

const playGameBtn = document.getElementById('play-game');
const timeChallengeBtn = document.getElementById('time-challenge');
const menuMain = document.getElementById('menu-main');
const menuPause = document.getElementById('menu-pause');
const menuOver = document.getElementById('menu-over');
const resumeBtn = document.getElementById('resume-game');
const menuBg = document.getElementById('menu-background');
const menuList = document.getElementById('menu-list');
const hudNode = document.getElementById('hud');
const pauseBtn = document.getElementById('pause-btn');
const pauseBtnList = document.getElementsByClassName('pause-btn-list');
const menuBtnList = document.getElementsByClassName('menu-btn');
const scoreNumber = document.getElementById('score-over');
const highScoreNumber = document.getElementById('high-score-over');
const finalScore = document.getElementsByClassName('final-score')[0];
const playBtnList = document.getElementsByClassName('play');
const timeLeftNode = document.getElementById('time-left');
// const fireworksNode = document.getElementById('fireworks');

/******************** FUNCTION ********************/

function displayRound(isCreate, number) {
    if (isCreate) {
        const roundNode = document.createElement('div');
        roundNode.classList.add('round');
        roundNode.innerText = `Round ${number}`;
        menuList.appendChild(roundNode);
    } else {
        const roundNode = document.getElementsByClassName('round')[0];
        roundNode.remove();
    };
};

function drawScore() {
    const scoreNode = document.getElementById('score-lbl');
    const timeLeftNode = document.getElementById('time-left');
    const ravenCountNode = document.getElementById('raven-count-lbl');
    scoreNode.innerText = `Scores: ${score}`;
    if (gameMode === 'play-game') {
        ravenCountNode.innerText = `Enemies: ${enemyClicked}`;
        timeLeftNode.innerText = '';
    };
    if (gameMode === 'time-challenge') {
        if (isStartCounter) {
            isStartCounter = false;
            // interval.start();
        }
        ravenCountNode.innerText = '';
    };
};

export function setGameOver(isOver) {
    isGameOver = isOver;
};

function addNewScoreDiv() {
    const newScoreNode = document.createElement('div');
    newScoreNode.id = 'new-score';
    finalScore.appendChild(newScoreNode);
};

function handleGameOver() {
    if (gameMode === 'play-game') {
        let highScore = window.localStorage.getItem('normal-high-score') || 0;
        if (score > highScore) {
            highScore = score;
            window.localStorage.setItem('normal-high-score', highScore);
            addNewScoreDiv();
            const fireworksNode = document.createElement('div');
            fireworksNode.id = 'fireworks';
            document.body.appendChild(fireworksNode);
            const fireworks = new Fireworks.default(fireworksNode);
            fireworks.start();
        };
        isGamePause = true;
        hudNode.style.display = 'none';
        [menuOver, menuBg].forEach(e => {
            e.classList.add('fade-in');
            e.style.display = 'flex';
        });
        scoreNumber.innerText = `You Scores: ${score}`;
        highScoreNumber.innerText = `High Scores: ${highScore}`;
        isGameOverOneTime = false;
    } else if (gameMode === 'time-challenge') {
        let highScore = window.localStorage.getItem('time-challenge-high-score') || 0;
        if (score > highScore) {
            highScore = score;
            window.localStorage.setItem('time-challenge-high-score', highScore);
            addNewScoreDiv();
            const fireworksNode = document.createElement('div');
            fireworksNode.id = 'fireworks';
            document.body.appendChild(fireworksNode);
            const fireworks = new Fireworks.default(fireworksNode);
            fireworks.start();
        };
        isGamePause = true;
        // interval.clear();
        // time = 60;
        hudNode.style.display = 'none';
        [menuOver, menuBg].forEach(e => {
            e.classList.add('fade-in');
            e.style.display = 'flex';
        });
        scoreNumber.innerText = `You Scores: ${score}`;
        highScoreNumber.innerText = `High Scores: ${highScore}`;
        isGameOverOneTime = false;
    }
};

/******************** CONTROL ********************/

Array.prototype.forEach.call(playBtnList, playBtn => {
    playBtn.addEventListener('click', e => {
        const newScoreNode = document.getElementById('new-score'); // null
        if (newScoreNode) {
            newScoreNode.remove();
        }
        const fireworksNode = document.getElementById('fireworks');
        if (fireworksNode) fireworksNode.remove();
        if (isGameOver) {
            menuBg.classList.remove('fade-in');
            menuBg.classList.add('to-right');
            menuOver.style.display = 'none';
            menuMain.style.display = 'flex';
            isGamePause = false;
            isGameOver = false;
            ravens = [];
            explosions = [];
            score = 0;
            enemyClicked = 0;
            ravenInterval = 2000;
            isGameOverOneTime = true;
        };
        if (
            gameMode === 'play-game' || e.target.innerText === 'PLAY NORMAL'
        ) {
            menuBg.classList.remove('to-right');
            [menuBg, menuMain].forEach(e => e.classList.add('fade-out'));
            displayRound(true, 1);
            isGamePause = true;
            setTimeout(() => {
                displayRound(false);
                [menuBg, menuMain].forEach(e => {
                    e.classList.remove('fade-out');
                    e.style.display = 'none';
                });
                gameMode = 'play-game';
                isGamePause = false;
                hudNode.style.display = 'block';
            }, 3000);
        } else if (
            gameMode === 'time-challenge' || e.target.innerText === 'TIME CHALLENGE'
        ) {
            menuBg.classList.remove('to-right');
            [menuBg, menuMain].forEach(e => e.classList.add('fade-out'));
            isGamePause = true;
            timeLeftNode.innerText = '';
            interval.clear();
            time = 60;
            setTimeout(() => {
                [menuBg, menuMain].forEach(e => {
                    e.classList.remove('fade-out');
                    e.style.display = 'none';
                });
                gameMode = 'time-challenge';
                isGamePause = false;
                interval.start();
                hudNode.style.display = 'block';
            }, 3000);
        }
    });
});

Array.prototype.forEach.call(pauseBtnList, pauseBtn => {
    pauseBtn.addEventListener('click', () => {
        if (isGamePause) {
            menuPause.style.display = 'none';
            menuBg.style.display = 'none';
            interval.resume();
        } else {
            menuPause.style.display = 'flex';
            menuBg.style.display = 'flex';
            interval.pause();
        }
        isGamePause = !isGamePause;
    });
});

collisionCanvas.addEventListener('click', e => {
    if (gameMode) {
        const detectPixelColor = cctx.getImageData(e.x, e.y, 1, 1);
        const pc = detectPixelColor.data;
        ravens.forEach(object => {
            if (
                object.randomColors[0] === pc[0] &&
                object.randomColors[1] === pc[1] &&
                object.randomColors[2] === pc[2]
            ) {
                object.markedForDeletion = true;
                score += 10;
                enemyClicked++;
                explosions.push(new Explosion(object.x, object.y, object.width));
            }
        });
    }
});

Array.prototype.forEach.call(menuBtnList, menuBtn => {
    menuBtn.addEventListener('click', () => {
        const fireworksNode = document.getElementById('fireworks');
        if (fireworksNode) {
            fireworksNode.remove();
        }
        if (isGameOver) {
            menuBg.classList.remove('fade-in');
            menuBg.classList.add('to-right');
            menuOver.style.display = 'none';
            menuMain.style.display = 'flex';
            gameMode = undefined;
            isGamePause = false;
            isGameOver = false;
            ravens = [];
            explosions = [];
            score = 0;
            enemyClicked = 0;
            ravenInterval = 2000;
            isGameOverOneTime = true;
        } else {
            menuBg.classList.add('to-right');
            menuPause.style.display = 'none';
            menuMain.style.display = 'flex';
            hudNode.style.display = 'none';
            gameMode = undefined;
            isGamePause = false;
            ravens = [];
            explosions = [];
            score = 0;
            enemyClicked = 0;
            ravenInterval = 2000;
        }
    });
});

/******************* GAMEPLAY *******************/

(function animate(timeStamp) {
    if (!isGamePause) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cctx.clearRect(0, 0, canvas.width, canvas.height);
        background.update();
        background.draw();
        if (gameMode) {
            backgroundSound.update(true);
            let deltaTime = timeStamp - lastTime;
            lastTime = timeStamp;
            timeToNextRaven += deltaTime;
            if (timeToNextRaven > ravenInterval) {
                ravens.push(new Raven(CANVAS_WIDTH, CANVAS_HEIGHT));
                if (gameMode === 'play-game') {
                    if (ravenInterval > 800)
                        ravenInterval -= Math.floor(Math.random() * 120);
                    if (ravenInterval < 801 && ravenInterval > 300)
                        ravenInterval -= Math.floor(Math.random() * 20);
                };
                timeToNextRaven = 0;
                ravens.sort(function (a, b) {
                    return a.width - b.width;
                });
            };
            drawScore();
            [...ravens, ...explosions].forEach(object => object.update(deltaTime, gameMode));
            [...ravens, ...explosions].forEach(object => object.draw());
            ravens = ravens.filter(object => !object.markedForDeletion);
            explosions = explosions.filter(object => !object.markedForDeletion);
        } else {
            backgroundSound.update(false);
        }
        if (gameMode === 'time-challenge' && time === -1) {
            isGameOver = true;
        }
    }
    if (isGameOver && isGameOverOneTime) handleGameOver();
    requestAnimationFrame(animate);
})();