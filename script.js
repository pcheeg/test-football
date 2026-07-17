
const canvas=document.getElementById('slider');
const ctx=canvas.getContext('2d');
const wrap=document.getElementById('sliderWrap');
const valueEl=document.getElementById('value');
const result=document.getElementById('result');
const rangeEl=document.getElementById('range');

let max=653,val=0,target=0;
let dragging=false,startX=0,startVal=0;
let left,right,trackY;

function resize(){
 const dpr=window.devicePixelRatio||1;
 const w=wrap.clientWidth,h=170;
 canvas.width=w*dpr;
 canvas.height=h*dpr;
 ctx.setTransform(dpr,0,0,dpr,0,0);
 left=20;
 right=w-20;
 trackY=110;
 draw(0);
}
window.addEventListener('resize',resize);

function draw(lift){
 const w=wrap.clientWidth;
 ctx.clearRect(0,0,w,170);
 ctx.lineWidth=8;
 ctx.strokeStyle="#ddd";
 ctx.beginPath();
 ctx.moveTo(left,trackY);
 ctx.lineTo(right,trackY);
 ctx.stroke();
 const x=left+((right-left)*(val/max));
 ctx.strokeStyle="#bbb";
 ctx.beginPath();
 ctx.moveTo(x,trackY);
 ctx.lineTo(x,trackY-lift);
 ctx.stroke();
 ctx.fillStyle="#ff4fa0";
 ctx.beginPath();
 ctx.arc(x,trackY-lift,13,0,Math.PI*2);
 ctx.fill();
}

function newTarget(){target=Math.floor(Math.random()*(max+1));result.innerHTML=""}
newTarget();

canvas.addEventListener("pointerdown",e=>{
 dragging=true;
 const r=canvas.getBoundingClientRect();
 startX=e.clientX-r.left;
 startVal=val;
 canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove",e=>{
 if(!dragging)return;
 const r=canvas.getBoundingClientRect();
 const x=e.clientX-r.left;
 const y=e.clientY-r.top;
 const dx=x-startX;
 const dy=Math.max(0,trackY-y);

 let speed=1;
 if(dy>20)speed=.7;
 if(dy>50)speed=.35;
 if(dy>100)speed=.12;
 if(dy>140)speed=.05;

 val=Math.round(startVal+(dx/(right-left))*max*speed);
 val=Math.max(0,Math.min(max,val));
 valueEl.textContent=val;
 draw(Math.min(dy,60));
});

canvas.addEventListener("pointerup",()=>{dragging=false;draw(0)});

document.querySelectorAll("[data-max]").forEach(b=>b.onclick=()=>{
 max=+b.dataset.max;
 val=0;
 valueEl.textContent=0;
 rangeEl.textContent=`0–${max}`;
 newTarget();
 draw(0);
});

document.getElementById("submit").onclick=()=>{
 result.innerHTML=`Guess: <b>${val}</b><br>Target: <b>${target}</b><br>Difference: <b>${Math.abs(val-target)}</b>`;
};
document.getElementById("new").onclick=newTarget;

resize();
