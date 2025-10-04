// ===== Util: set CSS vars from data-* for hero =====
function bindHeroVars(){
  const hero = document.getElementById('hero');
  if(!hero) return;
  const root = hero.style;
  const img = hero.dataset.heroImg;
  const imgM = hero.dataset.heroImgMobile;
  const pos = hero.dataset.heroPos;
  const posM = hero.dataset.heroPosMobile;

  if(img)  document.documentElement.style.setProperty('--hero-img', `url("${img}")`);
  if(imgM) document.documentElement.style.setProperty('--hero-img-mobile', `url("${imgM}")`);
  if(pos)  document.documentElement.style.setProperty('--hero-pos', pos);
  if(posM) document.documentElement.style.setProperty('--hero-pos-mobile', posM);
}

// ===== Header shadow + logo swap on scroll =====
const header = document.getElementById('siteHeader');
function onScroll(){
  const top = window.scrollY || window.pageYOffset;
  const atTop = top < 10;
  header.classList.toggle('scrolled', !atTop);
  header.classList.toggle('on-hero', atTop);

  // 로고 자동 스왑
  const logo = document.getElementById('logoImg');
  if(logo){
    const dark = logo.getAttribute('data-logo-dark');
    const light = logo.getAttribute('data-logo-light');
    if(light){ logo.src = atTop ? light : (dark || logo.src); }
  }
}

// ===== Mobile overlay menu =====
const menu = document.getElementById('mobileMenu');
const openBtn = document.getElementById('openNav');
const closeBtn = document.getElementById('closeNav');

function openMenu(){
  if(!menu) return;
  menu.classList.add('open');
  document.body.classList.add('menu-open');
  openBtn?.setAttribute('aria-expanded','true');
}
function closeMenu(){
  if(!menu) return;
  menu.classList.remove('open');
  document.body.classList.remove('menu-open');
  openBtn?.setAttribute('aria-expanded','false');
}

// ===== 100vh / header height fix (mobile address bar) =====
function setVH(){
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
function setHeaderH(){
  const h = document.getElementById('siteHeader')?.offsetHeight || 76;
  document.documentElement.style.setProperty('--header-h', h + 'px');
}

// ===== Init =====
function init(){
  bindHeroVars();
  setVH(); setHeaderH();
  onScroll();

  // events
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', ()=>{ setVH(); setHeaderH(); if(window.innerWidth > 860) closeMenu(); }, { passive:true });
  window.addEventListener('orientationchange', ()=>{ setVH(); setHeaderH(); });

  openBtn?.addEventListener('click', (e)=>{ e.stopPropagation(); openMenu(); });
  closeBtn?.addEventListener('click', closeMenu);

  // Esc to close
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMenu(); });

  // Click outside to close
  document.addEventListener('click', (e)=>{
    if(!menu) return;
    const isInside = menu.contains(e.target) || openBtn?.contains(e.target);
    if(!isInside) closeMenu();
  }, true);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
}else{
  init();
}


/* ===== About: typing, count-up, reveal ===== */
function typingInit(){
  const title = document.querySelector('.about-title');
  if(!title) return;

  const target = title.querySelector('.typing-text');
  const caret = title.querySelector('.caret');
  const raw = title.dataset.typing || '[]';

  let words;
  try{ words = JSON.parse(raw); }catch(_){ words = [raw]; }

  let wi = 0, ci = 0, isDeleting = false;
  const speed = { type: 38, del: 24, hold: 1300, gap: 450 };

  function tick(){
    const word = words[wi % words.length];

    if(!isDeleting){
      // 타이핑
      ci++;
      target.textContent = word.slice(0, ci);
      if(ci === word.length){
        isDeleting = true;
        setTimeout(tick, speed.hold);
        return;
      }
      setTimeout(tick, speed.type);
    }else{
      // 삭제
      ci--;
      target.textContent = word.slice(0, ci);
      if(ci === 0){
        isDeleting = false;
        wi++;
        setTimeout(tick, speed.gap);
        return;
      }
      setTimeout(tick, speed.del);
    }
  }

  // 뷰포트 진입 시 시작
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e=>{
      if(e.isIntersecting){
        tick();
        io.disconnect();
      }
    });
  }, { threshold: .4 });
  io.observe(title);
}

