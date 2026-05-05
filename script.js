// Hero split-text reveal
const heroWords = document.querySelectorAll('.hero-word');
const heroFades = document.querySelectorAll('.hero-fade');

if (heroWords.length) {
  heroWords.forEach((word, i) => {
    setTimeout(() => word.classList.add('visible'), 300 + i * 120);
  });

  heroFades.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 300 + heroWords.length * 120 + 200 + i * 150);
  });
}

// Nav scroll effect
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// Mobile menu toggle
const toggle = document.getElementById('nav-toggle');
const links = document.querySelector('.nav-links');

if (toggle && links) {
  if (!links.id) {
    links.id = 'site-nav-links';
  }

  toggle.setAttribute('aria-controls', links.id);
  toggle.setAttribute('aria-expanded', 'false');
  links.setAttribute('aria-hidden', 'true');

  function closeNav() {
    toggle.classList.remove('active');
    links.classList.remove('open');
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    links.setAttribute('aria-hidden', 'true');
  }

  function openNav() {
    toggle.classList.add('active');
    links.classList.add('open');
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    links.setAttribute('aria-hidden', 'false');
  }

  function toggleNav() {
    if (links.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  }

  toggle.addEventListener('click', toggleNav);

  // Close mobile menu on link click
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('click', (event) => {
    if (!document.body.classList.contains('nav-open')) return;
    if (links.contains(event.target) || toggle.contains(event.target)) return;
    closeNav();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNav();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      closeNav();
    }
  });
}

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => observer.observe(el));

// Staggered card reveal
const staggerContainers = document.querySelectorAll('.stagger-cards');
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const cards = entry.target.querySelectorAll('.card');
      cards.forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), i * 120);
      });
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

staggerContainers.forEach(el => staggerObserver.observe(el));

// Coach card expand/collapse
document.querySelectorAll('.coach-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.coach-card');
    const expanded = card.classList.toggle('expanded');
    btn.setAttribute('aria-expanded', expanded);
    btn.querySelector('.coach-toggle-text').textContent = expanded ? 'Show Less' : 'Read More';
  });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 120;
  let current = '';

  sections.forEach(section => {
    if (scrollY >= section.offsetTop) {
      current = section.id;
    }
  });

  navAnchors.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
});

// Initialize EmailJS + contact form
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  if (typeof emailjs !== 'undefined') {
    emailjs.init('fSeuL3YtrR4mfy89Q');
  }

  // Auto-select session type from URL param (e.g. ?program=fulltime)
  const params = new URLSearchParams(window.location.search);
  const program = params.get('program');
  if (program) {
    const sessionSelect = contactForm.querySelector('#session');
    if (sessionSelect) {
      const programMap = {
        fulltime: 'Full-Time Program',
        parttime: 'Part-Time Program',
        mini: 'Mini Program',
        futsal: 'Futsal Program',
        birthday: 'Birthday Party',
        'birthday-silver': 'Birthday Party',
        'birthday-gold': 'Birthday Party',
      };

      const normalizedProgram = program.trim().toLowerCase();
      const selectedProgram = programMap[normalizedProgram] || program;
      const hasOption = Array.from(sessionSelect.options).some(option => option.value === selectedProgram);

      if (hasOption) {
        sessionSelect.value = selectedProgram;
      }
    }
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot check: if a bot filled this hidden field, silently bail
    const honey = contactForm.querySelector('#website');
    if (honey && honey.value) {
      contactForm.reset();
      return;
    }

    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.textContent;

    if (typeof emailjs === 'undefined') {
      btn.textContent = 'Email unavailable - try again';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 3000);
      return;
    }

    btn.textContent = 'Sending...';
    btn.disabled = true;

    const templateParams = {
      to_email: 'spherefootball2@gmail.com',
      from_name: contactForm.querySelector('#name').value,
      from_email: contactForm.querySelector('#email').value,
      session_type: contactForm.querySelector('#session').value,
      message: contactForm.querySelector('#message').value
    };

    try {
      await emailjs.send('service_sq13t1l', 'template_2915jba', templateParams);

      btn.textContent = 'Message Sent ✓';
      btn.style.background = 'var(--grey-800)';
      btn.style.color = 'var(--white)';
      contactForm.reset();

      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        btn.style.background = '';
        btn.style.color = '';
      }, 3000);
    } catch (error) {
      console.error('EmailJS error:', error);
      btn.textContent = 'Error - Try Again';
      btn.disabled = false;

      setTimeout(() => {
        btn.textContent = original;
      }, 3000);
    }
  });
}

// Hero carousel
const heroSlides = document.querySelectorAll('.hero-slide');
const progressBar = document.querySelector('.hero-progress-bar');

if (heroSlides.length && progressBar) {
  const SLIDE_DURATION = 6000;
  let currentSlide = 0;
  let carouselTimer = null;

  function goToSlide(index) {
    heroSlides[currentSlide].classList.remove('active');
    currentSlide = index;
    heroSlides[currentSlide].classList.add('active');
    resetProgress();
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }

  function resetProgress() {
    progressBar.classList.remove('animating');
    void progressBar.offsetWidth;
    progressBar.classList.add('animating');
    clearTimeout(carouselTimer);
    carouselTimer = setTimeout(nextSlide, SLIDE_DURATION);
  }

  resetProgress();

  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight) {
      const offset = window.scrollY * 0.4;
      const activeVideo = heroSlides[currentSlide].querySelector('.hero-slide-video');
      if (activeVideo) activeVideo.style.transform = `translateY(${offset}px) scale(1.1)`;
    }
  }, { passive: true });
}
