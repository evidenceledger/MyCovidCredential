if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise((async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()}))),s.then((()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]}))},s=(s,r)=>{Promise.all(s.map(e)).then((e=>r(1===e.length?e[0]:e)))},r={require:Promise.resolve(s)};self.define=(s,i,c)=>{r[s]||(r[s]=Promise.resolve().then((()=>{let r={};const n={uri:location.origin+s.slice(1)};return Promise.all(i.map((s=>{switch(s){case"exports":return r;case"module":return n;default:return e(s)}}))).then((e=>{const s=c(...e);return r.default||(r.default=s),r}))})))}}define("./sw.js",["./workbox-3b5792f5"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"apple-touch-icon.png",revision:"9aac7ef2ff1f9bbe66e043e8edd7ae3c"},{url:"assets/all_pages.3c84e1a7.js",revision:"5c90db00b22279a60b3bc1777bdaa128"},{url:"assets/cwt.f50405f8.js",revision:"91be8a52bd86cc95a5f9f92766743be0"},{url:"assets/index.b729402e.js",revision:"0bc9078af4c6bf9f9be6b87c721ab378"},{url:"assets/index.d3fc15e0.css",revision:"19a2fb47eb4237a27934d396285aca5e"},{url:"assets/workbox-window.prod.es5.73a2a4cf.js",revision:"786692479fa3c4f791eb2ba6ec2b3f74"},{url:"favicon.ico",revision:"0eb6a3e58fb0f61f080bfd48d9be4a2d"},{url:"icon-152.png",revision:"9aac7ef2ff1f9bbe66e043e8edd7ae3c"},{url:"icon-192.png",revision:"3e20c90593da8a23862b10ee63386454"},{url:"icon-512.png",revision:"818e855ee6105104764c0388190afac9"},{url:"index.html",revision:"66299362dece48577d086721434dbb2a"},{url:"manifest.webmanifest",revision:"62287756331395d85c8aecab6dcb762d"},{url:"notavailable.html",revision:"4710c4390943e5a6eb0356efe30ef887"},{url:"VERSION.txt",revision:"ce663e42eda625369dbc731e1436eb4c"}],{})}));
//# sourceMappingURL=sw.js.map
