// Procedural first-generation Fiat Multipla model, isolated from world construction and gameplay state.
(function(global){
  global.TemporaliVehicle = {
    create({THREE,scene,homeX,homeZ,heightAt,sharedMats,box,cyl}) {
      const rand=(a,b)=>a+Math.random()*(b-a);
// Fiat Multipla 1st generation (1998-2004): the unmistakable, slightly awkward tall body, raised glasshouse,
// short bulbous bonnet, split-level circular lamps, enormous grey bumpers and tall side windows.
const carRoot=new THREE.Group();scene.add(carRoot);carRoot.scale.y=.62; // the body is now a realistic ~1.7 m tall; length and width remain true to the car's proportions
const carPaint=new THREE.MeshStandardMaterial({color:0xa92838,roughness:.31,metalness:.16});
const carDarkPaint=new THREE.MeshStandardMaterial({color:0x45494a,roughness:.69,metalness:.04});
const bumperMat=new THREE.MeshStandardMaterial({color:0x55595a,roughness:.74,metalness:.02});
const lampMat=new THREE.MeshStandardMaterial({color:0xf8f1df,emissive:0xa79673,emissiveIntensity:.12,roughness:.2,metalness:.08});
const rearLamp=new THREE.MeshStandardMaterial({color:0x9d2921,emissive:0x280807,roughness:.28});
const indicatorMat=new THREE.MeshStandardMaterial({color:0xe5a13f,emissive:0x6f3210,emissiveIntensity:.08,roughness:.27});
const chromeMat=new THREE.MeshStandardMaterial({color:0x9a9d98,metalness:.56,roughness:.34});
const multiplaGlass=new THREE.MeshStandardMaterial({color:0x315761,roughness:.2,metalness:.08,transparent:true,opacity:.94,side:THREE.DoubleSide});
const glassRubber=new THREE.MeshStandardMaterial({color:0x1d2425,roughness:.78});
const redTail=new THREE.MeshStandardMaterial({color:0xb9342b,roughness:.3,emissive:0x200504});
const tyreMat=new THREE.MeshStandardMaterial({color:0x171918,roughness:.98});
const alloyMat=new THREE.MeshStandardMaterial({color:0xb9bdb8,roughness:.35,metalness:.58});
function ellipsoid(parent,sx,sy,sz,mat,x,y,z,rx=0,ry=0,rz=0,detail=2){const m=new THREE.Mesh(new THREE.SphereGeometry(1,detail===2?24:16,detail===2?16:10),mat);m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function carPanel(parent,verts,mat){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.material.side=THREE.DoubleSide;m.castShadow=false;m.receiveShadow=true;parent.add(m);return m;}
function carLoft(parent,sections,mat){const profile=[[0,-.5],[.58,-.5],[.82,-.46],[.96,-.30],[1,-.04],[.97,.25],[.84,.42],[.62,.5],[0,.5],[-.62,.5],[-.84,.42],[-.97,.25],[-1,-.04],[-.96,-.30],[-.82,-.46],[-.58,-.5]];const ring=profile.length,verts=[],idx=[];
 for(const sec of sections){for(const [px,py] of profile)verts.push(px*sec.w,sec.bottom+(py+.5)*(sec.top-sec.bottom),sec.z);}
 for(let r=0;r<sections.length-1;r++)for(let j=0;j<ring;j++){const a=r*ring+j,b=r*ring+(j+1)%ring,c=(r+1)*ring+j,d=(r+1)*ring+(j+1)%ring;idx.push(a,b,c,b,d,c);}
 const startCenter=verts.length/3;verts.push(0,(sections[0].bottom+sections[0].top)/2,sections[0].z);const endCenter=verts.length/3;const last=sections[sections.length-1];verts.push(0,(last.bottom+last.top)/2,last.z);for(let j=0;j<ring;j++){idx.push(startCenter,(j+1)%ring,j);const a=(sections.length-1)*ring+j,b=(sections.length-1)*ring+(j+1)%ring;idx.push(endCenter,a,b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,mat);mesh.material.side=THREE.DoubleSide;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
// The lower shell is broad and rounded, with an unusually short, high bonnet.
carLoft(carRoot,[{z:-2.02,w:.72,bottom:.47,top:1.34},{z:-1.88,w:.87,bottom:.42,top:1.52},{z:-1.54,w:.99,bottom:.40,top:1.58},{z:-1.12,w:1.035,bottom:.39,top:1.57},{z:-.45,w:1.045,bottom:.39,top:1.56},{z:.45,w:1.035,bottom:.40,top:1.55},{z:1.15,w:.98,bottom:.43,top:1.52},{z:1.65,w:.87,bottom:.47,top:1.43},{z:1.93,w:.70,bottom:.54,top:1.22}],carPaint);
// Very tall cabin/glasshouse, a defining feature of the first-series Multipla.
carLoft(carRoot,[{z:-1.46,w:.72,bottom:1.49,top:1.67},{z:-1.26,w:.82,bottom:1.50,top:1.98},{z:-.91,w:.90,bottom:1.51,top:2.55},{z:-.57,w:.935,bottom:1.50,top:2.68},{z:.20,w:.94,bottom:1.50,top:2.70},{z:.76,w:.92,bottom:1.48,top:2.65},{z:1.12,w:.88,bottom:1.45,top:2.50},{z:1.43,w:.80,bottom:1.36,top:2.07},{z:1.58,w:.73,bottom:1.26,top:1.73}],carPaint);
// The roof edge is nearly flat and thick, with soft corners rather than a pointed van roof.
ellipsoid(carRoot,.88,.085,1.02,carPaint,0,2.64,.10,0,0,0,2);
// Broad front windscreen and rear hatch glass follow the steep, unusual cabin angles.
carPanel(carRoot,[-.80,2.50,-.87,.80,2.50,-.87,.77,1.72,-1.48,-.77,1.72,-1.48],multiplaGlass);
carPanel(carRoot,[-.74,1.75,1.52,.74,1.75,1.52,.78,2.12,1.39,-.78,2.12,1.39],multiplaGlass);
// Side glazing: four tall panes per side, each framed individually by thick black rubber pillars.
for(const side of [-1,1]){
 const x=side*.895;
 carPanel(carRoot,[side*.83,2.48,-.85,side*.895,2.49,-.42,side*.895,1.73,-.35,side*.83,1.73,-1.22],multiplaGlass);
 carPanel(carRoot,[side*.895,2.49,-.38,side*.925,2.54,.18,side*.925,1.73,.20,side*.895,1.73,-.35],multiplaGlass);
 carPanel(carRoot,[side*.925,2.54,.22,side*.91,2.51,.72,side*.91,1.72,.72,side*.925,1.73,.22],multiplaGlass);
 carPanel(carRoot,[side*.91,2.50,.76,side*.84,2.30,1.28,side*.84,1.62,1.28,side*.91,1.72,.76],multiplaGlass);
 for(const z of [-.40,.20,.73])box(carRoot,.065,.86,.075,glassRubber,side*.94,2.12,z,0,0,side*.025);
 box(carRoot,.055,.08,1.55,glassRubber,side*1.015,1.56,.10);
 // Wide side moulding, two door gaps and the characteristic oversized black mirrors.
 box(carRoot,.055,.18,1.85,carDarkPaint,side*1.015,1.08,.12);
 for(const z of [-.64,.65]){box(carRoot,.025,.73,.025,carDarkPaint,side*1.018,1.02,z);ellipsoid(carRoot,.032,.035,.11,chromeMat,side*1.045,1.48,z-.15,0,0,0,1);}
 box(carRoot,.09,.055,.18,carDarkPaint,side*1.045,1.55,-.73,0,0,side*.1);
 box(carRoot,.18,.15,.30,glassRubber,side*1.08,1.73,-.91,0,0,side*.18);
 ellipsoid(carRoot,.18,.125,.21,carDarkPaint,side*1.17,1.78,-.91,0,0,side*.13,1);
 // Long rear light clusters, black wheel-arch mouldings and an amber front side repeater.
 box(carRoot,.16,.43,.12,carDarkPaint,side*.82,1.24,1.84);box(carRoot,.12,.35,.055,redTail,side*.825,1.25,1.88);box(carRoot,.12,.12,.06,indicatorMat,side*.825,1.06,1.88);
 ellipsoid(carRoot,.055,.095,.045,indicatorMat,side*1.045,1.36,-1.16,0,0,0,1);
 // Front and rear wheel arch lips use low rounded moulding segments.
 for(const wz of [-1.28,1.25]){const arch=new THREE.Mesh(new THREE.TorusGeometry(.445,.052,7,28),carDarkPaint);arch.position.set(side*1.025,.59,wz);arch.rotation.y=Math.PI/2;arch.scale.set(.74,.74/.62,.74);arch.castShadow=true;carRoot.add(arch);}
}
// Multipla's double-height face: little lamps atop the nose, larger round headlights, narrow upper slot and low grille.
ellipsoid(carRoot,1.03,.19,.14,bumperMat,0,.68,-1.99);
ellipsoid(carRoot,1.00,.11,.13,carDarkPaint,0,.86,-2.04);
// Upper slim grille beneath the centre of the bonnet.
box(carRoot,.72,.105,.055,glassRubber,0,1.405,-2.055);box(carRoot,.62,.035,.018,chromeMat,0,1.43,-2.09);
for(let i=0;i<3;i++)box(carRoot,1.28-i*.06,.025,.035,chromeMat,0,.84-i*.09,-2.10+i*.005);
for(const side of [-1,1]){
 // Large circular principal headlights.
 ellipsoid(carRoot,.245,.225,.10,bumperMat,side*.755,1.18,-2.055,0,0,0,2);
 ellipsoid(carRoot,.201,.184,.105,lampMat,side*.755,1.18,-2.115,0,0,0,2);
 ellipsoid(carRoot,.16,.145,.025,sharedMats.white,side*.755,1.18,-2.137,0,0,0,2);
 // The pair of smaller round marker/position lights sits conspicuously higher on the bonnet.
 ellipsoid(carRoot,.124,.125,.07,bumperMat,side*.80,1.575,-1.965,0,0,0,2);
 ellipsoid(carRoot,.085,.087,.065,lampMat,side*.80,1.575,-2.012,0,0,0,2);
 // Low fog lamps are set into the broad plastic bumper at its corners.
 ellipsoid(carRoot,.125,.12,.07,glassRubber,side*.80,.66,-2.025,0,0,0,2);
 ellipsoid(carRoot,.083,.08,.075,lampMat,side*.80,.66,-2.07,0,0,0,2);
}
// Centre badge and the characteristic wide, multi-slat lower intake.
ellipsoid(carRoot,.105,.08,.038,chromeMat,0,1.43,-2.10,0,0,0,1);ellipsoid(carRoot,.055,.042,.042,new THREE.MeshStandardMaterial({color:0x294d77,metalness:.3,roughness:.4}),0,1.43,-2.13,0,0,0,1);
box(carRoot,1.12,.19,.06,glassRubber,0,.99,-2.065);box(carRoot,.92,.025,.04,bumperMat,0,.94,-2.11);box(carRoot,.98,.025,.04,bumperMat,0,1.045,-2.11);
// A small Italian plate and recessed plate surround.
box(carRoot,.52,.18,.035,glassRubber,0,.75,-2.12);box(carRoot,.46,.125,.025,sharedMats.white,0,.75,-2.147);const plateCanvas=document.createElement('canvas');plateCanvas.width=512;plateCanvas.height=128;const pc=plateCanvas.getContext('2d');pc.fillStyle='#f4f2e9';pc.fillRect(0,0,512,128);pc.fillStyle='#245a91';pc.fillRect(0,0,34,128);pc.fillRect(478,0,34,128);pc.fillStyle='#f4f2e9';pc.font='bold 73px Arial';pc.textAlign='center';pc.textBaseline='middle';pc.fillText('AB 123 CD',256,67);const plateTex=new THREE.CanvasTexture(plateCanvas);plateTex.encoding=THREE.sRGBEncoding;const plateFace=new THREE.Mesh(new THREE.PlaneGeometry(.44,.105),new THREE.MeshStandardMaterial({map:plateTex,roughness:.8,side:THREE.DoubleSide}));plateFace.position.set(0,.75,-2.166);carRoot.add(plateFace);
// Wipers, roof aerial, number plate trim, door seals and rear-hatch handle.
box(carRoot,.68,.025,.035,glassRubber,-.18,1.685,-1.42,0,0,-.10);box(carRoot,.68,.025,.035,glassRubber,.28,1.69,-1.42,0,0,.10);
cyl(carRoot,.023,.023,.48,glassRubber,.22,2.745,-.1,0,0,.20,8);
box(carRoot,.5,.055,.045,glassRubber,0,1.63,1.94);box(carRoot,.24,.04,.06,chromeMat,0,1.57,1.98);
// Small interior details visible through the windscreen: dashboard, steering wheel and six-seat headrests.
box(carRoot,1.43,.16,.42,carDarkPaint,0,1.63,-1.02);
box(carRoot,.86,.12,.12,glassRubber,0,1.69,-1.18);
const steering=new THREE.Mesh(new THREE.TorusGeometry(.21,.025,8,20),glassRubber);steering.position.set(.48,1.78,-.90);steering.rotation.x=Math.PI/2;carRoot.add(steering);
for(const x of [-.58,0,.58])for(const z of [-.23,.69]){box(carRoot,.32,.12,.27,sharedMats.interior,x,1.94,z);box(carRoot,.27,.32,.12,sharedMats.interior,x,2.12,z+.08);}
// Four road wheels with dark sidewalls, silver multi-spoke rims and raised wheel-arch trim.
const wheels=[];for(const sx of [-1,1])for(const sz of [-1,1]){const wg=new THREE.Group();wg.position.set(sx*.985,.59,sz*1.27);wg.scale.set(.74,.74/.62,.74);carRoot.add(wg);
 cyl(wg,.405,.405,.265,tyreMat,0,0,0,0,0,Math.PI/2,28);
 for(const faceSide of [-1,1]){cyl(wg,.292,.292,.028,glassRubber,faceSide*.137,0,0,0,0,Math.PI/2,24);cyl(wg,.245,.245,.032,alloyMat,faceSide*.158,0,0,0,0,Math.PI/2,24);cyl(wg,.082,.082,.038,chromeMat,faceSide*.18,0,0,0,0,Math.PI/2,16);
  for(let a=0;a<6;a++){const an=a*Math.PI/3;box(wg,.025,.17,.052,alloyMat,faceSide*.18,Math.sin(an)*.145,Math.cos(an)*.145,an,0,0);const hole=ellipsoid(wg,.018,.025,.025,glassRubber,faceSide*.182,Math.sin(an)*.205,Math.cos(an)*.205,0,0,0,1);}}
 const hub=ellipsoid(wg,.105,.105,.105,alloyMat,0,0,0,0,0,0,1);wheels.push(wg);}
let car={x:homeX+15,z:homeZ+19,yaw:-2.12,speed:0,driving:false,fuel:76};
carRoot.position.set(car.x,heightAt(car.x,car.z),car.z);carRoot.rotation.y=car.yaw;
      return {carRoot,wheels,car};
    }
  };
})(window);
