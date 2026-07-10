// ============ SHARED SITE SCRIPT ============
document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

// Sticky header shadow on scroll
const header = document.getElementById('siteHeader');
const backToTop = document.getElementById('backToTop');
function onScroll(){
  const y = window.scrollY;
  if(header) header.classList.toggle('scrolled', y > 10);
  if(backToTop) backToTop.classList.toggle('show', y > 480);
}
window.addEventListener('scroll', onScroll, { passive:true });
onScroll();

backToTop && backToTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
const navOverlay = document.getElementById('navOverlay');
function closeNav(){
  mainNav && mainNav.classList.remove('open');
  navOverlay && navOverlay.classList.remove('open');
  navToggle && navToggle.setAttribute('aria-expanded','false');
}
function toggleNav(){
  const isOpen = mainNav && mainNav.classList.toggle('open');
  navOverlay && navOverlay.classList.toggle('open', !!isOpen);
  navToggle && navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}
navToggle && navToggle.addEventListener('click', toggleNav);
navOverlay && navOverlay.addEventListener('click', closeNav);
mainNav && mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

// Active nav link on scroll (home page sections)
const homeSections = ['home','about','services','work','pricing']
  .map(id => document.getElementById(id))
  .filter(Boolean);
const navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
if(homeSections.length && 'IntersectionObserver' in window){
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = '#' + entry.target.id;
        navLinks.forEach(l => {
          const href = l.getAttribute('href') || '';
          l.classList.toggle('active', href === id || href === 'index.html' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
  homeSections.forEach(s => navObserver.observe(s));
}

// Smooth scroll with header-offset compensation (in-page anchors only)
const headerOffset = 78;
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e){
    const id = this.getAttribute('href');
    if(id.length < 2) return;
    const target = document.querySelector(id);
    if(!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
if('IntersectionObserver' in window && revealEls.length){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.12, rootMargin:'0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in-view'));
}

// FAQ accordion (service pages)
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  q && q.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    item.parentElement.querySelectorAll('.faq-item.open').forEach(other => {
      if(other !== item) other.classList.remove('open');
    });
    item.classList.toggle('open', !wasOpen);
  });
});

// Portfolio filter (work.html)
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-grid .work-card');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    portfolioCards.forEach(card => {
      const match = cat === 'all' || card.dataset.category === cat;
      card.classList.toggle('hidden', !match);
    });
  });
});

// Contact form (contact.html) — validates, then hands the enquiry straight to WhatsApp
const STUDIO_WHATSAPP_NUMBER = '919976756627'; // Ditto Design WhatsApp — no + or spaces for wa.me links
const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('formMsg');
    const name = contactForm.name.value.trim();
    const phone = contactForm.phone.value.trim();
    const email = contactForm.email.value.trim();
    const serviceSelect = document.getElementById('cf-service');
    const service = serviceSelect && serviceSelect.selectedOptions.length ? serviceSelect.selectedOptions[0].text : '';
    const message = contactForm.message.value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if(!name || !emailOk || !message){
      msg.textContent = 'Please fill in your name, a valid email, and your message before sending.';
      msg.classList.remove('success');
      msg.classList.add('error');
      return;
    }

    // Build a readable WhatsApp message from the form fields
    const lines = [
      'Hi Ditto Design, I\'d like to enquire about a project.',
      '',
      'Name: ' + name,
      phone ? 'Phone: ' + phone : null,
      'Email: ' + email,
      (service && service !== 'Select a service (optional)') ? 'Service: ' + service : null,
      'Message: ' + message
    ].filter(Boolean).join('\n');

    const waUrl = 'https://wa.me/' + STUDIO_WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines);

    msg.textContent = "Thanks, " + name.split(' ')[0] + " — opening WhatsApp so you can send this straight to us.";
    msg.classList.remove('error');
    msg.classList.add('success');

    window.open(waUrl, '_blank', 'noopener');
    contactForm.reset();
  });
}