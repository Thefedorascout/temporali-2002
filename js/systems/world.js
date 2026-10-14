// Regional scene factory: terrain, roads, settlement generation, civic buildings, trees and starting-home placement.
(function(global){
  global.TemporaliWorld = {
    create({THREE, utils}) {
      const {$, clamp, lerp, rand, choose, dist} = utils;
      const {towns:TOWN_RAW, elevations:TOWN_ELEVATION} = global.TemporaliData;
const towns=TOWN_RAW.map(([name,lon,lat,province,pop,kind],i)=>({name,lon,lat,province,pop,kind,id:i,elev:TOWN_ELEVATION[name]??(kind==='mountain'?520:kind==='hill'?220:kind==='lake'?165:kind==='city'?100:75),x:(lon-9.8)*40000,z:(46.25-lat)*52000}));
const townByName=Object.fromEntries(towns.map(t=>[t.name,t]));
function townUrbanRadius(t){return t.pop>150000?2200:t.pop>50000?1550:t.pop>20000?1120:t.pop>10000?820:t.pop>5000?600:380;}
const elevationBins=new Map();
for(const t of towns){const key=Math.floor(t.x/5000)+','+Math.floor(t.z/5000);if(!elevationBins.has(key))elevationBins.set(key,[]);elevationBins.get(key).push(t);}
function nearestElevationAnchor(x,z){const gx=Math.floor(x/5000),gz=Math.floor(z/5000);let best=null,bd=Infinity;for(let ix=gx-1;ix<=gx+1;ix++)for(let iz=gz-1;iz<=gz+1;iz++){const list=elevationBins.get(ix+','+iz);if(!list)continue;for(const t of list){const d=dist(x,z,t.x,t.z);if(d<bd){bd=d;best=t;}}}return {town:best,distance:bd};}
const scene=new THREE.Scene();scene.background=new THREE.Color(0x91a9aa);scene.fog=new THREE.FogExp2(0x91a9aa,0.000022);
const camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,90000);camera.rotation.order='YXZ';
const renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
const hemi=new THREE.HemisphereLight(0xc9e4ef,0x454d37,1.0);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe6c0,1.45);sun.position.set(200,500,300);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-250;sun.shadow.camera.right=250;sun.shadow.camera.top=250;sun.shadow.camera.bottom=-250;sun.shadow.camera.near=.5;sun.shadow.camera.far=2000;sun.shadow.bias=-0.0005;scene.add(sun);scene.add(sun.target);
const groundMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0});
// A subtle generated grass texture prevents the enormous terrain from reading as a flat green sheet.
const grassCanvas=document.createElement('canvas');grassCanvas.width=512;grassCanvas.height=512;
const grassCtx=grassCanvas.getContext('2d');grassCtx.fillStyle='#aab08e';grassCtx.fillRect(0,0,512,512);
for(let i=0;i<17000;i++){const x=Math.random()*512,y=Math.random()*512;const v=Math.random();grassCtx.fillStyle=v<.36?'rgba(57,80,43,.16)':v<.68?'rgba(151,137,91,.12)':'rgba(238,232,202,.15)';grassCtx.fillRect(x,y,Math.random()*2.8+.35,Math.random()*2.8+.35);}
for(let i=0;i<1100;i++){grassCtx.strokeStyle=Math.random()<.5?'rgba(66,88,50,.16)':'rgba(171,160,115,.14)';grassCtx.lineWidth=.65;grassCtx.beginPath();const x=Math.random()*512,y=Math.random()*512;grassCtx.moveTo(x,y);grassCtx.lineTo(x+rand(1,5),y-rand(1,5));grassCtx.stroke();}
const grassTexture=new THREE.CanvasTexture(grassCanvas);grassTexture.wrapS=grassTexture.wrapT=THREE.RepeatWrapping;grassTexture.repeat.set(300,350);grassTexture.encoding=THREE.sRGBEncoding;grassTexture.anisotropy= Math.min(8,renderer.capabilities.getMaxAnisotropy());groundMat.map=grassTexture;
function inLake(x,z){const garda=((x-37000)/4400)**2+((z-30000)/12600)**2<1;const iseo=((x-10600)/1050)**2+((z-30500)/6900)**2<1;if(!(garda||iseo))return false;const near=nearestElevationAnchor(x,z);return !(near.town&&near.town.kind==='lake'&&near.distance<townUrbanRadius(near.town)*.9);}
function lakeLevel(x,z){const garda=((x-37000)/4400)**2+((z-30000)/12600)**2<1;return garda?65:185;}
function rawTerrainHeight(x,z){
 if(inLake(x,z))return lakeLevel(x,z);
 const plain=clamp(19+(56600-z)*.00645,8,440);
 const rolling=17*Math.sin(x/5100+z/7100)+11*Math.sin((x+z)/3100)+5*Math.cos(z/1050)*Math.sin(x/1750);
 const gauss=(cx,cz,rx,rz,h)=>h*Math.exp(-(((x-cx)/rx)**2+((z-cz)/rz)**2));
 // Major relief cues: Franciacorta, Maddalena, Val Trompia, upper Val Camonica and the Garda mountains.
 const franciacorta=gauss(8500,30600,6000,6000,185);
 const maddalena=gauss(24800,35100,2300,3100,710);
 const valTrompia=gauss(15700,24400,5200,7800,780);
 const camonica=gauss(20000,10500,6500,11800,1550);
 const adamello=gauss(29500,-4500,7800,10000,2700);
 const maniva=gauss(23000,17800,6000,5100,1500);
 const gardaMountains=gauss(36000,19700,6500,8300,1020);
 const alpineBackbone=clamp((27000-z)/19000,0,1)* (80+140*Math.max(0,Math.sin(x/4100+z/5300)));
 return Math.max(4,plain+rolling+franciacorta+maddalena+valTrompia+camonica+adamello+maniva+gardaMountains+alpineBackbone);
}
for(const t of towns)t.elevCorrection=t.elev-rawTerrainHeight(t.x,t.z);
// Town elevation data should guide the relief, not create kilometre-high artificial steps.
// Blend nearby correction anchors continuously and fade them over a broad area.
function smoothedTownCorrection(x,z){
 const gx=Math.floor(x/5000),gz=Math.floor(z/5000);let nearest=Infinity,weighted=0,totalWeight=0;
 for(let ix=gx-3;ix<=gx+3;ix++)for(let iz=gz-3;iz<=gz+3;iz++){
  const list=elevationBins.get(ix+','+iz);if(!list)continue;
  for(const t of list){
   const d=dist(x,z,t.x,t.z);if(d<nearest)nearest=d;if(d>14500)continue;
   const weight=1/(d*d+2600*2600);weighted+=t.elevCorrection*weight;totalWeight+=weight;
  }
 }
 if(!totalWeight||!Number.isFinite(nearest))return 0;
 const average=clamp(weighted/totalWeight,-165,165);
 const q=clamp(1-nearest/14500,0,1),fade=q*q*(3-2*q);
 return average*fade;
}
const TERRAIN_BOUNDS={minX:-5000,maxX:65000,minZ:-9000,maxZ:73000,segX:900,segZ:1050};
let terrainGrid=null;
const GRADE_BIN_SIZE=320,terrainGradePads=[],terrainGradeBins=new Map();
function ungradedTerrainHeightAt(x,z){
 if(inLake(x,z))return lakeLevel(x,z);
 return Math.max(2,rawTerrainHeight(x,z)+smoothedTownCorrection(x,z));
}
function registerGradePad(t,lx,lz,angle,halfW,halfD,kind='building'){
 const p=localPoint(t,lx,lz,angle),footprint=Math.hypot(halfW,halfD)+5;
 const innerRadius=Math.max(kind==='piazza'?64:48,footprint),outerRadius=innerRadius+52;
 terrainGradePads.push({x:p.x,z:p.z,innerRadius,outerRadius,level:0,kind});
}
function buildTerrainGradePads(){
 for(const t of towns){
  const angle=(t.id*.61803398875%1)*Math.PI;
  const plazaSize=t.pop>100000?135:t.pop>50000?108:t.pop>20000?88:t.pop>8000?70:48;
  registerGradePad(t,0,0,angle,plazaSize*.5,plazaSize*.39,'piazza');
  const districtSize=t.pop>100000?245:t.pop>50000?185:t.pop>20000?145:t.pop>8000?102:70;
  const churchScale=t.pop>50000?1.16:t.pop>10000?1:.82;
  registerGradePad(t,-districtSize*.56,-districtSize*.28,angle,6*churchScale,11.5*churchScale);
  if(t.pop>5000){const scale=t.pop>50000?1.12:t.pop>10000?1:.86;registerGradePad(t,districtSize*.57,-districtSize*.18,angle,8.5*scale,6*scale);}
  if(t.pop>6000){const scale=t.pop>50000?1.25:t.pop>20000?1.05:.88;registerGradePad(t,districtSize*.56,districtSize*.76,angle,11*scale,6*scale);}
  if(t.pop>10000){
   const scale=t.pop>50000?1.05:.82,count=t.pop>50000?6:t.pop>20000?5:3;
   registerGradePad(t,-districtSize*.5,districtSize*.72,angle,((count-1)*2.3+1.85)*scale,6*scale);
  }
  if(t.pop>20000){
   const scale=t.pop>100000?1.08:.92;registerGradePad(t,-districtSize*1.08,districtSize*.78,angle,11*scale,6*scale);
   const marketScale=t.pop>100000?.95:.78,count=t.pop>50000?6:5;
   registerGradePad(t,districtSize*.98,districtSize*1.08,angle,((count-1)*2.3+1.85)*marketScale,6*marketScale);
   registerGradePad(t,districtSize*1.05,districtSize*.5,angle,31,24,'park');
   const blocks=t.pop>100000?10:4;
   for(let i=0;i<blocks;i++){
    const ox=(i%5-2)*43+districtSize*1.15,oz=(Math.floor(i/5)-.5)*46;
    const bw=18+((i+1)%3)*3,bd=16+((i+2)%2)*4;
    registerGradePad(t,ox,oz,angle,bw*.5,bd*.5,'block');
   }
  }
  if(t.pop>100000)registerGradePad(t,districtSize*1.08,-districtSize*.82,angle,5.4,10.35);
 }
 // Choose a safe terrace level from the highest natural ground around the whole footprint and nearby mesh cells.
 // That way the low side is filled rather than allowing the terrain to poke through a plaza edge.
 const stepX=(TERRAIN_BOUNDS.maxX-TERRAIN_BOUNDS.minX)/TERRAIN_BOUNDS.segX,stepZ=(TERRAIN_BOUNDS.maxZ-TERRAIN_BOUNDS.minZ)/TERRAIN_BOUNDS.segZ;
 const supportExtra=Math.hypot(stepX,stepZ)*1.55+8;
 for(const pad of terrainGradePads){
  const radius=pad.innerRadius+supportExtra;let maxHeight=-Infinity;
  maxHeight=Math.max(maxHeight,ungradedTerrainHeightAt(pad.x,pad.z));
  for(let ring=1;ring<=5;ring++)for(let i=0;i<32;i++){
   const d=radius*ring/5,a=i*Math.PI*2/32;
   maxHeight=Math.max(maxHeight,ungradedTerrainHeightAt(pad.x+Math.cos(a)*d,pad.z+Math.sin(a)*d));
  }
  pad.level=maxHeight+.35;
  const minX=Math.floor((pad.x-pad.outerRadius)/GRADE_BIN_SIZE),maxX=Math.floor((pad.x+pad.outerRadius)/GRADE_BIN_SIZE);
  const minZ=Math.floor((pad.z-pad.outerRadius)/GRADE_BIN_SIZE),maxZ=Math.floor((pad.z+pad.outerRadius)/GRADE_BIN_SIZE);
  for(let ix=minX;ix<=maxX;ix++)for(let iz=minZ;iz<=maxZ;iz++){
   const key=ix+','+iz;if(!terrainGradeBins.has(key))terrainGradeBins.set(key,[]);
   terrainGradeBins.get(key).push(pad);
  }
 }
}
buildTerrainGradePads();
function applyTerrainGrading(x,z,base){
 if(inLake(x,z))return base;
 const pads=terrainGradeBins.get(Math.floor(x/GRADE_BIN_SIZE)+','+Math.floor(z/GRADE_BIN_SIZE));
 if(!pads)return base;
 let totalWeight=0,weightedLevel=0,inside=null,insideScore=Infinity;
 for(const pad of pads){
  const d=Math.hypot(x-pad.x,z-pad.z);if(d>=pad.outerRadius)continue;
  if(d<=pad.innerRadius){
   const score=d/pad.innerRadius;
   if(score<insideScore){inside=pad;insideScore=score;}
   continue;
  }
  const q=clamp((d-pad.innerRadius)/(pad.outerRadius-pad.innerRadius),0,1);
  const smooth=q*q*(3-2*q),weight=1-smooth;
  if(weight>0){totalWeight+=weight;weightedLevel+=pad.level*weight;}
 }
 if(inside)return inside.level;
 if(totalWeight<=0)return base;
 return lerp(base,weightedLevel/totalWeight,clamp(totalWeight,0,1));
}
function analyticHeightAt(x,z){
 const base=ungradedTerrainHeightAt(x,z);
 return applyTerrainGrading(x,z,base);
}
// Roads and props query the same triangles as the rendered heightmap, avoiding buried objects on steep terrain.
function heightAt(x,z){
 if(!terrainGrid)return analyticHeightAt(x,z);
 const b=terrainGrid;
 if(x<b.minX||x>b.maxX||z<b.minZ||z>b.maxZ)return analyticHeightAt(x,z);
 const gx=clamp((x-b.minX)/b.stepX,0,b.segX-1e-7),gz=clamp((z-b.minZ)/b.stepZ,0,b.segZ-1e-7);
 const ix=Math.floor(gx),iz=Math.floor(gz),u=gx-ix,v=gz-iz,row=b.segX+1;
 const h00=b.heights[iz*row+ix],h01=b.heights[(iz+1)*row+ix],h10=b.heights[iz*row+ix+1],h11=b.heights[(iz+1)*row+ix+1];
 if(u+v<=1)return h00*(1-u-v)+h01*v+h10*u;
 return h01*(1-u)+h11*(u+v-1)+h10*(1-v);
}
function makeTerrain(){
 const {minX,maxX,minZ,maxZ,segX,segZ}=TERRAIN_BOUNDS,stepX=(maxX-minX)/segX,stepZ=(maxZ-minZ)/segZ;
 const geo=new THREE.PlaneGeometry(maxX-minX,maxZ-minZ,segX,segZ);geo.rotateX(-Math.PI/2);
 const pos=geo.attributes.position,heights=new Float32Array(pos.count),colors=new Float32Array(pos.count*3),cx=(minX+maxX)/2,cz=(minZ+maxZ)/2;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i)+cx,z=pos.getZ(i)+cz,h=analyticHeightAt(x,z);heights[i]=h;pos.setY(i,h);}
 geo.computeVertexNormals();const normals=geo.attributes.normal,temp=new THREE.Color();
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i)+cx,z=pos.getZ(i)+cz,h=heights[i],slope=1-Math.max(0,normals.getY(i));
  const textureNoise=1+Math.sin(x/470)*Math.cos(z/590)*.018+Math.sin((x+z)/127)*.008;
  if(inLake(x,z))temp.setRGB(.10,.25,.29);
  else if(slope>.24||h>2300)temp.setRGB(.30,.32,.30);
  else if(h>1550)temp.setRGB(.35,.39,.36);
  else if(h>1050)temp.setRGB(.34,.41,.33);
  else if(h>700)temp.setRGB(.34,.43,.31);
  else if(h>420)temp.setRGB(.36,.45,.31);
  else if(h>220)temp.setRGB(.39,.46,.31);
  else{
   const fieldPattern=Math.sin(x/2150+Math.sin(z/3100))*Math.cos(z/1750+Math.sin(x/3700));
   if(z>41000&&fieldPattern>.48)temp.setRGB(.43,.43,.32);
   else if(z>41000&&fieldPattern<-.55)temp.setRGB(.37,.41,.31);
   else temp.setRGB(.39,.44,.32);
  }
  colors[i*3]=temp.r*textureNoise;colors[i*3+1]=temp.g*textureNoise;colors[i*3+2]=temp.b*textureNoise;
 }
 geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
 const mesh=new THREE.Mesh(geo,groundMat);mesh.position.set(cx,0,cz);mesh.receiveShadow=true;mesh.frustumCulled=false;scene.add(mesh);
 terrainGrid={minX,maxX,minZ,maxZ,segX,segZ,stepX,stepZ,heights};
}
makeTerrain();

