/* CYBER PORTFOLIO JS
   - Preloader / Enter
   - Circle progress
   - Job rotator
   - Time updater
   - Smooth scroll
   - Theme toggle
   - Cursor glow
   - Puppet physics & happy/star animation
   - Form send simulation & scan
   - Tiny hover SFX
*/

/* ------------------- small helpers ------------------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ------------------- Preloader / Enter ------------------- */
const preloader = $('#preloader');
const enterBtn = $('#enterBtn');
const mainSite = $('#mainSite');
const circleProgress = $('#circleProgress');
const circleText = $('#circleText');

function updateCircle(p){
  const c = Math.round(p);
  circleProgress.style.background = `conic-gradient(var(--neon-green) ${c}%, rgba(255,255,255,0.02) ${c}%)`;
  circleText.textContent = `${c}%`;
}

function animatePreloaderToComplete(cb){
  let pct = 0;
  const dur = 1400;
  const stepMs = 20;
  const steps = Math.floor(dur / stepMs);
  const inc = 100 / steps;
  const iv = setInterval(()=>{
    pct = Math.min(100, pct + inc);
    updateCircle(pct);
    if(pct >= 100){
      clearInterval(iv);
      setTimeout(()=>cb && cb(), 260);
    }
  }, stepMs);
}

enterBtn && enterBtn.addEventListener('click', ()=>{
  enterBtn.style.transform = 'scale(.995)';
  animatePreloaderToComplete(()=>{
    preloader.classList.add('hidden');
    preloader.classList.remove('active');
    setTimeout(()=> mainSite.classList.add('active'), 160);
  });
});
document.addEventListener('keydown', e => { if(e.key === 'Enter' && preloader.classList.contains('active')) enterBtn.click(); });

/* terminal lines */
(function terminalAuto(){
  const terminal = document.querySelector('.terminal');
  if(!terminal) return;
  const lines = ['> INITIALIZING SYSTEM...','> LOADING CYBER MODULES...','> ESTABLISHING CONNECTION...','> AUTHENTICATION: OK','> BEACON: ONLINE'];
  terminal.innerHTML = '';
  let i=0;
  const iv = setInterval(()=>{
    const p = document.createElement('p'); p.textContent = lines[i%lines.length]; terminal.appendChild(p);
    terminal.scrollTop = terminal.scrollHeight; i++; if(i>4) clearInterval(iv);
  }, 360);
})();

/* ------------------- Job rotator ------------------- */
const words = $$('.word-together');
let wtIndex = 0;
function rotateWords(){
  words.forEach((w,i)=> w.style.transform = `translateY(${-(wtIndex-i)*28}px)`);
  wtIndex = (wtIndex+1) % words.length;
}
if(words.length){ words.forEach((w,idx)=> w.style.transform = `translateY(${-idx*28}px)`); setInterval(rotateWords, 1700); }

/* ------------------- Time updater ------------------- */
function two(n){ return n<10 ? '0'+n : ''+n; }
function updateTime(){
  const el = $('#currentTime'); const updateTimeEl = $('#updateTime');
  const d = new Date(); const hh=two(d.getHours()), mm=two(d.getMinutes()), ss=two(d.getSeconds());
  if(el) el.textContent = `${hh}:${mm}:${ss}`;
  if(updateTimeEl) updateTimeEl.textContent = d.toLocaleString();
}
updateTime(); setInterval(updateTime,1000);

/* ------------------- Smooth scroll ------------------- */
function scrollToSection(id){
  const el = document.getElementById(id); if(!el) return;
  el.scrollIntoView({behavior:'smooth', block:'start'});
}
window.scrollToSection = scrollToSection;

/* ------------------- Theme toggle ------------------- */
const themeBtn = $('#themeBtn');
themeBtn && themeBtn.addEventListener('click', ()=>{
  document.documentElement.classList.toggle('alt');
  themeBtn.animate([{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:160});
});

/* ------------------- Cursor glow ------------------- */
let glow = document.createElement('div');
glow.className = 'cursor-glow';
document.body.appendChild(glow);
document.addEventListener('mousemove', e=>{
  glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; glow.style.opacity = 1;
});
document.addEventListener('mouseleave', ()=> glow.style.opacity = 0);

/* enlarge glow on interactive hover */
const interactiveEls = $$('button, .btn, a, .enter-btn, .photo, input, textarea');
function pulseGlow(){ glow.style.width = '260px'; glow.style.height = '260px'; setTimeout(()=>{ glow.style.width='160px'; glow.style.height='160px'; },220); }
interactiveEls.forEach(el=> el.addEventListener('mouseenter', pulseGlow));

/* ------------------- Tiny hover SFX using WebAudio ------------------- */
let audioCtx = null;
function hoverBeep(){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = 660; g.gain.value = 0.02;
    o.connect(g); g.connect(audioCtx.destination); o.start(); setTimeout(()=>o.stop(), 70);
  }catch(e){}
}
$$('.btn, button, a').forEach(el=> el.addEventListener('mouseenter', hoverBeep));

