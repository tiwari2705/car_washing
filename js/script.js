/* ===========================
   Car Wash Booking System
   Enhanced JS with Car Animation
=========================== */

// ─── Booking State ────────────────────────────────────────────────────────────
const booking = {
  service: null, userType: null, carType: null,
  date: null, time: null, name: '', phone: '', price: 0,
};

const PRICES = {
  student: {
    basic: { hatchback: 199, sedan: 249, suv: 299 },
    foam:  { hatchback: 249, sedan: 299, suv: 349 },
    full:  { hatchback: 329, sedan: 399, suv: 459 },
  },
  others: {
    basic: { hatchback: 259, sedan: 309, suv: 359 },
    foam:  { hatchback: 299, sedan: 349, suv: 399 },
    full:  { hatchback: 399, sedan: 459, suv: 549 },
  },
};

const SERVICE_LABELS = { basic:'Basic Exterior Wash', foam:'Foam Wash', full:'Interior + Exterior Wash' };
const CAR_LABELS     = { hatchback:'Hatchback', sedan:'Sedan', suv:'SUV' };
const USER_LABELS    = { student:'Student', others:'Others' };

// ─── Step Management ──────────────────────────────────────────────────────────
let currentStep = 1;
const TOTAL_STEPS = 6;

// Car positions per step (percentage across track)
const CAR_POSITIONS = { 1: 5, 2: 20, 3: 38, 4: 55, 5: 72, 6: 88 };
// Dirt opacity per step (1 = very dirty, 0 = clean)
const DIRT_LEVELS   = { 1: 1, 2: 0.8, 3: 0.55, 4: 0.3, 5: 0.1, 6: 0 };
// Step labels for car strip
const STEP_LABELS   = {
  1: '🚗 Dirty Car — Select Service',
  2: '🧑 Who\'s booking?',
  3: '🚙 What\'s your car?',
  4: '📅 Pick your slot',
  5: '📝 Your details',
  6: '✨ Sparkling Clean!'
};

function goToStep(step) {
  const prev = currentStep;
  document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('step-' + step);
  if (target) target.classList.add('active');
  currentStep = step;
  updateStepIndicator();
  updateProgressBar();
  updateCarAnimation(step, prev);
  const container = document.querySelector('.booking-container');
  if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateStepIndicator() {
  document.querySelectorAll('.step-item').forEach((item, idx) => {
    const n = idx + 1;
    item.classList.remove('active', 'completed');
    const dot = item.querySelector('.step-dot');
    if (n === currentStep) {
      item.classList.add('active');
      if (dot) dot.innerHTML = n;
    } else if (n < currentStep) {
      item.classList.add('completed');
      if (dot) dot.innerHTML = '<i class="fas fa-check" style="font-size:0.7rem"></i>';
    } else {
      if (dot) dot.textContent = n;
    }
  });
}

function updateProgressBar() {
  const bar = document.getElementById('progressBar');
  if (bar) {
    const pct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    bar.style.width = pct + '%';
  }
}

// ─── Car Animation ────────────────────────────────────────────────────────────
function updateCarAnimation(step, prevStep) {
  const carWrap = document.getElementById('carSvgWrap');
  const dirtLayer = document.getElementById('carDirt');
  const washDrops = document.getElementById('washDrops');
  const stepLabel = document.getElementById('carStepLabel');
  const track = document.getElementById('carTrack');
  if (!carWrap || !track) return;

  const trackWidth = track.offsetWidth;
  const carWidth = 120;
  const pos = CAR_POSITIONS[step] / 100;
  const leftPx = Math.min(pos * (trackWidth - carWidth), trackWidth - carWidth - 10);
  carWrap.style.left = Math.max(10, leftPx) + 'px';

  // Dirt fade
  if (dirtLayer) {
    dirtLayer.style.opacity = DIRT_LEVELS[step];
  }

  // Wash drops — show when moving forward and dirt is reducing
  if (washDrops && step > prevStep && step <= 5) {
    washDrops.classList.add('active');
    setTimeout(() => washDrops.classList.remove('active'), 1200);
  }

  // Step label
  if (stepLabel) {
    stepLabel.textContent = STEP_LABELS[step];
    stepLabel.className = 'car-step-label' + (step === 6 ? ' clean' : '');
  }

  // Sparkles on final step
  if (step === 6) {
    spawnSparkles(carWrap);
  }
}

function spawnSparkles(parent) {
  const colors = ['#ffd700','#00c6ff','#10b981','#f59e0b','#7c3aed'];
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const s = document.createElement('div');
      s.innerHTML = ['✨','⭐','💫','🌟'][Math.floor(Math.random()*4)];
      s.style.cssText = `
        position:absolute;
        left:${Math.random()*140-10}px;
        top:${Math.random()*60-20}px;
        font-size:${0.8+Math.random()*0.8}rem;
        pointer-events:none;
        animation:sparkleAnim 0.9s ease forwards;
        z-index:10;
      `;
      parent.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }, i * 80);
  }
}