function makeFarmland(){
 const positions=[],colors=[],indices=[],subX=8,subZ=9,row=subX+1;
 const palette=[0xb5a66d,0x94975d,0x9d8a5b,0x7e8c50,0xbab17c,0x8c8060].map(c=>new THREE.Color(c));
 const rnd=seededTownRandom(200207);let made=0,tries=0;
 while(made<155&&tries++<1800){
  const cx=-1500+rnd()*63000,cz=41400+rnd()*29200;
  if(inLake(cx,cz)||heightAt(cx,cz)>235||towns.some(t=>dist(cx,cz,t.x,t.z)<townUrbanRadius(t)*1.42+130))continue;
  const w=210+rnd()*330,d=260+rnd()*450,angle=rnd()*Math.PI*2,base=palette[Math.floor(rnd()*palette.length)],start=positions.length/3;
  for(let j=0;j<=subZ;j++)for(let i=0;i<=subX;i++){
   let lx=(i/subX-.5)*w,lz=(j/subZ-.5)*d;
   if(i===0||i===subX)lx+=(rnd()-.5)*w*.045;
   if(j===0||j===subZ)lz+=(rnd()-.5)*d*.045;
   const x=cx+lx*Math.cos(angle)-lz*Math.sin(angle),z=cz+lx*Math.sin(angle)+lz*Math.cos(angle),h=heightAt(x,z)+.28;
   positions.push(x,h,z);const v=.94+rnd()*.12;colors.push(base.r*v,base.g*v,base.b*v);
  }
  for(let j=0;j<subZ;j++)for(let i=0;i<subX;i++){const a=start+j*row+i,b=a+row,c=b+1,d0=a+1;indices.push(a,b,d0,b,c,d0);}
  made++;
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1});
 const fields=new THREE.Mesh(geo,mat);fields.receiveShadow=true;fields.castShadow=false;fields.frustumCulled=false;scene.add(fields);
}
makeFarmland();
// distant ridgelines give the northern horizon a recognisable prealpine silhouette
const ridgeMat=new THREE.MeshStandardMaterial({color:0x526961,roughness:1,flatShading:true});
function addRidges(){for(let r=0;r<3;r++){const pts=[];for(let i=0;i<=100;i++){const x=-2000+i*650;const y=300+r*115+Math.sin(i*.29+r*1.4)*180+Math.sin(i*.08+r)*310;pts.push(new THREE.Vector3(x,y,-5000-r*900));}const shapePts=[new THREE.Vector2(pts[0].x,0),...pts.map(p=>new THREE.Vector2(p.x,p.y)),new THREE.Vector2(pts[pts.length-1].x,0)];const shape=new THREE.Shape(shapePts);const geo=new THREE.ShapeGeometry(shape);geo.rotateX(0);const mesh=new THREE.Mesh(geo,ridgeMat);mesh.position.z=-55000-r*13000;mesh.material= ridgeMat; // silhouette far beyond the mapped north
 scene.add(mesh);}}
