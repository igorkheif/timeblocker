// TODO: Make sure this only runs once, even after X breaks
browser.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.type == "overlay") {
				OVERLAY.turnOverlayOn(request.overlay_text);
			}
		}
);
