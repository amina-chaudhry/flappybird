
//bakgrunnsmusikk
let isMusicPlaying = false;

const backgroundMusic = new Audio("audio/backgroundMusic.mp3");
backgroundMusic.loop = true;

function toggleMusic(event) {
    if (event.detail == 0) {
        return
    } 

isMusicPlaying = !isMusicPlaying;
if (isMusicPlaying) {
    backgroundMusic.play();
    document.getElementById("musicIcon").classList.replace("fa-volume-xmark", "fa-volume-high");
} else {
    backgroundMusic.pause();
    document.getElementById("musicIcon").classList.replace("fa-volume-high", "fa-volume-xmark");
}
}

document.getElementById("musicToggle").addEventListener("click", toggleMusic)