/* ------------------- Reveal on scroll ------------------- */
const revealEls = $$('.section, .project-card, .certificate-card, .left-side, .right-side');
const io = new IntersectionObserver(entries=>{
  entries.forEach(ent=>{
    if(ent.isIntersecting){
      ent.target.style.opacity = 1; ent.target.style.transform = 'translateY(0)'; ent.target.style.transition = 'opacity .9s ease, transform .9s ease';
      io.unobserve(ent.target);
    }
  });
},{threshold:0.12});
revealEls.forEach(el=>{ el.style.opacity = 0; el.style.transform = 'translateY(14px)'; io.observe(el); });

/* ------------------- PUPPET PHYSICS ------------------- */
/* Puppets follow cursor with soft spring physics. Keep doodle shapes intact.
   Each puppet has an anchored base position; we rotate/tilt and translate slightly
   based on cursor relative to each puppet center.
*/

const puppets = Array.from(document.querySelectorAll('.puppet'));
const puppetStar = $('#puppetStar');
let mouse = {x: window.innerWidth/2, y: window.innerHeight/2};
let deviceOffset = {x:0,y:0};

window.addEventListener('mousemove', (e)=>{ mouse.x = e.clientX; mouse.y = e.clientY; });

function getCenterRect(el){
  const r = el.getBoundingClientRect();
  return {x: r.left + r.width/2, y: r.top + r.height/2, w:r.width, h:r.height, left:r.left, top:r.top};
}

const state = puppets.map((p,i)=>({
  el: p,
  rx: 0, ry: 0, // rotation x/y simulated as single rotate for tilt
  tx: 0, ty: 0, // translation offsets
  vx: 0, vy: 0
}));

function updatePuppets(){
  state.forEach((s, idx)=>{
    const center = getCenterRect(s.el);
    // vector from puppet center to mouse
    const dx = (mouse.x - center.x);
    const dy = (mouse.y - center.y);
    // normalized small influence factor by distance and puppet index
    const dist = Math.max(60, Math.hypot(dx,dy));
    const influence = Math.min(1, 320 / dist); // closer -> stronger
    // target tilt & translate
    const targetTx = dx * 0.06 * influence * (1 + idx*0.08);
    const targetTy = Math.min(20, -dy * 0.02 * influence);
    const targetRot = Math.max(-8, Math.min(8, dx * 0.03 * influence));
    // spring smoothing
    s.vx += (targetTx - s.tx) * 0.18;
    s.vy += (targetTy - s.ty) * 0.18;
    s.vx *= 0.72; s.vy *= 0.72;
    s.tx += s.vx; s.ty += s.vy;
    s.rx += (targetRot - s.rx) * 0.16;
    // apply transform
    s.el.style.transform = `translateY(${s.ty}px) rotate(${s.rx}deg)`;
    // eyes follow a small amount (translate inside SVG)
    const eyes = s.el.querySelectorAll('.face .eye');
    eyes.forEach((eye)=>{
      const ex = (dx/ (dist)) * 3 * influence;
      const ey = (-dy/ (dist)) * 2 * influence;
      eye.style.transform = `translate(${ex}px, ${ey}px)`;
    });
  });
  requestAnimationFrame(updatePuppets);
}
requestAnimationFrame(updatePuppets);

/* click -> small bounce on puppets & star pop */
function puppetsCelebrate(){
  puppets.forEach((p, i)=>{
    p.classList.add('happy');
    setTimeout(()=> p.classList.remove('happy'), 1600);
  });
  // show star
  puppetStar.classList.add('show');
  setTimeout(()=> puppetStar.classList.remove('show'), 1800);
}

/* ------------------- FORM SUBMIT (simulate send) ------------------- */
const form = $('#transmitForm');
const sendBtn = document.querySelector('.btn-send');
const transmitStatus = $('#transmitStatus');
const transmitScan = $('#transmitScan');

if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    // start scan
    transmitStatus.textContent = 'TRANSMITTING...';
    transmitScan.classList.add('active');
    puppets.forEach(p => p.classList.remove('happy')); // reset
    // little button feedback
    if(sendBtn){
      sendBtn.disabled = true;
      sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> TRANSMITTING';
    }

    // simulate network delay
    setTimeout(()=>{
      // success state
      transmitScan.classList.remove('active');
      transmitStatus.textContent = 'SENT ✔';
      if(sendBtn){ sendBtn.innerHTML = '<i class="fas fa-check"></i> SENT'; }
      // celebrate puppets
      puppetsCelebrate();
      // reset button after short time
      setTimeout(()=>{
        if(sendBtn){ sendBtn.disabled = false; sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> SEND TRANSMISSION'; }
        transmitStatus.textContent = 'Idle';
        form.reset();
      }, 2400);
    }, 1800);
  });
}

/* ------------------- Accessibility & reduced motion ------------------- */
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.querySelectorAll('*').forEach(n => n.style.animationDuration = '0.001ms');
}

/* ------------------- initialize (if preloader skipped) ------------------- */
if(!preloader || preloader.classList.contains('hidden')){
  mainSite.classList.add('active');
  updateCircle(100);
}
