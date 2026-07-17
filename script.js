
const track=document.getElementById('track');
const thumb=document.getElementById('thumb');
const fill=document.getElementById('fill');
const valueEl=document.getElementById('value');
const rangeEl=document.getElementById('range');

let max=653;
let value=0;      // displayed integer
let precise=0;    // internal floating value

let dragging=false;
let lastX=0,startY=0;

function render(lift=0){
 const w=track.clientWidth;
 const x=(precise/max)*w;
 fill.style.width=x+'px';
 thumb.style.left=x+'px';
 thumb.style.top=`calc(50% - ${lift}px)`;
 value=Math.round(precise);
 valueEl.textContent=value;
}

render();

track.addEventListener('pointerdown',e=>{
 dragging=true;
 lastX=e.clientX;
 startY=e.clientY;
 track.setPointerCapture(e.pointerId);
});

track.addEventListener('pointermove',e=>{
 if(!dragging)return;

 const dx=e.clientX-lastX;
 lastX=e.clientX;

 const dy=Math.max(0,startY-e.clientY);

 let multiplier=1.0;
 if(dy>20) multiplier=0.5;
 if(dy>60) multiplier=0.2;
 if(dy>120) multiplier=0.05;

 // MOVEMENT-BASED SCRUBBING
 precise += dx*multiplier;

 if(precise<0) precise=0;
 if(precise>max) precise=max;

 render(Math.min(dy,40));
});

track.addEventListener('pointerup',()=>{
 dragging=false;
 render(0);
});

document.querySelectorAll('[data-max]').forEach(btn=>{
 btn.onclick=()=>{
   max=Number(btn.dataset.max);
   precise=0;
   rangeEl.textContent=`0–${max}`;
   render();
 };
});
