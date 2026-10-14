// Handheld MiniDV: equip/unequip, lens cleanup, recording and clip scoring.
(function(global){
  global.TemporaliCamera = {
    create(ctx) {
      const {game,car,isInside,localWeather,clamp,choose,nearestTown,getTimeText,player,rand,camProp,notify,$} = ctx;
function toggleCamera(){if(car.driving||game.laptopOpen||game.mapOpen)return;game.cameraEquipped=!game.cameraEquipped;camProp.visible=game.cameraEquipped;notify(game.cameraEquipped?'Videocamera MiniDV pronta. Occhio al vento.':'Videocamera riposta.');}
function cleanLens(){if(game.laptopOpen||car.driving)return;game.lensDirt=0;notify('Lente pulita. Immagine nitida.');}
function startStopRecording(){if(!game.cameraEquipped||car.driving||isInside()||game.laptopOpen||game.mapOpen)return;if(!game.recording){if(game.rollMinutes<=0){notify('Nastro MiniDV esaurito. Compra una cassetta al mercato.','warn');return;}game.recording=true;game.recordStarted=performance.now()/1000;game.recordTime=0;game.clipQuality=0;notify('REC ● — scegli una composizione, tieni ferma la camera.','warn');}
 else{game.recording=false;const dur=game.recordTime;const w=localWeather(player.x,player.z);if(dur<4){notify('Filmato troppo breve: almeno 4 secondi per conservarlo.','warn');return;}const focus=game.focus;const steadiness=clamp(game.steady-(game.wind/100)*.15,0,1);const stormScore=clamp(w.rain*.55+(w.storm?.intensity||0)*.28+(w.cover*.17),0,1);const durationScore=clamp(dur/18,.25,1);const rarity=clamp((w.rain*.5)+(w.wind/55)*.25+Math.random()*.25,0,1);const score=Math.round(100*(.30*focus+.27*steadiness+.23*stormScore+.12*durationScore+.08*(1-game.lensDirt)));const video={id:++game.clipId,title:choose(['Temporale sulla pianura','Cella temporalesca in arrivo','Fulmini verso '+nearestTown(player.x,player.z).town.name,'Pioggia e raffiche sulla provinciale','Cielo verde prima del nubifragio']),date:getTimeText(),place:nearestTown(player.x,player.z).town.name,duration:dur,focus,steady:steadiness,storm:stormScore,rarity,score,uploaded:false,source:'MiniDV'};game.clips.push(video);game.rollMinutes=Math.max(0,game.rollMinutes-dur/60);game.lensDirt=clamp(game.lensDirt+game.rain*.18,0,.9);notify(`REC terminato · qualità stimata ${score}/100. Torna online per pubblicare.`);}}
function updateRecording(dt){if(game.recording){game.recordTime+=dt;game.rollMinutes=Math.max(0,game.rollMinutes-dt/60);const w=localWeather(player.x,player.z);const dirtChance=dt*(w.rain*.08);if(Math.random()<dirtChance)game.lensDirt=clamp(game.lensDirt+rand(.01,.06),0,.9);if(game.rollMinutes<=0){game.recording=false;notify('Fine nastro MiniDV!','warn');}const progress=clamp(game.recordTime/25,0,1);$('cameraReadout').textContent=`● REC ${game.recordTime.toFixed(1)} s · stabilità ${Math.round(game.steady*100)}% · ${Math.floor(game.rollMinutes)} min`;}
}
      return {toggleCamera,cleanLens,startStopRecording,updateRecording};
    }
  };
})(window);
