
const track=document.getElementById('track');
const thumb=document.getElementById('thumb');
const fill=document.getElementById('fill');
const valueEl=document.getElementById('value');
const rangeEl=document.getElementById('range');
const result=document.getElementById('result');
let max=653,val=0,target=0,drag=false,startX=0,startVal=0,startY=0;
function rnd(){target=Math.floor(Math.random()*(max+1));result.innerHTML='';}
rnd();
function render(lift=0){
 const w=track.clientWidth;
 const x=(val/max)*w;
 fill.style.width=x+'px';
 thumb.style.left=x+'px';
 thumb.style.top=`calc(50% - ${lift}px)`;
 valueEl.textContent=val;
}
render();
track.addEventListener('pointerdown',e=>{
 drag=true;
 startX=e.clientX;
 startY=e.clientY;
 startVal=val;
 track.setPointerCapture(e.pointerId);
});
track.addEventListener('pointermove',e=>{
 if(!drag)return;
 const dx=e.clientX-startX;
 const dy=Math.max(0,startY-e.clientY);
 let s=1;
 if(dy>20)s=.7;
 if(dy>50)s=.35;
 if(dy>100)s=.12;
 if(dy>150)s=.05;
 const w=track.clientWidth;
 val=Math.round(startVal+(dx/w)*max*s);
 if(val<0)val=0;
 if(val>max)val=max;
 render(Math.min(dy,35));
});
track.addEventListener('pointerup',()=>{drag=false;render(0);});
document.querySelectorAll('[data-max]').forEach(b=>b.onclick=()=>{max=+b.dataset.max;val=0;rangeEl.textContent=`0–${max}`;rnd();render();});
document.getElementById('submit').onclick=()=>{result.innerHTML=`Guess <b>${val}</b><br>Target <b>${target}</b><br>Difference <b>${Math.abs(val-target)}</b>`}
document.getElementById('new').onclick=rnd;