// ─── Price Calculator ─────────────────────────────────────────────────────────
function calculatePrice() {
  if (booking.userType && booking.service && booking.carType) {
    booking.price = PRICES[booking.userType][booking.service][booking.carType];
  } else { booking.price = 0; }
  return booking.price;
}

// ─── Selections ───────────────────────────────────────────────────────────────
function selectService(service) {
  booking.service = service;
  document.querySelectorAll('.booking-service-card').forEach(c => c.classList.remove('selected'));
  const el = document.querySelector(`.booking-service-card[data-service="${service}"]`);
  if (el) { el.classList.add('selected'); ripple(el); }
}

function selectUserType(type) {
  booking.userType = type;
  document.querySelectorAll('.user-type-option').forEach(o => o.classList.remove('selected'));
  const el = document.querySelector(`.user-type-option[data-type="${type}"]`);
  if (el) { el.classList.add('selected'); ripple(el); }
}

function selectCarType(type) {
  booking.carType = type;
  document.querySelectorAll('.car-type-btn').forEach(b => b.classList.remove('selected'));
  const el = document.querySelector(`.car-type-btn[data-car="${type}"]`);
  if (el) { el.classList.add('selected'); ripple(el); }
}

function selectTimeSlot(time) {
  booking.time = time;
  document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
  const el = document.querySelector(`.time-slot-btn[data-time="${time}"]`);
  if (el) { el.classList.add('selected'); }
}

// Ripple effect on click
function ripple(el) {
  const r = document.createElement('span');
  r.style.cssText = `
    position:absolute;width:200px;height:200px;
    background:rgba(13,110,253,0.12);border-radius:50%;
    transform:scale(0);animation:rippleAnim 0.6s ease;
    left:50%;top:50%;margin-left:-100px;margin-top:-100px;
    pointer-events:none;z-index:0;
  `;
  el.style.position = 'relative';
  el.style.overflow = 'hidden';
  el.appendChild(r);
  setTimeout(() => r.remove(), 600);
}

// ─── Summary ──────────────────────────────────────────────────────────────────
function populateSummary() {
  calculatePrice();
  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  set('sum-service',  SERVICE_LABELS[booking.service]  || '—');
  set('sum-usertype', USER_LABELS[booking.userType]    || '—');
  set('sum-cartype',  CAR_LABELS[booking.carType]      || '—');
  set('sum-date',     formatDate(booking.date)         || '—');
  set('sum-time',     booking.time                     || '—');
  set('sum-name',     booking.name                     || '—');
  set('sum-phone',    booking.phone                    || '—');
  // Animate price
  animatePrice('sum-price', booking.price);
}

function animatePrice(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = target / 30;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = '₹' + Math.round(current);
    if (current >= target) clearInterval(timer);
  }, 20);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday:'short', year:'numeric', month:'short', day:'numeric' });
}

