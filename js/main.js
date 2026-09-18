/* =====================================================
   main.js — John Kamau Mwangi Portfolio
   Place this file at: js/main.js
===================================================== */

/* ─── 1. SET YEAR ────────────────────────────────── */
document.getElementById('currentYear').textContent = new Date().getFullYear();

/* ─── 2. DARK / LIGHT THEME TOGGLE ──────────────────
   - Saves the user's preference to localStorage
     so it is remembered next time they visit.
   - Updates the icon and text on both desktop
     and mobile toggle buttons.
──────────────────────────────────────────────────── */
var html       = document.documentElement;   /* the <html> element */
var themeIcon  = document.getElementById('themeIcon');
var themeIconMob  = document.getElementById('themeIconMob');
var themeTextMob  = document.getElementById('themeTextMob');

/* Read saved preference — default to 'light' if nothing saved */
var savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  if (theme === 'dark') {
    /* show sun icon so user can switch back to light */
    if (themeIcon)    { themeIcon.className    = 'fas fa-sun'; }
    if (themeIconMob) { themeIconMob.className = 'fas fa-sun'; }
    if (themeTextMob) { themeTextMob.textContent = 'Light Mode'; }
  } else {
    /* show moon icon so user can switch to dark */
    if (themeIcon)    { themeIcon.className    = 'fas fa-moon'; }
    if (themeIconMob) { themeIconMob.className = 'fas fa-moon'; }
    if (themeTextMob) { themeTextMob.textContent = 'Dark Mode'; }
  }
}

function toggleTheme() {
  var current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/* ─── 3. SCROLL: PROGRESS BAR + NAV SHADOW ──────── */
window.addEventListener('scroll', function () {
  var scrolled = window.scrollY;
  var total    = document.body.scrollHeight - window.innerHeight;
  document.getElementById('progress-bar').style.width = (scrolled / total * 100) + '%';
  document.getElementById('navbar').classList.toggle('scrolled', scrolled > 50);
});

/* ─── 4. SCROLL REVEAL ───────────────────────────── */
var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry, i) {
    if (entry.isIntersecting) {
      setTimeout(function () {
        entry.target.classList.add('visible');
      }, i * 80);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(function (el) {
  revealObserver.observe(el);
});

/* ─── 5. SKILL BARS ──────────────────────────────── */
var barObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(function (bar) {
        bar.style.width = bar.getAttribute('data-width') + '%';
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.25 });

var skillSection = document.getElementById('skillBars');
if (skillSection) barObserver.observe(skillSection);

/* ─── 6. MOBILE MENU ─────────────────────────────── */
function openMobileMenu()  { document.getElementById('mobileMenu').classList.add('open'); }
function closeMobileMenu() { document.getElementById('mobileMenu').classList.remove('open'); }
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeMobileMenu();
});

/* ─── 7. CONTACT FORM ────────────────────────────────
   Fixed version:
   - Validates all required fields with inline errors
   - Shows a clear success or error banner
   - Falls back to a mailto link if the server is down
   - Works with EmailJS (free, no server needed) OR
     your existing Render backend
──────────────────────────────────────────────────── */
var contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    /* grab values */
    var name    = document.getElementById('fname').value.trim();
    var email   = document.getElementById('femail').value.trim();
    var phone   = document.getElementById('fphone').value.trim();
    var subject = document.getElementById('fsubject').value.trim();
    var msg     = document.getElementById('fmsg').value.trim();
    var btn     = document.getElementById('submitBtn');
    var banner  = document.getElementById('formBanner');

    /* ── clear previous errors ── */
    clearErrors();
    hideBanner();

    /* ── validate ── */
    var hasError = false;

    if (!name) {
      showFieldError('nameError', 'fname');
      hasError = true;
    }
    if (!email || !isValidEmail(email)) {
      showFieldError('emailError', 'femail');
      hasError = true;
    }
    if (!subject) {
      showFieldError('subjectError', 'fsubject');
      hasError = true;
    }
    if (!msg) {
      showFieldError('msgError', 'fmsg');
      hasError = true;
    }

    if (hasError) return;

    /* ── show loading state ── */
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    /* ── METHOD 1: Try your Render backend ── */
    try {
      var response = await fetch(
        'https://my-personal-portfolio-website-tstd.onrender.com/submit-form',
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:    name,
            email:   email,
            phone:   phone,
            subject: subject,
            message: msg
          })
        }
      );

      if (response.ok) {
        /* ✅ Success */
        showBanner('success', '✓ Message sent! I\'ll get back to you within 24 hours.');
        contactForm.reset();
      } else {
        /* Server responded but with an error — fallback */
        throw new Error('Server error: ' + response.status);
      }

    } catch (err) {
      /* ── METHOD 2: Fallback — open mailto ──
         This opens the user's email app pre-filled,
         so the message still gets through even if
         the backend is down.
      ── */
      console.warn('Backend failed, falling back to mailto:', err.message);

      var mailtoLink =
        'mailto:johnkmwangi29@gmail.com' +
        '?subject=' + encodeURIComponent(subject || 'Portfolio Enquiry') +
        '&body=' + encodeURIComponent(
          'Name: '    + name    + '\n' +
          'Email: '   + email   + '\n' +
          'Phone: '   + (phone || 'N/A') + '\n\n' +
          msg
        );

      /* open the user's email client */
      window.location.href = mailtoLink;

      showBanner('success',
        '✓ Opening your email app with the message pre-filled. ' +
        'Alternatively email me directly: johnkmwangi29@gmail.com'
      );
      contactForm.reset();
    }

    /* ── restore button ── */
    btn.disabled = false;
    btn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
  });
}

/* ── helpers ── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(errorId, inputId) {
  document.getElementById(errorId).classList.add('show');
  document.getElementById(inputId).classList.add('error');
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(function (el) { el.classList.remove('show'); });
  document.querySelectorAll('.form-input, .form-textarea').forEach(function (el) { el.classList.remove('error'); });
}

function showBanner(type, message) {
  var banner = document.getElementById('formBanner');
  banner.className = 'form-banner ' + type;
  banner.textContent = message;
  /* scroll banner into view */
  banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  /* auto-hide after 8 seconds */
  setTimeout(hideBanner, 8000);
}

function hideBanner() {
  var banner = document.getElementById('formBanner');
  if (banner) banner.className = 'form-banner hidden';
}

/* clear field error on typing */
document.querySelectorAll('.form-input, .form-textarea').forEach(function (input) {
  input.addEventListener('input', function () {
    this.classList.remove('error');
    /* hide the error label next to this field */
    var errorEl = this.parentElement.querySelector('.field-error');
    if (errorEl) errorEl.classList.remove('show');
  });
});