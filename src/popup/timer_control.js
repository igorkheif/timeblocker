const WORK_KEY = "work";
const SMALL_BREAK_KEY = "small_break";
const BIG_BREAK_KEY = "big_break";

function indentTime(i) {
	if (i < 10) {
		i = "0" + i
	}; // add zero in front of numbers < 10
	return i;
}

function processUpdate(update){
	document.getElementById('clock').innerHTML = indentTime(update.minutes) + ":" + indentTime(update.seconds);
}

function getUpdate(){

	var sending = browser.runtime.sendMessage({
		type: "update-request"
	});

	sending.then(processUpdate, function (error){return;});  
}

document.addEventListener("click", (e) => {
	//window.alert("sometext");

	if (e.target.classList.contains("countdown")) {
		var chosen_countdown = e.target.textContent.toLowerCase().replace(" ", "_");
		browser.runtime.sendMessage({
			type: "start",
			session_type: chosen_countdown
		});
	} else if (e.target.classList.contains("stop")) {
		var executing = browser.tabs.executeScript(null, {file: "/content_scripts/overlay.js"});
		executing.then(function (res){console.log("started overlay.js: " + res);}, function (err){console.log("haven't started, error: " + err);});
		browser.runtime.sendMessage({
			type: "stop"
		});
	}
});

// Getting updates (the time to show the user mostly) from the background JS.
getUpdate();

setInterval(getUpdate, 100);