// ─── Validation ───────────────────────────────────────────────────────────────
function showToast(msg, type = 'error') {
  const toast = document.getElementById('errorToast');
  const toastMsg = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.className = 'toast-notification' + (type === 'success' ? ' success' : '');
  if (toastIcon) toastIcon.className = type === 'success' ? 'fas fa-check-circle toast-icon' : 'fas fa-exclamation-circle toast-icon';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function validateStep(step) {
  switch (step) {
    case 1: if (!booking.service)  { showToast('Please select a service to continue.'); return false; } break;
    case 2: if (!booking.userType) { showToast('Please select your user type.'); return false; } break;
    case 3: if (!booking.carType)  { showToast('Please select your car type.'); return false; } break;
    case 4:
      if (!booking.date) { showToast('Please select a date.'); return false; }
      if (!booking.time) { showToast('Please select a time slot.'); return false; }
      break;
    case 5:
      const name = document.getElementById('inputName');
      const phone = document.getElementById('inputPhone');
      if (!name || !name.value.trim()) {
        showToast('Please enter your full name.');
        if (name) { name.classList.add('is-invalid'); name.focus(); }
        return false;
      }
      if (!phone || !phone.value.trim()) {
        showToast('Please enter your phone number.');
        if (phone) { phone.classList.add('is-invalid'); phone.focus(); }
        return false;
      }
      if (!/^[6-9]\d{9}$/.test(phone.value.trim())) {
        showToast('Please enter a valid 10-digit Indian mobile number.');
        phone.classList.add('is-invalid'); phone.focus();
        return false;
      }
      booking.name = name.value.trim();
      booking.phone = phone.value.trim();
      break;
  }
  return true;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function nextStep() {
  if (!validateStep(currentStep)) return;
  if (currentStep < TOTAL_STEPS) {
    if (currentStep === 5) populateSummary();
    goToStep(currentStep + 1);
  }
}

function prevStep() {
  if (currentStep > 1) goToStep(currentStep - 1);
}

// ─── Confirm Booking ──────────────────────────────────────────────────────────
function confirmBooking() {
  const btn = document.querySelector('.btn-confirm');
  if (btn) {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Confirming...';
    btn.disabled = true;
  }
  const bookingId = 'CW' + Date.now().toString().slice(-6).toUpperCase();
  sessionStorage.setItem('cwBooking', JSON.stringify({
    ...booking, bookingId,
    serviceLabel: SERVICE_LABELS[booking.service],
    carLabel: CAR_LABELS[booking.carType],
    userLabel: USER_LABELS[booking.userType],
    dateFormatted: formatDate(booking.date),
  }));
  setTimeout(() => { window.location.href = 'success.html'; }, 800);
}

// ─── Success Page ─────────────────────────────────────────────────────────────
function loadSuccessPage() {
  const data = sessionStorage.getItem('cwBooking');
  if (!data) { window.location.href = 'index.html'; return; }
  const b = JSON.parse(data);
  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  set('sc-id',       b.bookingId);
  set('sc-service',  b.serviceLabel);
  set('sc-usertype', b.userLabel);
  set('sc-cartype',  b.carLabel);
  set('sc-date',     b.dateFormatted);
  set('sc-time',     b.time);
  set('sc-name',     b.name);
  set('sc-phone',    b.phone);
  set('sc-price',    '₹' + b.price);
  sessionStorage.removeItem('cwBooking');
  // Launch confetti
  setTimeout(launchConfetti, 400);
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = [];
  const colors = ['#0d6efd','#00c6ff','#10b981','#f59e0b','#7c3aed','#ef4444','#ffd700'];
  for (let i = 0; i < 120; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: 8 + Math.random() * 8,
      h: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      vr: (Math.random() - 0.5) * 0.2,
      opacity: 1,
    });
  }
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (frame > 120) p.opacity -= 0.012;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < 220) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => observer.observe(el));
}

// ─── Animated Counters ────────────────────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = target / 50;
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.round(current) + suffix;
          if (current >= target) clearInterval(timer);
        }, 30);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

// ─── Navbar scroll effect ─────────────────────────────────────────────────────
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ─── Water drops (hero) ───────────────────────────────────────────────────────
function initWaterDrops() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const drop = document.createElement('div');
    drop.className = 'water-drop';
    drop.style.left = Math.random() * 100 + '%';
    drop.style.animationDuration = (3 + Math.random() * 5) + 's';
    drop.style.animationDelay = (Math.random() * 5) + 's';
    drop.style.width = drop.style.height = (4 + Math.random() * 6) + 'px';
    container.appendChild(drop);
  }
}

// ─── Date Picker ─────────────────────────────────────────────────────────────
function initDatePicker() {
  const dp = document.getElementById('inputDate');
  if (!dp) return;
  dp.min = new Date().toISOString().split('T')[0];
  dp.addEventListener('change', function() { booking.date = this.value; });
}

// ─── Input Listeners ─────────────────────────────────────────────────────────
function initInputListeners() {
  const name = document.getElementById('inputName');
  const phone = document.getElementById('inputPhone');
  if (name) name.addEventListener('input', function() {
    this.classList.remove('is-invalid'); booking.name = this.value.trim();
  });
  if (phone) phone.addEventListener('input', function() {
    this.classList.remove('is-invalid');
    this.value = this.value.replace(/\D/g,'').slice(0,10);
    booking.phone = this.value;
  });
}

// ─── Ripple CSS injection ─────────────────────────────────────────────────────
function injectRippleCSS() {
  const style = document.createElement('style');
  style.textContent = '@keyframes rippleAnim{from{transform:scale(0);opacity:1}to{transform:scale(1);opacity:0}}';
  document.head.appendChild(style);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initNavbar();
  initScrollReveal();
  initCounters();
  injectRippleCSS();

  if (document.getElementById('heroParticles')) initWaterDrops();

  if (document.getElementById('step-1')) {
    goToStep(1);
    initDatePicker();
    initInputListeners();
    // Init car position
    setTimeout(() => updateCarAnimation(1, 1), 100);
    // Resize handler for car track
    window.addEventListener('resize', () => updateCarAnimation(currentStep, currentStep));
  }

  if (document.getElementById('success-page')) loadSuccessPage();
});
