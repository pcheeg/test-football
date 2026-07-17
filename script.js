
const track=document.getElementById("track");
const thumb=document.getElementById("thumb");
const fill=document.getElementById("fill");
const valueEl=document.getElementById("value");

let max=260;
let value=0;
let dragging=false,lastX=0,trackY=0;

function draw(){
 const w=track.clientWidth;
 const x=(value/max)*w;
 thumb.style.left=x+"px";
 fill.style.width=x+"px";
 valueEl.textContent=Math.round(value);
}
draw();

track.onpointerdown=e=>{
 dragging=true;
 lastX=e.clientX;
 trackY=track.getBoundingClientRect().top+track.clientHeight/2;
 track.setPointerCapture(e.pointerId);
};

track.onpointermove=e=>{
 if(!dragging) return;

 const dx=e.clientX-lastX;
 lastX=e.clientX;

 // distance BELOW the track only
 const down=Math.max(0,e.clientY-trackY);

 // continuous precision curve:
 // on line = 100%
 // lower = progressively slower
 const precision=1/(1+down/35);

 // full-width swipe at track level traverses full range
 const unitsPerPixel=(max/track.clientWidth);

 value+=dx*unitsPerPixel*precision;

 if(value<0)value=0;
 if(value>max)value=max;

 draw();
};

track.onpointerup=()=>dragging=false;

document.querySelectorAll("[data-max]").forEach(b=>{
 b.onclick=()=>{
   max=+b.dataset.max;
   value=0;
   draw();
 };
});
