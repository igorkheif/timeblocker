const MS_IN_SEC = 1000;
const MS_IN_MIN = 60000;
const SEC_IN_MIN = 60;

var CONFIG = (function() {
	var is_started;
	var starting_time;
	var interval_id;
	var original_countdown;
	var countdown_to_minutes = {
		"Work": {minutes: 25, color: "red"},
		"Small Break": {minutes: 0.05, color: "royalblue"},
		"Big Break": {minutes: 30, color: "green"}
	}

	return {
		setCountdown: function(key, value) {
			countdown_to_minutes[key].minutes = value;
		},
		getCountdown: function(key) {
			return countdown_to_minutes[key].minutes;
		},
		setCountdownColor: function(key, value) {
			countdown_to_minutes[key].color = value;
		},
		getCountdownColor: function(key) {
			return countdown_to_minutes[key].color;
		},
		setIntervalID: function(id) {
			interval_id = id;
		},
		getIntervalID: function() {
			return interval_id;
		},
		start: function() {
			is_started = true;
		},
		stop: function() {
			is_started = false;
		},
		getIsStarted: function() {
			return is_started;
		},
		setStartingTime: function(time) {
			starting_time = time;
		},
		getStartingTime: function() {
			return starting_time;
		},
		setOriginalCountdown: function(countdown) {
			original_countdown = countdown;
		},
		getOriginalCountdown: function() {
			return original_countdown;
		},
	};
})();

function getRemainingTime (){
	var diff_ms = Date.now() - CONFIG.getStartingTime();
	var remaining_ms = CONFIG.getOriginalCountdown() * MS_IN_MIN - diff_ms;

	if (remaining_ms < 0) {
		return {
			remaining_minutes: 0,
			remaining_seconds: 0
		};
	}

	// Adding another 1000 ms so that it'll be pretty and the clock will end exactly as we hit 00:00
	var remaining_ms_pretty = remaining_ms + MS_IN_SEC;
	var remaining_whole_minutes = Math.floor(remaining_ms_pretty / (MS_IN_MIN));
	var remaining_seconds = Math.floor((remaining_ms_pretty / MS_IN_SEC) - remaining_whole_minutes * SEC_IN_MIN);

	return {
		remaining_minutes: remaining_whole_minutes,
		remaining_seconds: remaining_seconds
	};
}

function timerTick() {
	// We're not supposed to run
	if (!CONFIG.getIsStarted()) {

		return;
	}

	var remaining_time = new getRemainingTime();
	if ((remaining_time.remaining_minutes == 0) && (remaining_time.remaining_seconds == 0)) {
		var audio = new Audio('sounds/ding.mp3'); 
		audio.play(); 
		stopTimer();
		return;
	}

	browser.browserAction.setBadgeText({text: (remaining_time.remaining_minutes + Math.ceil(remaining_time.remaining_seconds / SEC_IN_MIN)).toString()});
}

function stopTimer() {
	if (!CONFIG.getIsStarted()) {

		return;
	}
	clearInterval(CONFIG.getIntervalID());
	CONFIG.stop();
	browser.browserAction.setBadgeText({text: ""});
}

function setupTimer(pressed_button) {
	browser.browserAction.setBadgeBackgroundColor({color: CONFIG.getCountdownColor(pressed_button)});
	CONFIG.setOriginalCountdown(CONFIG.getCountdown(pressed_button));
	window.console.log("asdfasdf");
	CONFIG.setStartingTime(Date.now());
	CONFIG.start();
	timerTick();
	CONFIG.setIntervalID(setInterval(timerTick, 50));
}

function handleMessage(request, sender, sendResponse) {
			window.console.log("asdfasdf");
	switch(request.type) {
		case "start":
			window.console.log("asdfasdf");
			setupTimer(request.pressed_button);
			break;
		case "stop":
			stopTimer();
			break;
		case "update-request":
			var mins = 0;
			var secs = 0;

			if (CONFIG.getIsStarted()) {
				var remaining_time = new getRemainingTime();
				mins = remaining_time.remaining_minutes;
				secs = remaining_time.remaining_seconds;
			}

			sendResponse({minutes : mins, seconds : secs});
			break;
		default:	// Should never happen
			break;
	}
}

browser.runtime.onMessage.addListener(handleMessage);
window.console.log("asdfasdf");
