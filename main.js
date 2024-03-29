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
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    canvas.removeEventListener("mousedown", mouseRestart);
    canvas.removeEventListener("touchstart", touchRestart);

    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);

    window.addEventListener("resize", checkWindow);
    window.addEventListener("orientationchange", checkWindow);
    document.addEventListener("fullscreenchange", checkWindow);
    document.addEventListener("mozfullscreenchange", checkWindow);
    document.addEventListener("webkitfullscreenchange", checkWindow);
    document.addEventListener("msfullscreenchange", checkWindow);

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

    score = 0;
    spoonScore = 10;
    level = 1;
    spoonRate = 2000;
    left = false;
    right = false;
    spoons = [];
    captions = [];

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
    ctx.fillText("ОЦЕНКА АСИМПТОТИЧЕСКИ НЕТОЧНА!", canvas.width / 2, canvas.height / 2 - 24);

    setTimeout(suggestRestart, 500);
}

function suggestRestart() {
    ctx.font = "24px Pangolin";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText("Click to restart", canvas.width / 2, canvas.height / 2 + 24);

    ctx.strokeStyle = "black";
    ctx.strokeRect(canvas.width / 2 - 80, canvas.height / 2, 160, 32);

    canvas.addEventListener("mousedown", mouseRestart);
    canvas.addEventListener("touchstart", touchRestart);
}

function mouseRestart(evt) {
    if (
        getMousePos(evt).x > canvas.width / 2 - 80 &&
        getMousePos(evt).x < canvas.width / 2 + 80 &&
        getMousePos(evt).y > canvas.height / 2 &&
        getMousePos(evt).y < canvas.height / 2 + 32
    ) {
        main();
    }
}

function touchRestart(evt) {
    evt.preventDefault();
    if (
        getTouchPos(evt).x > canvas.width / 2 - 80 &&
        getTouchPos(evt).x < canvas.width / 2 + 80 &&
        getTouchPos(evt).y > canvas.height / 2 &&
        getTouchPos(evt).y < canvas.height / 2 + 32
    ) {
        main();
    }
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
    return {
        x: (evt.clientX - rect.left) / rect.width * canvas.width,
        y: (evt.clientY - rect.top) / rect.height * canvas.height,
    };
}

function mousedown(evt) {
    if (getMousePos(evt).x < canvas.width / 2) {
        left = true;
    } else {
        right = true;
    }
}

function mouseup(evt) {
    if (getMousePos(evt).x < canvas.width / 2) {
        left = false;
    } else {
        right = false;
    }
}

function getTouchPos(evt) {
    var touch = evt.touches[0] || evt.changedTouches[0];
    var rect = canvas.getBoundingClientRect();
    return {
        x: (touch.clientX - rect.left) / rect.width * canvas.width,
        y: (touch.clientY - rect.top) / rect.height * canvas.height,
    };
}

function touchstart(evt) {
    if (getTouchPos(evt).x < canvas.width / 2) {
        left = true;
    } else {
        right = true;
    }
    evt.preventDefault();
}

function touchend(evt) {
    if (getTouchPos(evt).x < canvas.width / 2) {
        left = false;
    } else {
        right = false;
    }
    evt.preventDefault();
}

function touchmove(evt) {
    if (getTouchPos(evt).x < canvas.width / 2) {
        left = true;
        right = false;
    } else {
        left = false;
        right = true;
    }
    evt.preventDefault();
}

window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function checkWindow() {
    if (!window.mobilecheck() || (window.orientation == 90 || window.orientation == -90) && document.fullscreenElement != null || document.documentElement.requestFullscreen == null) {
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
