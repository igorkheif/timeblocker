console.log("0");
var OVERLAY = (function() {
	console.log("1");
	const click_anywhere_note = "(click anywhere to exit)"
	var is_on = false;

	// Setting the properties of the background of the overlay
	var overlay_bg = document.createElement("overlay_bg");
	overlay_bg.id = "timeBlockerOverlayBg";

	overlay_bg.style.backgroundColor = "black";
	overlay_bg.style.opacity = 0.9;
	overlay_bg.style.position = "absolute";
	overlay_bg.style.top = 0;
	overlay_bg.style.left = 0;
	overlay_bg.style.width = "100%";
	overlay_bg.style.height = "100%";
	overlay_bg.style.zIndex = 10000;

	var overlay_text = document.createElement("overlay_text");
	overlay_text.id = "timeBlockerOverlayText";

	overlay_text.style.textAlign = "center";
	overlay_text.style.color = "white";

	overlay_bg.append(overlay_text);

	return {
		turnOverlayOn: function(overlay_text) {
			if (is_on) {
				return;
			}

			document.body.append(overlay_bg);
			var full_overlay_text = String.format("<h1>{0}</h1><br /><h3>{1}</h3>", 
					overlay_text, click_anywhere_note);
			document.getElementById("timeBlockerOverlay").innerHTML = fullOverlayText;
			is_on = true;
		},
		turnOverlayOff: function() {
			if (!is_on) {
				return;
			}

			is_on = false;
			var inserted_overlay_bg = document.getElementById("timeBlockerOverlay");
			document.body.removeChild(inserted_overlay_bg);
		}
	};
})();
console.log("Running");
browser.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.type == "overlay") {
				console.log("got overlay request");
				OVERLAY.turnOverlayOn(request.overlay_text);
			}
		});

document.addEventListener("click", (e) => {
	OVERLAY.turnOverlayOff();
});
console.log("Still running");
