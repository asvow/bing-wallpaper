const $ = API("bing");
const readme = "README.md";
const readmeEN = "README_en.md";
const list = "list.md";
const listEN = "list_en.md";
const josn = "bing.json";
const josnEN = "bing_en.json";

!(async () => {
  const bing = "https://www.bing.com"
  const bing_api = "https://global.bing.com"
  const url_zh =  bing_api + "/HPImageArchive.aspx?format=js&idx=0&n=1&pid=hp&FORM=BEHPTB&uhd=1&uhdwidth=384&uhdheight=216&setmkt=zh-cn&setlang=zh-cn";
  const url_en =  bing_api + "/HPImageArchive.aspx?format=js&idx=0&n=1&pid=hp&FORM=BEHPTB&uhd=1&uhdwidth=384&uhdheight=216&setmkt=en-us&setlang=en-us";
  const headers = {
      "Origin": bing_api,
      "Host": bing_api.replace("https://",""),
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/14.16299",
      "Referer": bing_api
  };
  await handleInfo (url_zh,readme,list);
  await handleInfo (url_en,readmeEN,listEN,josnEN);

  async function handleInfo (url,readme,list,josnEN){
    const request = {
        url: url,
        headers: headers
    };
    await $.http.get(request)
      .then((resp) => {
        $.data = $.toObj(resp.body).images[0];
        $.urltiny = bing + $.data.url
        $.url = $.urltiny.replace(/&.*/, "");
        $.enddate = $.data.enddate;
        $.date = $.enddate.slice(0,4) + "-" + $.enddate.slice(4,6) + "-" + $.enddate.slice(6);
        $.copyright = $.data.copyright;
        $.copyrightlink = bing + $.data.copyrightlink;
        $.param = {"open-url": $.url,"media-url": $.urltiny};
        $.notify("必应每日壁纸", "", $.enddate + "🎉\n" + $.copyright, $.param);
      })
      .catch((err) => {
        $.error("error‼️" + "\n" + err);
      })

    if ($.env.isNode) {
      const today = `![](${$.url}&w=1000)Today: [${$.copyright}](${$.url})`;
      const addReadme = `![](${$.urltiny})${$.date} [Download UHD](${$.url})`
      const addList = `${$.date} | [${$.copyright}](${$.url})`
      const addJson = {url:$.url,copyright:$.copyright,copyrightlink:$.copyrightlink}
      const fs = require("fs");
      // 写入 README
      fs.existsSync(readme) || fs.writeFileSync(readme,"");
      fs.readFile(readme, 'utf8', (err, content) => {
        if (err) {
          $.error(err);
          return
        }
        if (!content.includes($.date)) {
          fs.writeFileSync(readme,"## Bing Wallpaper\n");
          fs.appendFileSync(readme,"[中文](README.md) | [English](README_en.md)\n\n");
          fs.appendFileSync(readme,today);
          fs.appendFileSync(readme,"\n|      |      |      |");
          fs.appendFileSync(readme,"\n| :----: | :----: | :----: |");
          content = content.replace("## Bing Wallpaper","").replace(/^.*中文.*$/mg, "").replace(/^.*Today.*$/mg, "").replace("|      |      |      |","").replace("| :----: | :----: | :----: |","").replace(/\|/g,"\n").replace(/\n\n/g,"");
          content = addReadme + content;
          content.trim().split('\n').forEach(function(v, i) {
            (i+1)%3==0|(i+2)%3==0 ? fs.appendFileSync(readme,v+"|") : fs.appendFileSync(readme,"\n|"+v+"|");
          })
        }
      })
      // 写入 list
      fs.existsSync(list) || fs.writeFileSync(list,"");
      fs.readFile(list, 'utf8', (err, content) => {
        if (err) {
          $.error(err);
          return
        }
        if (!content.includes($.date)) {
          fs.writeFileSync(list,"## Bing Wallpaper\n");
          fs.appendFileSync(list,"[中文](list.md) | [English](list_en.md)\n\n");
          content = content.replace("## Bing Wallpaper","").replace(/^.*中文.*$\n/mg, "");
          content = addList + content;
          content.trim().split('\n').forEach(function(v, i) {
            fs.appendFileSync(list,v + "\n");
          })
        }
      })
      // 写入 json
      if (josnEN) {
        const en = API("bing_en");
        en.write(addJson,$.enddate);
      } else {
        $.write(addJson,$.enddate);
      }
    }
  }
})().finally(() => {
  $.done();
});

