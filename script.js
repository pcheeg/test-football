
const track=document.getElementById("track"),thumb=document.getElementById("thumb"),
fill=document.getElementById("fill"),valueEl=document.getElementById("value");

let max=260,value=0,drag=false,lastX=0,trackY=0;

function speedForDown(d){
  if(d<=160) return 1.0;     // large dead zone
  if(d>=380) return 0.10;

  const pts=[
    [160,1.00],
    [220,0.50],
    [280,0.25],
    [380,0.10]
  ];

  for(let i=0;i<pts.length-1;i++){
    const [d1,s1]=pts[i], [d2,s2]=pts[i+1];
    if(d<=d2){
      const t=(d-d1)/(d2-d1);
      return s1+(s2-s1)*t;
    }
  }
  return 0.10;
}

function draw(){
 const w=track.clientWidth;
 const x=(value/max)*w;
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
 value+=dx*(max/track.clientWidth)*speed;
 value=Math.max(0,Math.min(max,value));
 draw();
};

track.onpointerup=()=>drag=false;

document.querySelectorAll("[data-max]").forEach(b=>b.onclick=()=>{
 max=+b.dataset.max;
 value=0;
 draw();
});
