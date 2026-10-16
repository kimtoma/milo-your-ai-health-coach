import './companion.js';
import {conversationMoods} from './milo-behavior.js';
const companion=document.querySelector('milo-companion');
let timer;
document.querySelector('#try-message').addEventListener('submit',event=>{
  event.preventDefault();clearTimeout(timer);
  const moods=conversationMoods(document.querySelector('#preview-message').value);
  const next=index=>{companion.setAttribute('mood',moods[index]);if(index+1<moods.length)timer=setTimeout(()=>next(index+1),6500);};next(0);
});
document.querySelectorAll('[data-pose]').forEach(button=>button.addEventListener('click',()=>{clearTimeout(timer);companion.setAttribute('mood',button.dataset.pose);}));
