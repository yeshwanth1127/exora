// Component concept by Dominik Koch — adapted for Exora's integration marks.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import './OrbitImages.css';

const ellipse = (cx, cy, rx, ry) => `M ${cx-rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx+rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx-rx} ${cy}`;
const rectangle = (cx,cy,w,h) => `M ${cx-w/2} ${cy-h/2} L ${cx+w/2} ${cy-h/2} L ${cx+w/2} ${cy+h/2} L ${cx-w/2} ${cy+h/2} Z`;
const triangle = (cx,cy,size) => { const h=size*Math.sqrt(3)/2; return `M ${cx} ${cy-h/1.5} L ${cx+size/2} ${cy+h/3} L ${cx-size/2} ${cy+h/3} Z`; };
const star = (cx,cy,outer,inner,points) => { let d=''; for(let i=0;i<points*2;i++){const r=i%2?inner:outer;const a=i*Math.PI/points-Math.PI/2;d+=`${i?' L':'M'} ${cx+r*Math.cos(a)} ${cy+r*Math.sin(a)}`;} return `${d} Z`; };
const infinity = (cx,cy,w,h) => `M ${cx} ${cy} C ${cx+w*.25} ${cy-h/2}, ${cx+w/2} ${cy-h/2}, ${cx+w/2} ${cy} C ${cx+w/2} ${cy+h/2}, ${cx+w*.25} ${cy+h/2}, ${cx} ${cy} C ${cx-w*.25} ${cy+h/2}, ${cx-w/2} ${cy+h/2}, ${cx-w/2} ${cy} C ${cx-w/2} ${cy-h/2}, ${cx-w*.25} ${cy-h/2}, ${cx} ${cy}`;

function OrbitItem({item,index,total,path,itemSize,rotation,progress,fill}) {
  const offset=(index/total)*100;
  const offsetDistance=useTransform(progress,p=>`${(((p+(fill?offset:0))%100)+100)%100}%`);
  return <motion.div className="orbit-item" style={{width:itemSize,height:itemSize,offsetPath:`path("${path}")`,offsetRotate:'0deg',offsetAnchor:'center center',offsetDistance}}><div className="orbit-item-inner" style={{transform:`rotate(${-rotation}deg)`}}>{item}</div></motion.div>;
}

export default function OrbitImages({
  images=[], items, altPrefix='Orbiting image', shape='ellipse', customPath,
  baseWidth=1400, radiusX=700, radiusY=170, radius=300, starPoints=5,
  starInnerRatio=.5, rotation=-8, duration=40, itemSize=64,
  direction='normal', fill=true, width=100, height=100, className='',
  showPath=false, pathColor='rgba(255,255,255,.12)', pathWidth=2,
  easing='linear', paused=false, centerContent, responsive=false,
}) {
  const ref=useRef(null); const [scale,setScale]=useState(null); const c=baseWidth/2;
  const path=useMemo(()=>{
    if(shape==='custom') return customPath||ellipse(c,c,radius,radius);
    if(shape==='circle') return ellipse(c,c,radius,radius);
    if(shape==='square') return rectangle(c,c,radius*2,radius*2);
    if(shape==='rectangle') return rectangle(c,c,radiusX*2,radiusY*2);
    if(shape==='triangle') return triangle(c,c,radius*2);
    if(shape==='star') return star(c,c,radius,radius*starInnerRatio,starPoints);
    if(shape==='infinity') return infinity(c,c,radiusX*2,radiusY*2);
    return ellipse(c,c,radiusX,radiusY);
  },[shape,customPath,c,radius,radiusX,radiusY,starPoints,starInnerRatio]);

  useLayoutEffect(()=>{if(!responsive||!ref.current)return;const update=()=>ref.current&&setScale(ref.current.clientWidth/baseWidth);update();const observer=new ResizeObserver(update);observer.observe(ref.current);return()=>observer.disconnect();},[responsive,baseWidth]);
  const progress=useMotionValue(0);
  useEffect(()=>{if(paused)return;const controls=animate(progress,direction==='reverse'?-100:100,{duration,ease:easing,repeat:Infinity,repeatType:'loop'});return()=>controls.stop();},[progress,duration,easing,direction,paused]);
  const orbitItems=items||images.map((src,index)=><img key={src} src={src} alt={`${altPrefix} ${index+1}`} draggable={false} className="orbit-image"/>);
  return <div ref={ref} className={`orbit-container ${className}`} style={{width:responsive?'100%':typeof width==='number'?width:'100%',height:responsive?'auto':typeof height==='number'?height:typeof width==='number'?width:'auto',aspectRatio:responsive?'1 / 1':undefined}}>
    <div className={responsive?'orbit-scaling-container orbit-scaling-container--responsive':'orbit-scaling-container'} style={{width:responsive?baseWidth:'100%',height:responsive?baseWidth:'100%',transform:responsive&&scale!==null?`translate(-50%, -50%) scale(${scale})`:undefined,visibility:responsive&&scale===null?'hidden':undefined}}>
      <div className="orbit-rotation-wrapper" style={{transform:`rotate(${rotation}deg)`}}>
        {showPath&&<svg width="100%" height="100%" viewBox={`0 0 ${baseWidth} ${baseWidth}`} className="orbit-path-svg"><path d={path} fill="none" stroke={pathColor} strokeWidth={pathWidth/(scale||1)}/></svg>}
        {orbitItems.map((item,index)=><OrbitItem key={index} item={item} index={index} total={orbitItems.length} path={path} itemSize={itemSize} rotation={rotation} progress={progress} fill={fill}/>) }
      </div>
    </div>
    {centerContent&&<div className="orbit-center-content">{centerContent}</div>}
  </div>;
}