// use terrain ridges naturally; the huge flat ribbon above is deliberately not placed near the playable area
// utilities for generated geometry
const sharedMats={wall:new THREE.MeshStandardMaterial({color:0xb9b09c,roughness:.95}),wall2:new THREE.MeshStandardMaterial({color:0xd0c8b6,roughness:.95}),brick:new THREE.MeshStandardMaterial({color:0x9c6b4f,roughness:1}),roof:new THREE.MeshStandardMaterial({color:0x834f3b,roughness:.94}),roof2:new THREE.MeshStandardMaterial({color:0x675d52,roughness:.92}),glass:new THREE.MeshStandardMaterial({color:0x39565d,roughness:.18,metalness:.15}),asphalt:new THREE.MeshStandardMaterial({color:0x343a39,roughness:.97}),line:new THREE.MeshStandardMaterial({color:0xbcb9a4,roughness:.8}),treeTrunk:new THREE.MeshStandardMaterial({color:0x594434,roughness:1}),leaf:new THREE.MeshStandardMaterial({color:0x395944,roughness:1}),leaf2:new THREE.MeshStandardMaterial({color:0x4d6b43,roughness:1}),concrete:new THREE.MeshStandardMaterial({color:0x898e86,roughness:1}),white:new THREE.MeshStandardMaterial({color:0xd6d4c9,roughness:.6}),black:new THREE.MeshStandardMaterial({color:0x1a1c1b,roughness:.75}),rubber:new THREE.MeshStandardMaterial({color:0x171a19,roughness:.95}),interior:new THREE.MeshStandardMaterial({color:0x9a9a81,roughness:.95})};
function box(parent,w,h,d,mat,x,y,z,rx=0,ry=0,rz=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cyl(parent,r1,r2,h,mat,x,y,z,rx=0,ry=0,rz=0,segments=12){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;parent.add(m);return m;}
function ellipsoid(parent,sx,sy,sz,mat,x,y,z,rx=0,ry=0,rz=0,detail=2){const m=new THREE.Mesh(new THREE.SphereGeometry(1,detail===2?24:16,detail===2?16:10),mat);m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function nearestTown(x,z){let best=towns[0],bd=Infinity;for(const t of towns){let d=dist(x,z,t.x,t.z);if(d<bd){bd=d;best=t;}}return {town:best,distance:bd};}
const roadSegments=[];const roadMarkPositions=[];const roadEdgePositions=[];const roadPositions=[];const roadUvs=[];const roadIndices=[];const shoulderPositions=[];const shoulderIndices=[];
const shoulderMat=new THREE.MeshStandardMaterial({color:0x777d72,roughness:1});
const ROAD_GRID=280,ROAD_MAX_GRADE=.085;
function terrainRoadRoute(a,b,local=false){
 const direct=Math.hypot(b.x-a.x,b.z-a.z);
 const endpointGrade=Math.abs(heightAt(a.x,a.z)-heightAt(b.x,b.z))/Math.max(1,direct);
 if(direct<360||(local&&direct<760&&endpointGrade<ROAD_MAX_GRADE))return [a,b];
 const margin=local?clamp(direct*.60,850,2400):clamp(direct*.30,5200,10500);
 const minX=Math.min(a.x,b.x)-margin,maxX=Math.max(a.x,b.x)+margin,minZ=Math.min(a.z,b.z)-margin,maxZ=Math.max(a.z,b.z)+margin;
 const minGX=Math.floor(minX/ROAD_GRID),maxGX=Math.ceil(maxX/ROAD_GRID),minGZ=Math.floor(minZ/ROAD_GRID),maxGZ=Math.ceil(maxZ/ROAD_GRID);
 const sx=Math.round(a.x/ROAD_GRID),sz=Math.round(a.z/ROAD_GRID),ex=Math.round(b.x/ROAD_GRID),ez=Math.round(b.z/ROAD_GRID);
 const key=(x,z)=>x+','+z,coord=(x,z)=>({x:x*ROAD_GRID,z:z*ROAD_GRID});
 const startKey=key(sx,sz),endKey=key(ex,ez),offsets=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
 const hCache=new Map(),height=(x,z)=>{const k=key(x,z);if(!hCache.has(k))hCache.set(k,heightAt(x*ROAD_GRID,z*ROAD_GRID));return hCache.get(k);};
 const heuristic=(x,z)=>Math.hypot(ex-x,ez-z)*ROAD_GRID;
 function search(maxGrade){
  const gScore=new Map([[startKey,0]]),came=new Map(),closed=new Set(),heap=[];
  function push(item){let i=heap.length;heap.push(item);while(i>0){const p=(i-1)>>1;if(heap[p].f<=item.f)break;heap[i]=heap[p];i=p;}heap[i]=item;}
  function pop(){const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(true){const l=i*2+1,r=l+1;if(l>=heap.length)break;const c=r<heap.length&&heap[r].f<heap[l].f?r:l;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return first;}
  push({x:sx,z:sz,g:0,f:heuristic(sx,sz)});let found=false,visits=0;
  while(heap.length&&visits++<90000){
   const cur=pop(),ck=key(cur.x,cur.z);
   if(closed.has(ck)||cur.g>(gScore.get(ck)??Infinity))continue;
   if(cur.x===ex&&cur.z===ez){found=true;break;}
   closed.add(ck);const ch=height(cur.x,cur.z);
   for(const [ox,oz] of offsets){
    const nx=cur.x+ox,nz=cur.z+oz;
    if(nx<minGX||nx>maxGX||nz<minGZ||nz>maxGZ)continue;
    const np=coord(nx,nz);if(inLake(np.x,np.z))continue;
    const nk=key(nx,nz);if(closed.has(nk))continue;
    const horizontal=Math.hypot(ox,oz)*ROAD_GRID,nh=height(nx,nz),grade=Math.abs(nh-ch)/horizontal;
    if(grade>maxGrade)continue;
    // Within the allowed maximum, still prefer a contour road over one close to the grade limit.
    const excess=Math.max(0,grade-.065)/.065,cost=horizontal*(1+excess*excess*2.2),tentative=cur.g+cost;
    if(tentative<(gScore.get(nk)??Infinity)){gScore.set(nk,tentative);came.set(nk,ck);push({x:nx,z:nz,g:tentative,f:tentative+heuristic(nx,nz)});}
   }
  }
  if(!found)return null;
  const cells=[];let current=endKey,guard=0;
  while(current&&guard++<12000){const [x,z]=current.split(',').map(Number);cells.push(coord(x,z));if(current===startKey)break;current=came.get(current);}
  if(!cells.length||key(Math.round(cells[cells.length-1].x/ROAD_GRID),Math.round(cells[cells.length-1].z/ROAD_GRID))!==startKey)return null;
  cells.reverse();const simplified=[cells[0]];
  for(let i=1;i<cells.length-1;i++){
   const p=simplified[simplified.length-1],c=cells[i],n=cells[i+1],ax=c.x-p.x,az=c.z-p.z,bx=n.x-c.x,bz=n.z-c.z,den=Math.hypot(ax,az)*Math.hypot(bx,bz)||1;
   if((ax*bx+az*bz)/den<.985)simplified.push(c);
  }
  simplified.push(cells[cells.length-1]);
  const rounded=[a];
  for(let i=1;i<simplified.length-1;i++){const p=simplified[i-1],c=simplified[i],n=simplified[i+1],q=.22;rounded.push({x:lerp(p.x,c.x,q),z:lerp(p.z,c.z,q)},{x:lerp(c.x,n.x,q),z:lerp(c.z,n.z,q)});}
  rounded.push(b);return rounded;
 }
 // Try a 8.5% grade limit first, relaxing only if the synthetic terrain has no valid connection.
 for(const cap of [ROAD_MAX_GRADE,.12,.17,.25,.38]){const route=search(cap);if(route)return route;}
 return [a,b];
}
function roadBetween(a,b,width=8,marking=true,terrainRoute=false){
 const directLength=Math.hypot(b.x-a.x,b.z-a.z),endGrade=Math.abs(heightAt(a.x,a.z)-heightAt(b.x,b.z))/Math.max(1,directLength);const localRoute=!terrainRoute&&directLength>350&&endGrade>ROAD_MAX_GRADE*1.10;const path=terrainRoute?terrainRoadRoute(a,b,false):(localRoute?terrainRoadRoute(a,b,true):[a,b]);if(path.length<2)return;
 const lengths=[],cumulative=[0];let total=0;
 for(let i=0;i<path.length-1;i++){const len=Math.hypot(path[i+1].x-path[i].x,path[i+1].z-path[i].z);lengths.push(len);total+=len;cumulative.push(total);}
 if(total<1)return;
 function pointAt(distance){
  const d=clamp(distance,0,total);let i=0;while(i<lengths.length-1&&cumulative[i+1]<d)i++;
  const len=lengths[i]||1,q=clamp((d-cumulative[i])/len,0,1),p=path[i],n=path[i+1];
  return {x:lerp(p.x,n.x,q),z:lerp(p.z,n.z,q)};
 }
 const n=Math.max(1,Math.ceil(total/34)),half=width/2,shoulderHalf=half+1.35,positions=[],uvs=[],indices=[],shoulders=[],shIndices=[];
 for(let i=0;i<=n;i++){
  const d=total*i/n,p=pointAt(d),before=pointAt(Math.max(0,d-3)),after=pointAt(Math.min(total,d+3));
  let tx=after.x-before.x,tz=after.z-before.z,l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;
  const lx=p.x-tz*half,lz=p.z+tx*half,rx=p.x+tz*half,rz=p.z-tx*half;
  const slx=p.x-tz*shoulderHalf,slz=p.z+tx*shoulderHalf,srx=p.x+tz*shoulderHalf,srz=p.z-tx*shoulderHalf;
  const yL=heightAt(lx,lz),yR=heightAt(rx,rz),syL=heightAt(slx,slz),syR=heightAt(srx,srz);
  positions.push(lx,yL+.22,lz,rx,yR+.22,rz);shoulders.push(slx,syL+.12,slz,srx,syR+.12,srz);
  uvs.push(d/24,0,d/24,1);
  if(i<n){const a0=i*2,b0=a0+1,a1=a0+2,b1=a0+3;indices.push(a0,a1,b0,b0,a1,b1);shIndices.push(a0,a1,b0,b0,a1,b1);}
  if(i>0){const d0=total*(i-1)/n,pp=pointAt(d0),pbefore=pointAt(Math.max(0,d0-3)),pafter=pointAt(Math.min(total,d0+3));let ptx=pafter.x-pbefore.x,ptz=pafter.z-pbefore.z,pl=Math.hypot(ptx,ptz)||1;ptx/=pl;ptz/=pl;
   const plx=pp.x-ptz*half,plz=pp.z+ptx*half,prx=pp.x+ptz*half,prz=pp.z-ptx*half;
   roadEdgePositions.push(plx,heightAt(plx,plz)+.255,plz,lx,yL+.255,lz,prx,heightAt(prx,prz)+.255,prz,rx,yR+.255,rz);
  }
 }
 const indexOffset=roadPositions.length/3;roadPositions.push(...positions);roadUvs.push(...uvs);for(const idx of indices)roadIndices.push(indexOffset+idx);
 const shoulderOffset=shoulderPositions.length/3;shoulderPositions.push(...shoulders);for(const idx of shIndices)shoulderIndices.push(shoulderOffset+idx);
 for(let i=0;i<path.length-1;i++)roadSegments.push({a:path[i],b:path[i+1],width});
 if(marking&&total>80){for(let d=10;d<total-4;d+=18){const p=pointAt(d),before=pointAt(Math.max(0,d-2)),after=pointAt(Math.min(total,d+2));let tx=after.x-before.x,tz=after.z-before.z,l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;const dy=heightAt(p.x,p.z)+.255;roadMarkPositions.push(p.x-tx*2,dy,p.z-tz*2,p.x+tx*2,dy,p.z+tz*2);}}
}
function buildRoadNetwork(){
 const connected=new Set();
 const hubNames=['Brescia','Mantova','Desenzano del Garda','Montichiari','Iseo','Darfo Boario Terme','Gardone Val Trompia','Chiari','Rovato','Castiglione delle Stiviere','Suzzara','Asola','Viadana','Ostiglia','Pisogne','Salò','Lumezzane'];
 const hubs=hubNames.map(n=>townByName[n]).filter(Boolean);
 const mainRoutes=[
  ['Brescia','Rovato'],['Rovato',"Palazzolo sull'Oglio"],['Brescia','Desenzano del Garda'],['Brescia','Iseo'],
  ['Brescia','Montichiari'],['Brescia','Chiari'],['Brescia','Gardone Val Trompia'],['Gardone Val Trompia','Lumezzane'],
  ['Iseo','Pisogne'],['Pisogne','Darfo Boario Terme'],['Darfo Boario Terme','Esine'],['Desenzano del Garda','Salò'],
  ['Montichiari','Castiglione delle Stiviere'],['Montichiari','Mantova'],['Montichiari','Asola'],
  ['Mantova','Suzzara'],['Mantova','Ostiglia'],['Chiari','Orzinuovi'],['Asola','Viadana'],['Viadana','Suzzara']
 ];
 function connect(a,b,width,mark=true){const A=typeof a==='string'?townByName[a]:a,B=typeof b==='string'?townByName[b]:b;if(!A||!B||A===B)return;
  const ids=[Math.min(A.id,B.id),Math.max(A.id,B.id)].join('-');if(connected.has(ids))return;connected.add(ids);
  roadBetween(A,B,width,mark,Math.hypot(A.x-B.x,A.z-B.z)>1200);
 }
 for(const [a,b] of mainRoutes)connect(a,b,11,true);
 // Small settlements feed into one nearby road hub. They do not all receive links to every neighbour.
 for(const t of towns){if(hubs.includes(t))continue;
  let best=null,bestCost=Infinity;
  for(const h of hubs){const d=dist(t.x,t.z,h.x,h.z);const kindPenalty=(t.kind==='mountain'&&h.kind==='plain')?800:0;const cost=d+kindPenalty;if(cost<bestCost){best=h;bestCost=cost;}}
  if(best)connect(t,best, t.pop>20000?8: t.pop>8000?7:5.8, t.pop>9000);
 }
 // A few short local links improve redundancy without returning to a fully connected mesh.
 const localLinks=[];for(const t of towns.filter(t=>!hubs.includes(t)&&t.pop>10000)){
  const next=towns.filter(o=>o!==t&&!hubs.includes(o)&&o.province===t.province&&dist(t.x,t.z,o.x,o.z)<4700)
    .sort((a,b)=>dist(t.x,t.z,a.x,a.z)-dist(t.x,t.z,b.x,b.z))[0];
  if(next&&((t.id*17+next.id*13)%5===0))localLinks.push([t,next]);
 }
 for(const [a,b] of localLinks)connect(a,b,7,true);
}
buildRoadNetwork();
const ROAD_CLEARANCE_CELL=650;let roadSpatialIndex=null;
function buildRoadSpatialIndex(){
 roadSpatialIndex=new Map();
 for(const segment of roadSegments){
  const pad=segment.width*.5+30,minX=Math.floor((Math.min(segment.a.x,segment.b.x)-pad)/ROAD_CLEARANCE_CELL),maxX=Math.floor((Math.max(segment.a.x,segment.b.x)+pad)/ROAD_CLEARANCE_CELL);
  const minZ=Math.floor((Math.min(segment.a.z,segment.b.z)-pad)/ROAD_CLEARANCE_CELL),maxZ=Math.floor((Math.max(segment.a.z,segment.b.z)+pad)/ROAD_CLEARANCE_CELL);
  for(let ix=minX;ix<=maxX;ix++)for(let iz=minZ;iz<=maxZ;iz++){const k=ix+','+iz;if(!roadSpatialIndex.has(k))roadSpatialIndex.set(k,[]);roadSpatialIndex.get(k).push(segment);}
 }
}
function isNearRoad(x,z,clearance=20){
 if(!roadSpatialIndex)return false;
 const minX=Math.floor((x-clearance)/ROAD_CLEARANCE_CELL),maxX=Math.floor((x+clearance)/ROAD_CLEARANCE_CELL),minZ=Math.floor((z-clearance)/ROAD_CLEARANCE_CELL),maxZ=Math.floor((z+clearance)/ROAD_CLEARANCE_CELL);
 const seen=new Set();
 for(let ix=minX;ix<=maxX;ix++)for(let iz=minZ;iz<=maxZ;iz++)for(const seg of roadSpatialIndex.get(ix+','+iz)||[]){
  if(seen.has(seg))continue;seen.add(seg);
  const ax=seg.a.x,az=seg.a.z,dx=seg.b.x-ax,dz=seg.b.z-az,den=dx*dx+dz*dz||1;
  const t=clamp(((x-ax)*dx+(z-az)*dz)/den,0,1),px=ax+t*dx,pz=az+t*dz;
  if(Math.hypot(x-px,z-pz)<clearance+seg.width*.5)return true;
 }
 return false;
}
function localPoint(t,x,z,angle=0){return {x:t.x+x*Math.cos(angle)-z*Math.sin(angle),z:t.z+x*Math.sin(angle)+z*Math.cos(angle)};}
function buildTownStreets(){for(const t of towns){const r=townUrbanRadius(t),angle=(t.id*0.61803398875%1)*Math.PI,core=t.pop>100000?110:t.pop>20000?83:t.pop>8000?62:40;const streetW=t.pop>50000?8:t.pop>10000?6.5:5.2;const outer=r*.82;
 // Connected octagonal collector ring around each settlement.
 const ring=[];for(let i=0;i<8;i++){const a=i*Math.PI/4;ring.push(localPoint(t,Math.cos(a)*outer,Math.sin(a)*outer,angle));}
 for(let i=0;i<ring.length;i++)roadBetween(ring[i],ring[(i+1)%ring.length],streetW,false);
 // Four main approaches link the centre to the ring. The central square remains pedestrian space.
 for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const end=localPoint(t,Math.cos(a)*outer,Math.sin(a)*outer,angle),mid=localPoint(t,Math.cos(a)*(core+22),Math.sin(a)*(core+22),angle);roadBetween(mid,end,streetW,false);}
 // Residential grid. These streets meet the ring and the approaches instead of ending in empty grass.
 const offsets=[-r*.58,-r*.29,r*.29,r*.58];
 for(const v of offsets){let a=localPoint(t,v,-outer,angle),b=localPoint(t,v,-core-35,angle),c=localPoint(t,v,core+35,angle),d=localPoint(t,v,outer,angle);roadBetween(a,b,streetW*.72,false);roadBetween(c,d,streetW*.72,false);a=localPoint(t,-outer,v,angle);b=localPoint(t,-core-35,v,angle);c=localPoint(t,core+35,v,angle);d=localPoint(t,outer,v,angle);roadBetween(a,b,streetW*.72,false);roadBetween(c,d,streetW*.72,false);}
 }}
buildTownStreets();
buildRoadSpatialIndex(); // Include regional routes and local streets in vegetation clearance.
// Procedural asphalt grain follows each road; broad shoulder ribbons overlap at junctions to hide seams.
const asphaltCanvas=document.createElement('canvas');asphaltCanvas.width=256;asphaltCanvas.height=256;
const asphaltCtx=asphaltCanvas.getContext('2d');asphaltCtx.fillStyle='#eeeeea';asphaltCtx.fillRect(0,0,256,256);
for(let i=0;i<4800;i++){const v=Math.random(),x=Math.random()*256,y=Math.random()*256;asphaltCtx.fillStyle=v<.42?'rgba(35,39,37,.18)':v<.78?'rgba(95,99,95,.12)':'rgba(255,255,255,.20)';asphaltCtx.fillRect(x,y,Math.random()*2.2+.25,Math.random()*1.6+.25);}
for(let i=0;i<180;i++){asphaltCtx.strokeStyle='rgba(50,53,50,.09)';asphaltCtx.lineWidth=.6;asphaltCtx.beginPath();const x=Math.random()*256,y=Math.random()*256;asphaltCtx.moveTo(x,y);asphaltCtx.lineTo(x+rand(2,14),y+rand(-1,1));asphaltCtx.stroke();}
const asphaltTexture=new THREE.CanvasTexture(asphaltCanvas);asphaltTexture.wrapS=asphaltTexture.wrapT=THREE.RepeatWrapping;asphaltTexture.encoding=THREE.sRGBEncoding;asphaltTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());sharedMats.asphalt.map=asphaltTexture;sharedMats.asphalt.needsUpdate=true;
const shoulderGeo=new THREE.BufferGeometry();shoulderGeo.setAttribute('position',new THREE.Float32BufferAttribute(shoulderPositions,3));shoulderGeo.setIndex(shoulderIndices);shoulderGeo.computeVertexNormals();
const shoulderMesh=new THREE.Mesh(shoulderGeo,shoulderMat);shoulderMesh.material.side=THREE.DoubleSide;shoulderMesh.receiveShadow=true;shoulderMesh.frustumCulled=false;scene.add(shoulderMesh);
const roadGeo=new THREE.BufferGeometry();roadGeo.setAttribute('position',new THREE.Float32BufferAttribute(roadPositions,3));roadGeo.setAttribute('uv',new THREE.Float32BufferAttribute(roadUvs,2));roadGeo.setIndex(roadIndices);roadGeo.computeVertexNormals();
const roadMesh=new THREE.Mesh(roadGeo,sharedMats.asphalt);roadMesh.material.side=THREE.DoubleSide;roadMesh.receiveShadow=true;roadMesh.castShadow=false;roadMesh.frustumCulled=false;scene.add(roadMesh);
const roadMarkGeo=new THREE.BufferGeometry();roadMarkGeo.setAttribute('position',new THREE.Float32BufferAttribute(roadMarkPositions,3));const roadMarks=new THREE.LineSegments(roadMarkGeo,new THREE.LineBasicMaterial({color:0xd1cbb5,transparent:true,opacity:.84}));roadMarks.frustumCulled=false;scene.add(roadMarks);
const roadEdgeGeo=new THREE.BufferGeometry();roadEdgeGeo.setAttribute('position',new THREE.Float32BufferAttribute(roadEdgePositions,3));const roadEdges=new THREE.LineSegments(roadEdgeGeo,new THREE.LineBasicMaterial({color:0xc5c2b4,transparent:true,opacity:.50}));roadEdges.frustumCulled=false;scene.add(roadEdges);
// towns are represented by small clusters; larger centres receive a denser cluster.
const buildingBoxes=[];const villageLabels=[];
// Reuse instanced geometry for thousands of town houses instead of issuing a draw call per wall/window.
const houseLimit=4000;
const instWallMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.96});
const instRoofMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.94});
const instDoorMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.92});
const instWindowMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.22,metalness:.1});
const instWalls=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),instWallMat,houseLimit);
const roofGeo=new THREE.BufferGeometry();
roofGeo.setAttribute('position',new THREE.Float32BufferAttribute([
 -.5,0,-.5, 0,.43,-.5, 0,.43,.5, -.5,0,-.5, 0,.43,.5, -.5,0,.5,
 0,.43,-.5, .5,0,-.5, .5,0,.5, 0,.43,-.5, .5,0,.5, 0,.43,.5,
 -.5,0,-.5, .5,0,-.5, 0,.43,-.5, -.5,0,.5, 0,.43,.5, .5,0,.5
],3));roofGeo.computeVertexNormals();
instRoofMat.side=THREE.DoubleSide;
const instRoofs=new THREE.InstancedMesh(roofGeo,instRoofMat,houseLimit);
const instDoors=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),instDoorMat,houseLimit);
const instWindows=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),instWindowMat,houseLimit*2);
const instShutters=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.94}),houseLimit*4);
const instChimneys=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0xffffff,roughness:1}),houseLimit);
const instChimneyCaps=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0x504a40,roughness:1}),houseLimit);
for(const mesh of [instWalls,instRoofs,instDoors,instWindows,instShutters,instChimneys,instChimneyCaps]){mesh.count=0;mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);}
const housePalette=[0xbdb3a1,0xd4cbb8,0x9d6d53,0xb0b7ab,0xc4c0ae,0xc9b79e];
const roofPalette=[0x834f3b,0x675d52,0x8d5941,0x615c54,0x985f48];
const doorPalette=[0x6c513b,0x8b5b3b,0xb4a18b,0x4d5e5d];
const imDummy=new THREE.Object3D();let houseCount=0,windowCount=0,shutterCount=0,chimneyCount=0;
function setInstance(mesh,index,x,y,z,sx,sy,sz,rotationY=0,rotationZ=0,color=null){imDummy.position.set(x,y,z);imDummy.rotation.set(0,rotationY,rotationZ);imDummy.scale.set(sx,sy,sz);imDummy.updateMatrix();mesh.setMatrixAt(index,imDummy.matrix);if(color)mesh.setColorAt(index,new THREE.Color(color));}
function makeHouse(x,z,size=1,urban=false,yawOverride=null){
 if(houseCount>=houseLimit)return null;
 const y=heightAt(x,z),w=size*(urban?rand(8.5,12):rand(5.5,8)),d=size*(urban?rand(7.5,11):rand(5,8)),h=size*(urban?rand(5.5,8.5):rand(3.5,5.5));
 const wallColor=choose(housePalette),roofColor=choose(roofPalette),doorColor=choose(doorPalette),yaw=yawOverride===null?rand(0,Math.PI*2):yawOverride,i=houseCount++;
 setInstance(instWalls,i,x,y+h/2,z,w,h,d,yaw,0,wallColor);
 setInstance(instRoofs,i,x,y+h,z,w*1.12,h*.62,d*1.12,yaw,0,roofColor);
 const front=d/2+.08,fx=x+Math.sin(yaw)*front,fz=z+Math.cos(yaw)*front;
 setInstance(instDoors,i,fx,y+.85*size,fz,.78*size,1.7*size,.13*size,yaw,0,doorColor);
 for(const sx of [-1,1]){
  const wx=fx+sx*w*.27*Math.cos(yaw),wz=fz-sx*w*.27*Math.sin(yaw),wy=y+h*.63;
  setInstance(instWindows,windowCount++,wx,wy,wz,.82*size,.9*size,.1*size,yaw,0,0x39565d);
  const shutterColor=choose([0x675b42,0x75694d,0x4c5d4b,0x8b6b4c]);
  for(const side of [-1,1]){
   const off=side*.56*size,shx=wx+off*Math.cos(yaw)+Math.sin(yaw)*.08*size,shz=wz-off*Math.sin(yaw)+Math.cos(yaw)*.08*size;
   setInstance(instShutters,shutterCount++,shx,wy,shz,.16*size,1.02*size,.12*size,yaw,0,shutterColor);
  }
 }
 if(Math.random()<.34&&chimneyCount<houseLimit){
  const ox=(Math.random()-.5)*w*.34,oz=(Math.random()-.5)*d*.28,cx=x+ox*Math.cos(yaw)+oz*Math.sin(yaw),cz=z-ox*Math.sin(yaw)+oz*Math.cos(yaw),ch=rand(.62,.98)*size,k=chimneyCount++;
  const chimneyColor=choose([0x8a5945,0x7d5141,0x72685d,0x5f5b53]);
  setInstance(instChimneys,k,cx,y+h+h*.23+ch*.5,cz,.34*size,ch,.34*size,yaw,0,chimneyColor);
  setInstance(instChimneyCaps,k,cx,y+h+h*.23+ch+.035*size,cz,.40*size,.07*size,.40*size,yaw,0,0x504a40);
 }
 buildingBoxes.push({x,z,r:Math.max(w,d)*.52});return null;
}
function seededTownRandom(seed){let state=(seed+0x9e3779b9)>>>0;return ()=>{state=(Math.imul(state^state>>>15,1|state)+0x6d2b79f5)>>>0;state=Math.imul(state^state>>>7,61|state)>>>0;return ((state^state>>>14)>>>0)/4294967296;};}
function makeVillage(){for(const t of towns){const rnd=seededTownRandom(t.id+2002),r=townUrbanRadius(t),angle=(t.id*0.61803398875%1)*Math.PI,step=t.pop>50000?112:t.pop>20000?92:t.pop>10000?79:66,urban=t.pop>30000;
 const target=t.pop>150000?120:t.pop>50000?72:t.pop>20000?50:t.pop>10000?34:t.pop>5000?23:11,core=t.pop>100000?190:t.pop>20000?145:108,lots=[],lanes=[-r*.58,-r*.29,r*.29,r*.58];
 // Enumerate possible lots along blocks, then sample them across the whole neighbourhood instead of clustering them at one edge.
 for(const lane of lanes)for(let q=-r*.70;q<=r*.70;q+=step){if(Math.abs(q)<core&&Math.abs(lane)<core)continue;const jitter=(rnd()-.5)*9;lots.push({x:lane+20+jitter,z:q,yaw:-Math.PI/2-angle},{x:lane-20-jitter,z:q,yaw:Math.PI/2-angle},{x:q,z:lane+20+jitter,yaw:Math.PI-angle},{x:q,z:lane-20-jitter,yaw:-angle});}
 for(let i=lots.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[lots[i],lots[j]]=[lots[j],lots[i]];}
 let placed=0;for(const lot of lots){if(placed>=target)break;const p=localPoint(t,lot.x,lot.z,angle),scale=urban?.9+rnd()*.24:.82+rnd()*.30;makeHouse(p.x,p.z,scale,urban,lot.yaw);placed++;}
 // Detached fringe houses and farmyards taper out into countryside.
 const fringe=t.pop>50000?12:t.pop>10000?7:3;for(let i=0;i<fringe;i++){const a=rnd()*Math.PI*2,rr=r*(.78+rnd()*.7),p=localPoint(t,Math.cos(a)*rr,Math.sin(a)*rr,angle);makeHouse(p.x,p.z,.78+rnd()*.35,false,a+Math.PI/2);}
 if(t.kind==='plain'&&t.province==='MN'){for(let i=0;i<2;i++){const p=localPoint(t,(rnd()-.5)*r*2.3,(rnd()-.5)*r*2.2,angle),y=heightAt(p.x,p.z),w=rand(18,34),d=rand(24,48);box(scene,w,5,d,sharedMats.wall2,p.x,y+2.5,p.z);box(scene,w+1,.35,d+1,sharedMats.roof2,p.x,y+5.05,p.z);}}
 }}
