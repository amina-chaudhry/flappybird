// Variabler

let gameStarted = false;
let gameOver = false;

//hopp
let velocityX = -2;
let velocityY = 0;
let gravity = 0.2;
let jumpVelocity = -4 ;

//highscore
let score = 0;
let highscore = 0;
let playerName = "";

//rør
const pipeWidth = 64;
const pipeHeight = 512;
const pipeGap = 150;
const pipeX = 370;
let pipeArray = [];

// DOM - element
//highscore api
const GameID = "flappybird1";
const URL = "https://rasmusweb.no/hs.php";

// Lyd
const gameOverSound = new Audio("audio/gameOver.mp3");
const scoreSound = new Audio("audio/poeng.mp3");
const celebrationSound = new Audio("audio/celebration.mp3");

// Spillbrett
const board = document.getElementById("board");
board.width = 360;
board.height = 640;
const context = board.getContext("2d");

// Fugl
const bird = {
    x: board.width / 8,
    y: board.height / 2,
    width: 44,
    height: 34,
    img: new Image()
};
bird.img.src = "bilder/bird-wing-down.png";

// Rør
const topPipeImg = new Image();
topPipeImg.src = "bilder/top-pipe.png";
const bottomPipeImg = new Image();
bottomPipeImg.src = "bilder/bottom-pipe.png";

// Event Listeners
document.addEventListener("keydown", handleKeyDown);

document.getElementById("speedControl").addEventListener("input", updateSpeed);

window.onload = function () {
    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    getHighscore(); // Hent highscore ved innlasting av siden
};

function handleKeyDown(e) {
    if (!gameStarted && ["Space", "ArrowUp", "KeyX"].includes(e.code)) {
        startGame();
    } else if (gameStarted && ["Space", "ArrowUp", "KeyX"].includes(e.code)) {
        moveBird();
        toggleBirdImage();
    }
}

function startGame() {
    gameStarted = true;
    document.getElementById("instructions").style.display = "none";
}

function toggleBirdImage() {
    bird.img.src = "bilder/bird-wing-up.png";
    setTimeout(() => {
        bird.img.src = "bilder/bird-wing-down.png";
    }, 200);
}

function update() {
    requestAnimationFrame(update);
    if (!gameStarted || gameOver) return;

    context.clearRect(0, 0, board.width, board.height);

    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(bird.img, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    updatePipes();
    drawScore();

    if (gameOver) {
        playGameOverSound();
        context.font = "45px Anton";

        if (score > highscore) {
            context.fillStyle = "darkgreen"; // Grønn farge for ny highscore
        } else {
            context.fillStyle = "darkred"; // Rød farge for vanlig "GAME OVER"
        }

        // Deretter tegn teksten
        context.fillText("GAME OVER", board.width / 4, board.height / 2);
    
        updateHighscore(score); // Oppdater highscore når spillet er over
        getHighscore();
    }
}

function moveBird() {
    velocityY = jumpVelocity;
    if (gameOver) {
        resetGame();
    }
}

function updateSpeed() {
    let speed = parseFloat(this.value);
    velocityX = -2 * speed;
}

function placePipes() {
    if (!gameStarted || gameOver) return;

    let randomPipeY = Math.random() * (board.height - pipeGap - 300) + 150;
    pipeArray.push({ img: topPipeImg, x: pipeX, y: randomPipeY - pipeHeight, passed: false });
    pipeArray.push({ img: bottomPipeImg, x: pipeX, y: randomPipeY + pipeGap, passed: false });
}

function updatePipes() {
    for (let i = 0; i < pipeArray.length; i += 2) {
        let topPipe = pipeArray[i];
        let bottomPipe = pipeArray[i + 1];

        topPipe.x += velocityX;
        bottomPipe.x += velocityX;

        context.drawImage(topPipe.img, topPipe.x, topPipe.y, pipeWidth, pipeHeight);
        context.drawImage(bottomPipe.img, bottomPipe.x, bottomPipe.y, pipeWidth, pipeHeight);

        if (!topPipe.passed && bird.x > topPipe.x + pipeWidth) {
            score++;
            topPipe.passed = true;
            playScoreSound();
        }

        if (detectCollision(bird, topPipe) || detectCollision(bird, bottomPipe)) {
            gameOver = true;
        }
    }

    pipeArray = pipeArray.filter(pipe => pipe.x + pipeWidth > 0);
}

function detectCollision(bird, pipe) {
    return bird.x < pipe.x + pipeWidth &&
        bird.x + bird.width > pipe.x &&
        bird.y < pipe.y + pipeHeight &&
        bird.y + bird.height > pipe.y;
}

function drawScore() {
    context.font = "45px anton";
    context.fillStyle = "white";
    context.fillText(score, 12, 50); //plassering av score 
}

function playGameOverSound() {
    gameOverSound.play();
}

function playScoreSound() {
    scoreSound.play();
}

function resetGame() {
    bird.y = board.height / 2;
    pipeArray = [];
    score = 0
    velocityY = 0;
    gameOver = false;
}


// Highscore funksjoner
async function getHighscore() {
    const response = await fetch(`${URL}?id=${GameID}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    const highscoreData = await response.json();
    if (highscoreData) {
        highscore = Number(highscoreData.hs);
        playerName = highscoreData.player;
        displayHighscore();
    }
}

async function saveHighscore(currentScore) {
    let playerName = prompt("Gratulerer! Du har satt en highscore!\nSkriv inn navnet ditt:");

    // Setter navn som Anonym dersom spilleren ikke skriver inn navn
    playerName = playerName.trim() !== "" ? playerName : "Anonym";

    const data = {
        id: GameID,
        hs: currentScore,
        player: playerName,
    };

    const response = await fetch(URL, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log(responseData);
}

async function updateHighscore(currentScore) {
    // Hvis det ikke er noen highscore enda, eller hvis spillers poeng er bedre enn den dårligste highscoren
    if (!highscore || highscore < currentScore) {
        saveHighscore(currentScore);
        celebrationSound.play();
    }
}

function displayHighscore() {
    const highscoreElement = document.getElementById("highscore");
    const playerNameElement = document.getElementById("playerName");

    if (playerName && !isNaN(highscore)) {
        highscoreElement.textContent = `Highscore: ${highscore}`;
        playerNameElement.textContent = `Navn: ${playerName}`;
    } else {
        highscoreElement.textContent = "Highscore:";
        playerNameElement.textContent = "Navn:";
    }
}