// prettier-ignore
/*********************************** API *************************************/
function ENV(){const t="undefined"!=typeof $task,e="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!e,o="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:t,isLoon:e,isSurge:s,isNode:"function"==typeof require&&!o,isJSBox:o,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(t={baseURL:""}){const{isQX:e,isLoon:s,isSurge:o,isScriptable:i,isNode:n}=ENV(),r=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;const h={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(c=>h[c.toLowerCase()]=(h=>(function(h,c){c="string"==typeof c?{url:c}:c;const l=t.baseURL;l&&!r.test(c.url||"")&&(c.url=l?l+c.url:c.url),c&&c.body&&c.headers&&!c.headers["Content-Type"]&&(c.headers["Content-Type"]="application/x-www-form-urlencoded");const a=(c={...t,...c}).timeout,_={...{onRequest:()=>{},onResponse:t=>t,onTimeout:()=>{}},...c.events};let p,u;if(_.onRequest(h,c),e)p=$task.fetch({method:h,...c});else if(s||o||n)p=new Promise((t,e)=>{(n?require("request"):$httpClient)[h.toLowerCase()](c,(s,o,i)=>{s?e(s):t({statusCode:o.status||o.statusCode,headers:o.headers,body:i})})});else if(i){const t=new Request(c.url);t.method=h,t.headers=c.headers,t.body=c.body,p=new Promise((e,s)=>{t.loadString().then(s=>{e({statusCode:t.response.statusCode,headers:t.response.headers,body:s})}).catch(t=>s(t))})}const d=a?new Promise((t,e)=>{u=setTimeout(()=>(_.onTimeout(),e(`${h} URL: ${c.url} exceeds the timeout ${a} ms`)),a)}):null;return(d?Promise.race([d,p]).then(t=>(clearTimeout(u),t)):p).then(t=>_.onResponse(t))})(c,h))),h}function API(t="untitled",e=!1){const{isQX:s,isLoon:o,isSurge:i,isNode:n,isJSBox:r,isScriptable:h}=ENV();return new class{constructor(t,e){this.name=t,this.debug=e,this.http=HTTP(),this.env=ENV(),n&&(this.isMute=process.env.isMute||this.isMute,this.isMuteLog=process.env.isMuteLog||this.isMuteLog),this.startTime=(new Date).getTime(),console.log(`🔔${t}, 开始!`),this.node=(()=>{if(n){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(t){return this.then(function(e){return((t,e)=>new Promise(function(s){setTimeout(s.bind(null,e),t)}))(t,e)})}}initCache(){if(s&&(this.cache=this.toObj($prefs.valueForKey(this.name)||"{}")),(o||i)&&(this.cache=this.toObj($persistentStore.read(this.name)||"{}")),n){let t="root.json";this.node.fs.existsSync(t)||this.node.fs.writeFileSync(t,this.toStr({}),{flag:"wx"},t=>console.log(t)),this.root={},t=`${this.name}.json`,this.node.fs.existsSync(t)?this.cache=this.toObj(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(t,this.toStr({}),{flag:"wx"},t=>console.log(t)),this.cache={})}}persistCache(){const t=this.toStr(this.cache);s&&$prefs.setValueForKey(t,this.name),(o||i)&&$persistentStore.write(t,this.name),n&&(this.node.fs.writeFileSync(`${this.name}.json`,t,{flag:"w"},t=>console.log(t)),this.node.fs.writeFileSync("root.json",this.toStr(this.root),{flag:"w"},t=>console.log(t)))}write(t,e){if(this.log(`SET ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),i||o)return $persistentStore.write(t,e);if(s)return $prefs.setValueForKey(t,e);n&&(this.root[e]=t)}else this.cache[e]=t;this.persistCache()}read(t){return this.log(`READ ${t}`),-1===t.indexOf("#")?this.cache[t]:(t=t.substr(1),i||o?$persistentStore.read(t):s?$prefs.valueForKey(t):n?this.root[t]:void 0)}delete(t){if(this.log(`DELETE ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),i||o)return $persistentStore.write(null,t);if(s)return $prefs.removeValueForKey(t);n&&delete this.root[t]}else delete this.cache[t];this.persistCache()}notify(t,e="",c="",l={}){const a=l["open-url"],_=l["media-url"];if(!this.isMute){if(s&&$notify(t,e,c,l),i&&$notification.post(t,e,c+`${_?"\n多媒体:"+_:""}`,{url:a}),o){let s={};a&&(s.openUrl=a),_&&(s.mediaUrl=_),"{}"===this.toStr(s)?$notification.post(t,e,c):$notification.post(t,e,c,s)}if(n&&new Promise(async s=>{const o=(e?`${e}\n`:"")+c+(a?`\n点击跳转: ${a}`:"")+(_?"\n多媒体: "+_:"");await this.sendNotify(t,o,{url:a})}),h){const s=c+(a?`\n点击跳转: ${a}`:"")+(_?`\n多媒体: ${_}`:"");if(r){require("push").schedule({title:t,body:(e?e+"\n":"")+s})}else console.log(`${t}\n${e}\n${s}\n\n`)}}if(!this.isMuteLog){let s=["","==============📣系统通知📣=============="];s.push(t),e&&s.push(e),c&&s.push(c),console.log(s.join("\n"))}}sendNotify(t,e,s={}){return new Promise(async o=>{this.querystring=require("querystring"),this.timeout=this.timeout||"15000",e+=this.author||"\n\n仅供用于学习 https://ooxx.be/js",this.setParam(),await Promise.all([this.serverNotify(t,e),this.pushPlusNotify(t,e)]),t=t.match(/.*?(?=\s?-)/g)?t.match(/.*?(?=\s?-)/g)[0]:t,await Promise.all([this.BarkNotify(t,e,s),this.tgBotNotify(t,e),this.ddBotNotify(t,e),this.qywxBotNotify(t,e),this.qywxamNotify(t,e),this.iGotNotify(t,e,s),this.gobotNotify(t,e)])})}setParam(){this.SCKEY=process.env.SCKEY||this.SCKEY,this.PUSH_PLUS_TOKEN=process.env.PUSH_PLUS_TOKEN||this.PUSH_PLUS_TOKEN,this.PUSH_PLUS_USER=process.env.PUSH_PLUS_USER||this.PUSH_PLUS_USER,this.BARK_PUSH=process.env.BARK_PUSH||this.BARK_PUSH,this.BARK_SOUND=process.env.BARK_SOUND||this.BARK_SOUND,this.BARK_GROUP=process.env.BARK_GROUP||"AsVow",this.BARK_PUSH&&!this.BARK_PUSH.includes("http")&&(this.BARK_PUSH=`https://api.day.app/${this.BARK_PUSH}`),this.TG_BOT_TOKEN=process.env.TG_BOT_TOKEN||this.TG_BOT_TOKEN,this.TG_USER_ID=process.env.TG_USER_ID||this.TG_USER_ID,this.TG_PROXY_AUTH=process.env.TG_PROXY_AUTH||this.TG_PROXY_AUTH,this.TG_PROXY_HOST=process.env.TG_PROXY_HOST||this.TG_PROXY_HOST,this.TG_PROXY_PORT=process.env.TG_PROXY_PORT||this.TG_PROXY_PORT,this.TG_API_HOST=process.env.TG_API_HOST||"api.telegram.org",this.DD_BOT_TOKEN=process.env.DD_BOT_TOKEN||this.DD_BOT_TOKEN,this.DD_BOT_SECRET=process.env.DD_BOT_SECRET||this.DD_BOT_SECRET,this.QYWX_KEY=process.env.QYWX_KEY||this.QYWX_KEY,this.QYWX_AM=process.env.QYWX_AM||this.QYWX_AM,this.IGOT_PUSH_KEY=process.env.IGOT_PUSH_KEY||this.IGOT_PUSH_KEY,this.GOBOT_URL=process.env.GOBOT_URL||this.GOBOT_URL,this.GOBOT_TOKEN=process.env.GOBOT_TOKEN||this.GOBOT_TOKEN,this.GOBOT_QQ=process.env.GOBOT_QQ||this.GOBOT_QQ}serverNotify(t,e,s=2100){return new Promise(o=>{if(this.SCKEY){e=e.replace(/[\n\r]/g,"\n\n");const i={url:this.SCKEY.includes("SCT")?`https://sctapi.ftqq.com/${this.SCKEY}.send`:`https://sc.ftqq.com/${this.SCKEY}.send`,body:`text=${t}&desp=${e}`,headers:{"Content-Type":"application/x-www-form-urlencoded"},timeout:this.timeout};setTimeout(()=>{this.http.post(i).then(t=>{const e=this.toObj(t.body);0===e.errno||0===e.data.errno?console.log("server酱发送通知消息成功🎉\n"):1024===e.errno?console.log(`server酱发送通知消息异常: ${e.errmsg}\n`):console.log(`server酱发送通知消息异常\n${this.toStr(e)}`)}).catch(t=>{console.log("server酱发送通知调用API失败！！\n"),this.error(t)}).finally(()=>{o()})},s)}else o()})}pushPlusNotify(t,e){return new Promise(s=>{if(this.PUSH_PLUS_TOKEN){e=e.replace(/[\n\r]/g,"<br>");const o={token:`${this.PUSH_PLUS_TOKEN}`,title:`${t}`,content:`${e}`,topic:`${this.PUSH_PLUS_USER}`},i={url:"https://www.pushplus.plus/send",body:this.toStr(o),headers:{"Content-Type":" application/json"},timeout:this.timeout};this.http.post(i).then(t=>{const e=this.toObj(t.body);200===e.code?console.log(`push+发送${this.PUSH_PLUS_USER?"一对多":"一对一"}通知消息完成。\n`):console.log(`push+发送${this.PUSH_PLUS_USER?"一对多":"一对一"}通知消息失败：${e.msg}\n`)}).catch(t=>{console.log(`push+发送${this.PUSH_PLUS_USER?"一对多":"一对一"}通知消息失败！！\n`),this.error(t)}).finally(()=>{s()})}else s()})}BarkNotify(t,e,s={}){return new Promise(o=>{if(this.BARK_PUSH){const i={url:`${this.BARK_PUSH}/${encodeURIComponent(t)}/${encodeURIComponent(e)}?sound=${this.BARK_SOUND}&group=${this.BARK_GROUP}&${this.querystring.stringify(s)}`,headers:{"Content-Type":"application/x-www-form-urlencoded"},timeout:this.timeout};this.http.get(i).then(t=>{const e=this.toObj(t.body);200===e.code?console.log("Bark APP发送通知消息成功🎉\n"):console.log(`${e.message}\n`)}).catch(t=>{console.log("Bark APP发送通知调用API失败！！\n"),this.error(t)}).finally(()=>{o()})}else o()})}tgBotNotify(t,e){return new Promise(s=>{if(this.TG_BOT_TOKEN&&this.TG_USER_ID){const o={url:`https://${this.TG_API_HOST}/bot${this.TG_BOT_TOKEN}/sendMessage`,body:`chat_id=${this.TG_USER_ID}&text=${t}\n\n${e}&disable_web_page_preview=true`,headers:{"Content-Type":"application/x-www-form-urlencoded"},timeout:this.timeout};if(this.TG_PROXY_HOST&&this.TG_PROXY_PORT){const t={host:this.TG_PROXY_HOST,port:1*this.TG_PROXY_PORT,proxyAuth:this.TG_PROXY_AUTH};Object.assign(o,{proxy:t})}this.http.post(o).then(t=>{const e=this.toObj(t.body);e.ok?console.log("Telegram发送通知消息成功🎉。\n"):400===e.error_code?console.log("请主动给bot发送一条消息并检查接收用户ID是否正确。\n"):401===e.error_code&&console.log("Telegram bot token 填写错误。\n")}).catch(t=>{console.log("Telegram发送通知消息失败！！\n"),this.error(t)}).finally(()=>{s()})}else s()})}ddBotNotify(t,e){return new Promise(s=>{const o={url:`https://oapi.dingtalk.com/robot/send?access_token=${this.DD_BOT_TOKEN}`,json:{msgtype:"text",text:{content:` ${t}\n\n${e}`}},headers:{"Content-Type":"application/json"},timeout:this.timeout};if(this.DD_BOT_TOKEN&&this.DD_BOT_SECRET){const t=require("crypto"),e=Date.now(),i=t.createHmac("sha256",this.DD_BOT_SECRET);i.update(`${e}\n${this.DD_BOT_SECRET}`);const n=encodeURIComponent(i.digest("base64"));o.url=`${o.url}&timestamp=${e}&sign=${n}`,this.http.post(o).then(t=>{const e=this.toObj(t.body);0===e.errcode?console.log("钉钉发送通知消息成功🎉。\n"):console.log(`${e.errmsg}\n`)}).catch(t=>{console.log("钉钉发送通知消息失败！！\n"),this.error(t)}).finally(()=>{s()})}else this.DD_BOT_TOKEN?this.http.post(o).then(t=>{const e=this.toObj(t.body);0===e.errcode?console.log("钉钉发送通知消息完成。\n"):console.log(`${e.errmsg}\n`)}).catch(t=>{console.log("钉钉发送通知消息失败！！\n"),this.error(t)}).finally(()=>{s()}):s()})}qywxBotNotify(t,e){return new Promise(s=>{const o={url:`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${this.QYWX_KEY}`,json:{msgtype:"text",text:{content:` ${t}\n\n${e}`}},headers:{"Content-Type":"application/json"},timeout:this.timeout};this.QYWX_KEY?this.http.post(o).then(t=>{const e=this.toObj(t.body);0===e.errcode?console.log("企业微信发送通知消息成功🎉。\n"):console.log(`${e.errmsg}\n`)}).catch(t=>{console.log("企业微信发送通知消息失败！！\n"),this.error(t)}).finally(()=>{s()}):s()})}ChangeUserId(t){if(this.QYWX_AM_AY=this.QYWX_AM.split(","),this.QYWX_AM_AY[2]){const e=this.QYWX_AM_AY[2].split("|");let s="";for(let o=0;o<e.length;o++){const i="签到号 "+(o+1);t.match(i)&&(s=e[o])}return s||(s=this.QYWX_AM_AY[2]),s}return"@all"}qywxamNotify(t,e){return new Promise(s=>{if(this.QYWX_AM){this.QYWX_AM_AY=this.QYWX_AM.split(",");const o={url:"https://qyapi.weixin.qq.com/cgi-bin/gettoken",json:{corpid:`${this.QYWX_AM_AY[0]}`,corpsecret:`${this.QYWX_AM_AY[1]}`},headers:{"Content-Type":"application/json"},timeout:this.timeout};let i;this.http.post(o).then(s=>{const o=e.replace(/\n/g,"<br/>"),n=this.toObj(s.body).access_token;switch(this.QYWX_AM_AY[4]){case"0":i={msgtype:"textcard",textcard:{title:`${t}`,description:`${e}`,url:"https://ooxx.be/js",btntxt:"更多"}};break;case"1":i={msgtype:"text",text:{content:`${t}\n\n${e}`}};break;default:i={msgtype:"mpnews",mpnews:{articles:[{title:`${t}`,thumb_media_id:`${this.QYWX_AM_AY[4]}`,author:"智能助手",content_source_url:"",content:`${o}`,digest:`${e}`}]}}}this.QYWX_AM_AY[4]||(i={msgtype:"text",text:{content:`${t}\n\n${e}`}}),i={url:`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${n}`,json:{touser:`${this.ChangeUserId(e)}`,agentid:`${this.QYWX_AM_AY[3]}`,safe:"0",...i},headers:{"Content-Type":"application/json"}}}),this.http.post(i).then(t=>{const s=this.toObj(s);0===s.errcode?console.log("成员ID:"+this.ChangeUserId(e)+"企业微信应用消息发送通知消息成功🎉。\n"):console.log(`${s.errmsg}\n`)}).catch(t=>{console.log("成员ID:"+this.ChangeUserId(e)+"企业微信应用消息发送通知消息失败！！\n"),this.error(t)}).finally(()=>{s()})}else s()})}iGotNotify(t,e,s={}){return new Promise(o=>{if(this.IGOT_PUSH_KEY){if(this.IGOT_PUSH_KEY_REGX=new RegExp("^[a-zA-Z0-9]{24}$"),!this.IGOT_PUSH_KEY_REGX.test(this.IGOT_PUSH_KEY))return console.log("您所提供的IGOT_PUSH_KEY无效\n"),void o();const i={url:`https://push.hellyw.com/${this.IGOT_PUSH_KEY.toLowerCase()}`,body:`title=${t}&content=${e}&${this.querystring.stringify(s)}`,headers:{"Content-Type":"application/x-www-form-urlencoded"},timeout:this.timeout};this.http.post(i).then(t=>{const e=this.toObj(t.body);0===e.ret?console.log("iGot发送通知消息成功🎉\n"):console.log(`iGot发送通知消息失败：${e.errMsg}\n`)}).catch(t=>{console.log("iGot发送通知调用API失败！！\n"),this.error(t)}).finally(()=>{o()})}else o()})}gobotNotify(t,e,s=2100){return new Promise(o=>{if(this.GOBOT_URL){const i={url:`${this.GOBOT_URL}?access_token=${this.GOBOT_TOKEN}&${this.GOBOT_QQ}`,body:`message=${t}\n${e}`,headers:{"Content-Type":"application/x-www-form-urlencoded"},timeout:this.timeout};setTimeout(()=>{this.http.post(i).then(t=>{const e=this.toObj(t.body);0===e.retcode?console.log("go-cqhttp发送通知消息成功🎉\n"):100===e.retcode?console.log(`go-cqhttp发送通知消息异常: ${e.errmsg}\n`):console.log(`go-cqhttp发送通知消息异常\n${this.toStr(e)}`)}).catch(t=>{console.log("发送go-cqhttp通知调用API失败！！\n"),this.error(t)}).finally(()=>{o()})},s)}else o()})}log(t){this.debug&&console.log(`[${this.name}] LOG:\n${this.toStr(t)}`)}info(t){console.log(`[${this.name}] INFO:\n${this.toStr(t)}`)}error(t){console.log(`[${this.name}] ERROR:\n${this.toStr(t)}`)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=((new Date).getTime()-this.startTime)/1e3;console.log(`🔔${this.name}, 结束! 🕛 ${e} 秒`),s||o||i?$done(t):n&&!r&&"undefined"!=typeof $context&&($context.headers=t.headers,$context.statusCode=t.statusCode,$context.body=t.body)}toObj(t){if("object"==typeof t||t instanceof Object)return t;try{return JSON.parse(t)}catch(e){return t}}toStr(t){if("string"==typeof t||t instanceof String)return t;try{return JSON.stringify(t)}catch(e){return t}}}(t,e)}
/*****************************************************************************/