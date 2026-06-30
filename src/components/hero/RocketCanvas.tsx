"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/* ══════════════════════════════════════════════════════════
   FLAME STRATEGY
   • Blender flame objects (emissiveIntensity > 3) are SHOWN with
     AdditiveBlending — their dark geometry becomes transparent,
     emissive areas glow. emissiveIntensity is animated each frame.
   • Idle: ei pulsing gently around 0.85
   • Click/ignition: surges to 2.8 (dramatic flare)
   • Subtle Three.js effects BELOW the flame tip:
       - Fiber-optic blue streaks from nozzle
       - Tight nozzle glow (2 small spheres + PointLight)
       - Small pulsing sprite glow at flame tip
   • Re-entry: rockets sweeps in from BOTTOM-LEFT corner
   • Return time: 650 ms
══════════════════════════════════════════════════════════ */

/* ── Smoke sprite texture — kept light so hero stays readable through it ── */
function createSmokeTex(): THREE.CanvasTexture {
  const cv = document.createElement("canvas"); cv.width = cv.height = 256;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(128,128,0,128,128,128);
  g.addColorStop(0.00,"rgba(60,90,200,0.50)");
  g.addColorStop(0.30,"rgba(40,70,180,0.36)");
  g.addColorStop(0.62,"rgba(20,50,160,0.18)");
  g.addColorStop(0.85,"rgba(10,35,140,0.07)");
  g.addColorStop(1.00,"rgba( 5,20,120,0.00)");
  ctx.fillStyle=g; ctx.fillRect(0,0,256,256);
  return new THREE.CanvasTexture(cv);
}

/* ── Nozzle light — invisible point light only, illuminates Blender flame geometry ── */
function buildNozzleGlow(parent: THREE.Object3D): THREE.PointLight {
  const l=new THREE.PointLight(0x44aaff,0,12); parent.add(l); return l;
}

/* ── Stars ── */
function buildStars(): THREE.Points {
  const N=1600,p=new Float32Array(N*3),c=new Float32Array(N*3);
  for(let i=0;i<N;i++){
    const r=28+Math.random()*90,t=Math.random()*Math.PI*2,a=Math.acos(2*Math.random()-1);
    p[i*3]=r*Math.sin(a)*Math.cos(t);p[i*3+1]=r*Math.sin(a)*Math.sin(t);p[i*3+2]=r*Math.cos(a);
    const v=Math.random();
    if(v<0.12){c[i*3]=0.5;c[i*3+1]=0.22;c[i*3+2]=0.94;}
    else if(v<0.22){c[i*3]=0.05;c[i*3+1]=0.82;c[i*3+2]=0.95;}
    else{c[i*3]=0.95;c[i*3+1]=0.95;c[i*3+2]=1.0;}
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.BufferAttribute(p,3));
  g.setAttribute("color",   new THREE.BufferAttribute(c,3));
  return new THREE.Points(g,new THREE.PointsMaterial({
    size:0.08,vertexColors:true,transparent:true,opacity:0,
    blending:THREE.AdditiveBlending,depthWrite:false,
  }));
}

