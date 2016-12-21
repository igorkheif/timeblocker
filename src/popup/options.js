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
			config.sessions[key] = document.getElementById(key).value;
		}

		switch (document.getElementById("play_sound").value){
			case "on":
				config.should_play_sound = true;
				break;
			case "off":
				config.should_play_sound = false;
				break;
			default: // Should never get here
				break;
		}
}

function updateHtmlFromConfig() {
		for (key in config.sessions){
			document.getElementById(key).value = config.sessions[key];
		}

		switch (config.shold_play_sound){
			case true:
				document.getElementById("play_sound").value = "on";
				break;
			case false:
				document.getElementById("play_sound").value = "off";
				break;
			default: // Should never get here
				break;
		}
}

function updateHtmlAndConfig(conf_obj) {
	if (Object.keys(conf_obj).length === 0) {
		return;
	}

	console.log(JSON.stringify(conf_obj["new_config"]));
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
