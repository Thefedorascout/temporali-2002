// Main orchestrator: game state, simulation loop, player interaction, user interface and audio.
(() => {
'use strict';
if (!window.THREE) { const screen=document.getElementById('startScreen'); screen.innerHTML='<div style="max-width:600px;color:#e8f0eb;font-family:Tahoma,Arial,sans-serif;line-height:1.6"><div style="font-size:12px;letter-spacing:.15em;color:#d0e9a7">TEMPORALI · AVVIO NON RIUSCITO</div><h1 style="font-size:32px">Motore 3D non caricato</h1><p>Il gioco non riesce a scaricare Three.js. Apri il file HTML in Chrome o Edge con Internet attivo; se lo stai visualizzando in un’anteprima, scaricalo prima e aprilo come file locale.</p><button id="reloadStartup" style="padding:12px 16px;background:#d0e9a7;color:#172119;border:0;cursor:pointer">RICARICA</button></div>'; document.getElementById('reloadStartup').addEventListener('click',()=>location.reload()); return; }
try {
const { $, clamp, lerp, rand, choose, dist, fmt, euros } = window.TemporaliUtils;
const CONFIG = window.TemporaliConfig;
const world = window.TemporaliWorld.create({THREE, utils:window.TemporaliUtils});
const {scene,camera,renderer,hemi,sun,groundMat,box,cyl,towns,townByName,townUrbanRadius,heightAt,rawTerrainHeight,inLake,lakeLevel,nearestTown,roadSegments,roadBetween,buildingBoxes,sharedMats,homeTown,homeX,homeZ,homeGroup,updateFoliage,addTreeAt} = world;
const floorMat=new THREE.MeshStandardMaterial({color:0x8c806b,roughness:1});const floor=box(homeGroup,12,.24,11,floorMat,0,.12,0);box(homeGroup,12,3.1,.3,sharedMats.wall2,0,1.55,-5.4);box(homeGroup,.3,3.1,11,sharedMats.wall2,-6,1.55,0);box(homeGroup,.3,3.1,11,sharedMats.wall2,6,1.55,0);
// Complete front facade with a sensible doorway, plus a full-height rear wall (not just a narrow top beam).
box(homeGroup,3.85,2.78,.3,sharedMats.wall2,-4.08,1.45,5.4);box(homeGroup,3.85,2.78,.3,sharedMats.wall2,4.08,1.45,5.4);box(homeGroup,1.15,2.45,.3,sharedMats.wall2,-1.58,1.23,5.4);box(homeGroup,1.15,2.45,.3,sharedMats.wall2,1.58,1.23,5.4);box(homeGroup,2.3,.3,.3,sharedMats.wall2,0,2.96,5.4);box(homeGroup,.16,2.45,.2,sharedMats.white,-1.04,1.23,5.25);box(homeGroup,.16,2.45,.2,sharedMats.white,1.04,1.23,5.25);
const homeDoorPivot=new THREE.Group();homeDoorPivot.position.set(-.95,0,5.22);homeDoorPivot.rotation.y=-.78;homeGroup.add(homeDoorPivot);box(homeDoorPivot,1.86,2.35,.13,sharedMats.roof2,.93,1.18,0);box(homeDoorPivot,.08,.08,.08,sharedMats.concrete,1.62,1.2,.08);
// gable roof planes
const roofA=box(homeGroup,6.5,.25,11.5,sharedMats.roof,-2.8,3.95,0,0,0,.22);const roofB=box(homeGroup,6.5,.25,11.5,sharedMats.roof,2.8,3.95,0,0,0,-.22);roofA.castShadow=false;roofB.castShadow=false;
// kitchen table / desk / laptop / mug / chair
box(homeGroup,3.1,.16,1.45,sharedMats.roof2,-2.3,1.05,-2.8);for(const dx of [-1.3,1.3])for(const dz of [-.5,.5])box(homeGroup,.12,1.0,.12,sharedMats.black,-2.3+dx,.5,-2.8+dz);
box(homeGroup,1.45,.1,.95,sharedMats.black,-2.3,1.28,-2.8);box(homeGroup,1.34,.08,.84,sharedMats.glass,-2.3,1.34,-2.8);box(homeGroup,1.25,.05,.75,sharedMats.white,-2.3,1.39,-2.8);
// laptop display (emissive enough to spot when at the table)
const laptopScreenMat=new THREE.MeshStandardMaterial({color:0x183439,emissive:0x163b3c,emissiveIntensity:.5,roughness:.35});box(homeGroup,.82,.54,.04,laptopScreenMat,-2.3,1.72,-2.95,-.12,0,0);box(homeGroup,.96,.055,.64,sharedMats.concrete,-2.3,1.43,-2.8);
cyl(homeGroup,.11,.11,.2,sharedMats.black,-3.0,1.48,-2.35,0,0,0,12);
// sofa and shelf
box(homeGroup,2.8,.65,1,sharedMats.roof2,2.8,.42,1.1);box(homeGroup,2.8,.75,.22,sharedMats.roof2,2.8,.85,.7);box(homeGroup,2.5,.13,1,sharedMats.interior,2.8,.78,1.05);
box(homeGroup,2.5,2.1,.4,sharedMats.roof2,3.8,1.05,-4.2);for(let j=0;j<4;j++)box(homeGroup,2.2,.07,.45,sharedMats.wall2,3.8,.45+j*.46,-3.96);
// window frames on side walls
for(const wz of [-1.2,2.3]){box(homeGroup,.16,1.1,1.4,sharedMats.glass,-5.8,2.0,wz);box(homeGroup,.19,.1,1.55,sharedMats.white,-5.8,2.0,wz);box(homeGroup,.19,1.25,.1,sharedMats.white,-5.8,2.0,wz);}
// Front step and exterior stoop
box(homeGroup,3,.18,1.4,sharedMats.concrete,0,.09,6.0);
const {carRoot,wheels,car} = window.TemporaliVehicle.create({THREE,scene,homeX,homeZ,heightAt,sharedMats,box,cyl,rand});
// driveway from stoop to the lane
roadBetween({x:homeX,z:homeZ+14},{x:homeX+100,z:homeZ+70},4.3);
// city-square hotspots and their modest 2002 internet cafés
const hotspots=towns.filter(t=>['Brescia','Mantova','Desenzano del Garda','Montichiari','Lumezzane','Suzzara','Castiglione delle Stiviere','Viadana','Iseo','Darfo Boario Terme','Rovato'].includes(t.name)).map(t=>({x:t.x+28,z:t.z+15,name:t.name}));
for(const h of hotspots){const y=heightAt(h.x,h.z);const post=new THREE.Group();post.position.set(h.x,y,h.z);cyl(post,.12,.16,1.5,sharedMats.concrete,0,.75,0,0,0,0,8);box(post,.8,.4,.12,new THREE.MeshStandardMaterial({color:0x325b45,emissive:0x193b2a,emissiveIntensity:.2}),0,1.5,0);scene.add(post);}
// dynamic storm cells and their layered cloud towers
const {storms,makeStorm} = window.TemporaliStorms.create({THREE,scene,rand});
// player state starts at a different randomly chosen Brescian home each new run
const player={x:homeX-.25,z:homeZ-2.0,yaw:Math.PI,pitch:0,walkSpeed:5.2,running:false,inside:true};
const firstStorm=makeStorm(homeX+rand(-2100,2100),homeZ+rand(-2200,2200),.88,'supercell');
for(let i=0;i<5;i++){const t=choose(towns);makeStorm(t.x+rand(-3500,3500),t.z+rand(-3500,3500),rand(.35,.8),Math.random()<.55?'supercell':'cell');}
// add a few lake/valley mist banks that react visually to dampness
const mistMat=new THREE.MeshStandardMaterial({color:0xcbd7d3,transparent:true,opacity:.12,roughness:1,depthWrite:false});const mistPatches=[];for(let i=0;i<25;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),mistMat);const t=choose(towns.filter(v=>v.kind==='lake'||v.kind==='plain'));m.position.set(t.x+rand(-1200,1200),heightAt(t.x,t.z)+rand(30,80),t.z+rand(-1200,1200));m.scale.set(rand(150,500),rand(15,40),rand(150,400));scene.add(m);mistPatches.push(m);}
// procedural rain ribbons, updated around the active observer
const rainCount=2300;const rainPositions=new Float32Array(rainCount*6);const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPositions,3));const rainMat=new THREE.LineBasicMaterial({color:0xd5e4e7,transparent:true,opacity:.34,depthWrite:false});const rainLines=new THREE.LineSegments(rainGeo,rainMat);scene.add(rainLines);const rainDrops=[];for(let i=0;i<rainCount;i++){rainDrops.push({x:rand(-55,55),y:rand(0,65),z:rand(-55,55),v:rand(20,36)});}
// handheld MiniDV camcorder: visible when equipped
const camProp=new THREE.Group();const camBodyMat=new THREE.MeshStandardMaterial({color:0x343c3d,roughness:.5,metalness:.45});box(camProp,.31,.23,.48,camBodyMat,0,0,0);box(camProp,.27,.16,.23,sharedMats.black,0,.02,-.23);cyl(camProp,.09,.09,.16,sharedMats.black,0,-.005,-.34,Math.PI/2,0,0,16);cyl(camProp,.055,.055,.18,new THREE.MeshStandardMaterial({color:0x466b76,metalness:.4,roughness:.18}),0,-.005,-.43,Math.PI/2,0,0,16);box(camProp,.15,.04,.15,sharedMats.black,-.05,.14,-.04);camProp.position.set(.43,-.38,-.8);camera.add(camProp);camProp.visible=false;
const game={started:false,paused:false,seconds:16*3600+10*60,rate:CONFIG.simulationRate,weather:0,wind:4,rain:0,cloudCover:.35,humidity:61,pressure:1014,cash:CONFIG.initialCash,rollMinutes:60,laptopBattery:CONFIG.startingBatteryPercent,camBattery:100,focus:.78,steady:1,lensDirt:0,cameraEquipped:false,recording:false,recordStarted:0,recordTime:0,clips:[],reports:[],nextCitizenReport:210,nextFlash:rand(24,50),flashTimer:0,uploaded:0,totalEarned:0,subscriptions:{pro:false},upgrades:{lens:false,strap:false,tripod:false,battery:false},waypoint:null,waypointName:'',laptopOpen:false,mapOpen:false,notificationTimer:0,radio:false,activeTab:'radar',lastWifi:'Casa',nearbyText:'Casa · 2002',inWifi:true,task:'Raggiungi un punto temporalesco e registra il tuo primo filmato.',clipId:0};
// Initial public report represents an observation made five in-game minutes earlier.
const initialLoc=nearestTown(firstStorm.x,firstStorm.z).town;game.reports.push({id:1,x:firstStorm.x,z:firstStorm.z,town:initialLoc.name,headline:choose(['Nube a mensola in avvicinamento','Raffiche improvvise e cielo verdastro','Fulmini nube-terra molto frequenti','Pioggia intensa, visibilità in calo']),details:'Segnalazione di un residente. Fronte in rapido avvicinamento; osservazione sul posto da verificare.',severity:'FORTE',observedAt:-300,readyAt:-1,status:'ready'});
let lastTime=performance.now(),frame=0,windNoise=null,audioCtx=null,rainGain=null,noiseSource=null;const keys={};
function startAudio(){if(audioCtx)return;try{audioCtx=new (window.AudioContext||window.webkitAudioContext)();const len=audioCtx.sampleRate*2;const buffer=audioCtx.createBuffer(1,len,audioCtx.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*.35;noiseSource=audioCtx.createBufferSource();noiseSource.buffer=buffer;noiseSource.loop=true;const filter=audioCtx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=900;rainGain=audioCtx.createGain();rainGain.gain.value=0;noiseSource.connect(filter);filter.connect(rainGain);rainGain.connect(audioCtx.destination);noiseSource.start();}catch(e){}}
function thunderSound(delay=0){if(!audioCtx)return;const start=audioCtx.currentTime+delay;const osc=audioCtx.createOscillator();const gain=audioCtx.createGain();const lp=audioCtx.createBiquadFilter();osc.type='sawtooth';osc.frequency.setValueAtTime(rand(38,64),start);osc.frequency.exponentialRampToValueAtTime(23,start+2.3);lp.type='lowpass';lp.frequency.value=160;gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.16,start+.12);gain.gain.exponentialRampToValueAtTime(.0001,start+3.5);osc.connect(lp);lp.connect(gain);gain.connect(audioCtx.destination);osc.start(start);osc.stop(start+3.6);}
function notify(txt,kind=''){const el=$('notification');el.textContent=txt;el.className='notification show';if(kind==='warn')el.style.borderColor='#d59f6c';else el.style.borderColor='#96b2a5';game.notificationTimer=3.3;}
function currentPos(){return car.driving?{x:car.x,z:car.z}:player;}
const weatherSystem = window.TemporaliWeather.create({THREE,scene,renderer,hemi,sun,game,storms,heightAt,clamp,lerp,rand,choose,dist,towns,makeStorm,currentPos,thunderSound,notify,$,euros,nearestTown,player,car,homeX,homeZ,getAudioContext:()=>audioCtx,getRainGain:()=>rainGain,rainLines,rainMat,rainGeo,rainDrops,rainCount});
const {localWeather,stormDescription,getTimeText,isInside,updateCurrentWeather,updateStorms,updateRain,flashLightning,updateClockAndReports} = weatherSystem;
const playerSystem = window.TemporaliPlayer.create({game,car,buildingBoxes,dist,homeX,homeZ,clamp,keys,heightAt,carRoot,wheels,camera,player,camProp,nearestTown,homeTown,isInside,$});
const {updateBuildingsCollision,updatePlayer} = playerSystem;
const cameraSystem = window.TemporaliCamera.create({game,car,isInside,localWeather,clamp,choose,nearestTown,getTimeText,player,rand,camProp,notify,$});
const {toggleCamera,cleanLens,startStopRecording,updateRecording} = cameraSystem;
const uiSystem = window.TemporaliUI.create({$,game,isInside,currentPos,hotspots,dist,localWeather,stormDescription,player,storms,towns,townByName,roadSegments,notify,euros,getTimeText,car,homeTown,clamp,nearestTown});
const {openLaptop,closeLaptop,findWifi,renderLaptop,drawMapCanvas,openMap,closeMap} = uiSystem;
uiSystem.bind();
window.TemporaliInput.bind({$,game,notify,homeTown,startAudio,resumeAudio:()=>{if(audioCtx?.state==='suspended')audioCtx.resume();},player,clamp,car,camProp,camera,dist,homeX,homeZ,openLaptop,openMap,findWifi,toggleCamera,startStopRecording,cleanLens,keys,closeLaptop,closeMap,drawMapCanvas,nearestTown,renderLaptop});
function renderFrame(now){requestAnimationFrame(renderFrame);const dt=Math.min(.05,(now-lastTime)/1000||0);lastTime=now;if(!game.started){renderer.render(scene,camera);return;}if(!game.paused&&!game.laptopOpen&&!game.mapOpen){updateStorms(dt);updateClockAndReports(dt);updatePlayer(dt);updateCurrentWeather(dt);updateFoliage(dt,currentPos(),game);updateRain(dt);updateRecording(dt);if(game.laptopBattery>0&&!isInside()&&!game.laptopOpen)game.laptopBattery=Math.max(0,game.laptopBattery-dt*.015);if(isInside())game.laptopBattery=Math.min(100,game.laptopBattery+dt*.08);if(game.cameraEquipped&&!isInside())game.lensDirt=clamp(game.lensDirt+game.rain*dt*.00065,0,.9);
 if(game.recording){$('crosshair').style.opacity='.15';$('rainGlass').style.opacity=String(game.lensDirt*.8);}else{$('crosshair').style.opacity=game.cameraEquipped?'.9':'.65';}
 if(game.waypoint){const p=currentPos();const d=dist(p.x,p.z,game.waypoint.x,game.waypoint.z);$('cameraReadout').title='GPS: '+game.waypointName+' · '+(d/1000).toFixed(1)+' km';if(d<70){game.waypoint=null;notify('Sei arrivato alla meta. Guarda il cielo e prepara la camera.');}}
 if(game.notificationTimer>0){game.notificationTimer-=dt;if(game.notificationTimer<=0)$('notification').classList.remove('show');}
 if(!game.laptopOpen&&!game.mapOpen){sun.position.set(player.x+Math.sin(game.seconds/300)*400,player.y+500,player.z+300);sun.target.position.set(player.x,player.y,player.z);sun.target.updateMatrixWorld();}
 }else{if(game.laptopOpen&&game.activeTab==='radar'){const cv=$('radarCanvas');if(cv&&frame%20===0)drawMapCanvas(cv,false);}if(game.mapOpen&&frame%60===0)drawMapCanvas($('mapCanvas'),true);}
 frame++;renderer.render(scene,camera);}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
