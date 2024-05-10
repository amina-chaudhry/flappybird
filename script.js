//variabler 

//lyd
let gameOverSound = new Audio("audio/gameover.mp3");
let scoreSound = new Audio("audio/poeng.mp3");

// SpillBrett
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Fugl
let birdWidth = 54; // bredde/høyde-forhold = 408/228 = 17/12
let birdHeight = 44;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

let birdWingUpImg = new Image();
birdWingUpImg.src = "bilder/bird-wing-up.png";

let birdWingDownImg = new Image();
birdWingDownImg.src = "bilder/bird-wing-down.png";

// Legg til event-lytter for å bytte bilde av fuglens vinger når brukeren trykker på tastene Space, ArrowUp eller KeyX
document.addEventListener("keydown", function(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        // Bytt bilde av fuglens vinger
        birdImg.src = "bilder/bird-wing-up.png";
        // Sett en timeout for å gå tilbake  ned
        setTimeout(function() {
            birdImg.src = "bilder/bird-wing-down.png";
        }, 200); // tidsperiode i millisekunder
    }
});

// Rør
let pipeArray = [];
let pipeWidth = 64; // bredde/høyde-forhold = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Fysikk
let velocityX = -2; // hastighet for rør som beveger seg til venstre
let velocityY = 0; // hastighet for fuglens hopp
let gravity = 0.4;

let gameOver = false;
let score = 0;

// Spill av gameover-lyden når spillet er over
function playGameOverSound() {
    gameOverSound.play();
}

// Spill av poeng-lyden hver gang spilleren scorer
function playScoreSound() {
    scoreSound.play();
}

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // brukes for å tegne på brettet

    // Legg til event-lytter for å lytte etter endringer i hastighetskontrollen
    let speedControl = document.getElementById("speedControl");
    speedControl.addEventListener("input", function () {
        let speed = parseFloat(speedControl.value);
        velocityX = -2 * speed; // Endre hastigheten basert på kontrollens verdi

    });

    // Teger flappy bird
    // Laster inn bilder
    birdImg = new Image();
    birdImg.src = "bilder/bird-wing-down.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "bilder/top-pipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "bilder/bottom-pipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // hver 1.5 sekund
    document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Fugl
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); // Påfør tyngdekraft på gjeldende bird.y, begrens bird.y til toppen av brettet
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // Rør
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // 0.5 fordi det er 2 rør! så 0.5*2 = 1, 1 for hvert sett med rør
            pipe.passed = true;
             playScoreSound();
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Fjerner rør når de er passert
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // Fjerner første element fra arrayen
    }

    // Poeng
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        playGameOverSound(); // Spill av gameover-lyden
        context.fillText("GAME OVER", boardWidth/8, boardHeight/2);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    // (0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
    
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        // Hopp
        velocityY = -6;

        // Nullstill spillet
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

// skjekker overlapping
function detectCollision(a, b) { 
    return a.x < b.x + b.width &&   // sjekker om a sitt øvre venstre hjørne er til venstre for b sitt øvre høyre hjørne. 
        a.x + a.width > b.x &&   // sjekker om a sitt øvre høyre hjørne er til høyre for b sitt øvre venstre hjørne
        a.y < b.y + b.height &&  // sjekker om a sitt øvre venstre hjørne er over b sitt nedre venstre hjørne.
        a.y + a.height > b.y;    // sjekker om a sitt nedre venstre hjørne er under b sitt øvre venstre hjørne.
} 