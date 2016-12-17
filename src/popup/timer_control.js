const WORK_KEY = "work";
const SMALL_BREAK_KEY = "small_break";
const BIG_BREAK_KEY = "big_break";

var CONFIG = (function() {
	var countdown_to_mins_and_color = {
		work: {minutes: 25, color: "crimson"},
		small_break: {minutes: 0.05, color: "royalblue"},
		big_break: {minutes: 30, color: "green"}
	}

	return {
		setCountdown: function(key, value) {
			countdown_to_mins_and_color[key].minutes = value;
		},
		getCountdown: function(key) {
			return countdown_to_mins_and_color[key].minutes;
		},
		setCountdownColor: function(key, value) {
			countdown_to_mins_and_color[key].color = value;
		},
		getCountdownColor: function(key) {
			return countdown_to_mins_and_color[key].color;
		},
		getTimes: function(key) {
			var times = {};

			for (var key in countdown_to_mins_and_color) {
				times[key] = countdown_to_mins_and_color[key].minutes;
			}

			return times;
		}
	};
})();

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
		minutes: CONFIG.getCountdown(requested_button),
		color: CONFIG.getCountdownColor(requested_button),
	});
}

function stop() {
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

function updateTimesFromInput(){
	// TODO: Make a for loop
	CONFIG.setCountdown(WORK_KEY, document.getElementById(WORK_KEY).value);
	CONFIG.setCountdown(SMALL_BREAK_KEY, document.getElementById(SMALL_BREAK_KEY).value);
	CONFIG.setCountdown(BIG_BREAK_KEY, document.getElementById(BIG_BREAK_KEY).value);
}

// Updating the times we've got saved in the storage
function updateCountdown(times) {
	for (var key in times) {
		CONFIG.setCoutdown(key, times[key]);
		CONFIG.setCountdown(document.getElementById(key).innerHTML.value = times[key]);
	}
}

document.addEventListener("click", (e) => {
	//window.alert("sometext");

	if (e.target.classList.contains("countdown")) {
		updateTimesFromInput();
		var chosen_countdown = e.target.textContent.toLowerCase().replace(" ", "_");
		start(chosen_countdown);
	} else if (e.target.classList.contains("stop")) {
		stop();
	}
});

// Upon unload, were saving the times into the storage
window.addEventListener("beforeunload", function (event) {
	browser.storage.local.set({times: CONFIG.getTimes()});
});

var gettingTimes = browser.storage.local.get("times");
gettingTimes.then(updateCountdown, function (error){return;});

// Getting updates (the time to show the user mostly) from the background JS.
getUpdate();
setInterval(getUpdate, 100);