// a tiny in-world objective prompt should point to the first public report
if(firstStorm){game.waypoint={x:firstStorm.x,z:firstStorm.z};game.waypointName=initialLoc.name;}
// The button stays disabled while the regional scene is being generated, so a fast click cannot be lost during startup.
const readyButton=$('startButton');
if(readyButton){readyButton.disabled=false;readyButton.textContent='ENTRA NELL’ESTATE 2002 ↗';}
updateCurrentWeather(0);requestAnimationFrame(renderFrame);
} catch (err) {
  console.error('TEMPORALI: errore durante l’inizializzazione', err);
  window.__temporaliStartupError = String(err && (err.stack || err.message) || err);
  const screen = document.getElementById('startScreen');
  if (screen) {
    screen.innerHTML = '<div style="max-width:650px;color:#e8f0eb;font-family:Tahoma,Arial,sans-serif;line-height:1.6"><div style="font-size:12px;letter-spacing:.15em;color:#ffcb83">TEMPORALI · ERRORE DI AVVIO</div><h1 style="font-size:32px;line-height:1.1">Il motore 3D non si è inizializzato</h1><p>Il pulsante non partiva perché si è verificato un errore mentre il gioco preparava la mappa. Prova Chrome o Edge aggiornato e attiva l’accelerazione grafica hardware. Se ricapita, copia il messaggio qui sotto e mandamelo: contiene l’errore preciso da correggere.</p><pre id="startupErrorDetails" style="white-space:pre-wrap;overflow:auto;max-height:30vh;background:#080e0f;border:1px solid #52615b;padding:12px;font:12px Consolas,monospace;color:#ffd8c4"></pre><button id="reloadStartup" style="padding:12px 16px;background:#d0e9a7;color:#172119;border:0;cursor:pointer">RIPROVA</button></div>';
    const detail=document.getElementById('startupErrorDetails'); if(detail) detail.textContent=window.__temporaliStartupError;
    const retry=document.getElementById('reloadStartup'); if(retry) retry.addEventListener('click',()=>location.reload());
  }
}

})();
