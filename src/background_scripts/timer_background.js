const MS_IN_SEC = 1000;
const MS_IN_MIN = 60000;
const SEC_IN_MIN = 60;

// This is the state holder, it exports some getters and setters.
var STATE = (function() {
	// Is the timer currently running
	var is_started;
	// What time did the timer start
	var starting_time;
	// The ID of the timerTick, so we know to turn if off when necessary
	var interval_id;
	// The original amount of time we're counting down from
	var original_countdown;
	// The current session type as a string (time_block, small_break or big_break)
	var original_session_type;

	// The config. Holds the user defined things (mostly) such as times for different blocks
	// and whether or not show a popup/play sound upon completion
	var config = {
		sessions: {
			time_block: {minutes: 25, color: "maroon"},
			small_break: {minutes: 0.05, color: "royalblue"},
			big_break: {minutes: 30, color: "green"}
		},
		should_play_sound: true,
		should_continue_to_small_break: true,
		should_popup: true
	};

	// The "exports"
	return {
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
		setOriginalSessionType: function(session_type) {
			original_session_type = session_type;
		},
		getOriginalSessionType: function() {
			return original_session_type;
		},
		updateConfig: function(new_config) {
			config = new_config;
		},
		shouldContinueToSmallBreak: function() {
			return ((config.should_continue_to_small_break) && 
				(original_session_type == "time_block"));
		},
		shouldPlaySound: function() {
			return config.should_play_sound;
		},
		shouldPopup: function() {
			return config.should_popup;
		},
		getSession: function(key){
			return config.sessions[key];
		}
	};
})();

// Returns the remaining time in the countdown in minutes and seconds
function getRemainingTime (){
	var diff_ms = Date.now() - STATE.getStartingTime();
	var remaining_ms = STATE.getOriginalCountdown() * MS_IN_MIN - diff_ms;

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

// This function tests whether or not the countdown has ended
function timerTick() {
	// We're not supposed to run
	if (!STATE.getIsStarted()) {

		return;
	}

	var remaining_time = new getRemainingTime();
	if ((remaining_time.remaining_minutes == 0) && (remaining_time.remaining_seconds == 0)) {
		// TODO: Move this one to stopTimer, but it's fine here and it works (even simplifies the code)
		if (STATE.shouldPlaySound()) {
			var audio = new Audio('../sounds/ding.mp3'); 
			audio.play(); 
		}

		stopTimer(false);
		return;
	}

	chrome.browserAction.setBadgeText({text: remaining_time.remaining_minutes.toString()});
}

// Part of the process of sending the message to the popup script
function sendMessageToTabs(tabs, message) {
	// Going over the found active tabs and sending them the message
	for (let tab of tabs) {
		chrome.tabs.sendMessage(
				tab.id,
				{
					type: "popup", 
					popup_text: message
				});
	};
}

// Part of the process of sending the message to the popup script
function sendContentScriptMessage(message) {
	// Getting the active tab for the popup
	var querying = chrome.tabs.query({
		currentWindow: true,
		active: true
	},
	function (tabs) {
		if (chrome.runtime.lastError) {
			console.warn("Couldn't get tabs from query function");
			return;
		}

		sendMessageToTabs(tabs, message);
	});
}

function stopTimer(is_forced_stop) {
	if (!STATE.getIsStarted()) {

		return;
	}

	// If we should show a popup upon stopping (and the user hasn't stopped us himself), 
	// we're starting the popup.js script and sending it a message with the text to print
	if ((STATE.shouldPopup()) && (!is_forced_stop)){
		var session_type_printable = STATE.getOriginalSessionType().toString().replace('_', ' ');
		var executingScript = chrome.tabs.executeScript(null, {file: "/content_scripts/popup.js"},
				function () {

					if (chrome.runtime.lastError) {
						console.warn("Couldn't run the content script");
						return;
					}

					sendContentScriptMessage("The " + session_type_printable + " session has ended.");
				});
	}

	// Clearing the interval so we don't call timerTick from now on
	clearInterval(STATE.getIntervalID());

	// We don't start the small break timer if the user pressed the stop button, or we're not ment to
	if ((!is_forced_stop) && (STATE.shouldContinueToSmallBreak())){
		startTimer("small_break");
	}
	else {
		STATE.stop();
		chrome.browserAction.setBadgeText({text: ""});
	}

}

function startTimer(session_type) {
	// Saving many things in the state, setting the badge's color
	relevant_session = STATE.getSession(session_type);
	chrome.browserAction.setBadgeBackgroundColor({color: relevant_session.color});
	STATE.setOriginalSessionType(session_type);
	STATE.setOriginalCountdown(relevant_session.minutes);
	STATE.setStartingTime(Date.now());
	STATE.start();
	
	// This is the countdown part. 
	timerTick();
	// Setting the interval time for testing whether or not we're done (10 times a second)
	STATE.setIntervalID(setInterval(timerTick, 100));
}

// Handles the received messages, whether it's from the options page or the controller
function handleMessage(request, sender, sendResponse) {
	switch(request.type) {
		case "update-config":
			STATE.updateConfig(request.config);
			break;
		case "start":
			startTimer(request.session_type);
			break;
		case "stop":
			stopTimer(true);
			break;
		// This is the time control requesting to know how much time is left to show it to the user
		case "update-request":
			var mins = 0;
			var secs = 0;

			if (STATE.getIsStarted()) {
				var remaining_time = new getRemainingTime();
				mins = remaining_time.remaining_minutes;
				secs = remaining_time.remaining_seconds;
			}

			sendResponse({minutes : mins, seconds : secs});
			break;
		default:	// Message is not for us
			break;
	}
}

// Trying to get the configuration from the storage. If it's there, good, if not, we'll use the default.
var gettingTimes = chrome.storage.local.get("new_config", 
		function (new_config){
			if (chrome.runtime.lastError) {
				console.log("Couldn't get config from storage");
				return;
			}

			if (Object.keys(new_config).length !== 0) {
				STATE.updateConfig(new_config["new_config"]);
			}
		});

chrome.runtime.onMessage.addListener(handleMessage);

// If the user sends a command using the keyboard (more on that in the manifest file under commands)
// we either stop the timer, or start it with the requested preset
chrome.commands.onCommand.addListener(function(command) {
	if (command == "stop") {
		stopTimer(true);
		return;
	}

	startTimer(command);
});
