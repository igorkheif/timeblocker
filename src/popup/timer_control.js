// Adds a "0" to a digit so it'll look prettier if it's a single digit
function indentTime(i) {
	if (i < 10) {
		i = "0" + i
	}; // add zero in front of numbers < 10
	return i;
}

// Prints the newly acquired time left from the background script 
function processUpdate(update){
	document.getElementById('clock').innerHTML = indentTime(update.minutes) + ":" + indentTime(update.seconds);
}

// Requests an update from the background script to display to the user
function getUpdate(){

	var sending = browser.runtime.sendMessage({
		type: "update-request"
	});

	sending.then(processUpdate, function (error){return;});  
}

// Processes the button clicks of the user
document.addEventListener("click", (e) => {
	if (e.target.classList.contains("countdown")) {
		var chosen_countdown = e.target.textContent.toLowerCase().replace(" ", "_");
		browser.runtime.sendMessage({
			type: "start",
			session_type: chosen_countdown
		});
	} else if (e.target.classList.contains("stop")) {
		browser.runtime.sendMessage({
			type: "stop"
		});
	}
});

// Getting updates (the time to show the user) from the background JS.
getUpdate();

setInterval(getUpdate, 120);
