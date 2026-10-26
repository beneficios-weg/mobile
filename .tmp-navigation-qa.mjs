import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {spawn} from 'node:child_process'
import assert from 'node:assert/strict'
const output=await fs.mkdtemp(path.join(os.tmpdir(),'mobile-navigation-qa-'))
console.log(output)
const profile=path.join(output,'profile')
const chrome=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'})
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))
let ws
const errors=[]
try{
 let port
 for(let i=0;i<100;i++){try{port=(await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break}catch{await sleep(100)}}
 assert(port)
 const tabs=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()
 ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl)
 await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}))
 let id=0;const pending=new Map()
 ws.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params);const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(m.error):p.resolve(m.result)}})
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;const timer=setTimeout(()=>reject(new Error(method)),15000);pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params}))})
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value}
 const wait=async(expression)=>{for(let i=0;i<100;i++){if(errors.length)throw new Error(JSON.stringify(errors));if(await ev(expression))return;await sleep(100)}throw new Error(`Timeout ${expression}`)}
 const page=async(route,selector)=>{await send('Page.navigate',{url:`http://localhost:5174${route}`});await wait(`!!document.querySelector(${JSON.stringify(selector)})`);await sleep(150)}
 const click=async selector=>{await ev(`document.querySelector(${JSON.stringify(selector)}).click()`);await sleep(100)}
 const input=async(selector,value)=>{await ev(`{const el=document.querySelector(${JSON.stringify(selector)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}))}`);await sleep(100)}
 const isPage=async(selector)=>{await wait(`!!document.querySelector(${JSON.stringify(selector)})`);await sleep(150)}
 const shot=async(name)=>{const s=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(output,`${name}.png`),Buffer.from(s.data,'base64'))}
 const history=async(direction,selector)=>{await ev(`window.history.${direction}()`);await isPage(selector)}
 await send('Page.enable');await send('Runtime.enable')
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false})
 await page('/','.main-page')
 await ev(`window.navigationTestToken='same-document'`)
 await click('.main-page__login');await isPage('.login-page')
 assert.match(await ev(`document.querySelector('.form-notice').textContent`),/sem autenticação real/)
 await input('#login-email','teste@weg.net');await input('#login-password','exemplo')
 await ev(`document.querySelector('form').requestSubmit()`);await isPage('.main-page')
 assert.equal(await ev('window.navigationTestToken'),'same-document','SPA navigation')
 console.log('Login preview and SPA transition: OK')
 const categorySlugs=['clientes-weg','educacao','idiomas','cursos-e-treinamentos','saude-e-bem-estar','lazer','estetica-e-vestuario']
 for(let index=0;index<categorySlugs.length;index++){
  await ev(`document.querySelectorAll('.category-button')[${index}].click()`)
  await isPage('.category-page')
  assert.equal(await ev('location.pathname'),`/categoria/${categorySlugs[index]}`)
  if(index>=5)assert.equal(await ev(`document.querySelectorAll('.directory-card').length`),0)
  await click('.directory-map-header .back-button');await isPage('.main-page')
 }
 console.log('All seven category routes and returns: OK')
 await click('.category-button[data-tone="coral"]');await isPage('.category-page')
 await input('.search-field input','Academia')
 await click('.filter-button');await ev(`document.querySelectorAll('.filter-dropdown__option input')[2].click()`);await click('.filter-dropdown__apply')
 assert.equal(await ev(`document.querySelectorAll('.directory-card').length`),2)
 await click('.directory-card .favorite-toggle')
 const favoriteName=await ev(`document.querySelector('.directory-card__content strong').textContent`)
 await click('.directory-card__main');await isPage('.establishment-page')
 assert.equal(await ev(`document.querySelector('.establishment-page__header h1').textContent`),favoriteName)
 assert.equal(await ev(`document.querySelector('.favorite-toggle').getAttribute('aria-pressed')`),'true')
 await shot('390-detail')
 await click('.establishment-page__header .back-button');await isPage('.category-page')
 assert.equal(await ev(`document.querySelector('.search-field input').value`),'Academia')
 assert.equal(await ev(`document.querySelectorAll('.directory-card').length`),2)
 assert.match(await ev(`document.querySelector('.filter-button').textContent`),/Maior Desconto/)
 await history('forward','.establishment-page')
 await history('back','.category-page')
 console.log('Cards, correct details, favorites and browser back/forward with filters: OK')
 await click('.floating-tabs [aria-label="Favoritos"]');await isPage('.favorites-page')
 assert.equal(await ev(`document.querySelectorAll('.directory-card').length`),9)
 await input('.search-field input','Clínica')
 const name=await ev(`document.querySelector('.directory-card__content strong').textContent`)
 await click('.directory-card__main');await isPage('.establishment-page')
 assert.equal(await ev(`document.querySelector('.establishment-page__header h1').textContent`),name)
 assert.equal(await ev(`document.querySelector('a.establishment-facade-card__contact')===null`),true,'No invalid telephone link for missing contact')
 await click('.establishment-page__header .back-button');await isPage('.favorites-page')
 assert.equal(await ev(`document.querySelector('.search-field input').value`),'Clínica')
 await input('.search-field input','')
 await click('.directory-card .favorite-toggle')
 assert.equal(await ev(`document.querySelectorAll('.directory-card').length`),8)
 console.log('Favorites list, independent details and removal retained across routes: OK')
 await click('.floating-tabs [aria-label="Histórico"]');await isPage('.visited-page')
 assert.equal(await ev(`document.querySelectorAll('.directory-card').length`),8)
 await click('.directory-card__main');await isPage('.establishment-page')
 await click('.establishment-page__header .back-button');await isPage('.visited-page')
 await click('.floating-tabs [aria-label="Mapa"]');await isPage('dialog.map-dialog[open]')
 assert.equal(await ev('location.pathname'),'/visitados','Map expands without a new route')
 assert.equal(await ev(`document.querySelector('.map-dialog').contains(document.activeElement)`),true,'Modal owns keyboard focus')
 await shot('390-map')
 await history('back','.visited-page')
 await wait(`!document.querySelector('.map-dialog')`)
 await history('forward','dialog.map-dialog[open]')
 await click('.map-dialog .back-button');await wait(`!document.querySelector('.map-dialog')`)
 assert.equal(await ev('location.pathname'),'/visitados')
 console.log('Map modal, focus, same URL and browser back/forward: OK')
 await click('.floating-tabs [aria-label="Mapa"]');await isPage('dialog.map-dialog[open]')
 await click('.map-dialog .leaflet-marker-icon');await isPage('.map-dialog .map-popup-action')
 await click('.map-dialog .map-popup-action');await isPage('.establishment-page')
 assert.equal(await ev(`!!document.querySelector('.map-dialog')`),false)
 await click('.establishment-page__header .back-button');await isPage('.visited-page')
 assert.equal(await ev(`!!document.querySelector('.map-dialog')`),false,'Detail return skips closed map entry')
 console.log('Map popup to correct details and back to its source: OK')
 for(const[route,selector]of[['/login','.login-page'],['/categoria/nao-existe','.not-found-page'],['/estabelecimento/nao-existe','.not-found-page'],['/rota-inexistente','.not-found-page'],['/visitados/','.visited-page'],['/estabelecimento/academia-move','.establishment-page'],['/componentes-preview','.component-preview']])await page(route,selector)
 await click('.preview-header .back-button');await isPage('.main-page')
 console.log('Deep links, trailing slash, unknown routes and gallery return: OK')
 for(const[width,height]of[[390,844],[844,390],[834,1194],[1194,834]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false})
  for(const[route,selector]of[['/','.main-page'],['/categoria/saude-e-bem-estar','.category-page'],['/favoritos','.favorites-page'],['/visitados','.visited-page'],['/estabelecimento/academia-move','.establishment-page']]){
   await page(route,selector)
   assert.equal(await ev('document.documentElement.scrollWidth'),width,`No overflow ${width} ${route}`)
   await click('.floating-tabs [aria-label="Mapa"]');await isPage('dialog.map-dialog[open]')
   const box=await ev(`(()=>{const r=document.querySelector('.map-dialog').getBoundingClientRect();return{w:r.width,h:r.height}})()`)
   assert.equal(box.w,width);assert.equal(box.h,height)
   await click('.map-dialog .back-button');await wait(`!document.querySelector('.map-dialog')`)
   await shot(`${width}x${height}-${selector.slice(1)}`)
  }
  console.log(`${width}x${height}: all five layouts and map dialogs OK`)
 }
 assert.equal(errors.length,0,JSON.stringify(errors))
 console.log(JSON.stringify({output,runtimeErrors:errors.length}))
}finally{await fs.writeFile(path.join(output,'errors.json'),JSON.stringify(errors,null,2));ws?.close();chrome.kill()}