const civicGroups=[];
function placeCivic(t,lx,lz,angle){const p=localPoint(t,lx,lz,angle);const g=new THREE.Group();g.position.set(p.x,analyticHeightAt(p.x,p.z),p.z);g.rotation.y=-angle;civicGroups.push(g);scene.add(g);return g;}
function civicBox(g,w,h,d,mat,x,y,z,rx=0,ry=0,rz=0){const m=box(g,w,h,d,mat,x,y,z,rx,ry,rz);m.castShadow=(mat!==sharedMats.glass&&mat!==sharedMats.black);m.receiveShadow=true;return m;}
const civicPlaster=new THREE.MeshStandardMaterial({color:0xd5cbbb,roughness:.92}),civicWarm=new THREE.MeshStandardMaterial({color:0xbda88d,roughness:.94}),civicRoof=new THREE.MeshStandardMaterial({color:0x8d4f3c,roughness:.95}),civicDarkRoof=new THREE.MeshStandardMaterial({color:0x625951,roughness:.92}),civicGlass=new THREE.MeshStandardMaterial({color:0x273f47,roughness:.24,metalness:.05}),civicStone=new THREE.MeshStandardMaterial({color:0x968a76,roughness:1}),civicPavement=new THREE.MeshStandardMaterial({color:0x8f928a,roughness:1}),civicInnerPavement=new THREE.MeshStandardMaterial({color:0xb7b4a8,roughness:1}),civicWater=new THREE.MeshStandardMaterial({color:0x477d85,roughness:.22,metalness:.12}),civicParkMat=new THREE.MeshStandardMaterial({color:0x82916f,roughness:1}),flagGreen=new THREE.MeshStandardMaterial({color:0x337c4c}),flagWhite=new THREE.MeshStandardMaterial({color:0xe8e2d1}),flagRed=new THREE.MeshStandardMaterial({color:0xb8453c}),marketRed=new THREE.MeshStandardMaterial({color:0xa64d3e,roughness:.78}),marketCream=new THREE.MeshStandardMaterial({color:0xdccda8,roughness:.84}),marketGreen=new THREE.MeshStandardMaterial({color:0x647c59,roughness:.84});
function civicWindowGrid(g,w,y,z,count=5,wallW=1){for(let i=0;i<count;i++){const x=-w/2+(i+.5)*w/count;civicBox(g,wallW,.92,.075,civicGlass,x,y,z);civicBox(g,wallW+.1,.07,.09,civicStone,x,y,z-.045);}}
function addTownHall(t,lx,lz,angle,scale=1){const g=placeCivic(t,lx,lz,angle);const w=17*scale,d=12*scale,h=8*scale;civicBox(g,w,h,d,civicPlaster,0,h/2,0);civicBox(g,w+1,.38,d+1,civicStone,0,h+.16,0);civicBox(g,w+1.2,.28,d+1.2,civicRoof,0,h+.48,0);civicBox(g,w*.42,.16,.3,civicStone,0,4.4*scale,-d/2-.18);for(let i=-2;i<=2;i++){cyl(g,.12*scale,.12*scale,3.3*scale,civicStone,i*2.2*scale,2.7*scale,-d/2-.28,0,0,0,8);}
 civicWindowGrid(g,w*.78,5.9*scale,-d/2-.10,Math.max(3,Math.round(4*scale)),1.0*scale);civicWindowGrid(g,w*.78,3.0*scale,-d/2-.10,Math.max(3,Math.round(4*scale)),1.0*scale);civicBox(g,1.7*scale,2.8*scale,.16,civicDarkRoof,0,1.45*scale,-d/2-.14);civicBox(g,2.4*scale,.22,.22,civicStone,0,4.7*scale,-d/2-.3);
 // The little municipal clock tower makes the centre recognisable from the approaches.
 civicBox(g,3.5*scale,4.7*scale,3.5*scale,civicWarm,0,h+2.45*scale,-1*scale);civicBox(g,4*scale,.25*scale,4*scale,civicRoof,0,h+4.85*scale,-1*scale);cyl(g,.65*scale,.65*scale,.12*scale,civicStone,0,h+2.5*scale,-2.84*scale,Math.PI/2,0,0,20);cyl(g,.48*scale,.48*scale,.13*scale,civicDarkRoof,0,h+2.5*scale,-2.92*scale,Math.PI/2,0,0,20);civicBox(g,.09*scale,.55*scale,.08,civicWarm,0,h+2.56*scale,-3.02*scale);civicBox(g,.35*scale,.08*scale,.08,civicWarm,.1*scale,h+2.5*scale,-3.02*scale);civicBox(g,.09*scale,.5*scale,.08,civicWarm,0,h+2.75*scale,-3.02*scale);
 const flagY=h+5.2*scale;for(let i=0;i<3;i++)civicBox(g,.16*scale,.42*scale,.06,[flagGreen,flagWhite,flagRed][i],2.7*scale+i*.16*scale,flagY,-d/2-.12);
 buildingBoxes.push({x:g.position.x,z:g.position.z,r:Math.max(w,d)*.58});return g;}
