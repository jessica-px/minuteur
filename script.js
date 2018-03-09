var mode = "focus"; // modes: wait, focus, rest
var play = false;
var percent = 0;
var time = "25:00";
var focusTime = 25;
var restTime = 5;
var currentTime;
var timer;
var showCustom = false;
var enableCustom = true;
var focusFinAudio = new Audio('audio/SynthChime11.mp3');
var restFinAudio = new Audio('audio/SynthChime1.mp3');

document.addEventListener("DOMContentLoaded", function(event) {
    init();
});

function init() {
    console.log("INIT");
    b = buttons;
    ui = uiElements;
    bindUIActions();
    setMode("wait");
}

buttons = {
    restart: document.getElementById("restart"),
    pausePlay: document.getElementById("pause"),
    stop: document.getElementById("stop"),
    customize: document.getElementById("customize"),
    focusUp: document.getElementById("sPlus"),
    focusDown: document.getElementById("sMinus"),
    restUp: document.getElementById("rPlus"),
    restDown: document.getElementById("rMinus"),
}

uiElements = {
    customizeWrapper: document.getElementById("customizeWrapper"),
    customFocusWrapper: document.getElementById("focusWrap"),
    customRestWrapper: document.getElementById("restWrap"),
    customFocus: document.getElementById("cFocus"),
    customRest: document.getElementById("cRest"),
    subtitleFocus: document.getElementsByClassName("tFocus"),
    subtitleRest: document.getElementsByClassName("tRest"), 
    countdown: document.getElementById("timerCount"),
    countdownText: document.getElementById("timerMain"),
    progressBar: document.getElementById("progressBar")
}

function bindUIActions() {
    b.restart.addEventListener("click", function() {
        resetTimer();});
    b.pausePlay.addEventListener("click", function() {
        pausePlay();});
    b.stop.addEventListener("click", function() {
        stopButton();});
    b.customize.addEventListener("click", function() {
        toggleCustomBtn();});    
    b.focusUp.addEventListener("click", function() {
        changeFocusTime(1);});
    b.focusDown.addEventListener("click", function() {
        changeFocusTime(-1);});
    b.restUp.addEventListener("click", function() {
        changeRestTime(1);});
    b.restDown.addEventListener("click", function() {
        changeRestTime(-1);});
    
}

function toggleCustomBtn(){
    showCustom = !showCustom;
    switch(showCustom){
        case(true): 
            b.customize.innerHTML = "Hide";
            ui.customFocusWrapper.style.display = "block";
            ui.customRestWrapper.style.display = "block";
            break;
        case(false): 
            b.customize.innerHTML = "Customize";
            ui.customFocusWrapper.style.display = "none";
            ui.customRestWrapper.style.display = "none";
            break;
    }  
}

function enableCustomButtons(bool){
    switch(bool){
        case(true): ui.customizeWrapper.style.display = "grid"; break;
        case(false): ui.customizeWrapper.style.display = "none"; break;
    }
}

function stopButton(){
    timer.stop();
    timer = undefined;
    if (showCustom){
        toggleCustomBtn();
    }
    setMode("wait");
}

function pausePlay(bool){
    play = !play;
    if (bool != null){
        play = bool;
    }
    switch(play){
        case(true): 
            b.pausePlay.innerHTML = '<i class= "button fas fa-2x fa-pause"></i>';
            startCountdown();
            break;
        case(false): 
            console.log("PAUSE");
            ui.countdownText.innerHTML = "Paused";
            b.pausePlay.innerHTML = '<i class= "button fas fa-2x fa-play"></i>';
            if (timer){
                timer.pause();
            }
            break;
    }
}

function changeFocusTime(change){
    if (enableCustom == false){
        return;}
    focusTime += change;
    focusTime = Math.min(Math.max(focusTime, 1), 60); //poor man's Math.Clamp
    ui.customFocus.innerHTML = addZero(focusTime) + ":00";
    for (let t of ui.subtitleFocus){t.innerHTML = focusTime;}
    ui.countdown.innerHTML = addZero(focusTime) + ":00";
}

function changeRestTime(change){
    if (enableCustom == false){
        return;}
    restTime += change;
    restTime = Math.min(Math.max(restTime, 1), 60); //poor man's Math.Clamp
    ui.customRest.innerHTML = addZero(restTime) + ":00";
    for (let t of ui.subtitleRest){t.innerHTML = restTime;}
}

function addZero(number){
    if (number < 10){
        number = "0" + number;
    }
    return number;
}

function resetTimer(){
    ui.countdown.innerHTML = addZero(currentTime) + ":00";
    timer.reset();
    resetProgressBar();
}

function newCountdown(){
    if (mode == "wait"){
        setMode("focus");
    }
    timer = new Timer();
    timer.addEventListener('secondsUpdated', function (e) {
        tickCountdown();
    });
    timer.addEventListener('targetAchieved', function (e) {
        countdownComplete();
    });
    enableCustomButtons(false);
    startCountdown();
}

function startCountdown(){
    if (!timer){
        newCountdown();
        return;
    }
    ui.countdownText.innerHTML = mode[0].toUpperCase() + mode.slice(1); // "Mode" w/ first letter capitalized
    timer.start({countdown: true, startValues: {minutes: currentTime, seconds: 00}});
}

function tickCountdown(){
    var displayTime = timer.getTimeValues().toString(['minutes', 'seconds']);
    ui.countdown.innerHTML = displayTime;
    setProgressBar();
}

function setProgressBar(){
    let timeElapsed = currentTime*60 - timer.getTotalTimeValues().seconds;
    let percent = (timeElapsed / (currentTime*60)) * 100;
    switch(mode){
        case("focus"): ui.progressBar.style.width = percent + "%"; break;
        case("rest"): ui.progressBar.style.width = (100 - percent) + "%"; break;
    }
}

function resetProgressBar(){
    switch(mode){
        case("wait"):
        case("focus"): ui.progressBar.style.width = "0%"; break;
        case("rest"): ui.progressBar.style.width = "100%"; break;
    }
}

function countdownComplete(){
    console.log("Complete");
    toggleModes();
    newCountdown();
}

function toggleModes(){
    if (mode == "focus"){
        focusFinAudio.play();
        setMode("rest");
    }
    else if (mode == "rest"){
        restFinAudio.play();
        setMode("focus");
    }
}

function setMode(newMode){
    switch(newMode){
        case("focus"): 
            mode = "focus";
            ui.progressBar.className = "progressFocus";
            ui.countdownText.innerHTML = "Focus";
            ui.countdown.innerHTML = addZero(focusTime) + ":00";
            currentTime = focusTime; 
            changeFocusTime(0);
            break;
        case("rest"): 
            mode = "rest";
            ui.progressBar.className = "progressRest";
            ui.countdownText.innerHTML = "Rest";
            ui.countdown.innerHTML = addZero(restTime) + ":00";
            currentTime = restTime; 
            changeRestTime(0);
            break;
        case("wait"): 
            mode = "wait";
            pausePlay(false);
            enableCustomButtons(true);
            resetProgressBar();
            ui.progressBar.className = "";
            ui.countdownText.innerHTML = "Ready?";
            currentTime = focusTime; 
            ui.countdown.innerHTML = addZero(currentTime) + ":00";
            break;
    }
}
