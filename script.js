
const track=document.getElementById('track'),thumb=document.getElementById('thumb'),
fill=document.getElementById('fill'),valueEl=document.getElementById('value'),info=document.getElementById('info');
let max=1000,value=0;
let drag=false,startY=0,lastX=0;

function zoomFactor(dy){
  // dy: upward distance
  return Math.max(0.01,Math.pow(0.985,dy)); // continuous zoom
}
function render(lift=0){
  const w=track.clientWidth;
  const x=(value/max)*w;
  thumb.style.left=x+"px";
  thumb.style.top=`calc(50% - ${Math.min(lift,40)}px)`;
  fill.style.width=x+"px";
  valueEl.textContent=Math.round(value);
  const z=zoomFactor(Math.max(0,startY-(window._cy||startY)));
  const visible=Math.max(1,max*z);
  info.textContent=`Visible range ≈ ${visible.toFixed(0)} values`;
}
render();

track.onpointerdown=e=>{
 drag=true;startY=e.clientY;lastX=e.clientX;window._cy=e.clientY;
 track.setPointerCapture(e.pointerId);
};

track.onpointermove=e=>{
 if(!drag)return;
 window._cy=e.clientY;
 const dx=e.clientX-lastX; lastX=e.clientX;
 const dy=Math.max(0,startY-e.clientY);

 const visible=max*zoomFactor(dy); // how much the track represents
 const unitsPerPixel=visible/track.clientWidth;

 value+=dx*unitsPerPixel;
 if(value<0)value=0;
 if(value>max)value=max;
 render(dy);
};

track.onpointerup=()=>{drag=false;render(0);};

document.querySelectorAll("[data-max]").forEach(b=>b.onclick=()=>{
 max=+b.dataset.max;
 value=0;
 render();
});
