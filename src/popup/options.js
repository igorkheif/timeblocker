var config = {
	sessions: {
		work: {minutes: 25, color: "maroon"},
		small_break: {minutes: 0.05, color: "royalblue"},
		big_break: {minutes: 30, color: "green"}
	},
	should_play_sound: true,
}

function updateConfigFromHtml() {
		for (key in config.sessions){
			config.sessions[key].minutes = document.getElementById(key).value;
		}

		config.should_play_sound = document.getElementById("play_sound").checked;
}

function updateHtmlFromConfig() {
		for (key in config.sessions){
			document.getElementById(key).value = config.sessions[key].minutes;
		}

		document.getElementById("play_sound").checked =	config.should_play_sound;
}

function updateHtmlAndConfig(conf_obj) {
	if (Object.keys(conf_obj).length === 0) {
		return;
	}

	config = conf_obj["new_config"];
	updateHtmlFromConfig();
}

function sendConfigToBackground() {
	browser.runtime.sendMessage({
		type: "update-config",
		config: config
	});
}

// We try to get the config from the storage, if it's already saved there. Otherwise, we use the default one here.
var gettingTimes = browser.storage.local.get("new_config");
gettingTimes.then(updateHtmlAndConfig, function (error){updateHtmlFromConfig()});

// When the user submits the options form, we update our config and save it to storage

document.getElementById("options_form").onsubmit=function() {
	updateConfigFromHtml();

	var new_config = config;
	browser.storage.local.set({new_config: new_config});
	sendConfigToBackground();
	return false;
}