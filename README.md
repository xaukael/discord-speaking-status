# Discord Speaking Status
Outlines user character token and their user color marker in the players ui when they speak.

![indicators](https://github.com/xaukael/discord-speaking-status/blob/ba76675eb8316e94bc6fb246feaaed041ca669d0/speaking-indicators.jpg)

Relays speaking status in a discord voice channel from a https://streamkit.discord.com/ tab.

The streamkit tab must be opened from Foundry. You do this by clicking the 'Open Discrod Streamkit' button in the Game Access section of the settings tab.

![indicators](https://github.com/xaukael/discord-speaking-status/blob/6c7381110f913505221f74d2969e952d4b6b1d67/to-open-streamkit-tab.jpg)

This must be done by each client/user. Discord Streamkit connects to the Discod Desktop Application, so this will not work with Discord instances in a browser.

You must access your Foundry game in a browser to allow it to open the streamkit tab. Will not work with the Foundry VTT desktop application.

Until the extension is approved by our Google overlords and published on the chrome web store, you must install the necessary extension by extracting discord-speaking-relay.zip, enable developer mode in your chrome based browser, and load it as an unpacked extension.

If you do not want to go through the trouble of manually installing the extension, you can run set up a tampermonkey script to do the same.

Tampermonkey: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en

Using this userscript:
````
// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Sends data about the speaker to the window that opened https://streamkit.discord.com/overlay/voice/
// @author       Xaukael
// @match        https://streamkit.discord.com/overlay/voice/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=discord.com
// @grant        none
// ==/UserScript==

(async function() {
  "use strict";
  const users = {};
  const log = window.console.log.bind(window.console);
  window.console.log = (...args) => {
    if (!args[1]) return log(...args);
    if (typeof args[1] !== 'object') return log(...args);
    let data = args[1].data;
  	data.evt = args[1].evt;
  	if (data.evt == "VOICE_STATE_UPDATE") {
  		users[data.user.id] = `${data.user.username}#${data.user.discriminator}`
  		return console.log(users[data.user.id], 'added to users', users)
  	}
  	if (!["SPEAKING_START", "SPEAKING_STOP"].includes(data.evt)) return log(...args);
  	data.name = users[data.user_id];
  	delete data.channel_id; delete data.user_id;
  	log('sending this data to window.opener', data);
    window.opener.postMessage(data, '*');
  }
})();
````
Or you can just paste this part in the console (F12) of the streamkit window after you open it from Foundry:
````
const users = {};
const log = window.console.log.bind(window.console);
window.console.log = (...args) => {
  if (!args[1]) return log(...args);
  if (typeof args[1] !== 'object') return log(...args);
  let data = args[1].data;
	data.evt = args[1].evt;
	if (data.evt == "VOICE_STATE_UPDATE") {
		users[data.user.id] = `${data.user.username}#${data.user.discriminator}`
		return console.log(users[data.user.id], 'added to users', users)
	}
	if (!["SPEAKING_START", "SPEAKING_STOP"].includes(data.evt)) return log(...args);
	data.name = users[data.user_id];
	delete data.channel_id; delete data.user_id;
	log('sending this data to window.opener', data);
  window.opener.postMessage(data, '*');
}
````