function countUpInit(){
  const nums = document.querySelectorAll('.about .num');
  if(!nums.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const play = (el) => {
    const target = parseInt(el.dataset.count || '0', 10);
    const start = performance.now();
    const dur = 1200 + Math.random()*600;

    function step(now){
      const p = Math.min(1, (now - start)/dur);
      const val = Math.floor(easeOut(p) * target);
      el.textContent = val.toLocaleString();
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e=>{
      if(e.isIntersecting){
        play(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: .6 });

  nums.forEach(n=> io.observe(n));
}

function revealInit(){
  const els = document.querySelectorAll('.reveal');
  if(!els.length) return;

  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .25 });

  els.forEach(el=> io.observe(el));
}

// 기존 init() 이후에 실행하도록 DOMContentLoaded 안에서 호출됨
document.addEventListener('DOMContentLoaded', ()=>{
  typingInit();
  countUpInit();
  revealInit();
});

/* ===== Logos: auto-fill seamless loop ===== */
function logosInit(){
  const track = document.getElementById('logoTrack');
  if(!track) return;

  const marquee = track.parentElement;
  const imgs = track.querySelectorAll('img');
  if(!imgs.length) return;

  // 복제해서 최소 두 세트는 확보
  let totalWidth = track.scrollWidth;
  while(totalWidth < window.innerWidth * 2){ 
    imgs.forEach(img=>{
      const clone = img.cloneNode(true);
      track.appendChild(clone);
    });
    totalWidth = track.scrollWidth;
  }

  // 속도 자동 계산 (180px/s 기준)
  const seconds = Math.max(18, Math.min(36, totalWidth / 180));
  track.style.setProperty('--logo-speed', `${seconds}s`);
}

window.addEventListener('load', logosInit);
window.addEventListener('resize', logosInit);


document.querySelectorAll("#process .line").forEach(line=>{
  const btn = line.querySelector(".more-btn");

  // line 전체 클릭
  line.addEventListener("click", e=>{
    // ... 버튼 외 영역 눌러도 작동
    if (!e.target.classList.contains("more-btn")) {
      line.classList.toggle("open");
    }
  });

  // ... 버튼도 그대로 작동
  if(btn){
    btn.addEventListener("click", e=>{
      e.stopPropagation(); // 이벤트 중복 방지
      line.classList.toggle("open");
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#portfolio .portfolio-track").forEach(track=>{
    const cards = Array.from(track.children);
    cards.forEach(card=>{
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden","true");
      track.appendChild(clone);
    });
  });
});

// Card Fan: 자동 순환 + 클릭 시 앞으로
document.addEventListener("DOMContentLoaded", () => {
  const stage = document.getElementById("testiStage");
  const cards = Array.from(stage.querySelectorAll(".tcard"));

  // 가운데 포함 5장 배치 (좌2, 중앙1, 우2) — 개수가 적으면 있는 만큼 배치
  const layout = [
    { tx: -260, rot: -12, scale: .9,  z: 1, opacity: .55, blur: "1px" },
    { tx: -120, rot: -6,  scale: .95, z: 2, opacity: .75, blur: "0.5px" },
    { tx:   0,  rot: 0,   scale: 1.04, z: 5, opacity: 1,   blur: "0px" }, // center
    { tx:  120, rot: 6,   scale: .95, z: 2, opacity: .75, blur: "0.5px" },
    { tx:  260, rot: 12,  scale: .9,  z: 1, opacity: .55, blur: "1px" },
  ];

  // 반응형 보정
  function scaledLayout(){
    const vw = Math.min(window.innerWidth, 1200);
    const k = vw / 1200; // 0~1
    return layout.map(l => ({
      tx: l.tx * (0.8 + 0.2*k),     // 모바일에서 간격 살짝 축소
      rot: l.rot,
      scale: l.scale - (1-k)*0.05, // 화면 좁을수록 스케일 살짝 줄임
      z: l.z, opacity: l.opacity, blur: l.blur
    }));
  }

  let idx = 0;       // 중앙 카드 인덱스
  let timer = null;  // 자동 재생 타이머

  function render(){
    const L = scaledLayout();
    // 현재 인덱스를 기준으로 5장 잡아서 배치
    for(let i=0; i<cards.length; i++){
      const rel = ((i - idx) % cards.length + cards.length) % cards.length; // 0..N-1
      let conf = null;
      if(rel === 0) conf = L[2];               // center
      else if(rel === 1) conf = L[3];          // right1
      else if(rel === 2) conf = L[4];          // right2
      else if(rel === cards.length-1) conf = L[1]; // left1
      else if(rel === cards.length-2) conf = L[0]; // left2

      const c = cards[i];
      if(conf){
        c.style.setProperty("--tx", `${conf.tx}px`);
        c.style.setProperty("--rot", `${conf.rot}deg`);
        c.style.setProperty("--scale", conf.scale);
        c.style.setProperty("--z", conf.z);
        c.style.setProperty("--opacity", conf.opacity);
        c.style.setProperty("--blur", conf.blur);
        c.style.pointerEvents = "auto";
      }else{
        // 나머지는 뒤로 보내고 살짝 숨김
        c.style.setProperty("--tx", `0px`);
        c.style.setProperty("--rot", `0deg`);
        c.style.setProperty("--scale", `.88`);
        c.style.setProperty("--z", `0`);
        c.style.setProperty("--opacity", `.0`);
        c.style.setProperty("--blur", `1px`);
        c.style.pointerEvents = "none";
      }
    }
  }

  function next(){ idx = (idx + 1) % cards.length; render(); }
  function start(){ timer = setInterval(next, 3500); }
  function stop(){ if(timer){ clearInterval(timer); timer=null; } }

  // 카드에 마우스 올리면 일시정지 + 클릭 시 그 카드 앞으로
  cards.forEach((card, i) => {
    card.addEventListener("mouseenter", stop);
    card.addEventListener("mouseleave", start);
    card.addEventListener("click", () => { 
      idx = i; 
      render(); 
    });
  });

  window.addEventListener("resize", render);

  render();
  start();
});

document.querySelectorAll("#faq .faq-item").forEach(item => {
  const btn = item.querySelector(".faq-question");
  const ans = item.querySelector(".faq-answer");

  ans.hidden = true;
  btn.setAttribute("aria-expanded", "false");

  const open = () => {
    ans.hidden = false;
    ans.style.maxHeight = ans.scrollHeight + "px"; // auto 대신 고정
    ans.style.opacity = "1";
    ans.style.transform = "translateY(0)";
    ans.style.paddingBottom = "16px";
    item.classList.add("active");
    btn.setAttribute("aria-expanded", "true");
  };

  const close = () => {
    ans.style.maxHeight = ans.scrollHeight + "px"; // 현재 높이에서 시작
    requestAnimationFrame(() => {
      ans.style.maxHeight = "0";
      ans.style.opacity = "0";
      ans.style.transform = "translateY(-6px)";
      ans.style.paddingBottom = "0px";
    });
    item.classList.remove("active");
    btn.setAttribute("aria-expanded", "false");
    ans.addEventListener("transitionend", () => { ans.hidden = true; }, { once: true });
  };

  btn.addEventListener("click", () => {
    item.classList.contains("active") ? close() : open();
  });
});

// Scroll Reveal Observer
(function(){
  const els = document.querySelectorAll('.sr');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el=>el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  },{
    threshold: 0.1,         // 10% 보여도 발동
    rootMargin: "0px 0px -10% 0px"
  });

  els.forEach(el=>io.observe(el));
})();


/* ===== Contact → Google Sheet submit (fix: name 충돌, phone required) ===== */
(function(){
  const form = document.getElementById("contactForm");
  if(!form) return;

  const alertBox = document.getElementById("formAlert");
  const pills = form.querySelectorAll(".pill");
  const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwFSugzYX0o0wMPVCUwr47pk5qg9qZhqllFNgMSbIs4ddyZAHm9Z5ua1P0FEngfh7V8Aw/exec"; // ← Apps Script 웹 앱 URL

  // 칩 토글
  pills.forEach(pill=> pill.addEventListener("click", ()=> pill.classList.toggle("on")));

  function showAlert(msg, ok=false){
    if(!alertBox) return;
    alertBox.hidden = false;
    alertBox.className = "form-alert " + (ok ? "ok" : "err");
    alertBox.textContent = msg;
  }

  // ★ 안전한 접근 유틸
  const $ = (n) => form.elements[n];

  // 한국형 전화번호 간단 패턴: 02/0XX-XXXX-XXXX, 하이픈 생략 허용
  const phoneKR = /^(0\d{1,2})-?\d{3,4}-?\d{4}$/;

  function validate(){
    const nameVal  = ($("name")?.value || "").trim();
    const emailVal = ($("email")?.value || "").trim();
    const phoneVal = ($("phone")?.value || "").trim();
    const msgVal   = ($("message")?.value || "").trim();
    const agree    = $("agree")?.checked;

    if(!nameVal)  return showAlert("성함을 입력해 주세요."), false;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) return showAlert("올바른 이메일 주소를 입력해 주세요."), false;
    if(!phoneVal) return showAlert("연락처를 입력해 주세요."), false;
    if(!phoneKR.test(phoneVal)) return showAlert("연락처 형식을 확인해 주세요. 예) 010-1234-5678"), false;
    if(!msgVal)   return showAlert("요청/설명을 입력해 주세요."), false;
    if(!agree)    return showAlert("개인정보 수집·이용에 동의가 필요합니다."), false;

    return true;
  }

  async function sendToSheet(payload){
    const res = await fetch(WEBAPP_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    if(alertBox) alertBox.hidden = true;
    if(!validate()) return;

    const types = [...form.querySelectorAll(".pill.on")]
      .map(b=>b.textContent.trim())
      .join(", ");

    const payload = {
      name:    ($("name")?.value || "").trim(),
      email:   ($("email")?.value || "").trim(),
      phone:   ($("phone")?.value || "").trim(),
      types,
      message: ($("message")?.value || "").trim(),
      agree:   !!$("agree")?.checked,
      page:    location.href,
      ua:      navigator.userAgent
    };

    try{
      const data = await sendToSheet(payload);
      if(data && data.ok){
        showAlert("문의가 정상 접수되었습니다. 감사합니다! 영업일 기준 24시간 내 회신 드립니다.", true);
        form.reset();
        form.querySelectorAll(".pill.on").forEach(p=>p.classList.remove("on"));
      }else{
        showAlert("전송 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      }
    }catch(err){
      showAlert("네트워크 오류가 발생했습니다. 연결을 확인 후 다시 시도해 주세요.");
    }
  });
})();