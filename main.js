"use strict";

var canvas;
var ctx;

var paused = true;
var prevTimestamp;
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

var border = 0;

var backgroundImg;

var lozhkinImg;
var lozhkinShift;
var lozhkinSize = 110;

var spoonUrls = [
    "spoon1.png",
    "spoon2.png",
    "spoon3.png",
];
var spoonImages = [];
var spoons = [];
var spoonSize = 60;

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
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);

    window.addEventListener("resize", checkWindow);
    window.addEventListener("orientationchange", checkWindow);
    document.addEventListener("fullscreenchange", checkWindow);
    document.addEventListener("mozfullscreenchange", checkWindow);
    document.addEventListener("webkitfullscreenchange", checkWindow);
    document.addEventListener("msfullscreenchange", checkWindow);

    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("touchstart", touchstart);
    canvas.addEventListener("touchend", touchend);
    canvas.addEventListener("touchmove", touchmove);

    levelTag = document.getElementById("level");
    scoreTag = document.getElementById("score");

    timestamp = 0;
    prevTimestamp = Date.now();
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

    checkWindow();
}

function startGame() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().then(function() {
            screen.orientation.lock("landscape");
            checkWindow();
        })
    } else {
        checkWindow();
    }
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1 / 2;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawScene();
    ctx.globalAlpha = 1;
    ctx.font = "36px Pangolin";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText("ОЦЕНКА АСИМПТОТИЧЕСКИ НЕТОЧНА!", canvas.width / 2, canvas.height / 2);
}

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(lozhkinImg, lozhkinShift, canvas.height - lozhkinSize, lozhkinSize, lozhkinSize);

    ctx.font = "24px Pangolin";
    ctx.textAlign = "left";
    ctx.fillStyle = "black";
    ctx.fillText("Level: " + level, 8, 24);

    ctx.font = "24px Pangolin";
    ctx.textAlign = "right";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, canvas.width - 8, 24);

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
    if (!paused) {
        timestamp += Date.now() - prevTimestamp;
    }
    prevTimestamp = Date.now();

    if (!paused) {
        drawScene();
    }

    if (!paused && timestamp - redrawTimestamp > redrawRate) {
        redrawTimestamp = timestamp;

        if (timestamp - levelTimestamp > levelRate) {
            levelTimestamp = timestamp;
            ++level;
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
  return (evt.touches[0] || event.changedTouches[0]).clientX - rect.left;
}

function touchstart(evt) {
    if (getTouchPos(evt) < $(window).width() / 2) {
        left = true;
    } else {
        right = true;
    }
    evt.preventDefault();
}

function touchend(evt) {
    if (getTouchPos(evt) < $(window).width() / 2) {
        left = false;
    } else {
        right = false;
    }
    evt.preventDefault();
}

function touchmove(evt) {
    if (getTouchPos(evt) < $(window).width() / 2) {
        left = true;
        right = false;
    } else {
        left = false;
        right = true;
    }
    evt.preventDefault();
}

function checkWindow() {
    if ((window.orientation == 90 || window.orientation == -90) && document.fullscreenElement != null || document.documentElement.requestFullscreen == null) {
        paused = false;
        $("#overlay").hide();
        $("#game").show();
        if ($(window).width() / $(window).height() > 960.0 / 540.0) {
            $("#myCanvas").height($(window).height());
            $("#myCanvas").width($(window).height() * 960.0 / 540.0);
        } else {
            $("#myCanvas").width($(window).width());
            $("#myCanvas").height($(window).width() * 540.0 / 960.0);
        }
    } else {
        paused = true;
        $("#game").hide();
        $("#overlay").show();
    }
}

$(main);
