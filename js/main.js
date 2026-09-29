
/* =====================================================
   main.js — John Kamau Mwangi Portfolio
   Place at: js/main.js
===================================================== */
 
/* ─── 1. YEAR ─────────────────────────────────────── */
var yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();
 
/* ─── 2. THEME TOGGLE ────────────────────────────────
   Saves preference to localStorage so it persists
   across page visits. Updates both desktop + mobile
   toggle icons and text simultaneously.
─────────────────────────────────────────────────── */
var html         = document.documentElement;
var themeIcon    = document.getElementById('themeIcon');
var themeIconMob = document.getElementById('themeIconMob');
var themeTextMob = document.getElementById('themeTextMob');
 
/* Read saved theme — default to light */
var savedTheme = localStorage.getItem('jk-theme') || 'light';
applyTheme(savedTheme);
 
function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('jk-theme', theme);
 
  if (theme === 'dark') {
    if (themeIcon)    themeIcon.className    = 'fas fa-sun';
    if (themeIconMob) themeIconMob.className = 'fas fa-sun';
    if (themeTextMob) themeTextMob.textContent = 'Light Mode';
  } else {
    if (themeIcon)    themeIcon.className    = 'fas fa-moon';
    if (themeIconMob) themeIconMob.className = 'fas fa-moon';
    if (themeTextMob) themeTextMob.textContent = 'Dark Mode';
  }
}
 
function toggleTheme() {
  var current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}
 
/* ─── 3. SCROLL: PROGRESS BAR + NAV SHADOW ────────── */
window.addEventListener('scroll', function () {
  var scrolled = window.scrollY;
  var total    = document.body.scrollHeight - window.innerHeight;
  var pct      = total > 0 ? (scrolled / total) * 100 : 0;
 
  var bar = document.getElementById('progress-bar');
  if (bar) bar.style.width = pct + '%';
 
  var nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', scrolled > 50);
});
 
/* ─── 4. SCROLL REVEAL ───────────────────────────────
   Elements with class "reveal" animate in when
   they enter the viewport.
─────────────────────────────────────────────────── */
var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry, i) {
    if (entry.isIntersecting) {
      setTimeout(function () {
        entry.target.classList.add('visible');
      }, i * 75);
    }
  });
}, { threshold: 0.1 });
 
document.querySelectorAll('.reveal').forEach(function (el) {
  revealObserver.observe(el);
});
 
/* ─── 5. SKILL BARS ──────────────────────────────────
   Bars start at width:0 in CSS.
   When the skills section scrolls into view,
   JS expands each bar to its data-width value.
─────────────────────────────────────────────────── */
var barObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(function (bar) {
        bar.style.width = (bar.getAttribute('data-width') || 0) + '%';
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.25 });
 
var skillSection = document.getElementById('skillBars');
if (skillSection) barObserver.observe(skillSection);
 
/* ─── 6. MOBILE MENU ─────────────────────────────── */
function openMobileMenu() {
  var menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.add('open');
}
function closeMobileMenu() {
  var menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.remove('open');
}
/* close on Escape key */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeMobileMenu();
});
 
/* ─── 7. JOURNEY TABS ────────────────────────────────
   Switches between Education and Work panes.
─────────────────────────────────────────────────── */
document.querySelectorAll('.tl-tab').forEach(function (tab) {
  tab.addEventListener('click', function () {
    /* deactivate all tabs and panes */
    document.querySelectorAll('.tl-tab').forEach(function (t) {
      t.classList.remove('active');
    });
    document.querySelectorAll('.tl-pane').forEach(function (p) {
      p.classList.remove('active');
    });
    /* activate the clicked tab and its matching pane */
    tab.classList.add('active');
    var pane = document.getElementById('pane-' + tab.getAttribute('data-pane'));
    if (pane) pane.classList.add('active');
  });
});
 
/* ─── 8. CONTACT FORM ────────────────────────────────
   Validates fields, sends to backend, and falls
   back to mailto if the server is unreachable.
─────────────────────────────────────────────────── */
var contactForm = document.getElementById('contactForm');
 
if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
 
    var name    = document.getElementById('fname').value.trim();
    var email   = document.getElementById('femail').value.trim();
    var phone   = document.getElementById('fphone').value.trim();
    var subject = document.getElementById('fsubject').value.trim();
    var msg     = document.getElementById('fmsg').value.trim();
    var btn     = document.getElementById('submitBtn');
 
    /* clear previous errors */
    clearErrors();
    hideBanner();
 
    /* validate */
    var hasError = false;
    if (!name)                     { showFieldError('nameError',    'fname');    hasError = true; }
    if (!email || !validEmail(email)) { showFieldError('emailError', 'femail');  hasError = true; }
    if (!subject)                  { showFieldError('subjectError', 'fsubject'); hasError = true; }
    if (!msg)                      { showFieldError('msgError',     'fmsg');     hasError = true; }
    if (hasError) return;
 
    /* loading state */
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
 
    /* try backend */
    try {
      var res = await fetch(
        'https://my-personal-portfolio-website-tstd.onrender.com/submit-form',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, subject, message: msg })
        }
      );
 
      if (res.ok) {
        showBanner('success', '✓ Message sent! I\'ll get back to you within 24 hours.');
        contactForm.reset();
      } else {
        throw new Error('Server responded with ' + res.status);
      }
 
    } catch (err) {
      /* fallback: open mailto pre-filled */
      var mailto =
        'mailto:johnkmwangi29@gmail.com' +
        '?subject=' + encodeURIComponent(subject || 'Portfolio Enquiry') +
        '&body='    + encodeURIComponent(
          'Name: '    + name  + '\n' +
          'Email: '   + email + '\n' +
          'Phone: '   + (phone || 'N/A') + '\n\n' +
          msg
        );
      window.location.href = mailto;
      showBanner('success', '✓ Opening your email app — message pre-filled. Alternatively email: johnkmwangi29@gmail.com');
      contactForm.reset();
    }
 
    btn.disabled = false;
    btn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
  });
}
 
/* ── form helpers ── */
function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
 
function showFieldError(errId, inputId) {
  var errEl   = document.getElementById(errId);
  var inputEl = document.getElementById(inputId);
  if (errEl)   errEl.classList.add('show');
  if (inputEl) inputEl.classList.add('error');
}
 
function clearErrors() {
  document.querySelectorAll('.field-error').forEach(function (el) { el.classList.remove('show'); });
  document.querySelectorAll('.form-input, .form-textarea').forEach(function (el) { el.classList.remove('error'); });
}
 
function showBanner(type, message) {
  var banner = document.getElementById('formBanner');
  if (!banner) return;
  banner.className = 'form-banner ' + type;
  banner.textContent = message;
  banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(hideBanner, 8000);
}
 
function hideBanner() {
  var banner = document.getElementById('formBanner');
  if (banner) banner.className = 'form-banner hidden';
}
 
/* clear field error as user types */
document.querySelectorAll('.form-input, .form-textarea').forEach(function (input) {
  input.addEventListener('input', function () {
    this.classList.remove('error');
    var errEl = this.parentElement.querySelector('.field-error');
    if (errEl) errEl.classList.remove('show');
  });
});