function addChurch(t,lx,lz,angle,scale=1){const g=placeCivic(t,lx,lz,angle);const w=12*scale,d=23*scale,h=7*scale;civicBox(g,w,h,d,civicWarm,0,h/2,0);civicBox(g,w+.45*scale,.2,d+.5*scale,civicStone,0,h+.1*scale,0);const roofA=civicBox(g,w*.59,.28*scale,d+.8*scale,civicRoof,-w*.25,h+1.05*scale,0,0,0,.52);const roofB=civicBox(g,w*.59,.28*scale,d+.8*scale,civicRoof,w*.25,h+1.05*scale,0,0,0,-.52);
 // A two-stage bell tower, arched belfry and cross.
 civicBox(g,4.8*scale,9*scale,5.2*scale,civicPlaster,-w*.52,4.5*scale,-d*.34);civicBox(g,3.8*scale,4.0*scale,4.2*scale,civicWarm,-w*.52,11*scale,-d*.34);civicBox(g,4.4*scale,.22*scale,4.7*scale,civicRoof,-w*.52,13.1*scale,-d*.34);const spire=new THREE.Mesh(new THREE.ConeGeometry(2.45*scale,3.3*scale,4),civicRoof);spire.position.set(-w*.52,14.8*scale,-d*.34);spire.rotation.y=Math.PI/4;g.add(spire);civicBox(g,.12*scale,2.2*scale,.12*scale,civicStone,-w*.52,17.25*scale,-d*.34);civicBox(g,.9*scale,.12*scale,.12*scale,civicStone,-w*.52,17.45*scale,-d*.34);
 // Front portal and a rose window above it.
 civicBox(g,2.1*scale,3.4*scale,.16,civicDarkRoof,0,1.72*scale,-d/2-.1);cyl(g,.95*scale,.95*scale,.12*scale,civicStone,0,5.2*scale,-d/2-.14,Math.PI/2,0,0,20);cyl(g,.68*scale,.68*scale,.14*scale,civicGlass,0,5.2*scale,-d/2-.22,Math.PI/2,0,0,20);
 for(let z of [-5,3,8]){civicBox(g,.09,2.0*scale,.68*scale,civicGlass,w/2+.03,3.3*scale,z*scale);civicBox(g,.09,2.0*scale,.68*scale,civicGlass,-w/2-.03,3.3*scale,z*scale);}
 buildingBoxes.push({x:g.position.x,z:g.position.z,r:Math.max(w,d)*.56});return g;}
