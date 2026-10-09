import {T} from './art.js';
const vertices=[],colors=[];
for(let i=0;i<7;i++){
 const a=i*2.399,x=Math.cos(a)*.13,z=Math.sin(a)*.13,h=.16+(i%3)*.055,w=.025;
 const dx=Math.cos(a)*w,dz=Math.sin(a)*w;
 vertices.push(x-dx,0,z-dz,x+dx,0,z+dz,x+Math.sin(a)*.07,h,z+Math.cos(a)*.07);
 for(let k=0;k<3;k++)colors.push(k===2?.38:.19,k===2?.57:.35,k===2?.15:.075);
}
const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
const material=new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide});material.userData.cutawayExcluded=true;
export function meadowTufts(placements,parent){
 const mesh=new T.InstancedMesh(geometry,material,placements.length),o=new T.Object3D();
 placements.forEach((p,i)=>{o.position.set(p.x,p.y+.015,p.z);o.rotation.y=p.r||0;o.scale.setScalar((p.s||.15)*6);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});
 mesh.receiveShadow=true;mesh.computeBoundingSphere();parent.add(mesh);return mesh;
}
