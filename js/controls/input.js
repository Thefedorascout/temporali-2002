// Keyboard/mouse, pointer lock, menu shortcuts and gameplay input.
(function(global){
  global.TemporaliInput = {
    bind(ctx) {
      const {$,game,notify,homeTown,startAudio,resumeAudio,player,clamp,car,camProp,camera,dist,homeX,homeZ,openLaptop,openMap,findWifi,toggleCamera,startStopRecording,cleanLens,keys,closeLaptop,closeMap,drawMapCanvas,nearestTown,renderLaptop} = ctx;
      let pointerLocked=false;
$('startButton').addEventListener('click',()=>{game.started=true;$('startScreen').style.display='none';$('hud').style.display='block';startAudio();resumeAudio();$('world').requestPointerLock?.();notify('Benvenuto a '+homeTown.name+'. Controlla il portatile: c’è una segnalazione in zona.');});
$('resumeButton').addEventListener('click',()=>{game.paused=false;$('gameover').style.display='none';if(game.started)$('world').requestPointerLock?.();});
document.addEventListener('pointerlockchange',()=>{pointerLocked=document.pointerLockElement===$('world');});
document.addEventListener('mousemove',e=>{if(!pointerLocked||game.laptopOpen||game.mapOpen||!game.started)return;const sens=.0021;player.yaw-=e.movementX*sens;player.pitch=clamp(player.pitch-e.movementY*sens,-1.45,1.45);if(car.driving){car.yaw=player.yaw;}});
document.addEventListener('wheel',e=>{if(game.cameraEquipped&&!game.laptopOpen&&!game.mapOpen&&!car.driving){game.focus=clamp(game.focus+(e.deltaY<0?.035:-.035),.15,1);notify('Fuoco manuale: '+Math.round(game.focus*100)+'%.');}},{passive:true});
document.addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.repeat)return;
 if(e.code==='Escape'){if(game.laptopOpen)closeLaptop();else if(game.mapOpen)closeMap();else if(game.started){game.paused=!game.paused;$('gameover').style.display=game.paused?'flex':'none';if(game.paused&&document.pointerLockElement)document.exitPointerLock();else if(!game.paused)$('world').requestPointerLock?.();}}
 if(e.code==='KeyM'&&game.started){if(game.mapOpen)closeMap();else if(game.laptopOpen){game.laptopOpen=false;$('laptop').style.display='none';openMap();}else openMap();}
 if(e.code==='KeyE'&&game.started&&!game.laptopOpen&&!game.mapOpen){if(car.driving){if(Math.abs(car.speed)<5){car.driving=false;player.x=car.x+Math.cos(car.yaw)*2.5;player.z=car.z+Math.sin(car.yaw)*2.5;player.yaw=car.yaw;camProp.visible=game.cameraEquipped;notify('Sei sceso dalla Multipla.');}else notify('Frena prima di scendere!','warn');}else{const dDesk=dist(player.x,player.z,homeX-2.3,homeZ-2.8),dCar=dist(player.x,player.z,car.x,car.z);if(dDesk<3.2)openLaptop();else if(dCar<4.5){car.driving=true;game.cameraEquipped=false;camProp.visible=false;camera.rotation.y=car.yaw;notify('Al volante. Cerca una strada e segui le segnalazioni.');}}}
 if(e.code==='KeyL'&&game.started&&!game.laptopOpen&&!game.mapOpen&&!car.driving){const wifi=findWifi();if(wifi){openLaptop();notify('Connessione disponibile: '+wifi.name+'.');}else notify('Nessun Wi-Fi nelle vicinanze. Cerca un internet point in città.','warn');}
 if(e.code==='KeyV'&&game.started)toggleCamera();if(e.code==='KeyR'&&game.started)startStopRecording();if(e.code==='KeyC'&&game.started)cleanLens();if(e.code==='KeyF'&&game.started&&!car.driving){game.focus=clamp(game.focus+.04,0,1);notify('Fuoco regolato: '+Math.round(game.focus*100)+'%.');}
 if(e.code==='Space'&&car.driving)car.speed*=.76;
});document.addEventListener('keyup',e=>{keys[e.code]=false;});
    }
  };
})(window);
