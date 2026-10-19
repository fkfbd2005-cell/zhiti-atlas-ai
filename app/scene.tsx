import {useEffect,useRef} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createExplosionLayout} from './explosion-layout';
import {decodeModelResponse} from './model-download';
import {PointerTap} from './pointer-tap';
import {cameraTransitionDuration,easeInOutCubic,safeFocusDistance,transitionVisibility} from './camera-transition';
import {SYSTEMS,type Atlas,type SceneState} from './anatomy';
interface Props {atlas:Atlas;state:SceneState;preferredSelection?:string[];onSelect:(id:string)=>void;onProgress:(n:number)=>void;onError:(s:string)=>void}
export default function AnatomyScene({atlas,state,preferredSelection=[],onSelect,onProgress,onError}:Props){
 const host=useRef<HTMLDivElement>(null),latest=useRef(state),select=useRef(onSelect),preferred=useRef(preferredSelection);
 latest.current=state;select.current=onSelect;preferred.current=preferredSelection;
 useEffect(()=>{
  const el=host.current!;let disposed=false,frame=0,dirty=true,ready=false,lastView='',lastReset=-1,lastIsolate='',layoutKey='',amount=0;
  let lastState:SceneState|null=null;
  const abort=new AbortController();
  let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{onError('This browser could not start the 3D viewer. Please try a browser with WebGL enabled.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.5:2));renderer.setClearColor('#f2f3f3');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Interactive human anatomy. Drag to orbit, pinch or scroll to zoom, and tap a structure to inspect it.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.005,100),controls=new OrbitControls(camera,renderer.domElement);
  camera.position.set(1.4,1.05,3.6);controls.target.set(0,.85,0);controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=.07;controls.maxDistance=40;controls.maxPolarAngle=Math.PI*.96;controls.addEventListener('change',()=>{dirty=true;});
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xffffff,0xa7acb2,1.05));
  const key=new T.DirectionalLight(0xfffaf4,2.3);key.position.set(-2,4,3);scene.add(key);
  const rim=new T.DirectionalLight(0xe9f0ff,1.8);rim.position.set(2,2,-3);scene.add(rim);
  const ground=new T.Mesh(new T.CircleGeometry(30,96),new T.MeshStandardMaterial({color:0xd5d9dc,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.019;scene.add(ground);
  const platform=new T.Mesh(new T.CylinderGeometry(.68,.7,.028,100),new T.MeshStandardMaterial({color:0xeeeeec,metalness:.12,roughness:.67}));platform.position.y=-.016;scene.add(platform);
  const ring=new T.Mesh(new T.RingGeometry(.63,.632,128),new T.MeshBasicMaterial({color:0x8c969f,transparent:true,opacity:.4,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.001;scene.add(ring);
  const innerRing=new T.Mesh(new T.RingGeometry(.55,.551,128),new T.MeshBasicMaterial({color:0xa4aeb8,transparent:true,opacity:.16,side:T.DoubleSide}));innerRing.rotation.x=-Math.PI/2;innerRing.position.y=.001;scene.add(innerRing);
  const width=T.MathUtils.ceilPowerOfTwo(atlas.parts.length),data=new Float32Array(width*4),partTexture=new T.DataTexture(data,width,1,T.RGBAFormat,T.FloatType);partTexture.needsUpdate=true;
  const selectedData=new Uint8Array(width*4),selectionTexture=new T.DataTexture(selectedData,width,1);selectionTexture.needsUpdate=true;
  const materials:T.Material[]=[],geometries:T.BufferGeometry[]=[],pickers:(T.Mesh|undefined)[]=[],centers=atlas.parts.map(p=>new T.Vector3().fromArray(p.bounds[0]).add(new T.Vector3().fromArray(p.bounds[1])).multiplyScalar(.5));
  const offsets:T.Vector3[]=[],bounds=atlas.parts.map(p=>new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1])));
  let packingWidth=1,packingHeight=1;
  const hover=document.createElement('div');hover.className='part-hover';hover.setAttribute('role','tooltip');hover.hidden=true;el.appendChild(hover);
  type Target={index:number;x:number;y:number;left:number;right:number;top:number;bottom:number};let targets:Target[]=[];
  const projected=new T.Vector3();
  const findTarget=(x:number,y:number,radius:number)=>{
   let best=-1,score=Infinity;
   for(const t of targets){const dx=Math.max(t.left-x,0,x-t.right),dy=Math.max(t.top-y,0,y-t.bottom),distance=Math.hypot(dx,dy);if(distance>radius)continue;const candidate=distance+Math.hypot(t.x-x,t.y-y)*.025;if(candidate<score){score=candidate;best=t.index;}}
   return best;
  };
  const findPreferredScreenTarget=(x:number,y:number,radius:number)=>{
   const preferredIds=new Set(preferred.current);let best=-1,score=Infinity;
   atlas.parts.forEach((part,index)=>{if(!preferredIds.has(part.id)||data[index*4+3]<.5)return;projected.copy(centers[index]).add(new T.Vector3(data[index*4],data[index*4+1],data[index*4+2])).project(camera);if(projected.z< -1||projected.z>1)return;const centerX=(projected.x+1)*el.clientWidth/2,centerY=(1-projected.y)*el.clientHeight/2;let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(let corner=0;corner<8;corner++){projected.set(part.bounds[(corner&1)?1:0][0]+data[index*4],part.bounds[(corner&2)?1:0][1]+data[index*4+1],part.bounds[(corner&4)?1:0][2]+data[index*4+2]).project(camera);const px=(projected.x+1)*el.clientWidth/2,py=(1-projected.y)*el.clientHeight/2;left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}const dx=Math.max(left-x,0,x-right),dy=Math.max(top-y,0,y-bottom),distance=Math.hypot(dx,dy);if(distance>radius)return;const candidate=distance+Math.hypot(centerX-x,centerY-y)*.02;if(candidate<score){score=candidate;best=index;}});return best;
  };
  const materialFor=(system:string)=>{
   const m=new T.MeshStandardMaterial({color:SYSTEMS.find(s=>s.id===system)?.color??'#aebbb8',metalness:.08,roughness:.53,side:T.DoubleSide,transparent:system==='integumentary',opacity:system==='integumentary'?.1:1,depthWrite:system!=='integumentary'});
   m.onBeforeCompile=shader=>{
    shader.uniforms.partState={value:partTexture};shader.uniforms.selectionState={value:selectionTexture};shader.uniforms.stateWidth={value:width};
    shader.vertexShader='attribute float partIndex; uniform sampler2D partState; uniform sampler2D selectionState; uniform float stateWidth; varying float partVisible; varying float partSelected;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 state = texture2D(partState, stateUv); transformed += state.xyz; partVisible = state.w; partSelected = texture2D(selectionState, stateUv).r;');
    shader.fragmentShader='varying float partVisible; varying float partSelected;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (partVisible < 0.5) discard;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.85, 0.78), partSelected * 0.75);');
   };materials.push(m);return m;
  };
  const mats=new Map(SYSTEMS.map(s=>[s.id,materialFor(s.id)]));
  const focusMaterials=new Map(SYSTEMS.map(system=>{const material=new T.MeshStandardMaterial({color:system.color,metalness:.08,roughness:.5,side:T.DoubleSide,emissive:new T.Color('#0a8990'),emissiveIntensity:.08});materials.push(material);return [system.id,material] as const;}));
  const focusGroup=new T.Group(),focusMeshes=new Map<number,T.Mesh>();focusGroup.renderOrder=3;scene.add(focusGroup);
  let loaded=0;
  const loadChunk=async(ci:number)=>{
   const chunk=atlas.chunks[ci],compressed=!!chunk.gzip&&typeof DecompressionStream!=='undefined',asset=(url:string)=>`${import.meta.env.BASE_URL}${url.replace(/^\/+/, '')}`;const response=await fetch(asset(compressed?chunk.gzip!:chunk.url),{signal:abort.signal});const buffer=await decodeModelResponse(response,chunk.bytes,compressed);if(disposed)return;
   const groups=new Map<string,T.BufferGeometry[]>();
   atlas.parts.forEach((p,i)=>{
    if(p.chunk!==ci)return;
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,p.positions,p.vertexCount*3),3));
    g.setAttribute('normal',new T.BufferAttribute(new Int16Array(buffer,p.normals,p.vertexCount*3),3,true));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1));
    g.boundingBox=bounds[i].clone();g.computeBoundingSphere();const pick=new T.Mesh(g);pick.matrixAutoUpdate=false;pickers[i]=pick;geometries.push(g);
    g.setAttribute('partIndex',new T.BufferAttribute(new Float32Array(p.vertexCount).fill(i),1));
    const list=groups.get(p.system)??[];list.push(g);groups.set(p.system,list);
   });
   groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('Could not assemble anatomy geometry.');geometries.push(geometry);const mesh=new T.Mesh(geometry,mats.get(system as never));mesh.frustumCulled=false;scene.add(mesh);});
   lastState=null;loaded++;onProgress(Math.round(loaded/atlas.chunks.length*100));dirty=true;
  };
  (async()=>{try{let cursor=0;await Promise.all(Array.from({length:3},async()=>{while(cursor<atlas.chunks.length){const i=cursor++;await loadChunk(i);}}));if(!disposed){ready=true;dirty=true;}}catch(e){if(!disposed)onError(e instanceof Error?e.message:'Could not load the anatomy.');}})();
  const fitPose=(view:string,extent=0)=>{
   const aspect=camera.aspect,mobile=el.clientWidth<768,normalDistance=mobile?Math.max(4.5,1.8*el.clientHeight/Math.max(160,el.clientHeight-350)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))):4;
   const reservedHeight=mobile?350:270;const availableAspect=Math.max(.35,(el.clientWidth-(mobile?40:340))/Math.max(160,el.clientHeight-reservedHeight));const atlasDistance=Math.max(packingHeight,packingWidth/availableAspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*(el.clientHeight/Math.max(160,el.clientHeight-reservedHeight))*1.08;
   const distance=T.MathUtils.lerp(normalDistance,Math.max(.2,atlasDistance),extent);if(extent>.8)view='front';
   const direction=view==='front'?new T.Vector3(0,.02,1):view==='back'?new T.Vector3(0,.02,-1):view==='side'?new T.Vector3(1,.02,0):new T.Vector3(.35,.06,1).normalize();
   const target=new T.Vector3(extent>.1&&el.clientWidth>767?-packingWidth*.12:0,extent>.1||mobile?.85:.68,0);return {target,position:target.clone().addScaledVector(direction,distance)};
  };
  const applyPose=(pose:{target:T.Vector3;position:T.Vector3})=>{controls.target.copy(pose.target);camera.position.copy(pose.position);controls.update();dirty=true;};
  type CameraFlight={started:number;duration:number;fromPosition:T.Vector3;fromTarget:T.Vector3;toPosition:T.Vector3;toTarget:T.Vector3;focus:boolean;cancelled:boolean;progress:number};
  let flight:CameraFlight|null=null;
  const startFlight=(pose:{target:T.Vector3;position:T.Vector3},focus:boolean)=>{const distance=camera.position.distanceTo(pose.position)+controls.target.distanceTo(pose.target);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;flight={started:performance.now(),duration:cameraTransitionDuration(distance,reduced)*1000,fromPosition:camera.position.clone(),fromTarget:controls.target.clone(),toPosition:pose.position,toTarget:pose.target,focus,cancelled:false,progress:0};if(!flight.duration){applyPose(pose);flight=null;}dirty=true;};
  const cancelFlight=()=>{if(flight){flight.cancelled=true;flight=null;controls.update();dirty=true;}};
  const resize=()=>{layoutKey='';lastState=null;renderer.setPixelRatio(Math.min(devicePixelRatio,el.clientWidth<768||el.clientHeight<600?1.5:2));camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);if(!flight&&!latest.current.isolate)applyPose(fitPose(latest.current.view,amount));};const observer=new ResizeObserver(resize);observer.observe(el);
  const raycaster=new T.Raycaster(),pointer=new T.Vector2(),tap=new PointerTap(),worldBox=new T.Box3(),hitPoint=new T.Vector3();
  const down=(e:PointerEvent)=>{cancelFlight();hover.hidden=true;tap.down(e.pointerId,e.clientX,e.clientY,e.pointerType==='touch'?12:5);};
  const move=(e:PointerEvent)=>{tap.move(e.pointerId,e.clientX,e.clientY);if(e.buttons||amount<.5||e.pointerType==='touch'){hover.hidden=true;return;}const rect=el.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,index=findTarget(x,y,12);hover.hidden=index<0;renderer.domElement.style.cursor=index<0?'grab':'pointer';if(index>=0){hover.textContent=atlas.parts[index].name;hover.style.left=`${Math.max(8,Math.min(x+14,el.clientWidth-260))}px`;hover.style.top=`${Math.max(8,Math.min(y+18,el.clientHeight-55))}px`;}};
  const cancel=(e:PointerEvent)=>tap.cancel(e.pointerId);
  const up=(e:PointerEvent)=>{
   const validTap=tap.up(e.pointerId,e.clientX,e.clientY);if(!validTap||!ready)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
   let nearest=Infinity,found=-1,preferredNearest=Infinity,preferredFound=-1;const preferredIds=new Set(preferred.current),hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);
   pickers.forEach((mesh,i)=>{if(!mesh||data[i*4+3]<.5||(hasSolid&&atlas.parts[i].system==='integumentary'))return;worldBox.copy(bounds[i]).translate(mesh.position);if(!raycaster.ray.intersectBox(worldBox,hitPoint))return;const hits=raycaster.intersectObject(mesh,false);if(!hits[0])return;const distance=hits[0].distance;if(distance<nearest){nearest=distance;found=i;}if(preferredIds.has(atlas.parts[i].id)&&distance<preferredNearest){preferredNearest=distance;preferredFound=i;}});
   if(preferredFound<0&&preferredIds.size)preferredFound=findPreferredScreenTarget(e.clientX-rect.left,e.clientY-rect.top,e.pointerType==='touch'?20:12);
   if(preferredFound>=0)found=preferredFound;
   if(found<0&&amount>.45)found=findTarget(e.clientX-rect.left,e.clientY-rect.top,e.pointerType==='touch'?24:16);if(found>=0){hover.hidden=true;select.current(atlas.parts[found].id);}
  };
  const wheel=()=>cancelFlight();renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',cancel);renderer.domElement.addEventListener('wheel',wheel,{passive:true});
  const clock=new T.Clock();let lastExtent=-1;
  const animate=()=>{
   if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),s=latest.current;
   const changed=lastState?.visible!==s.visible||lastState?.selected!==s.selected||lastState?.isolate!==s.isolate||lastState?.systemOpacity!==s.systemOpacity;
   const moving=Math.abs(amount-s.explode)>.0001,localExplosionActive=(s.explodeSelection?.length??0)>0&&s.explode>.01;
   if(moving){amount=T.MathUtils.damp(amount,s.explode,8,dt);dirty=true;}
   const focusProgress=flight?.focus?flight.progress:(s.isolate?1:0);
   if(changed||moving||lastExtent<0||!!flight){
    const visible=new Set(s.visible),selection=new Set(s.selected);
    mats.forEach((material,system)=>{const configured=s.systemOpacity?.[system]??(system==='integumentary'?.1:1);const context=localExplosionActive ? .008 : (s.isolate?transitionVisibility(focusProgress,false,true):1),minimum=localExplosionActive ? .008 : .04;material.opacity=Math.max(minimum,Math.min(1,configured*context));material.transparent=material.opacity<.999;material.depthWrite=!s.isolate&&material.opacity>.45;material.needsUpdate=true;});
    const explosionSelection=new Set(s.explodeSelection??[]),explosionCenter=new T.Vector3(),visibleParts=explosionSelection.size?atlas.parts.filter(p=>explosionSelection.has(p.id)):atlas.parts.filter(p=>visible.has(p.system)||selection.has(p.id));
    if(explosionSelection.size){let count=0;atlas.parts.forEach((p,i)=>{if(explosionSelection.has(p.id)){explosionCenter.add(centers[i]);count++;}});if(count)explosionCenter.multiplyScalar(1/count);}
    const nextLayoutKey=visibleParts.map(p=>p.id).join(',')+':'+camera.aspect.toFixed(3);
     if(nextLayoutKey!==layoutKey){const layout=createExplosionLayout(visibleParts,camera.aspect);packingWidth=layout.width;packingHeight=layout.height;atlas.parts.forEach((p,i)=>{const cell=layout.cells.get(p.id);offsets[i]=cell?new T.Vector3(cell.x,cell.y+.85,0):centers[i].clone();});layoutKey=nextLayoutKey;}

    atlas.parts.forEach((p,i)=>{
     const c=centers[i],destination=offsets[i];let dx=0,dy=0,dz=0;
     const participates=!explosionSelection.size||explosionSelection.has(p.id);
     if(participates&&explosionSelection.size){const direction=c.clone().sub(explosionCenter);if(direction.lengthSq()<.00001){const angle=i*.91;direction.set(Math.sin(angle),Math.cos(angle*.7)*.55,Math.cos(angle));}direction.normalize().multiplyScalar(amount*(.1+(i%5)*.008));dx=direction.x;dy=direction.y;dz=direction.z;}
     else if(participates&&amount<=.45){const t=amount/.45;const group=SYSTEMS.findIndex(sys=>sys.id===p.system);const angle=group/SYSTEMS.length*Math.PI*2;dx=Math.sin(angle)*t*.48;dy=(c.y-.85)*t*.28;dz=Math.cos(angle)*t*.48;}
     else if(participates){const t=(amount-.45)/.55,group=SYSTEMS.findIndex(sys=>sys.id===p.system),angle=group/SYSTEMS.length*Math.PI*2;dx=T.MathUtils.lerp(Math.sin(angle)*.48,destination.x-c.x,t);dy=T.MathUtils.lerp((c.y-.85)*.28,destination.y-c.y,t);dz=T.MathUtils.lerp(Math.cos(angle)*.48,-c.z,t);}
     const selected=selection.has(p.id),baseVisible=visible.has(p.system)||selected;data.set([dx,dy,dz,baseVisible?1:0],i*4);selectedData[i*4]=selected?Math.round(255*Math.max(.2,focusProgress)):0;
     const mesh=pickers[i];if(mesh){mesh.position.set(dx,dy,dz);mesh.updateMatrix();mesh.updateMatrixWorld(true);}
    });partTexture.needsUpdate=true;selectionTexture.needsUpdate=true;lastState=s;lastExtent=amount;dirty=true;
    focusMeshes.forEach(mesh=>mesh.visible=false);if(s.isolate){atlas.parts.forEach((part,index)=>{if(!selection.has(part.id)||!pickers[index])return;let overlay=focusMeshes.get(index);if(!overlay){overlay=new T.Mesh(pickers[index]!.geometry,focusMaterials.get(part.system));overlay.matrixAutoUpdate=false;focusMeshes.set(index,overlay);focusGroup.add(overlay);}overlay.position.set(data[index*4],data[index*4+1],data[index*4+2]);overlay.updateMatrix();overlay.visible=true;});}
   }
   if((s.view!==lastView||s.reset!==lastReset)&&!s.isolate){camera.clearViewOffset();startFlight(fitPose(s.view,amount),false);lastView=s.view;lastReset=s.reset;lastIsolate='';}
   if(moving&&!s.isolate&&!flight)applyPose(fitPose(amount>.5?'front':s.view,Math.max(0,(amount-.3)/.7)));
   const localExplosion=(s.explodeSelection?.length??0)>0,isolateKey=s.isolate?s.selected.join(',')+':'+s.reset+':'+s.inspectorOpen+':'+camera.aspect+(localExplosion?':local-explosion':''):'';
   if(isolateKey!==lastIsolate||(s.isolate&&moving)){
    if(s.isolate){const box=new T.Box3();atlas.parts.forEach((p,i)=>{if(s.selected.includes(p.id))box.union(bounds[i].clone().translate(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])));});
     if(!box.isEmpty()){const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());const w=el.clientWidth,h=el.clientHeight,mobile=w<768,landscape=w>h&&h<=600;let left=20,right=w-20,top=mobile?175:110,bottom=h-170;if(s.inspectorOpen){if(landscape){right=w-335;top=100;bottom=h-125;}else if(mobile){const sheet=document.querySelector('.detail-sheet')?.getBoundingClientRect(),header=document.querySelector('.identity')?.getBoundingClientRect();top=(header?.bottom??94)+16;bottom=(sheet?.top??h*.58-139)-16;}else{right=w-370;left=w>1100?285:25;}}const availableWidth=Math.max(150,right-left),availableHeight=Math.max(80,bottom-top);camera.setViewOffset(w,h,w/2-(left+right)/2,h/2-(top+bottom)/2,w,h);const distance=safeFocusDistance([size.x,size.y,size.z],camera.fov,availableWidth,availableHeight);controls.maxDistance=Math.max(40,distance*2);const currentDirection=camera.position.clone().sub(controls.target).normalize();if(!Number.isFinite(currentDirection.x)||currentDirection.lengthSq()<.5)currentDirection.set(.2,.1,1).normalize();const direction=currentDirection.lerp(new T.Vector3(.2,.08,1).normalize(),.32).normalize();startFlight({target:center,position:center.clone().addScaledVector(direction,distance)},true);dirty=true;}
    }else if(lastIsolate){camera.clearViewOffset();startFlight(fitPose(s.view,amount),false);}
    lastIsolate=isolateKey;
   }
   if(flight){const elapsed=performance.now()-flight.started;const raw=flight.duration?Math.min(1,elapsed/flight.duration):1;flight.progress=raw;const eased=easeInOutCubic(raw);controls.target.lerpVectors(flight.fromTarget,flight.toTarget,eased);camera.position.lerpVectors(flight.fromPosition,flight.toPosition,eased);const arc=Math.sin(Math.PI*raw)*Math.min(.28,flight.fromPosition.distanceTo(flight.toPosition)*.08);camera.position.addScaledVector(camera.position.clone().sub(controls.target).normalize(),arc);controls.update();dirty=true;if(raw>=1||flight.cancelled){flight=null;lastState=null;}}
   controls.enableRotate=localExplosion||amount<.8;controls.mouseButtons.LEFT=localExplosion||amount<.8?T.MOUSE.ROTATE:T.MOUSE.PAN;controls.touches.ONE=localExplosion||amount<.8?T.TOUCH.ROTATE:T.TOUCH.PAN;ground.visible=platform.visible=ring.visible=innerRing.visible=amount<.5&&!s.isolate;controls.autoRotate=s.rotate&&!s.isolate&&amount<.4;controls.autoRotateSpeed=.65;controls.update();if(controls.autoRotate)dirty=true;
   if(dirty){renderer.render(scene,camera);targets=[];if(amount>.45){const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);atlas.parts.forEach((p,i)=>{if(data[i*4+3]<.5||(hasSolid&&p.system==='integumentary'))return;let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(let corner=0;corner<8;corner++){projected.set(p.bounds[(corner&1)?1:0][0]+data[i*4],p.bounds[(corner&2)?1:0][1]+data[i*4+1],p.bounds[(corner&4)?1:0][2]+data[i*4+2]).project(camera);const x=(projected.x+1)*el.clientWidth/2,y=(1-projected.y)*el.clientHeight/2;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}projected.copy(centers[i]).add(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])).project(camera);if(projected.z< -1||projected.z>1)return;targets.push({index:i,x:(projected.x+1)*el.clientWidth/2,y:(1-projected.y)*el.clientHeight/2,left,right,top,bottom});});}dirty=false;}

  };animate();
  const contextLost=(e:Event)=>{e.preventDefault();onError('The 3D session was paused by your device. Reload to continue.');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  return()=>{disposed=true;abort.abort();cancelAnimationFrame(frame);observer.disconnect();renderer.domElement.removeEventListener('wheel',wheel);controls.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.traverse(o=>{if(o instanceof T.Mesh&&!geometries.includes(o.geometry)){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});env.dispose();partTexture.dispose();selectionTexture.dispose();hover.remove();renderer.dispose();renderer.domElement.remove();};
 },[atlas]);
 return <div className="scene" ref={host}/>;
}
