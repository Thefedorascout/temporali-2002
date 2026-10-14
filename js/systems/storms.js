// Storm-cloud visual factory; storm movement and precipitation remain part of simulation logic.
(function(global){
  global.TemporaliStorms = {
    create({THREE,scene,rand}) {
const storms=[];const stormMat=new THREE.MeshStandardMaterial({color:0x3b4548,roughness:1,transparent:true,opacity:.9,flatShading:true});const cloudLightMat=new THREE.MeshStandardMaterial({color:0x737e7e,roughness:1,transparent:true,opacity:.72,flatShading:true});
function makeStorm(x,z,intensity=.8,kind='supercell'){const group=new THREE.Group();const cloudCount=kind==='supercell'?42:27;for(let i=0;i<cloudCount;i++){const mat=Math.random()<.8?stormMat:cloudLightMat;const g=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),mat);const rr=kind==='supercell'?rand(100,480):rand(120,390);g.position.set(rand(-1800,1800),rand(780,1900),rand(-1500,1500));g.scale.set(rr*rand(1.4,2.7),rr*rand(.35,.8),rr*rand(1.1,2.1));g.rotation.set(rand(0,1),rand(0,6),rand(0,1));g.castShadow=false;group.add(g);}const anvil=new THREE.Mesh(new THREE.IcosahedronGeometry(1,2),cloudLightMat);anvil.position.set(350,1740,-200);anvil.scale.set(2200,340,1000);group.add(anvil);scene.add(group);const s={x,z,intensity,baseIntensity:intensity,kind,group,vx:rand(-7,7),vz:rand(-6,6),phase:rand(0,6),age:rand(0,250),lifetime:rand(1000,2800),baseX:x,baseZ:z};storms.push(s);return s;}
      return {storms,makeStorm};
    }
  };
})(window);
