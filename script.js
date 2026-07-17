
const track=document.getElementById("track"),thumb=document.getElementById("thumb"),
fill=document.getElementById("fill"),valueEl=document.getElementById("value");
let max=260,value=0,drag=false,lastX=0,trackY=0;

function speedForDown(d){
  if(d<=40) return 1.0; // dead zone
  if(d>=180) return 0.10;
  const pts=[
    [40,1.00],
    [80,0.50],
    [120,0.25],
    [180,0.10]
  ];
  for(let i=0;i<pts.length-1;i++){
    const [d1,s1]=pts[i],[d2,s2]=pts[i+1];
    if(d<=d2){
      const t=(d-d1)/(d2-d1);
      return s1+(s2-s1)*t;
    }
  }
  return 0.10;
}

function draw(){
  const w=track.clientWidth,x=(value/max)*w;
  thumb.style.left=x+"px";
  fill.style.width=x+"px";
  valueEl.textContent=Math.round(value);
}
draw();

track.onpointerdown=e=>{
  drag=true;
  lastX=e.clientX;
  trackY=track.getBoundingClientRect().top+track.clientHeight/2;
  track.setPointerCapture(e.pointerId);
};

track.onpointermove=e=>{
  if(!drag) return;
  const dx=e.clientX-lastX;
  lastX=e.clientX;
  const down=Math.max(0,e.clientY-trackY);
  const speed=speedForDown(down);
  const unitsPerPixel=max/track.clientWidth;
  value+=dx*unitsPerPixel*speed;
  value=Math.max(0,Math.min(max,value));
  draw();
};

track.onpointerup=()=>drag=false;

document.querySelectorAll("[data-max]").forEach(b=>b.onclick=()=>{
  max=+b.dataset.max;
  value=0;
  draw();
});
