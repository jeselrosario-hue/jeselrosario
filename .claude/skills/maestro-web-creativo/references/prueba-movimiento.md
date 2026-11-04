# Prueba de que el sitio SÍ se mueve (sin necesidad de visión)

Úsala antes de entregar. Corre con `NODE_PATH=$(npm root -g) node prueba.js` (o desde el venv de Playwright de Hermes). Ajusta `url`.

```js
const {chromium}=require('playwright');const crypto=require('crypto');
const url='file:///RUTA/sitio-un-archivo.html';
(async()=>{const b=await chromium.launch();
for(const rm of ['no-preference','reduce']){
 const ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:rm});const p=await ctx.newPage();
 const errs=[],ext=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
 p.on('request',r=>{const u=r.url();if(!/^(file|data|blob):/.test(u))ext.push(u)});
 await p.goto(url);await p.waitForTimeout(1500);
 const info=await p.evaluate(()=>({anims:document.getAnimations().filter(a=>a.playState==='running').length,
  imgs:[...document.images].filter(i=>i.naturalWidth>0).length+'/'+document.images.length,H:document.documentElement.scrollHeight}));
 const hs=[];for(let i=0;i<8;i++){await p.evaluate(y=>scrollTo(0,y),Math.round(info.H*i/9));await p.waitForTimeout(800);
  hs.push(crypto.createHash('md5').update(await p.screenshot()).digest('hex').slice(0,8))}
 console.log(rm,info,'capturas distintas:',new Set(hs).size+'/8','errores:',errs,'externos:',ext);await ctx.close()}
await b.close()})();
```

Criterios para aprobar:
- `anims` mayor que 0 en AMBOS modos (si es 0 en `reduce`, repite el fallo de la v5).
- Capturas distintas: 8/8 (o al menos 7/8).
- `errores` y `externos` vacíos; imágenes `N/N`.
- Elementos con vida propia: compara el `style.transform` de las letras o del letrero en dos instantes (0.7 s) sin mover el mouse: deben cambiar.
- Video: `video.paused === false` (portada) y `currentTime` distinto tras hacer scroll (scrub).
- Móvil: `document.documentElement.scrollWidth - innerWidth === 0` con `devices['iPhone 13']`.
