window.addEventListener("WebPresence", (message) => {
	chrome.runtime.sendMessage(message.detail);
}, false);

const s = document.createElement('script');
s.src = chrome.runtime.getURL('js/script.js');
s.onload = function() { this.remove() };
(document.head || document.documentElement).appendChild(s);