/* ══════════════════════════════════════════════════════════ */
export default function RocketCanvas() {
  const mountRef=useRef<HTMLDivElement>(null);
  const rafRef  =useRef<number>(0);

  useEffect(()=>{
    const mount=mountRef.current; if(!mount) return;
    const reduced=window.matchMedia("(prefers-reduced-motion:reduce)").matches;

    /* ── Renderer ── */
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,premultipliedAlpha:true});
    renderer.setClearColor(0x000000,0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(mount.clientWidth,mount.clientHeight);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.28;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    /* ── Scene / Camera ── */
    const scene =new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(52,mount.clientWidth/mount.clientHeight,0.1,200);
    camera.position.set(0,1.0,7.5); camera.lookAt(0.5,0,0);

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff,0.10));
    const key=new THREE.DirectionalLight(0xffffff,4.2); key.position.set(5,9,5);    scene.add(key);
    const vr =new THREE.PointLight(0x7c3aed,32,26); vr.position.set(-5.5,-2,3);   scene.add(vr);
    const ca =new THREE.PointLight(0x06b6d4,24,22); ca.position.set(5.5,-3,4);    scene.add(ca);
    const wf =new THREE.PointLight(0xffa060,16,16); wf.position.set(-2,5,3);      scene.add(wf);
    const og =new THREE.Group(); scene.add(og);
    const oa =new THREE.PointLight(0x7c3aed,22,20); oa.position.set( 8,2,0);  og.add(oa);
    const ob =new THREE.PointLight(0x06b6d4,22,20); ob.position.set(-8,-2,0); og.add(ob);

    /* ── Stars ── */
    const stars=buildStars(); scene.add(stars);

    /* ══════════════════════════════════════════════════════════
       SMOKE SYSTEM
    ══════════════════════════════════════════════════════════ */
    const SMOKE_N=240;
    const smokeTex=createSmokeTex();
    const smokeSprites:THREE.Sprite[]=[];
    const smokeLife:number[]=[],smokeMaxL:number[]=[],smokeVel:THREE.Vector3[]=[];
    for(let i=0;i<SMOKE_N;i++){
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({
        map:smokeTex,transparent:true,depthWrite:false,blending:THREE.NormalBlending,opacity:0,
      }));
      sp.visible=false;sp.scale.setScalar(0.01);scene.add(sp);
      smokeSprites.push(sp);smokeLife.push(0);smokeMaxL.push(1);smokeVel.push(new THREE.Vector3());
    }

    const spawnSmoke=(wpos:THREE.Vector3,count:number,big=false)=>{
      let spawned=0;
      for(let i=0;i<SMOKE_N&&spawned<count;i++){
        if(smokeLife[i]>0) continue;
        const life=big?4.5+Math.random()*2.5:2.0+Math.random()*1.5;
        smokeLife[i]=life;smokeMaxL[i]=life;
        const sp=big?3.8:0.55;
        smokeSprites[i].position.set(
          wpos.x+(Math.random()-0.5)*sp*2.2,
          wpos.y+(Math.random()-0.5)*(big?2.8:0.4),
          wpos.z+(Math.random()-0.5)*(big?1.8:0.4),
        );
        smokeSprites[i].scale.setScalar(big?0.8:0.14);
        (smokeSprites[i].material as THREE.SpriteMaterial).opacity=0;
        smokeSprites[i].visible=true;
        smokeVel[i].set(
          (Math.random()-0.5)*(big?0.30:0.12),
          big?0.08+Math.random()*0.18:-0.16-Math.random()*0.12,
          (Math.random()-0.5)*(big?0.20:0.08),
        );
        spawned++;
      }
    };

    const updateSmoke=(dt:number)=>{
      for(let i=0;i<SMOKE_N;i++){
        if(smokeLife[i]<=0){smokeSprites[i].visible=false;continue;}
        smokeLife[i]-=dt;
        if(smokeLife[i]<=0){smokeSprites[i].visible=false;continue;}
        const frac=smokeLife[i]/smokeMaxL[i];
        smokeVel[i].y+=dt*0.20;smokeVel[i].x+=(Math.random()-0.5)*dt*0.04;
        smokeSprites[i].position.addScaledVector(smokeVel[i],dt);
        const isBig=smokeMaxL[i]>3.0;
        const maxSz=isBig?20.0:4.5,growR=isBig?4.2:1.8;
        smokeSprites[i].scale.setScalar(Math.min(smokeSprites[i].scale.x+dt*growR,maxSz));
        let op:number;
        if(frac>0.80)     op=(1-frac)*5*0.72;
        else if(frac>0.12)op=0.72;
        else              op=frac/0.12*0.72;
        (smokeSprites[i].material as THREE.SpriteMaterial).opacity=Math.max(0,op);
      }
    };

    const clearSmoke=(maxRem:number)=>{
      for(let i=0;i<SMOKE_N;i++) if(smokeLife[i]>maxRem) smokeLife[i]=maxRem;
    };

    /* ── Group hierarchy ──
       rocketParent → arcballGroup → tiltGroup → bodySpinGroup → model / exhaust
    ── */
    const OX=1.5,OY=0.0;
    const rocketParent=new THREE.Group();rocketParent.position.set(OX,OY,0);
    rocketParent.scale.setScalar(0);scene.add(rocketParent);
    const arcballGroup=new THREE.Group();rocketParent.add(arcballGroup);
    const tiltGroup=new THREE.Group();tiltGroup.rotation.z=-0.65;tiltGroup.rotation.x=-0.12;
    arcballGroup.add(tiltGroup);
    const bodySpinGroup=new THREE.Group();tiltGroup.add(bodySpinGroup);

    /* ── GLB load ── */
    let loaded=false,loadedAt=0;
    let nozzleLight:THREE.PointLight|null=null;
    const nozzleWorldPos=new THREE.Vector3();
    /* Blender flame meshes — referenced for live emissiveIntensity animation */
    const flameMeshRefs:THREE.Mesh[]=[];

    new GLTFLoader().load("/rocket.glb",(gltf)=>{
      const model=gltf.scene;

      /* Identify Blender flame meshes by high emissiveIntensity */
      model.traverse((child)=>{
        const mesh=child as THREE.Mesh;
        if(!mesh.isMesh) return;
        const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];
        if(mats.some(m=>{const sm=m as THREE.MeshStandardMaterial;return sm.isMeshStandardMaterial&&(sm.emissiveIntensity??1)>3;}))
          flameMeshRefs.push(mesh);
      });

      /* Full bbox for scale; body-only for centering */
      const fullBox=new THREE.Box3().setFromObject(model);
      const fullSz=new THREE.Vector3();fullBox.getSize(fullSz);
      const sc=6.0/Math.max(fullSz.x,fullSz.y,fullSz.z);

      const bodyBox=new THREE.Box3();
      model.traverse((child)=>{
        const mesh=child as THREE.Mesh;
        if(!mesh.isMesh||flameMeshRefs.includes(mesh)) return;
        bodyBox.expandByObject(mesh);
      });
      if(bodyBox.isEmpty()) bodyBox.copy(fullBox);
      const sz=new THREE.Vector3(),ctr=new THREE.Vector3();
      bodyBox.getSize(sz);bodyBox.getCenter(ctr);
      model.scale.setScalar(sc);
      model.position.set(-ctr.x*sc,-ctr.y*sc,-ctr.z*sc);

      /* Apply materials:
         - Blender flames → AdditiveBlending, moderate ei, recolour near-white → blue
         - Rocket body    → enhance reflections                                        */
      model.traverse((child)=>{
        const mesh=child as THREE.Mesh;
        if(!mesh.isMesh) return;
        const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];
        mats.forEach((m)=>{
          const sm=m as THREE.MeshStandardMaterial;
          if(!sm.isMeshStandardMaterial) return;
          const ei=sm.emissiveIntensity??1;
          if(ei>3){
            /* SHOW Blender flame with AdditiveBlending.
               Force all flame layers to deep blue — multiple overlapping meshes
               sum additively, so low individual ei keeps the total a rich cyan-blue
               rather than clipping to white.                                        */
            sm.emissive.set(0.06,0.28,1.0); // electric blue (all layers, not just near-white)
            sm.emissiveIntensity=0.22;  // base; animated up to 0.55 on launch
            sm.blending=THREE.AdditiveBlending;
            sm.transparent=true;
            sm.depthWrite=false;
          } else {
            mesh.castShadow=true;
            sm.envMapIntensity=2.2;
          }
          sm.needsUpdate=true;
        });
      });

      bodySpinGroup.add(model);

      /* Nozzle point light — illuminates the Blender flame geometry from below */
      const engineY = -(sz.y/2)*sc + 0.06;
      const glowHolder=new THREE.Group();glowHolder.position.y=engineY;bodySpinGroup.add(glowHolder);
      nozzleLight=buildNozzleGlow(glowHolder);

      loaded=true;loadedAt=performance.now()/1000;
    },undefined,(e)=>console.error("GLB:",e));

    /* ── Pointer ── */
    let ptrDown=false,ptrX=0,ptrY=0,ptrMoved=0,ptrT=0;
    let pendDX=0,pendDY=0,isDrag=false,arcTimer=0;
    const onPD=(e:PointerEvent)=>{ptrDown=true;ptrX=e.clientX;ptrY=e.clientY;ptrMoved=0;ptrT=performance.now();clearTimeout(arcTimer);};
    const onPM=(e:PointerEvent)=>{
      if(!ptrDown) return;
      const dx=e.clientX-ptrX,dy=e.clientY-ptrY;ptrX=e.clientX;ptrY=e.clientY;
      ptrMoved+=Math.abs(dx)+Math.abs(dy);if(ptrMoved>6)isDrag=true;
      pendDX+=dx*0.010;pendDY+=dy*0.010;
    };
    const onPU=()=>{
      ptrDown=false;
      const isClick=ptrMoved<8&&(performance.now()-ptrT)<220;
      if(isClick&&loaded&&flyState==="idle") startFly();
      else if(isDrag){clearTimeout(arcTimer);arcTimer=window.setTimeout(()=>{isDrag=false;},1800);}
      isDrag=false;
    };
    window.addEventListener("pointerdown",onPD);
    window.addEventListener("pointermove",onPM);
    window.addEventListener("pointerup",onPU);

    /* ── Launch state machine ── */
    type FS="idle"|"ignition"|"smoke"|"liftoff"|"flying"|"gone"|"enter";
    let flyState:FS="idle",flyT=0;
    const startFly=()=>{flyState="ignition";flyT=performance.now();};
    const DUR={ignition:800,smoke:1000,liftoff:900,flying:3200,gone:700,enter:1400};
    const launchWorldPos=new THREE.Vector3();

    const onResize=()=>{
      camera.aspect=mount.clientWidth/mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth,mount.clientHeight);
    };
    window.addEventListener("resize",onResize);

    const eob =(t:number)=>{const c=1.70158,c3=c+1;return 1+c3*Math.pow(t-1,3)+c*Math.pow(t-1,2);};
    const expo=(t:number)=>t>=1?1:1-Math.pow(2,-10*t);
    const L   =THREE.MathUtils.lerp;

    let last=performance.now(),elapsed=0;
    /* Smoothed flame emissiveIntensity target (additive: keep low, 0.22 idle → 0.55 launch) */
    let flameEI=0.22;

    const animate=()=>{
      rafRef.current=requestAnimationFrame(animate);
      const now=performance.now(),dt=Math.min((now-last)/1000,0.05);
      last=now;elapsed+=dt;

      (stars.material as THREE.PointsMaterial).opacity=Math.min(elapsed/0.8,1)*0.26;
      if(!reduced) og.rotation.y+=dt*(Math.PI/6);

      updateSmoke(dt);

      if(!loaded){renderer.render(scene,camera);return;}

      const sl=elapsed-loadedAt;
      rocketParent.scale.setScalar(eob(Math.max(0,Math.min((sl-0.05)/0.80,1))));


      /* Nozzle glow pulse */
      if(nozzleLight&&!reduced) nozzleLight.intensity=flameEI*14+Math.sin(elapsed*5.5)*4;

      /* ── Blender flame animation ──────────────────────────────────
         emissiveIntensity drives the glow.
         Idle: gentle organic flicker around 0.85
         Launch: surges to 2.8 on ignition, holds at 1.8 while flying
         Gone:   drops to 0 (rocket invisible)
         Enter:  ramps back to idle
      ─────────────────────────────────────────────────────────────── */
      if(!reduced&&flameMeshRefs.length>0){
        const flicker=Math.abs(Math.sin(elapsed*6.8))*0.06+Math.abs(Math.sin(elapsed*13.4))*0.03;
        const liveEI=flameEI+flicker;
        flameMeshRefs.forEach((fm)=>{
          const mats=Array.isArray(fm.material)?fm.material:[fm.material];
          mats.forEach((m)=>{
            const sm=m as THREE.MeshStandardMaterial;
            if(sm.isMeshStandardMaterial) sm.emissiveIntensity=liveEI;
          });
        });
      }


      /* Nozzle world pos for smoke */
      if(nozzleLight) nozzleLight.getWorldPosition(nozzleWorldPos);

      /* ── Launch state machine ── */
      const fe=now-flyT;

      if(flyState==="ignition"){
        const t=Math.min(fe/DUR.ignition,1);
        /* Flame SURGES on click — dramatic ignition burst */
        flameEI=L(flameEI,0.62,dt*6.0);
        /* Smoke starts immediately */
        if(Math.random()<dt*(4+t*10)) spawnSmoke(nozzleWorldPos,1);
        if(t>=1){flyState="smoke";flyT=now;launchWorldPos.copy(nozzleWorldPos);}

      }else if(flyState==="smoke"){
        flameEI=L(flameEI,0.50,dt*3.0);
        const rate=4+Math.min(fe/DUR.smoke,1)*6; // reduced — hero stays readable
        if(Math.random()<rate*dt) spawnSmoke(nozzleWorldPos,1);
        if(fe>=DUR.smoke){flyState="liftoff";flyT=now;}

      }else if(flyState==="liftoff"){
        flameEI=L(flameEI,0.50,dt*3.0);
        const t=Math.min(fe/DUR.liftoff,1);
        rocketParent.position.x=L(OX,OX+0.3,t*t);
        rocketParent.position.y=L(OY,OY+0.8,t*t);
        if(Math.random()<dt*8) spawnSmoke(launchWorldPos,1); // light trail
        if(t>=1){flyState="flying";flyT=now;}

      }else if(flyState==="flying"){
        flameEI=L(flameEI,0.45,dt*2.0);
        const t=Math.min(fe/DUR.flying,1);
        const e=expo(t);
        rocketParent.position.x=L(OX+0.3,OX+16,e);
        rocketParent.position.y=L(OY+0.8,OY+12,e);
        rocketParent.position.z=L(0,-8,e);
        rocketParent.scale.setScalar(eob(1)*L(1.0,0.05,t));
        if(t<0.4&&Math.random()<dt*5) spawnSmoke(nozzleWorldPos,1); // light exhaust
        if(Math.random()<dt*4) spawnSmoke(launchWorldPos,1);
        if(t>=1){rocketParent.visible=false;flyState="gone";flyT=now;}

      }else if(flyState==="gone"){
        flameEI=L(flameEI,0.0,dt*8.0); // flame dims — rocket gone
        if(Math.random()<dt*1.5) spawnSmoke(launchWorldPos,1); // minimal residual
        if(fe>=DUR.gone){
          /* Re-enter from BOTTOM-LEFT corner */
          rocketParent.position.set(OX-10, OY-5, 0);
          rocketParent.scale.setScalar(eob(1)*0.05);
          rocketParent.visible=true;
          flyState="enter";flyT=now;
        }

      }else if(flyState==="enter"){
        /* 1400ms — sweeps in slowly from bottom-left; smoke gone instantly */
        const t=Math.min(fe/DUR.enter,1);
        const e=expo(t);
        rocketParent.position.x=L(OX-10, OX, e);
        rocketParent.position.y=L(OY-5,  OY, e);
        rocketParent.position.z=0;
        rocketParent.scale.setScalar(eob(1)*L(0.05,1.0,e));
        flameEI=L(flameEI,0.22,dt*5.0); // ramp flame back up
        if(t<0.02) clearSmoke(0); // smoke disappears the instant rocket reappears
        if(t>=1){
          rocketParent.position.set(OX,OY,0);
          rocketParent.scale.setScalar(eob(1));
          clearSmoke(0);
          flameEI=0.22;
          flyState="idle";
        }

      }else{
        /* IDLE: float + TIN-ROLLING SPIN + flame gently pulses */
        flameEI=L(flameEI,0.22,dt*3.0);
        if(!reduced){
          rocketParent.position.y=OY+Math.sin(elapsed*0.62)*0.22;
          rocketParent.position.x=OX+Math.sin(elapsed*0.28)*0.06;
          rocketParent.position.z=0;
        }
        if(isDrag&&(pendDX!==0||pendDY!==0)){
          arcballGroup.rotation.y+=pendDX;
          arcballGroup.rotation.x=Math.max(-Math.PI*0.55,Math.min(Math.PI*0.55,arcballGroup.rotation.x+pendDY));
          pendDX=0;pendDY=0;
        }else if(!isDrag&&!reduced){
          arcballGroup.rotation.y*=0.97;arcballGroup.rotation.x*=0.97;
        }
        if(!reduced) bodySpinGroup.rotation.y+=dt*0.50;
      }

      renderer.render(scene,camera);
    };

    animate();

    return()=>{
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointerdown",onPD);
      window.removeEventListener("pointermove",onPM);
      window.removeEventListener("pointerup",onPU);
      window.removeEventListener("resize",onResize);
      clearTimeout(arcTimer);

      /* Release every GPU resource the scene is holding — geometries,
         materials, and any textures attached to them (GLB maps, the
         smoke sprite map). renderer.dispose() alone does not free these;
         skipping it is what lets WebGL contexts pile up across remounts
         until the browser starts blocking new context creation. */
      const TEX_KEYS=["map","normalMap","roughnessMap","metalnessMap","emissiveMap","aoMap","alphaMap","bumpMap","envMap"] as const;
      const disposeMaterial=(m:THREE.Material)=>{
        TEX_KEYS.forEach((key)=>{
          const tex=(m as unknown as Record<string,THREE.Texture|undefined>)[key];
          if(tex) tex.dispose();
        });
        m.dispose();
      };
      scene.traverse((obj)=>{
        const mesh=obj as THREE.Mesh;
        if(mesh.geometry) mesh.geometry.dispose();
        const mat=mesh.material as THREE.Material|THREE.Material[]|undefined;
        if(Array.isArray(mat)) mat.forEach(disposeMaterial);
        else if(mat) disposeMaterial(mat);
      });
      smokeTex.dispose();

      renderer.dispose();
      renderer.forceContextLoss();
      if(mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  },[]);

  return(
    <div ref={mountRef} className="absolute inset-0 z-[15] pointer-events-auto"
      style={{cursor:"grab"}} aria-hidden="true"/>
  );
}
