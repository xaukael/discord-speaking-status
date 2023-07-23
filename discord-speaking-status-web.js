listenForDiscordEvents = function (e) {
  let user = game.users.find(u=> u.flags["discord-speaking-status-web"]?.id == e.data.userId)
  /*
  if (!user) {
    
    let id = 'assign-' + e.data.userId;
    //console.log($(`#${id}`).length)
    if ($(`#${id}`).length) {
      if (e.data.evt=="SPEAKING_START") return $(`#${id}`).css({outline: '3px solid #3BA53B'});
      if (e.data.evt=="SPEAKING_STOP") return $(`#${id}`).css({outline: 'unset'});
    }
    new Dialog({
      title: e.data.userId,
      content: game.users.filter(u=> !u.flags["discord-speaking-status-web"]?.id).reduce((a,u)=>a+=`<option value="${u.id}">${u.name}</option>`,`<select name="user">`)+`</select>`,
      buttons: {
        confirm: {label:'confirm', callback: (html)=>{
          game.users.get(html.find('select').val()).setFlag('discord-speaking-status-web', 'id', e.data.userId)
        }}
      },
      default: 'confirm'
    },{id}).render(true)
    return;
  };*/
  Hooks.call('discordSpeakingEvent', e.data)
  let tokens = user.character?.getActiveTokens();
  if (e.data.speaking) {
    $(`#player-list > li[data-user-id="${user.id}"] span:first-child`).css({outline: '5px solid #3BA53B'});
    tokens.forEach(t => {
      
      $('#hud').append($(`<div class="speaking-token-marker ${t.id}" style="position: absolute; top: ${t.y}px; left: ${t.x}px; width: ${t.w}px; height: ${t.h}px; outline: ${canvas.grid.size/20}px solid #3BA53B; border-radius: ${canvas.grid.size/20}px;"></div>`));
      $(`#token-action-bar li[data-token-id="${t.id}"]`).css({outline: '3px solid #3BA53B'});
    });
  }
  if (!e.data.speaking) {
    $(`#player-list > li[data-user-id="${user.id}"] span:first-child`).css({outline: 'unset'});
    tokens.forEach(t => { 
      $('#hud').find(`div.speaking-token-marker.${t.id}`).remove(); 
      $(`#token-action-bar li[data-token-id="${t.id}"]`).css({outline: 'unset'});
    });
  }
}

Hooks.on('ready',()=>{
  window.addEventListener("message", listenForDiscordEvents, false)
});

cleanDiscordSpeakingMarkers = function () {
  $(`#player-list > li span:first-child`).css({outline: 'unset'});
  $('#hud').find(`div.speaking-token-marker`).remove(); 
  $(`#token-action-bar li`).css({outline: 'unset'});
}

Hooks.on('refreshToken', (t)=>{
	if (t.isPreview) return;
  $(`#hud > div.speaking-token-marker.${t.id}`).css({ top: `${t.y}px`, left: `${t.x}px`});
});

openDiscordWindow = async function () {
  //let code = "const users = {};\nconst log = window.console.log.bind(window.console);\nwindow.console.log = (...args) => {\n  if (!args[1]) return log(...args);\n  if (typeof args[1] !== 'object') return log(...args);\n  let data = args[1].data;\n\tdata.evt = args[1].evt;\n\tif (data.evt == \"VOICE_STATE_UPDATE\") {\n\t\tusers[data.user.id] = `${data.user.username}#${data.user.discriminator}`\n\t\treturn console.log(users[data.user.id], 'added to users', users)\n\t}\n\tif (![\"SPEAKING_START\", \"SPEAKING_STOP\"].includes(data.evt)) return log(...args);\n\tdata.name = users[data.user_id];if (name == undefined) data.name = document.querySelector(`img[src*=\"${data.user_id}\"]`)?.parentElement?.querySelector(\"span\").innerHTML;\n\tdelete data.channel_id; delete data.user_id;\n\tlog('sending this data to window.opener', data);\n  window.opener.postMessage(data, '*');\n}"
  //await window.navigator.clipboard.writeText(code);
  channel = game.settings.get("discord-speaking-status-web", "channel");
  let parts = channel.split('/');
  window.open(channel, '_blank');
  window.focus();
  new Dialog({title:'Companion Script', content: `<p>copy this<br> paste it into the console (F12) of the discord window<br>execute to monitor speaking status</p>
  <textarea rows="21" cols="95" onclick="this.focus();this.select()" >
const mutList = new MutationObserver((mutations, mut) => {
    for (let m of mutations) {
        if (!m.target.className.includes('userAvatar')) continue;
        let data = {};
        if (!mutations) return;
        let match = mutations[0].target.style.backgroundImage.match(/avatars\\/([0-9])+\\//g);
        if (!match) return;
        let ua = match[0];
        data.userId = ua.substring(ua.indexOf('/')+1, ua.lastIndexOf('/'));
        data.speaking = mutations[0].target.className.includes('Speaking');
        console.log("emmitting event", data);
        window.opener.postMessage(data, '*');
    }
});
document.querySelectorAll('li[class*="containerDefault"]').forEach((li)=>{
    mutList.observe(li, {
        'childList': true,
        'subtree': true,
        'attributes': true
    });
});</textarea>`, buttons:{}}, {width: 'auto'}).render(true);
}
Hooks.once("init", async () => {
  
  game.settings.register('discord-speaking-status-web', 'channel', {
    name: `Discord Voice Channel URL`,
    hint: `Right click the channel in discord and click "Copy Link"`,
    scope: "world",
    config: true,
    type: String,
    default: "",
    requiresReload: false
  });

});

Hooks.on('renderSettings', (app, html)=>{
  html.find('#settings-access').prepend($(`<button><i class="fa-brands fa-discord"></i> Open Discord Voice Channel</button>`).click(function(){openDiscordWindow()}))
})

Hooks.on('renderUserConfig', (app, html, data)=>{
  html.append(`<style>#${html.closest('.app').attr('id')} { height: auto !important;} </style>`)
  html.find('form').prepend($(`
        <div class="form-group">
          <label>Discord User ID</label>
          <input type="text" name="flags.discord-speaking-status-web.id">
        </div>
  `));
  html.find('input[name="flags.discord-speaking-status-web.id"]').val(data.user.flags["discord-speaking-status-web"]?.id)
});
