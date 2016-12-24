// TODO: Make sure this only runs once, even after X breaks
function popupAndRemove(request, sender, sendResponse) {
	if (request.type == "popup") {
		setTimeout(function() { alert(request.popup_text); }, 100);
		browser.runtime.onMessage.removeListener(popupAndRemove);
	}
}

browser.runtime.onMessage.addListener(popupAndRemove);
