//variabler 
let gameStarted = false;

// Funksjon for å starte spillet
function startGame() {
    gameStarted = true;
    document.getElementById("instructions").style.display = "none"; //fjerner instruksjonsboks 
}

//lyd
let gameOverSound = new Audio("audio/gameover.mp3");
let scoreSound = new Audio("audio/poeng.mp3");

// SpillBrett
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Rør
let pipeArray = [];
let pipeWidth = 64; // bredde/høyde-forhold = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeGap = 200; // Avstand mellom øvre og nedre rør

// Endre poengtellingen til hele poeng
let score = 0;

// Spill av poeng-lyden hver gang spilleren scorer
function playScoreSound() {
    scoreSound.play();
    score++; // øk poeng med 1 for hvert passert rørpar
}

function placePipes() {
    if (!gameStarted || gameOver) {
        return;
    }

    let randomPipeY = Math.random() * (boardHeight - pipeGap); // Tilfeldig plassering for øvre rør

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY - pipeHeight, // Juster for høyden på det øvre røret
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeGap, // Juster for gapet
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

// Fugl
let birdWidth = 44; // bredde/høyde-forhold = 408/228 = 17/12
let birdHeight = 34;
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
    if (!gameStarted && (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX")) {
        startGame();
    } else if (gameStarted && (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX")) {
        // Bytt bilde av fuglens vinger
        birdImg.src = "bilder/bird-wing-up.png";
        // Sett en timeout for å gå tilbake  ned
        setTimeout(function() {
            birdImg.src = "bilder/bird-wing-down.png";
        }, 200); // tidsperiode i millisekunder
    }
});

// Rør variabler
let topPipeImg;
let bottomPipeImg;

// Fysikk
let velocityX = -2; // hastighet for rør som beveger seg til venstre
let velocityY = 0; // hastighet for fuglens hopp
let gravity = 0.4;
let jumpVelocity = -6; // Hoppets hastighet

let gameOver = false;

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
    if (!gameStarted || gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Fugl
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // Påfør tyngdekraft på gjeldende bird.y, begrens bird.y til toppen av brettet
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // Rør
    for (let i = 0; i < pipeArray.length; i += 2) { // Øvre og nedre rør
        let topPipe = pipeArray[i];
        let bottomPipe = pipeArray[i + 1];

        topPipe.x += velocityX;
        bottomPipe.x += velocityX;

        context.drawImage(topPipe.img, topPipe.x, topPipe.y, topPipe.width, topPipe.height);
        context.drawImage(bottomPipe.img, bottomPipe.x, bottomPipe.y, bottomPipe.width, bottomPipe.height);

        if (!topPipe.passed && bird.x > topPipe.x + topPipe.width) {
            score += 1; // endre poengtelling til hele poeng
            topPipe.passed = true;
            playScoreSound();
        }

        if (detectCollision(bird, topPipe) || detectCollision(bird, bottomPipe)) {
            gameOver = true;
        }
    }

    // Fjerner rør når de er passert
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.splice(0, 2); // Fjerner både øvre og nedre rør
    }

    // Poeng
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        playGameOverSound(); // Spill av gameover-lyden
        context.fillText("GAME OVER", boardWidth / 8, boardHeight / 2);
    }
}

function moveBird(e) {
    if (gameStarted && (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX")) {
        // Hopp
        velocityY = jumpVelocity;

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

// FØRSØK PÅ Highscore  ----------------------------------------
const URL = "https://rasmusweb.no/hs.php";
const GameID = "flappybird568"; 
let highscore = 0;
let playerName = "";

// Funksjon for å lagre highscore på serveren
async function saveHighscore(score) {
    let playerNameInput = prompt("Gratulerer! Du har satt en highscore!\nSkriv inn navnet ditt:");

    playerName = playerNameInput.trim() !== "" ? playerNameInput : "Anonym";

    const data = {
        id: GameID,
        hs: score,
        player: playerName,
    };

    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Det oppsto en feil ved lagring av highscore.");
        }

        const responseData = await response.json();
        console.log(responseData);
    } catch (error) {
        console.error("Feil ved lagring av highscore:", error.message);
    }
}

// Funksjon for å oppdatere highscore når spillet er vunnet
async function updateHighscore(score) {
    if (!highscore || score > highscore) {
        await saveHighscore(score);
        highscore = score; // Oppdaterer den lokale highscore-variabelen
        console.log("Highscore oppdatert til:", highscore);
        displayHighscore(); // Kaller funksjonen for å vise highscore etter oppdatering
    }
    // Nytt kall for å vise highscore umiddelbart ved oppdatering
    displayHighscore();
}

// Funksjon for å vise highscore på nettsiden
function displayHighscore() {
    const highscoreElement = document.getElementById("highscore");
    if (highscoreElement) {
        highscoreElement.textContent = `Highscore: ${highscore}`;
    }
    console.log("displayHighscore() ble kalt");
}