"use strict";

var canvas;
var ctx;

var timestamp;
var redrawTimestamp;
var spoonTimestamp;
var levelTimestamp;

var scoreTag;
var score = 0;
var spoonScore = 10;

var levelTag;
var level = 1;

var redrawRate = 10;
var spoonRate = 2000;
var spoonRateStep = 100;
var lozhkinVelocity = 15;
var spoonVelocity = 3;
var captionVelocity = 3;
var levelRate = 10000;

var left = false;
var right = false;

var border = 120;

var backgroundImg;

var lozhkinImg;
var lozhkinShift;
var lozhkinSize = 120;

var spoonUrls = [
    "spoon1.png",
    "spoon2.png",
    "spoon3.png",
];
var spoonImages = [];
var spoons = [];
var spoonSize = 64;

var phrases = [
    "Алло, это Ложкин!",
    "Так сказать...",
    "Квазиизоморфизм",
    "ДНФ сумма тупиковых",
    "Построим стандартное ДУМ!",
    "Применим метод каскадов"
];
var captions = [];

class Spoon {
    constructor() {
        this.img = spoonImages[randint(0, spoonImages.length - 1)];
        this.x = randint(border, canvas.width - spoonSize - border);
        this.y = -spoonSize;
    }
}

class Caption {
    constructor(x, y) {
        this.txt = phrases[randint(0, phrases.length - 1)];
        this.x = x;
        this.y = y;
    }
}

function randint(x, y) {
    return Math.floor((Math.random() * (y - x + 1)) + x);
}

function main() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("touchstart", touchstart);
    canvas.addEventListener("touchend", touchend);

    levelTag = document.getElementById("level");
    scoreTag = document.getElementById("score");

    timestamp = Date.now();
    redrawTimestamp = timestamp;
    spoonTimestamp = timestamp;
    levelTimestamp = timestamp;

    lozhkinShift = (canvas.width - lozhkinSize) / 2;

    backgroundImg = new Image();
    backgroundImg.src = "background.png";

    lozhkinImg = new Image();
    lozhkinImg.src = "lozhkin.png";

    for (var i in spoonUrls) {
        spoonImages.push(new Image());
        spoonImages[spoonImages.length - 1].src = spoonUrls[i];
    }

    spoons.push(new Spoon());

    window.requestAnimationFrame(draw);
}

function intersect(spoon) {
    return (
        spoon.x < lozhkinShift + lozhkinSize &&
        spoon.x + spoonSize > lozhkinShift &&
        spoon.y < canvas.height &&
        spoon.y + spoonSize > canvas.height - lozhkinSize
    );
}

function drop(spoon) {
    return spoon.y + spoonSize > canvas.height;
}

function gameOver() {
    ctx.globalAlpha = 1 / 2;
    drawScene();
    ctx.globalAlpha = 1;
    ctx.font = "36px Pangolin";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText("ОЦЕНКА АСИМПТОТИЧЕСКИ НЕТОЧНА!", canvas.width / 2, canvas.height / 2);
}

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, border, 0, canvas.width - 2 * border, canvas.height);

    ctx.drawImage(lozhkinImg, lozhkinShift, canvas.height - lozhkinSize, lozhkinSize, lozhkinSize);

    for (var i in spoons) {
        ctx.drawImage(spoons[i].img, spoons[i].x, spoons[i].y, spoonSize, spoonSize);
    }

    for (var i in captions) {
        ctx.font = "24px Pangolin";
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.fillText(captions[i].txt, captions[i].x, captions[i].y);
    }
}

function draw() {
    drawScene();

    timestamp = Date.now();
    if (timestamp - redrawTimestamp > redrawRate) {
        redrawTimestamp = timestamp;

        if (timestamp - levelTimestamp > levelRate) {
            levelTimestamp = timestamp;
            ++level;
            levelTag.innerHTML = "Level " + level;
            spoonScore += 10;
            spoonRate /= 1.2;
        }

        if (timestamp - spoonTimestamp > spoonRate) {
            spoonTimestamp = timestamp;
            spoons.push(new Spoon());
        }

        for (var i in captions) {
            captions[i].y -= captionVelocity;
        }

        for (var i in spoons) {
            spoons[i].y += spoonVelocity;
            if (intersect(spoons[i])) {
                captions.push(new Caption(spoons[i].x, spoons[i].y));
                delete spoons[i];
                score += spoonScore;
                scoreTag.innerHTML = "Score: " + score;
            } else if (drop(spoons[i])) {
                return gameOver();
            }
        }
        spoons.filter(Boolean);
        if (left == true && right == false && lozhkinShift >= border + lozhkinVelocity) lozhkinShift -= lozhkinVelocity;
        if (left == false && right == true && lozhkinShift <= canvas.width - lozhkinSize - border - lozhkinVelocity) lozhkinShift += lozhkinVelocity;
    }

    window.requestAnimationFrame(draw);
}

function keydown(evt) {
    switch (evt.keyCode) {
        case 37:
            left = true;
            break;
        case 39:
            right = true;
            break;
    }
}

function keyup(evt) {
    switch (evt.keyCode) {
        case 37:
            left = false;
            break;
        case 39:
            right = false;
            break;
    }
}

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return evt.clientX - rect.left;
}

function mousedown(evt) {
    if (getMousePos(evt) < canvas.width / 2) {
        left = true;
    } else {
        right = true;
    }
}

function mouseup(evt) {
    if (getMousePos(evt) < canvas.width / 2) {
        left = false;
    } else {
        right = false;
    }
}

function getTouchPos(evt) {
  var rect = canvas.getBoundingClientRect();
  return evt.touches[0].clientX - rect.left;
}

function touchstart(evt) {
    if (getTouchPos(evt) < canvas.width / 2) {
        left = true;
    } else {
        right = true;
    }
}

function touchend(evt) {
    if (getTouchPos(evt) < canvas.width / 2) {
        left = false;
    } else {
        right = false;
    }
}

document.addEventListener("keydown", keydown);
document.addEventListener("keyup", keyup);
document.addEventListener("DOMContentLoaded", main);