function addSchool(t,lx,lz,angle,scale=1){const g=placeCivic(t,lx,lz,angle);const w=22*scale,d=12*scale,h=6.5*scale;civicBox(g,w,h,d,civicPlaster,0,h/2,0);civicBox(g,w+1,.28,d+1,civicDarkRoof,0,h+.14,0);civicBox(g,3*scale,2.5*scale,.15,civicStone,0,1.25*scale,-d/2-.12);civicBox(g,1.35*scale,2.1*scale,.17,civicDarkRoof,0,1.1*scale,-d/2-.2);for(const y of [2.4,4.7])for(let i=0;i<6;i++)civicBox(g,1.45*scale,1.05*scale,.08,civicGlass,(-w*.40)+i*(w*.16),y*scale,-d/2-.12);civicBox(g,5*scale,.16*scale,.25,civicStone,0,h+.26*scale,-d/2-.25);
 // Playground and a painted basketball court.
 const yard=box(scene,27*scale,.09,20*scale,civicParkMat,g.position.x+26*scale,g.position.y+.04,g.position.z+3*scale);yard.receiveShadow=true;civicBox(g,18*scale,.035,.13,civicStone,26*scale,.105,3*scale);
 buildingBoxes.push({x:g.position.x,z:g.position.z,r:Math.max(w,d)*.55});return g;}
function addMarket(t,lx,lz,angle,scale=1){const g=placeCivic(t,lx,lz,angle);const count=t.pop>50000?6:t.pop>20000?5:3;for(let i=0;i<count;i++){const x=(i-(count-1)/2)*4.6*scale,z=(i%2)*4.2*scale;const awning=i%3===0?marketRed:i%3===1?marketCream:marketGreen;civicBox(g,3.7*scale,.16*scale,3.1*scale,awning,x,3.05*scale,z);civicBox(g,3.4*scale,.62*scale,1.0*scale,civicStone,x,1.05*scale,z);for(const dx of [-1.65,1.65])for(const dz of [-1.3,1.3])cyl(g,.055*scale,.055*scale,2.9*scale,civicStone,x+dx*scale,1.5*scale,z+dz*scale,0,0,0,6);civicBox(g,.48*scale,.65*scale,.08,civicWarm,x-.7*scale,1.72*scale,z-1.62*scale);}
 buildingBoxes.push({x:g.position.x,z:g.position.z,r:Math.max(12,count*2.5)*scale});}
function addPiazza(t,angle){const g=placeCivic(t,0,0,angle),sz=t.pop>100000?135:t.pop>50000?108:t.pop>20000?88:t.pop>8000?70:48;const paving=civicBox(g,sz,.18,sz*.78,civicPavement,0,.10,0);paving.receiveShadow=true;
 const inner=box(g,sz*.83,.035,sz*.60,civicInnerPavement,0,.205,0);inner.receiveShadow=true;
 // Simple stone fountain with a water basin, benches and period streetlamps.
 cyl(g,6.2,6.7,.62,civicStone,0,.51,0,0,0,0,28);cyl(g,4.9,5.2,.12,civicWater,0,.89,0,0,0,0,28);cyl(g,1.05,1.3,1.7,civicStone,0,1.55,0,0,0,0,16);cyl(g,.12,.12,1.3,civicStone,0,2.95,0,0,0,0,10);
 for(const [x,z,ry] of [[-sz*.30,0,0],[sz*.30,0,0],[0,-sz*.27,Math.PI/2],[0,sz*.27,Math.PI/2]]){civicBox(g,sz*.15,.32,1.2,civicWarm,x,.38,z,0,ry,0);}
 for(const [x,z] of [[-sz*.39,-sz*.30],[sz*.39,-sz*.30],[-sz*.39,sz*.30],[sz*.39,sz*.30]]){cyl(g,.08,.12,4.5,civicStone,x,2.35,z,0,0,0,8);cyl(g,.32,.36,.24,new THREE.MeshStandardMaterial({color:0xd6c89b,emissive:0x5a4b26,emissiveIntensity:.15}),x,4.62,z,0,0,0,10);}
 return {size:sz};}
function addTownLandmarks(){for(const t of towns){const angle=(t.id*0.61803398875%1)*Math.PI,sz=t.pop>100000?245:t.pop>50000?185:t.pop>20000?145:t.pop>8000?102:70;addPiazza(t,angle);addChurch(t,-sz*.56,-sz*.28,angle,t.pop>50000?1.16:t.pop>10000?1:.82);if(t.pop>5000)addTownHall(t,sz*.57,-sz*.18,angle,t.pop>50000?1.12:t.pop>10000?1:.86);if(t.pop>6000)addSchool(t,sz*.56,sz*.76,angle,t.pop>50000?1.25:t.pop>20000?1.05:.88);if(t.pop>10000)addMarket(t,-sz*.5,sz*.72,angle,t.pop>50000?1.05:.82);
 // Major towns receive extra public buildings in separate neighbourhoods, rather than a single landmark cluster.
 if(t.pop>20000){addSchool(t,-sz*1.08,sz*.78,angle+.18,t.pop>100000?1.08:.92);addMarket(t,sz*.98,sz*1.08,angle-.12,t.pop>100000?.95:.78);}
 if(t.pop>100000)addChurch(t,sz*1.08,-sz*.82,angle+.72,.90);
 // Larger settlements get a small public garden and apartment blocks; mountain hamlets stay compact.
 if(t.pop>20000){const park=placeCivic(t,sz*1.05,sz*.5,angle);const grass=new THREE.MeshStandardMaterial({color:0x78916b,roughness:1});civicBox(park,60, .08,45,grass,0,.05,0);for(let i=0;i<7;i++){const x=(i-3)*7;cyl(park,.11,.16,4.4,sharedMats.treeTrunk,x,2.2,-13,0,0,0,7);for(const [dx,dy,dz,sc] of [[0,4.2,0,1.55],[-.65,3.8,.12,1.0],[.65,4.05,-.1,1.05]])ellipsoid(park,sc,sc,sc,sharedMats.leaf, x+dx,dy+0.5,-13+dz,0,0,0,1);}
  const n=t.pop>100000?10:4;for(let i=0;i<n;i++){const ox=(i%5-2)*43+sz*1.15,oz=(Math.floor(i/5)-.5)*46;const bg=placeCivic(t,ox,oz,angle);const bw=18+((i+1)%3)*3,bd=16+((i+2)%2)*4,bh=12+(i%3)*4;civicBox(bg,bw,bh,bd,civicWarm,0,bh/2,0);civicBox(bg,bw+.8,.5,bd+.8,civicDarkRoof,0,bh+.25,0);for(let floor=0;floor<Math.floor(bh/3.4);floor++)for(let col=0;col<4;col++)civicBox(bg,1.4,1.15,.075,civicGlass,-bw*.37+col*bw*.245,2+floor*3.4,-bd/2-.05);buildingBoxes.push({x:bg.position.x,z:bg.position.z,r:Math.max(bw,bd)*.55});}}
 }}
