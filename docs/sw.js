if(!self.define){let e,i={};const s=(s,c)=>(s=new URL(s+".js",c).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(c,f)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(i[n])return;let r={};const o=e=>s(e,n),d={module:{uri:n},exports:r,require:o};i[n]=Promise.all(c.map((e=>d[e]||o(e)))).then((e=>(f(...e),r)))}}define(["./workbox-873c5e43"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"apple-touch-icon.png",revision:"63a30637dfaf54fda8fef38245d8c90b"},{url:"assets/all_pages.66652b59.js",revision:"08527d3c7befb1a602021bee7c952b3a"},{url:"assets/index.297ccd33.js",revision:"10ee0bf74f941ce87a9b2cdab0fc2b6c"},{url:"assets/index.8ea34325.css",revision:"4092cc04b6c6827899440055b2da1e3a"},{url:"assets/vendor.0cd60d42.js",revision:"117f718b081d0a68edc3c6fe0a8e75e8"},{url:"assets/workbox-window.prod.es5.a2fa118e.js",revision:"336c20b8c52e7fe192657bd4f83e6a6f"},{url:"favicon.ico",revision:"0eb6a3e58fb0f61f080bfd48d9be4a2d"},{url:"favicon.png",revision:"ec6eb3925f43d2f9eaacbfc6a7756934"},{url:"icon-152.png",revision:"63a30637dfaf54fda8fef38245d8c90b"},{url:"icon-192.png",revision:"c896e58149355fd82cf8c41053bfcbc8"},{url:"icon-512.png",revision:"9a89e31d4c14fffe9a66a88236df507e"},{url:"index.html",revision:"eee36918e79106d4b074fd5ebb7f03c2"},{url:"manifest.webmanifest",revision:"3ed7fdb2e7aa729b6c3c68899d58441a"}],{})}));
//# sourceMappingURL=sw.js.map
