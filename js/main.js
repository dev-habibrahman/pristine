/* ============================================================
   PRISTINE HEADLIGHT HEROES — Main JavaScript
   Handles: sticky nav, mobile menu, scroll-reveal, 
            before/after sliders, lightbox, booking form
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* =========================================================
     1. STICKY HEADER — adds .scrolled class on scroll
     ========================================================= */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }


  /* =========================================================
     2. MOBILE NAV TOGGLE
     ========================================================= */
  const navToggle = document.querySelector('.nav-toggle');
  const navMobile = document.querySelector('.nav-mobile');

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function () {
      const isOpen = navMobile.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!navToggle.contains(e.target) && !navMobile.contains(e.target)) {
        navMobile.classList.remove('open');
        navToggle.classList.remove('open');
      }
    });

    // Close on nav link click
    navMobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMobile.classList.remove('open');
        navToggle.classList.remove('open');
      });
    });
  }


  /* =========================================================
     3. ACTIVE NAV LINK — highlight current page
     ========================================================= */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });


  /* =========================================================
     4. SCROLL REVEAL — CSS-class-based, no library
     ========================================================= */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }


  /* =========================================================
     5. BEFORE/AFTER SLIDER — drag handle to reveal
     ========================================================= */
  document.querySelectorAll('.ba-slider-container').forEach(function (container) {
    const beforeWrap = container.querySelector('.ba-before-wrap');
    const divider    = container.querySelector('.ba-divider');
    if (!beforeWrap || !divider) return;

    let dragging = false;

    function setPosition(x) {
      const rect   = container.getBoundingClientRect();
      let   pct    = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      beforeWrap.style.width = pct + '%';
      divider.style.left     = pct + '%';
    }

    // Mouse events
    divider.addEventListener('mousedown', function (e) {
      e.preventDefault();
      dragging = true;
    });
    document.addEventListener('mousemove', function (e) {
      if (dragging) setPosition(e.clientX);
    });
    document.addEventListener('mouseup', function () {
      dragging = false;
    });

    // Touch events
    divider.addEventListener('touchstart', function (e) {
      e.preventDefault();
      dragging = true;
    }, { passive: false });
    document.addEventListener('touchmove', function (e) {
      if (dragging && e.touches[0]) setPosition(e.touches[0].clientX);
    }, { passive: true });
    document.addEventListener('touchend', function () {
      dragging = false;
    });

    // Also allow clicking anywhere on container
    container.addEventListener('click', function (e) {
      setPosition(e.clientX);
    });

    // Default position: 50%
    setPosition(container.getBoundingClientRect().left + container.getBoundingClientRect().width * 0.5);
  });


  /* =========================================================
     6. LIGHTBOX — click gallery image to zoom
     ========================================================= */
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightbox && lightboxImg) {
    document.querySelectorAll('[data-lightbox]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        const src = trigger.getAttribute('data-lightbox');
        const alt = trigger.getAttribute('data-lightbox-alt') || '';
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }


  /* =========================================================
     7. BOOKING FORM — multi-step, validation, photo upload
     ========================================================= */
  const form          = document.getElementById('booking-form');
  const formSteps     = document.querySelectorAll('.form-step');
  const stepItems     = document.querySelectorAll('.step-item');
  const nextBtns      = document.querySelectorAll('[data-next]');
  const prevBtns      = document.querySelectorAll('[data-prev]');
  const formSuccess   = document.querySelector('.form-success');

  let currentStep = 0;

  function goToStep(n) {
    formSteps.forEach(function (s, i) {
      s.classList.toggle('active', i === n);
    });
    stepItems.forEach(function (item, i) {
      item.classList.toggle('active', i === n);
      item.classList.toggle('completed', i < n);
    });
    currentStep = n;
    window.scrollTo({ top: form ? form.getBoundingClientRect().top + window.scrollY - 100 : 0, behavior: 'smooth' });
  }

  // Validate a single step
  function validateStep(stepIndex) {
    const step = formSteps[stepIndex];
    if (!step) return true;
    let valid = true;

    step.querySelectorAll('[required]').forEach(function (field) {
      const group = field.closest('.form-group');
      const val   = field.value.trim();
      const isRadioGroup = field.type === 'radio';

      if (isRadioGroup) {
        const name    = field.name;
        const anyChecked = step.querySelector(`input[name="${name}"]:checked`);
        if (!anyChecked) {
          valid = false;
          if (group) group.classList.add('has-error');
        } else {
          if (group) group.classList.remove('has-error');
        }
        return;
      }

      if (!val) {
        valid = false;
        if (group) group.classList.add('has-error');
      } else {
        if (group) group.classList.remove('has-error');
      }

      // Email validation
      if (field.type === 'email' && val) {
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        if (!emailOk) {
          valid = false;
          if (group) group.classList.add('has-error');
        }
      }

      // Phone validation
      if (field.type === 'tel' && val) {
        const phoneOk = /^[\d\s\-\+\(\)]{7,}$/.test(val);
        if (!phoneOk) {
          valid = false;
          if (group) group.classList.add('has-error');
        }
      }
    });

    return valid;
  }

  nextBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (validateStep(currentStep)) {
        goToStep(currentStep + 1);
      }
    });
  });

  prevBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      goToStep(currentStep - 1);
    });
  });

  // Clear error on input
  if (form) {
    form.querySelectorAll('.form-control, input[type="radio"]').forEach(function (field) {
      field.addEventListener('input', function () {
        const group = field.closest('.form-group');
        if (group) group.classList.remove('has-error');
      });
      field.addEventListener('change', function () {
        const group = field.closest('.form-group');
        if (group) group.classList.remove('has-error');
      });
    });

    // ---- FORM SUBMIT ----
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateStep(currentStep)) return;

      /* ================================================================
         BACKEND CONNECTION PLACEHOLDER
         Replace the block below with your actual form submission logic.
         Options:
           A) Formspree: fetch('https://formspree.io/f/YOUR_ID', {...})
           B) Web3Forms: fetch('https://api.web3forms.com/submit', {...})
           C) PHP mailer: fetch('mailer.php', { method:'POST', body: new FormData(form) })
         The FormData object already contains all fields including files.
         ================================================================ */
      const formData = new FormData(form);
      console.log('Form ready to submit. Wire up backend here:', Object.fromEntries(formData.entries()));

      // Simulate success (remove when wiring real backend)
      if (form) form.style.display = 'none';
      if (formSuccess) formSuccess.classList.add('show');
    });
  }


  /* =========================================================
     8. PHOTO UPLOAD — drag-drop, preview, validation
     ========================================================= */
  const uploadZone  = document.getElementById('upload-zone');
  const fileInput   = document.getElementById('headlight-photos');
  const previewGrid = document.getElementById('preview-grid');
  const MAX_SIZE_MB = 10;

  let uploadedFiles = [];

  function renderPreviews() {
    if (!previewGrid) return;
    previewGrid.innerHTML = '';
    uploadedFiles.forEach(function (file, idx) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const thumb = document.createElement('div');
        thumb.className = 'preview-thumb';
        thumb.innerHTML = `
          <img src="${e.target.result}" alt="Uploaded headlight photo ${idx + 1}">
          <button type="button" class="preview-thumb-remove" data-idx="${idx}" aria-label="Remove photo">&times;</button>
        `;
        thumb.querySelector('.preview-thumb-remove').addEventListener('click', function () {
          uploadedFiles.splice(idx, 1);
          renderPreviews();
        });
        previewGrid.appendChild(thumb);
      };
      reader.readAsDataURL(file);
    });
  }

  function handleFiles(files) {
    Array.from(files).forEach(function (file) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`File "${file.name}" exceeds ${MAX_SIZE_MB}MB and was skipped.`);
        return;
      }
      const allowed = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
      if (!allowed.includes(file.type) && !file.name.match(/\.(heic|heif)$/i)) {
        alert(`File "${file.name}" is not a supported format (JPG, PNG, HEIC).`);
        return;
      }
      uploadedFiles.push(file);
    });
    renderPreviews();
  }

  if (uploadZone && fileInput) {
    uploadZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', function () {
      uploadZone.classList.remove('dragover');
    });
    uploadZone.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', function () {
      handleFiles(fileInput.files);
      fileInput.value = '';
    });
  }


  /* =========================================================
     9. DATE PICKER — enforce future dates only
     ========================================================= */
  const datePicker = document.getElementById('preferred-date');
  if (datePicker) {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    datePicker.min = today.toISOString().split('T')[0];
  }

}); // end DOMContentLoaded