function addCivicFoundations(){
 const foundationMat=new THREE.MeshStandardMaterial({color:0x837b6d,roughness:.98,side:THREE.DoubleSide});
 for(const group of civicGroups){
  group.updateMatrixWorld(true);let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
  const children=group.children.filter(c=>c.isMesh);
  for(const child of children){
   child.updateMatrix();if(!child.geometry.boundingBox)child.geometry.computeBoundingBox();
   const b=child.geometry.boundingBox.clone().applyMatrix4(child.matrix);
   minX=Math.min(minX,b.min.x);maxX=Math.max(maxX,b.max.x);minZ=Math.min(minZ,b.min.z);maxZ=Math.max(maxZ,b.max.z);
  }
  if(!Number.isFinite(minX)||maxX-minX<1||maxZ-minZ<1)continue;
  const halfW=(maxX-minX)*.5+1.2,halfD=(maxZ-minZ)*.5+1.2,cx=(minX+maxX)*.5,cz=(minZ+maxZ)*.5;
  const sides=[
   {a:{x:cx-halfW,z:cz-halfD},b:{x:cx+halfW,z:cz-halfD},nx:0,nz:-1},
   {a:{x:cx+halfW,z:cz+halfD},b:{x:cx-halfW,z:cz+halfD},nx:0,nz:1},
   {a:{x:cx-halfW,z:cz+halfD},b:{x:cx-halfW,z:cz-halfD},nx:-1,nz:0},
   {a:{x:cx+halfW,z:cz-halfD},b:{x:cx+halfW,z:cz+halfD},nx:1,nz:0}
  ];
  for(const side of sides){
   const length=Math.hypot(side.b.x-side.a.x,side.b.z-side.a.z),segments=Math.max(1,Math.ceil(length/12)),verts=[],indices=[];let maxDrop=0;
   const top=.035;
   for(let i=0;i<=segments;i++){
    const q=i/segments,lx=lerp(side.a.x,side.b.x,q),lz=lerp(side.a.z,side.b.z,q);
    const yaw=group.rotation.y;
    const wx=group.position.x+lx*Math.cos(yaw)+lz*Math.sin(yaw);
    const wz=group.position.z-lx*Math.sin(yaw)+lz*Math.cos(yaw);
    const worldNX=side.nx*Math.cos(yaw)+side.nz*Math.sin(yaw),worldNZ=-side.nx*Math.sin(yaw)+side.nz*Math.cos(yaw);
    const sampleX=wx+worldNX*5,sampleZ=wz+worldNZ*5;
    const groundY=heightAt(sampleX,sampleZ),drop=group.position.y-groundY;maxDrop=Math.max(maxDrop,drop);
    const bottom=Math.min(-.4,groundY-group.position.y-.35);
    verts.push(lx,top,lz,lx,bottom,lz);
   }
   // On level sites use only a modest foundation curb; on slopes the same skirt becomes a retaining face.
   if(maxDrop<1.0){
    for(let i=0;i<=segments;i++)verts[i*6+4]=-.45;
   }
   for(let i=0;i<segments;i++){const a=i*2,b=a+1,c=a+2,d=a+3;indices.push(a,c,b,b,c,d);}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();
   const wall=new THREE.Mesh(geo,foundationMat);wall.castShadow=true;wall.receiveShadow=true;group.add(wall);
  }
 }
}
function mergeCivicGroups(){for(const group of civicGroups){}const buckets=new Map(),oldMeshes=group.children.filter(c=>c.isMesh);for(const child of oldMeshes){child.updateMatrix();const mat=Array.isArray(child.material)?child.material[0]:child.material;let b=buckets.get(mat);if(!b){b={mat,positions:[],normals:[],indices:[],count:0,cast:false,receive:false};buckets.set(mat,b);}const geo=child.geometry.clone();geo.applyMatrix4(child.matrix);if(!geo.getAttribute('normal'))geo.computeVertexNormals();const pa=geo.getAttribute('position'),na=geo.getAttribute('normal'),offset=b.positions.length/3;for(let i=0;i<pa.count;i++){b.positions.push(pa.getX(i),pa.getY(i),pa.getZ(i));b.normals.push(na.getX(i),na.getY(i),na.getZ(i));}if(geo.index){for(const id of geo.index.array)b.indices.push(offset+id);}else for(let i=0;i<pa.count;i++)b.indices.push(offset+i);b.cast=b.cast||child.castShadow;b.receive=b.receive||child.receiveShadow;geo.dispose();}
 for(const child of oldMeshes)group.remove(child);for(const b of buckets.values()){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(b.positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(b.normals,3));geo.setIndex(b.indices);const m=new THREE.Mesh(geo,b.mat);m.castShadow=b.cast;m.receiveShadow=b.receive;group.add(m);}}}
makeVillage();
addTownLandmarks();
addCivicFoundations();
mergeCivicGroups();
instWalls.count=houseCount;instRoofs.count=houseCount;instDoors.count=houseCount;instWindows.count=windowCount;instShutters.count=shutterCount;instChimneys.count=chimneyCount;instChimneyCaps.count=chimneyCount;for(const mesh of [instWalls,instRoofs,instDoors,instWindows,instShutters,instChimneys,instChimneyCaps]){mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;}
const TREE_CAPACITY=16000,treeData=[];let trunks,leafA,leafB,leafC,leafD,leafE,treeDummy=new THREE.Object3D(),treeWindClock=0;
function treeInstance(mesh,k,x,y,z,scaleX,scaleY,scaleZ,rx=0,ry=0,rz=0,color=null){treeDummy.position.set(x,y,z);treeDummy.rotation.set(rx,ry,rz);treeDummy.scale.set(scaleX,scaleY,scaleZ);treeDummy.updateMatrix();mesh.setMatrixAt(k,treeDummy.matrix);if(color)mesh.setColorAt(k,new THREE.Color(color));}
function addTreeAt(x,z,forcedScale=null){if(treeData.length>=TREE_CAPACITY||inLake(x,z)||isNearRoad(x,z,18))return;const terrain=heightAt(x,z);if(terrain>2100)return;const scale=forcedScale||rand(.72,1.45),yaw=rand(0,Math.PI*2),phase=rand(0,Math.PI*2),y=terrain,k=treeData.length;treeInstance(trunks,k,x,y+1.55*scale,z,scale,scale,scale,0,yaw,0);const shades=[new THREE.Color().setHSL(rand(.24,.34),rand(.28,.46),rand(.23,.34)),new THREE.Color().setHSL(rand(.24,.34),rand(.28,.48),rand(.25,.37)),new THREE.Color().setHSL(rand(.24,.34),rand(.28,.48),rand(.24,.36)),new THREE.Color().setHSL(rand(.24,.34),rand(.28,.46),rand(.25,.38))];
 treeInstance(leafA,k,x,y+4.05*scale,z,1.6*scale,1.65*scale,1.55*scale,0,yaw,0,shades[0]);treeInstance(leafB,k,x-.86*scale,y+4.0*scale,z+.12*scale,1.18*scale,1.22*scale,1.12*scale,.08,yaw+.6,.08,shades[1]);treeInstance(leafC,k,x+.84*scale,y+4.25*scale,z-.08*scale,1.20*scale,1.28*scale,1.18*scale,-.06,yaw-1.0,-.08,shades[2]);treeInstance(leafD,k,x+.08*scale,y+5.08*scale,z-.12*scale,1.15*scale,1.30*scale,1.15*scale,.04,yaw+.15,0,shades[3]);treeInstance(leafE,k,x+.03*scale,y+5.72*scale,z+.04*scale,.78*scale,.92*scale,.80*scale,-.03,yaw-.35,.02,shades[1]);treeData.push({x,z,y,scale,yaw,phase});trunks.count=leafA.count=leafB.count=leafC.count=leafD.count=leafE.count=treeData.length;}
function makeTrees(){const trunkGeo=new THREE.CylinderGeometry(.13,.25,3.1,8);const leafGeo=new THREE.SphereGeometry(1,14,10);const leafBaseMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1});const leafAltMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1});trunks=new THREE.InstancedMesh(trunkGeo,sharedMats.treeTrunk,TREE_CAPACITY);leafA=new THREE.InstancedMesh(leafGeo,leafBaseMat,TREE_CAPACITY);leafB=new THREE.InstancedMesh(leafGeo,leafAltMat,TREE_CAPACITY);leafC=new THREE.InstancedMesh(leafGeo,leafBaseMat,TREE_CAPACITY);leafD=new THREE.InstancedMesh(leafGeo,leafAltMat,TREE_CAPACITY);leafE=new THREE.InstancedMesh(leafGeo,leafBaseMat,TREE_CAPACITY);for(const m of [trunks,leafA,leafB,leafC,leafD,leafE]){m.castShadow=true;m.receiveShadow=true;m.count=0;scene.add(m);}
 // Random field trees and mixed woodland groups; dense tree lines follow valleys and rural roads.
 let tries=0;while(treeData.length<1750&&tries++<18000){const x=rand(-3500,62000),z=rand(-4000,69000);if(towns.some(t=>dist(x,z,t.x,t.z)<townUrbanRadius(t)*.88))continue;addTreeAt(x,z);}
 const groves=[];for(let i=0;i<30;i++){const north=i<20;groves.push({x:rand(1000,38000),z:north?rand(-2500,26500):rand(26000,59000),r:rand(850,2100)});}
 for(const grove of groves){const target=treeData.length+Math.floor(rand(120,220));let localTry=0;while(treeData.length<target&&localTry++<1800){const a=rand(0,Math.PI*2),r=Math.sqrt(Math.random())*grove.r,x=grove.x+Math.cos(a)*r,z=grove.z+Math.sin(a)*r;if(towns.some(t=>dist(x,z,t.x,t.z)<townUrbanRadius(t)*.78))continue;addTreeAt(x,z);}}
}
function updateFoliage(dt,p,gameState){treeWindClock+=dt;if(treeWindClock<.12)return;treeWindClock=0;const wind=clamp((gameState.wind||8)/70,.04,.8),clock=performance.now()*.001;let dirty=false;for(let i=0;i<treeData.length;i++){const t=treeData[i];if(dist(p.x,p.z,t.x,t.z)>1500)continue;const sway=Math.sin(clock*1.05+t.phase)*wind*.105,swaySide=Math.cos(clock*.83+t.phase*.71)*wind*.065,sc=t.scale;
 treeInstance(trunks,i,t.x,t.y+1.55*sc,t.z,sc,sc,sc,swaySide*.16,t.yaw,sway*.12);
 treeInstance(leafA,i,t.x+sway*1.2*sc,t.y+4.05*sc,t.z+swaySide*1.2*sc,1.6*sc,1.65*sc,1.55*sc,swaySide*.6,t.yaw,sway);
 treeInstance(leafB,i,t.x+(-.86+sway*.8)*sc,t.y+4.0*sc,t.z+(.12+swaySide)*sc,1.18*sc,1.22*sc,1.12*sc,.08+swaySide,t.yaw+.6,.08+sway);
 treeInstance(leafC,i,t.x+(.84+sway*1.1)*sc,t.y+4.25*sc,t.z+(-.08+swaySide)*sc,1.20*sc,1.28*sc,1.18*sc,-.06+swaySide,t.yaw-1.0,-.08+sway);
 treeInstance(leafD,i,t.x+(.08+sway*1.4)*sc,t.y+5.08*sc,t.z+(-.12+swaySide*1.3)*sc,1.15*sc,1.30*sc,1.15*sc,.04+swaySide,t.yaw+.15,sway*1.3);treeInstance(leafE,i,t.x+.03*sc,t.y+5.72*sc,t.z+.04*sc,.78*sc,.92*sc,.80*sc,-.03,t.yaw-.35,.02);dirty=true;}
 if(dirty)for(const m of [trunks,leafA,leafB,leafC,leafD,leafE])m.instanceMatrix.needsUpdate=true;}
