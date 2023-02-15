# Discord Speaking Status
Relays speaking status in a discord voice channel from a https://streamkit.discord.com/ tab.

Outlines user character token and their user color marker in the players ui when they speak.

Must be used in browser. Will not work with the Foundry VTT desktop application.

Until the extension is approved by our Google overlords and published on the chrome web store, you must install the necessary extension by extracting discord-speaking-relay.zip, enable developer mode in your chrome based browser, and load it as an unpacked extension.

If you do not want to go through the trouble of manually installing the extension, you can run set up a tampermonkey script to do the same.

Tampermonkey: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en

Using this userscript
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
  const log = console.log.bind(console);
  console.log = (...args) => {
    if (!args[1]) return log(...args);
    if (typeof args[1] !== "object") return log(...args);
    let data = args[1].data;
    let name = document.querySelector(`img[src*="${data.user_id}"]`)?.parentElement?.querySelector("span").innerHTML;
    if (!name) return log(...args);
    data.evt = args[1].evt;
    data.name = name;
    window.opener.postMessage(data, "*");
    log(data.name, data.status);
  };
})();
````
Or you can just paste this part in the console (F12) of the streamkit window after you open it from Foundry,
````
const log = console.log.bind(console);
console.log = (...args) => {
  if (!args[1]) return log(...args);
  if (typeof args[1] !== "object") return log(...args);
  let data = args[1].data;
  let name = document.querySelector(`img[src*="${data.user_id}"]`)?.parentElement?.querySelector("span").innerHTML;
  if (!name) return log(...args);
  data.evt = args[1].evt;
  data.name = name;
  window.opener.postMessage(data, "*");
  log(data.name, data.status);
};
````

![indicators](https://github.com/xaukael/discord-speaking-status/blob/ba76675eb8316e94bc6fb246feaaed041ca669d0/speaking-indicators.jpg)
![indicators](https://github.com/xaukael/discord-speaking-status/blob/6c7381110f913505221f74d2969e952d4b6b1d67/to-open-streamkit-tab.jpg)
