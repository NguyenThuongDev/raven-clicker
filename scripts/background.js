import { ctx } from "./main.js";

// Number of frames in each theme
const themeMaxFrame = {
    themeA: 7,
    themeB: 6,
    themeC: 9,
    themeD: 7,
};

export class BackgroundLayer {
    constructor(theme, width, height) {
        this.maxFrame = themeMaxFrame[theme];
        const themeArr = [];
        for (let i = 1; i < this.maxFrame; i++) {
            const image = new Image();
            image.src = `/images/background/${theme.at(-1).toLowerCase() + i}.png`;
            const speed = i / 3; // Speed of theme frame, depends on frame index;
            themeArr.push([image, speed, 0, 0, width, height]);
        }
        this.themeArr = themeArr;
    }
    update() {
        for (let i = 0; i < this.maxFrame - 1; i++) {
            if (this.themeArr[i][2] <= -this.themeArr[i][4]) {
                this.themeArr[i][2] = 0;
            }
            this.themeArr[i][2] = this.themeArr[i][2] - this.themeArr[i][1];
        };
    }
    draw() {
        for (let i = 1; i < this.maxFrame - 1; i++) {
            ctx.drawImage(this.themeArr[i][0], this.themeArr[i][2], this.themeArr[i][3], this.themeArr[i][4], this.themeArr[i][5]);
            ctx.drawImage(this.themeArr[i][0], this.themeArr[i][2] + this.themeArr[i][4], this.themeArr[i][3], this.themeArr[i][4], this.themeArr[i][5]);
        };
    }
};

export class BackgroundMusic {
    constructor() {
        this.menuScreenSound = new Audio();
        this.playScreenSound = new Audio();
        this.menuScreenSound.src = 'sounds/nightmare-castle.ogg';
    }
    update(isPlay) {
        if (isPlay) this.menuScreenSound.play()
        else {
            this.menuScreenSound.pause();
            this.menuScreenSound.currentTime = 0;
        }
    }
};