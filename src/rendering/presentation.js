import {T} from './art.js';
// Optional multisampled scene target; Eco renders directly without a second GPU pass.
export class Presentation {
 constructor(renderer){this.renderer=renderer;this.size=new T.Vector2();this.quad=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{image:{value:null}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`uniform sampler2D image;varying vec2 vUv;void main(){vec3 c=texture2D(image,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.035);float edge=dot(vUv-.5,vUv-.5);c*=1.-edge*.12;gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`}));this.scene=new T.Scene();this.scene.add(this.quad);this.camera=new T.Camera();}
 configure(q){this.quality=q;this.target?.dispose();this.target=null;if(q==='low')return;const r=this.renderer;r.getDrawingBufferSize(this.size);this.target=new T.WebGLRenderTarget(this.size.x,this.size.y,{samples:q==='medium'?2:4,depthBuffer:true});this.quad.material.uniforms.image.value=this.target.texture;}
 render(scene,camera){const r=this.renderer;if(!this.target){r.render(scene,camera);return;}r.getDrawingBufferSize(this.size);if(this.target.width!==this.size.x||this.target.height!==this.size.y)this.target.setSize(this.size.x,this.size.y);r.setRenderTarget(this.target);r.render(scene,camera);r.setRenderTarget(null);r.render(this.scene,this.camera);}
}
