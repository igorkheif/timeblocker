var config = {
	sessions: {
		time_block: {minutes: 25, color: "maroon"},
		small_break: {minutes: 0.05, color: "royalblue"},
		big_break: {minutes: 30, color: "green"}
	},
	should_play_sound: true,
	should_continue_to_small_break: true,
	should_popup: true
}

// Updating the current config from the html page
function updateConfigFromHtml() {
		for (key in config.sessions){
			config.sessions[key].minutes = document.getElementById(key).value;
		}

		config.should_play_sound = document.getElementById("play_sound").checked;
		config.should_continue_to_small_break = document.getElementById("autocontinue").checked;
		config.should_popup = document.getElementById("popup").checked;
}

// Updating the html page from the config
function updateHtmlFromConfig() {
		for (key in config.sessions){
			document.getElementById(key).value = config.sessions[key].minutes;
		}

		document.getElementById("play_sound").checked =	config.should_play_sound;
		document.getElementById("autocontinue").checked = config.should_continue_to_small_break;
		document.getElementById("popup").checked = config.should_popup;
}

// Updating both the config and the options page from the given object (probably from storage)
function updateHtmlAndConfig(conf_obj) {
	if (Object.keys(conf_obj).length === 0) {
		return;
	}

	config = conf_obj["new_config"];
	updateHtmlFromConfig();
}

// Sending config to the background script
function sendConfigToBackground() {
	chrome.runtime.sendMessage({
		type: "update-config",
		config: config
	});
}

// We try to get the config from the storage, if it's already saved there. Otherwise, we use the default one here.
var gettingConfig = chrome.storage.local.get("new_config", 
		function (conf_obj){

			if (chrome.runtime.lastError) {
				updateHtmlFromConfig();
				return;
			}

			updateHtmlAndConfig(conf_obj);
		});

// When the user submits the options form, we update our config and save it to storage
document.getElementById("options_form").onsubmit=function() {
	updateConfigFromHtml();

	var new_config = config;
	chrome.storage.local.set({new_config: new_config});
	sendConfigToBackground();
	return false;
}
