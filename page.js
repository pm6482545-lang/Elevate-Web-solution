(function () {
  'use strict';
  var WA = '254746357349';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function track(name, params) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: name }, params || {}));
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (h.indexOf('wa.me') > -1) track('whatsapp_click');
    else if (h.indexOf('tel:') === 0) track('call_click');
  }, true);

  var header = $('#header'), toTop = $('#toTop'), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      if (header) header.classList.toggle('scrolled', window.scrollY > 20);
      if (toTop) toTop.classList.toggle('show', window.scrollY > 800);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  var menuBtn = $('#menuBtn'), drawer = $('#drawer');
  function setDrawer(open) {
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.innerHTML = '<svg class="ic"><use href="#' + (open ? 'i-close' : 'i-menu') + '"/></svg>';
    document.body.classList.toggle('locked', open);
    menuBtn.style.position = open ? 'relative' : '';
    menuBtn.style.zIndex = open ? '1002' : '';
  }
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', function () { setDrawer(!drawer.classList.contains('open')); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) setDrawer(false); });
  }

  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  var form = $('#projectForm');
  if (form) {
    var def = form.getAttribute('data-type');
    var sel = $('#type');
    if (def && sel) Array.prototype.forEach.call(sel.options, function (o) { if (o.text === def) sel.value = o.value; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('#formErr');
      var name = $('#name').value.trim(), phone = $('#phone').value.trim();
      var type = $('#type').value, message = $('#message').value.trim();
      var digits = phone.replace(/\D/g, '');
      if (!name) { err.textContent = 'Please enter your name.'; $('#name').focus(); return; }
      if (digits.length < 9 || digits.length > 14) { err.textContent = 'Please enter a valid phone or WhatsApp number.'; $('#phone').focus(); return; }
      if (!message) { err.textContent = 'Please tell us a little about your project.'; $('#message').focus(); return; }
      err.textContent = '';
      var text = [
        'Hello Elevate Web Solutions,', '',
        "I'd like to discuss a website project.", '',
        'Name: ' + name,
        'Phone: ' + phone,
        'Project type: ' + type,
        'Page: ' + (form.getAttribute('data-source') || document.title), '',
        'Project details:', message
      ].join('\n');
      track('enquiry_submit', { type: type });
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }
})();
