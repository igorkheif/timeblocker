// Shows a popup (async) and removes itself from the message listener. It's so that if the
// user stays on the same page, it won't launch many of those script and each one will have its own listener
// which will several popups for each countdown that ends
function popupAndRemove(request, sender, sendResponse) {
	if (request.type == "popup") {
		setTimeout(function() { alert(request.popup_text); }, 100);
		chrome.runtime.onMessage.removeListener(popupAndRemove);
	}
}

chrome.runtime.onMessage.addListener(popupAndRemove);
