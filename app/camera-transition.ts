export type Vec3Tuple=[number,number,number];

export function easeInOutCubic(t:number){
 const x=Math.max(0,Math.min(1,t));
 return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
}

export function cameraTransitionDuration(distance:number,reducedMotion=false){
 if(reducedMotion)return 0;
 return Math.max(.9,Math.min(1.6,.92+distance*.18));
}

export function safeFocusDistance(size:Vec3Tuple,fovDegrees:number,viewportWidth:number,viewportHeight:number,padding=1.58){
 const width=Math.max(1,viewportWidth),height=Math.max(1,viewportHeight);
 const halfFov=Math.max(.01,Math.tan(fovDegrees*Math.PI/360));
 const radius=Math.max(.025,Math.hypot(size[0],size[1],size[2])*.5);
 const vertical=Math.max(size[1]*.5,radius*.72)/halfFov;
 const horizontal=Math.max(size[0]*.5,radius*.72)/(halfFov*(width/height));
 return Math.max(.09,vertical,horizontal,size[2]*.75)*padding;
}

export function transitionVisibility(progress:number,isTarget:boolean,isolate:boolean){
 if(!isolate||isTarget)return 1;
 if(progress<=.28)return 1;
 const fade=Math.max(0,Math.min(1,(progress-.28)/.56));
 return 1-fade*.985;
}
