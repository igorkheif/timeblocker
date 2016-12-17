function indentTime(i) {
	if (i < 10) {
		i = "0" + i
	}; // add zero in front of numbers < 10
	return i;
}

function processUpdate(update){
	document.getElementById('clock').innerHTML = indentTime(update.minutes) + ":" + indentTime(update.seconds);
}

function processError(){
	return;
}

function start(requested_button) {
	browser.runtime.sendMessage({
		type: "start",
		pressed_button: requested_button,
	});
	document.getElementById('txt').innerHTML = "start";
}

function stop() {
	document.getElementById('txt').innerHTML = "stop";
	browser.runtime.sendMessage({
		type: "stop"
	});
}

function getUpdate(){

	var sending = browser.runtime.sendMessage({
		type: "update-request"
	});

	sending.then(processUpdate, processError);  
}

document.addEventListener("click", (e) => {
	//window.alert("sometext");

	document.getElementById('txt').innerHTML = "0";
	if (e.target.classList.contains("countdown")) {
		var chosen_countdown = e.target.textContent;
		start(chosen_countdown);
	} else if (e.target.classList.contains("stop")) {
		stop();
	}
});

getUpdate();
setInterval(getUpdate, 100);
