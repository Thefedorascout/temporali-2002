// Walking/driving movement, building collisions and interaction prompts.
(function(global){
  global.TemporaliPlayer = {
    create(ctx) {
      const {game,car,buildingBoxes,dist,homeX,homeZ,clamp,keys,heightAt,carRoot,wheels,camera,player,camProp,nearestTown,homeTown,isInside,$} = ctx;
      let currentPrompt='';
const BUILDING_GRID_CELL=120,buildingGrid=new Map();
for(const b of buildingBoxes){
 const minX=Math.floor((b.x-b.r-2)/BUILDING_GRID_CELL),maxX=Math.floor((b.x+b.r+2)/BUILDING_GRID_CELL);
 const minZ=Math.floor((b.z-b.r-2)/BUILDING_GRID_CELL),maxZ=Math.floor((b.z+b.r+2)/BUILDING_GRID_CELL);
 for(let ix=minX;ix<=maxX;ix++)for(let iz=minZ;iz<=maxZ;iz++){
  const key=ix+','+iz;if(!buildingGrid.has(key))buildingGrid.set(key,[]);buildingGrid.get(key).push(b);
 }
}
function nearBuilding(nx,nz,extra=0,scale=1){
 const gx=Math.floor(nx/BUILDING_GRID_CELL),gz=Math.floor(nz/BUILDING_GRID_CELL),seen=new Set();
 for(let ix=gx-1;ix<=gx+1;ix++)for(let iz=gz-1;iz<=gz+1;iz++)for(const b of buildingGrid.get(ix+','+iz)||[]){
  if(seen.has(b))continue;seen.add(b);
  if(dist(nx,nz,b.x,b.z)<b.r*scale+extra)return true;
 }
 return false;
}
function updateBuildingsCollision(nx,nz){if(car.driving){if(nearBuilding(nx,nz,1.3))return true;if(Math.abs(nx-homeX)<7&&Math.abs(nz-homeZ)<6)return true;return false;}
 const inX=Math.abs(nx-homeX)<5.75,inZ=Math.abs(nz-homeZ)<5.05;
 // The room itself is walkable. Wall collision only occurs when crossing its boundary, with a doorway at the front.
 if(inX&&inZ)return false;
 const leavingThroughDoor=Math.abs(nx-homeX)<1.25&&nz>homeZ+5.0&&nz<homeZ+7.1;
 if((Math.abs(nx-homeX)<6.1&&Math.abs(nz-homeZ)<6.2)&&!leavingThroughDoor)return true;
 if(Math.abs(nx-homeX)<6.1&&Math.abs(nz-homeZ)<6.2&&leavingThroughDoor)return false;
 if(nearBuilding(nx,nz,0,.7))return true;return false;}
function updatePlayer(dt){if(game.laptopOpen||game.mapOpen||!game.started||game.paused)return;if(car.driving){let acc=0;if(keys.KeyW||keys.ArrowUp)acc=18;if(keys.KeyS||keys.ArrowDown)acc=-13;car.speed+=acc*dt;if(!acc)car.speed*=Math.pow(.984,dt*60);car.speed=clamp(car.speed,-12,36);let steer=0;if(keys.KeyA||keys.ArrowLeft)steer=1;if(keys.KeyD||keys.ArrowRight)steer=-1;car.yaw+=steer*dt*(.22+Math.abs(car.speed)*.016)*(car.speed<-.5?-1:1);const nx=car.x-Math.sin(car.yaw)*car.speed*dt,nz=car.z-Math.cos(car.yaw)*car.speed*dt;if(!updateBuildingsCollision(nx,nz)){car.x=nx;car.z=nz;}else{car.speed*=-.17;}
 car.y=heightAt(car.x,car.z);carRoot.position.set(car.x,car.y,car.z);carRoot.rotation.y=car.yaw;for(const w of wheels)w.rotation.x+=car.speed*dt*1.7;camera.position.set(car.x-Math.sin(car.yaw)*.25,car.y+1.40,car.z-Math.cos(car.yaw)*.25);camera.rotation.y=car.yaw;camera.rotation.x=player.pitch*.6;$('vehicleReadout').textContent=Math.abs(car.speed*3.6).toFixed(0).padStart(3,'0')+' KM/H';$('cameraReadout').textContent='FIAT MULTIPLA · benzina '+Math.round(car.fuel)+'%';player.x=car.x;player.z=car.z;}
 else{const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);const side=(keys.KeyD?1:0)-(keys.KeyA?1:0);const run=keys.ShiftLeft||keys.ShiftRight;player.running=!!run;const speed=player.walkSpeed*(run?1.65:1)*(keys.ControlLeft?.55:1);const dx=-Math.sin(player.yaw)*forward+Math.cos(player.yaw)*side;const dz=-Math.cos(player.yaw)*forward-Math.sin(player.yaw)*side;const m=Math.hypot(dx,dz)||1;const nx=player.x+dx/m*speed*dt,nz=player.z+dz/m*speed*dt;if(!updateBuildingsCollision(nx,player.z))player.x=nx;if(!updateBuildingsCollision(player.x,nz))player.z=nz;player.y=heightAt(player.x,player.z);camera.position.set(player.x,player.y+1.68,player.z);camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;if(player.running&&game.cameraEquipped&&!game.recording)game.steady=clamp(game.steady-dt*.12,0,1);else game.steady=clamp(game.steady+dt*(game.upgrades.strap?.04:.025),0,1);if(game.cameraEquipped){const shake=(game.wind/80)*(1-game.steady)*(game.upgrades.tripod?.25:1);camProp.position.x=.43+Math.sin(game.seconds*.73)*shake*.04;camProp.position.y=-.38+Math.cos(game.seconds*1.3)*shake*.025;}
 $('vehicleReadout').textContent='A PIEDI';$('cameraReadout').textContent=game.cameraEquipped?`MINIDV · Fuoco ${Math.round(game.focus*100)}% · Nastro ${Math.floor(game.rollMinutes)} min`:'MiniDV · tasto V per impugnare';}
 // city-label UI and interaction prompting
 const near=nearestTown(player.x,player.z);if(near.distance<1000)game.nearbyText=near.town.name+' · '+near.town.province;else if(isInside())game.nearbyText='CASA · '+homeTown.name;else game.nearbyText='Strada provinciale';$('nearbyLabel').textContent=game.nearbyText;
 currentPrompt='';let interaction='';if(!car.driving){const dDesk=dist(player.x,player.z,homeX-2.3,homeZ-2.8);const dCar=dist(player.x,player.z,car.x,car.z);if(dDesk<3.2){currentPrompt='Premi <span class="key">E</span> per usare il portatile';interaction='laptop';}else if(dCar<4.5){currentPrompt='Premi <span class="key">E</span> per salire sulla Fiat Multipla';interaction='car';}else if(game.cameraEquipped){currentPrompt=`<span class="key">R</span> registra / termina · <span class="key">C</span> pulisci lente · rotella = fuoco · <span class="key">V</span> riponi`;interaction='camera';}else{currentPrompt='Esplora. <span class="key">V</span> videocamera · <span class="key">M</span> carta · cerca una segnalazione';}if(!game.cameraEquipped&&!isInside()){currentPrompt='Premi <span class="key">V</span> per impugnare la videocamera · <span class="key">M</span> carta';}}
 else {currentPrompt='Guida: <span class="key">W</span> avanti · <span class="key">S</span> indietro · <span class="key">A/D</span> sterza · <span class="key">E</span> scendi · <span class="key">Spazio</span> freno';interaction='driving';}
 $('hintText').innerHTML=currentPrompt;$('tooltip').style.display=(interaction==='laptop'||interaction==='car')?'block':'none';$('tooltip').innerHTML=interaction==='laptop'?'<strong>Portatile Medion</strong>Apri il radar, leggi i report dei cittadini e pubblica i filmati con una connessione.':interaction==='car'?'<strong>Fiat Multipla 1.6</strong>La strada è lunga: controlla il carburante.': '';
}
      return {updateBuildingsCollision,updatePlayer};
    }
  };
})(window);
