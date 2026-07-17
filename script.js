const slider=document.getElementById('slider');
const value=document.getElementById('value');
const result=document.getElementById('result');
const range=document.getElementById('range');

let target=0;

function randomTarget(){
 target=Math.floor(Math.random()*(Number(slider.max)+1));
 result.innerHTML="";
}

randomTarget();

slider.addEventListener('input',()=>{
 value.textContent=slider.value;
 if(navigator.vibrate){
   navigator.vibrate(5);
 }
});

document.getElementById('submit').onclick=()=>{
 const guess=Number(slider.value);
 const diff=Math.abs(guess-target);
 result.innerHTML=
 `Your guess: <b>${guess}</b><br>
 Target: <b>${target}</b><br>
 Difference: <b>${diff}</b>`;
};

document.getElementById('newTarget').onclick=randomTarget;

document.querySelectorAll('[data-max]').forEach(btn=>{
 btn.onclick=()=>{
   slider.max=btn.dataset.max;
   slider.value=0;
   value.textContent=0;
   range.textContent=`0–${btn.dataset.max}`;
   randomTarget();
 };
});
