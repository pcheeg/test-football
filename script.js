const canvas=document.getElementById("slider");
const ctx=canvas.getContext("2d");
const val=document.getElementById("value");
const res=document.getElementById("result");
const rangeTxt=document.getElementById("range");

let max=653,min=0,value=0,target=0;
const left=20,right=320,trackY=120;
let dragging=false,startX=0,startVal=0;

function rand(){target=Math.floor(Math.random()*(max+1));res.innerHTML="";}
rand();

function draw(lift=0){
ctx.clearRect(0,0,340,180);
ctx.lineWidth=8;
ctx.strokeStyle="#ddd";
ctx.beginPath();
ctx.moveTo(left,trackY);
ctx.lineTo(right,trackY);
ctx.stroke();

const x=left+(value/max)*(right-left);
ctx.strokeStyle="#999";
ctx.beginPath();
ctx.moveTo(x,trackY);
ctx.lineTo(x,trackY-lift);
ctx.stroke();

ctx.fillStyle="#ff4da6";
ctx.beginPath();
ctx.arc(x,trackY-lift,12,0,Math.PI*2);
ctx.fill();
}
draw();

canvas.addEventListener("pointerdown",e=>{
dragging=true;
startX=e.offsetX;
startVal=value;
canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove",e=>{
if(!dragging)return;

const dx=e.offsetX-startX;
const dy=Math.max(0,trackY-e.offsetY);

// precision scaling
let speed=1;
if(dy>20)speed=.75;
if(dy>50)speed=.4;
if(dy>100)speed=.15;
if(dy>150)speed=.05;

const pixels=right-left;
value=Math.round(startVal+(dx/pixels)*max*speed);
value=Math.max(min,Math.min(max,value));

val.textContent=value;
draw(Math.min(dy,60));

if(navigator.vibrate) navigator.vibrate(3);
});

canvas.addEventListener("pointerup",()=>{
dragging=false;
draw();
});

document.querySelectorAll("[data-max]").forEach(b=>{
b.onclick=()=>{
max=Number(b.dataset.max);
value=0;
val.textContent=0;
rangeTxt.textContent=`0–${max}`;
rand();
draw();
};
});

document.getElementById("submit").onclick=()=>{
const d=Math.abs(value-target);
res.innerHTML=`Guess: <b>${value}</b><br>Target: <b>${target}</b><br>Difference: <b>${d}</b>`;
};

document.getElementById("new").onclick=rand;