makeTrees();
function makeForests(){
 const rnd=seededTownRandom(20020602);
 const specs=[
  {zone:'mountain',count:4,minR:1450,maxR:2200,minTrees:460,maxTrees:700},
  {zone:'mountain',count:8,minR:650,maxR:1250,minTrees:170,maxTrees:290},
  {zone:'mountain',count:12,minR:280,maxR:640,minTrees:45,maxTrees:105},
  {zone:'plain',count:5,minR:700,maxR:1350,minTrees:150,maxTrees:280}
 ];
 for(const spec of specs)for(let forest=0;forest<spec.count;forest++){
  let center=null,radius=0;
  for(let attempt=0;attempt<900&&!center;attempt++){
   const x=spec.zone==='mountain'?rnd()*41000+2500:rnd()*62000-2500;
   const z=spec.zone==='mountain'?rnd()*39000-9000:rnd()*29000+41000;
   radius=spec.minR+rnd()*(spec.maxR-spec.minR);
   const h=heightAt(x,z);if(inLake(x,z)||(spec.zone==='mountain'?(h<310||h>1900):(h>260)))continue;
   if(isNearRoad(x,z,90))continue;
   if(towns.some(t=>dist(x,z,t.x,t.z)<townUrbanRadius(t)+radius+500))continue;
   center={x,z};
  }
  if(!center)continue;
  const target=Math.floor(spec.minTrees+rnd()*(spec.maxTrees-spec.minTrees));let made=0,tries=0;
  while(made<target&&tries++<target*5&&treeData.length<TREE_CAPACITY){
   const angle=rnd()*Math.PI*2,distance=Math.sqrt(rnd())*radius,x=center.x+Math.cos(angle)*distance,z=center.z+Math.sin(angle)*distance;
   if(inLake(x,z)||isNearRoad(x,z,26))continue;
   if(towns.some(t=>dist(x,z,t.x,t.z)<townUrbanRadius(t)*.82+50))continue;
   const h=heightAt(x,z);if(spec.zone==='mountain'?(h<250||h>2000):(h>270))continue;
   const before=treeData.length;addTreeAt(x,z,.78+rnd()*.72);if(treeData.length>before)made++;
  }
 }
}
makeForests();
// a few roadside utility poles sell the early-2000s countryside silhouette
function makePole(x,z){const y=heightAt(x,z);cyl(scene,.13,.18,7,new THREE.MeshStandardMaterial({color:0x514c43}),x,y+3.5,z,0,0,0,7);box(scene,2.2,.16,.15,sharedMats.roof2,x,y+6.4,z);}
for(let i=0;i<roadSegments.length;i+=4){const s=roadSegments[i];for(const q of [.22,.72]){const x=lerp(s.a.x,s.b.x,q),z=lerp(s.a.z,s.b.z,q);if(Math.random()<.48)makePole(x+rand(-12,12),z+rand(-12,12));}}
// The interior is deliberately furnished like a modest 2002 home.
const homeOptions=towns;const homeTown=choose(homeOptions);const homeAngle=rand(0,Math.PI*2);const homeOffset=homeTown.pop>150000?rand(500,950):homeTown.pop>50000?rand(350,700):homeTown.pop>15000?rand(220,420):homeTown.pop>5000?rand(130,310):rand(35,160);const homeX=homeTown.x+Math.cos(homeAngle)*homeOffset,homeZ=homeTown.z+Math.sin(homeAngle)*homeOffset;const homeGroup=new THREE.Group();homeGroup.position.set(homeX,heightAt(homeX,homeZ),homeZ);scene.add(homeGroup);
// A small belt of trees around the starting home makes the ground legible at walking distance.
for(let i=0;i<190;i++){const a=rand(0,Math.PI*2),r=rand(28,260);const tx=homeX+Math.cos(a)*r,tz=homeZ+Math.sin(a)*r;if(dist(tx,tz,homeX,homeZ)>24)addTreeAt(tx,tz,rand(.75,1.35));}for(const m of [trunks,leafA,leafB,leafC,leafD,leafE]){m.instanceMatrix.needsUpdate=true;m.count=treeData.length;}
// Generated 2002-style town-entry signs on the regional roads.
function makeRoadSign(x,z,name,province='BS',angle=0){const y=heightAt(x,z);const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=angle;scene.add(group);cyl(group,.065,.085,2.55,sharedMats.concrete,0,1.27,0,0,0,0,8);box(group,2.35,.64,.12,sharedMats.white,0,2.54,0);const c=document.createElement('canvas');c.width=512;c.height=116;const cx=c.getContext('2d');cx.fillStyle='#f1efe1';cx.fillRect(0,0,512,116);cx.strokeStyle='#212824';cx.lineWidth=7;cx.strokeRect(4,4,504,108);cx.fillStyle='#202721';cx.textAlign='center';cx.textBaseline='middle';cx.font=(name.length>18?'bold 28px Arial':'bold 34px Arial');cx.fillText(name.toUpperCase(),256,48,480);cx.font='22px Arial';cx.fillStyle='#59675a';cx.fillText(province==='BS'?'PROVINCIA DI BRESCIA':'PROVINCIA DI MANTOVA',256,86);const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;const face=new THREE.Mesh(new THREE.PlaneGeometry(2.18,.46),new THREE.MeshStandardMaterial({map:tex,roughness:.78,side:THREE.DoubleSide}));face.position.set(0,2.54,.078);group.add(face);return group;}
// Place the municipal signs on the actual approach roads at the settlement edge, not randomly beside the village.
const entryCount=towns.filter(t=>t.pop>5000).length;
const speedCanvas=document.createElement('canvas');speedCanvas.width=256;speedCanvas.height=256;
const speedCtx=speedCanvas.getContext('2d');speedCtx.clearRect(0,0,256,256);speedCtx.beginPath();speedCtx.arc(128,128,116,0,Math.PI*2);speedCtx.fillStyle='#f7f6ef';speedCtx.fill();speedCtx.lineWidth=22;speedCtx.strokeStyle='#c32f2b';speedCtx.stroke();
speedCtx.fillStyle='#141818';speedCtx.textAlign='center';speedCtx.textBaseline='middle';speedCtx.font='bold 98px Arial';speedCtx.fillText('50',128,130);
const speedTexture=new THREE.CanvasTexture(speedCanvas);speedTexture.encoding=THREE.sRGBEncoding;
const speedMaterial=new THREE.MeshStandardMaterial({map:speedTexture,transparent:true,alphaTest:.08,roughness:.7,side:THREE.DoubleSide});
const speedPlates=new THREE.InstancedMesh(new THREE.CircleGeometry(.43,32),speedMaterial,entryCount);
const speedPosts=new THREE.InstancedMesh(new THREE.CylinderGeometry(.035,.055,2.2,10),sharedMats.concrete,entryCount);
const speedDummy=new THREE.Object3D();let speedCount=0;
for(const t of towns.filter(t=>t.pop>5000)){
 const nearest=towns.filter(o=>o!==t).sort((a,b)=>dist(t.x,t.z,a.x,a.z)-dist(t.x,t.z,b.x,b.z))[0];
 const angle=nearest?Math.atan2(nearest.x-t.x,nearest.z-t.z):0,radius=townUrbanRadius(t)*.82;
 // The approach road runs along the bearing to the nearest settlement; signs sit just outside its shoulder.
 const signX=t.x+Math.sin(angle)*radius+Math.cos(angle)*7,signZ=t.z+Math.cos(angle)*radius-Math.sin(angle)*7;
 makeRoadSign(signX,signZ,t.name,t.province,angle);
 const sx=signX+Math.cos(angle)*3.0,sz=signZ-Math.sin(angle)*3.0,sy=heightAt(sx,sz);
 speedDummy.position.set(sx,sy+1.10,sz);speedDummy.rotation.set(0,angle,0);speedDummy.scale.set(1,1,1);speedDummy.updateMatrix();speedPosts.setMatrixAt(speedCount,speedDummy.matrix);
 speedDummy.position.set(sx,sy+1.87,sz);speedDummy.updateMatrix();speedPlates.setMatrixAt(speedCount,speedDummy.matrix);speedCount++;
}
speedPosts.count=speedCount;speedPosts.instanceMatrix.needsUpdate=true;scene.add(speedPosts);
speedPlates.count=speedCount;speedPlates.instanceMatrix.needsUpdate=true;scene.add(speedPlates);

const streetNames=['VIA ROMA','VIA XX SETTEMBRE','VIA GIUSEPPE GARIBALDI','VIA DANTE ALIGHIERI','VIA MARCONI','VIA DELLA STAZIONE','VIA MAZZINI','VIA MATTEOTTI','VIA SAN ROCCO','VIA DEL MERCATO','VIA EUROPA','VIA DEI TIGLI','VIA DELLA REPUBBLICA','VIA SAN GIOVANNI','VIA DELLE SCUOLE','VIA ALPINI'];
const streetSignMax=towns.filter(t=>t.pop>=5000).reduce((n,t)=>n+(t.pop>50000?4:t.pop>15000?3:t.pop>8000?2:1),0);
const streetPosts=new THREE.InstancedMesh(new THREE.BoxGeometry(.065,2.45,.065),new THREE.MeshStandardMaterial({color:0x777c76,roughness:.8}),streetSignMax);
const streetPostDummy=new THREE.Object3D();let streetPostCount=0;
function makeStreetPlate(x,z,name,angle){
 const y=heightAt(x,z),w=1.62,h=.27;
 streetPostDummy.position.set(x,y+1.22,z);streetPostDummy.rotation.set(0,angle,0);streetPostDummy.scale.set(1,1,1);streetPostDummy.updateMatrix();streetPosts.setMatrixAt(streetPostCount++,streetPostDummy.matrix);
 const c=document.createElement('canvas');c.width=512;c.height=88;const ctx=c.getContext('2d');
 ctx.fillStyle='#255b78';ctx.fillRect(0,0,512,88);ctx.strokeStyle='#f0f0e7';ctx.lineWidth=8;ctx.strokeRect(5,5,502,78);
 ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=name.length>20?'bold 28px Arial':'bold 36px Arial';ctx.fillText(name,256,45,476);
 const tex=new THREE.CanvasTexture(c);tex.encoding=THREE.sRGBEncoding;
 const board=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.72,side:THREE.DoubleSide}));
 board.position.set(x,y+2.20,z);board.rotation.y=angle;board.castShadow=false;scene.add(board);
}
for(const t of towns.filter(t=>t.pop>=5000)){
 const count=t.pop>50000?4:t.pop>15000?3:t.pop>8000?2:1;
 const angle=(t.id*.61803398875%1)*Math.PI,core=t.pop>100000?110:t.pop>20000?83:t.pop>8000?62:40;
 for(let k=0;k<count;k++){
  const dir=k*Math.PI/2,distAlong=core+38,offset=3.8,lx=Math.cos(dir)*distAlong+Math.cos(dir+Math.PI/2)*offset,lz=Math.sin(dir)*distAlong+Math.sin(dir+Math.PI/2)*offset;
  const p=localPoint(t,lx,lz,angle),name=streetNames[(t.id*3+k*5)%streetNames.length];
  makeStreetPlate(p.x,p.z,name,angle+dir+Math.PI/2);
 }
}
streetPosts.count=streetPostCount;streetPosts.instanceMatrix.needsUpdate=true;scene.add(streetPosts);
roadBetween({x:homeX+7,z:homeZ+12},{x:homeX+115,z:homeZ+79},6.8);
makeRoadSign(homeX+95,homeZ+67,homeTown.name,homeTown.province,Math.atan2(108,67));
      return {scene,camera,renderer,hemi,sun,groundMat,box,cyl,towns,townByName,townUrbanRadius,heightAt,rawTerrainHeight,inLake,lakeLevel,nearestTown,roadSegments,roadBetween,buildingBoxes,sharedMats,homeTown,homeX,homeZ,homeGroup,updateFoliage,addTreeAt};
    }
  };
})(window);
