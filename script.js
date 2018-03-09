var mode = "focus"; // modes: wait, focus, rest
var play = false;
var percent = 0;
var time = "25:00";
var focusTime = 25;
var restTime = 5;
var currentTime;
var timer;

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
    pause: document.getElementById("pause"),
    stop: document.getElementById("stop"),
    focusUp: document.getElementById("sPlus"),
    focusDown: document.getElementById("sMinus"),
    restUp: document.getElementById("rPlus"),
    restDown: document.getElementById("rMinus"),
}

uiElements = {
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
        resetTimer();
    });
    b.pause.addEventListener("click", function() {
        pausePlay();
    });
    b.stop.addEventListener("click", function() {
        stopButton();
    });
    b.focusUp.addEventListener("click", function() {
        changeFocusTime(1);});
    b.focusDown.addEventListener("click", function() {
        changeFocusTime(-1);});
    b.restUp.addEventListener("click", function() {
        changeRestTime(1);});
    b.restDown.addEventListener("click", function() {
        changeRestTime(-1);});
}

function stopButton(){
    timer.stop();
    timer = undefined;
    setMode("wait");
}

function pausePlay(){
    play = !play;
    switch(play){
        case(true): 
            console.log("Play");
            startCountdown();
            break;
        case(false): 
            console.log("Pause");
            timer.pause();
            break;
    }
}

function changeFocusTime(change){
    focusTime += change;
    focusTime = Math.min(Math.max(focusTime, 1), 60); //poor man's Math.Clamp
    ui.customFocus.innerHTML = addZero(focusTime) + ":00";
    for (let t of ui.subtitleFocus){t.innerHTML = focusTime;}
    ui.countdown.innerHTML = addZero(focusTime) + ":00";
}

function changeRestTime(change){
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

    startCountdown();
}

function startCountdown(){
    if (!timer){
        newCountdown();
        return;
    }
    timer.start({countdown: true, startValues: {minutes: currentTime, seconds: 00}});
}

function tickCountdown(){
    var displayTime = timer.getTimeValues().toString(['minutes', 'seconds']);
    //console.log("Tick: " + displayTime);
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
        setMode("rest");
    }
    else if (mode == "rest"){
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
            play = false;
            resetProgressBar();
            ui.progressBar.className = "";
            ui.countdownText.innerHTML = "Ready?";
            currentTime = focusTime; 
            ui.countdown.innerHTML = addZero(currentTime) + ":00";
            break;
    }
}
