// TODO: Make sure this only runs once, even after X breaks
function popupAndRemove(request, sender, sendResponse) {
	if (request.type == "popup") {
		alert(request.popup_text);
		browser.runtime.onMessage.removeListener(popupAndRemove);
	}
}

browser.runtime.onMessage.addListener(popupAndRemove);
