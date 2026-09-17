// Hero split-text reveal
const heroWords = document.querySelectorAll(".hero-word");
const heroFades = document.querySelectorAll(".hero-fade");

if (heroWords.length) {
  heroWords.forEach((word, i) => {
    setTimeout(() => word.classList.add("visible"), 300 + i * 120);
  });

  heroFades.forEach((el, i) => {
    setTimeout(
      () => el.classList.add("visible"),
      300 + heroWords.length * 120 + 200 + i * 150,
    );
  });
}

// Nav scroll effect
const nav = document.getElementById("nav");
if (nav) {
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  });
}

// Mobile menu toggle
const toggle = document.getElementById("nav-toggle");
const links = document.querySelector(".nav-links");

if (toggle && links) {
  if (!links.id) {
    links.id = "site-nav-links";
  }

  toggle.setAttribute("aria-controls", links.id);
  toggle.setAttribute("aria-expanded", "false");
  links.setAttribute("aria-hidden", "true");

  function closeNav() {
    toggle.classList.remove("active");
    links.classList.remove("open");
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    links.setAttribute("aria-hidden", "true");
  }

  function openNav() {
    toggle.classList.add("active");
    links.classList.add("open");
    document.body.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    links.setAttribute("aria-hidden", "false");
  }

  function toggleNav() {
    if (links.classList.contains("open")) {
      closeNav();
    } else {
      openNav();
    }
  }

  toggle.addEventListener("click", toggleNav);

  // Close mobile menu on link click
  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("nav-open")) return;
    if (links.contains(event.target) || toggle.contains(event.target)) return;
    closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeNav();
    }
  });
}

// Scroll reveal
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 },
);

reveals.forEach((el) => observer.observe(el));

// Staggered card reveal
const staggerContainers = document.querySelectorAll(".stagger-cards");
const staggerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll(".card");
        cards.forEach((card, i) => {
          setTimeout(() => card.classList.add("visible"), i * 120);
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

staggerContainers.forEach((el) => staggerObserver.observe(el));

// Coach card expand/collapse
document.querySelectorAll(".coach-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".coach-card");
    const expanded = card.classList.toggle("expanded");
    const collapsedLabel = btn.dataset.collapsedLabel || "Read More";
    const expandedLabel = btn.dataset.expandedLabel || "Show Less";
    btn.setAttribute("aria-expanded", expanded);
    btn.querySelector(".coach-toggle-text").textContent = expanded
      ? expandedLabel
      : collapsedLabel;
  });
});

// Active nav link on scroll
const sections = document.querySelectorAll("section[id]");
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY + 120;
  let current = "";

  sections.forEach((section) => {
    if (scrollY >= section.offsetTop) {
      current = section.id;
    }
  });

  navAnchors.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});

// Contact form
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  const CONTACT_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxlCzPb4RmG5gtztQBbnixI80wvDpA2WBN-zELFApM4_l7tTp7e8cDNeSxF1lpBi9T6/exec";

  const requiredContactFields = [
    { selector: "#name", label: "Name" },
    { selector: "#email", label: "Email" },
    { selector: "#session", label: "Session type" },
    { selector: "#message", label: "Message" },
  ];

  const validateContactForm = () => {
    let firstInvalidField = null;

    requiredContactFields.forEach(({ selector, label }) => {
      const field = contactForm.querySelector(selector);
      if (!field) return;

      field.setCustomValidity("");

      if (!field.value.trim()) {
        field.setCustomValidity(`${label} is required.`);
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      }
    });

    if (firstInvalidField) {
      contactForm.reportValidity();
      firstInvalidField.focus();
      return false;
    }

    return contactForm.reportValidity();
  };

  requiredContactFields.forEach(({ selector }) => {
    const field = contactForm.querySelector(selector);
    if (!field) return;

    field.addEventListener("input", () => field.setCustomValidity(""));
    field.addEventListener("change", () => field.setCustomValidity(""));
  });

  // Auto-select session type from URL param (e.g. ?program=fulltime)
  const params = new URLSearchParams(window.location.search);
  const program = params.get("program");
  if (program) {
    const sessionSelect = contactForm.querySelector("#session");
    if (sessionSelect) {
      const programMap = {
        fulltime: "Full-Time Program",
        parttime: "Part-Time Program",
        mini: "Mini Program",
        futsal: "Futsal Program",
        birthday: "Birthday Party",
        "birthday-silver": "Birthday Party",
        "birthday-gold": "Birthday Party",
      };

      const normalizedProgram = program.trim().toLowerCase();
      const selectedProgram = programMap[normalizedProgram] || program;
      const hasOption = Array.from(sessionSelect.options).some(
        (option) => option.value === selectedProgram,
      );

      if (hasOption) {
        sessionSelect.value = selectedProgram;
      }
    }
  }

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateContactForm()) {
      return;
    }

    // Honeypot check: if a bot filled this hidden field, silently bail
    const honey = contactForm.querySelector("#website");
    if (honey && honey.value) {
      contactForm.reset();
      return;
    }

    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.textContent;

    btn.textContent = "Sending...";
    btn.disabled = true;

    const payload = {
      type: "contact",
      name: contactForm.querySelector("#name").value.trim(),
      email: contactForm.querySelector("#email").value.trim(),
      session_type: contactForm.querySelector("#session").value.trim(),
      message: contactForm.querySelector("#message").value.trim(),
    };

    try {
      const res = await fetch(CONTACT_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.status !== "ok")
        throw new Error(result.message || "Send failed");

      btn.textContent = "Message Sent ✓";
      btn.style.background = "var(--grey-800)";
      btn.style.color = "var(--white)";
      contactForm.reset();

      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        btn.style.background = "";
        btn.style.color = "";
      }, 3000);
    } catch (error) {
      console.error("Contact form error:", error);
      btn.textContent = "Error - Try Again";
      btn.disabled = false;

      setTimeout(() => {
        btn.textContent = original;
      }, 3000);
    }
  });
}

// Birthday booking form
const birthdayBookingForm = document.getElementById("birthday-booking-form");
if (birthdayBookingForm) {
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbw94GWvDepMDZ_xKAIMwTSbEbdfe0f8aoyT7fi4vcS4FXoqinK_Kc0uKaafSYS0K8-p/exec";
  const bookingSection = document.getElementById("birthday-booking");
  const packageSelect = document.getElementById("birthday-package");
  const statusBox = document.getElementById("birthday-booking-status");
  const submitButton = document.getElementById("birthday-submit");
  const submitLabel = submitButton?.querySelector(".btn-label");
  const honeypot = document.getElementById("birthday-website");
  const partyDate = document.getElementById("birthday-party-date");
  let isSubmitting = false;

  const successMessage =
    "Thank you. Your Sphere Birthday Party enquiry has been received. Our team will contact you shortly to confirm availability.";
  const errorMessage =
    "Something went wrong. Please try again or contact Sphere directly.";

  const fieldRules = [
    { name: "parentName", label: "Parent full name" },
    { name: "phone", label: "Mobile number", validate: validatePhone },
    { name: "email", label: "Email address", validate: validateEmail },
    { name: "childName", label: "Child name" },
    { name: "childAge", label: "Child age" },
    {
      name: "partyDate",
      label: "Preferred party date",
      validate: validatePartyDate,
    },
    { name: "partyTime", label: "Preferred party time" },
    { name: "guestCount", label: "Number of children" },
    { name: "package", label: "Package selection" },
    {
      name: "termsAccepted",
      label: "Birthday party terms",
      validate: validateTerms,
    },
  ];

  if (partyDate) {
    partyDate.min = new Date().toISOString().slice(0, 10);
  }

  function openBirthdayBooking(packageName = "") {
    if (bookingSection?.hidden) {
      bookingSection.hidden = false;
      bookingSection
        .querySelectorAll(".reveal")
        .forEach((el) => el.classList.add("visible"));
    }

    if (packageName && packageSelect) {
      packageSelect.value = packageName;
      clearFieldError(packageSelect);
    }

    bookingSection?.scrollIntoView({ behavior: "smooth", block: "start" });

    const focusTarget = packageName
      ? document.getElementById("birthday-parent-name")
      : packageSelect;

    window.setTimeout(() => focusTarget?.focus({ preventScroll: true }), 450);
  }

  document.querySelectorAll("[data-birthday-package]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openBirthdayBooking(link.dataset.birthdayPackage || "");
    });
  });

  document.querySelectorAll("[data-birthday-open]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openBirthdayBooking();
    });
  });

  birthdayBookingForm
    .querySelectorAll("input, select, textarea")
    .forEach((field) => {
      const error = getFieldError(field);
      if (error) {
        field.setAttribute("aria-describedby", error.id);
      }

      field.addEventListener("input", () => clearFieldError(field));
      field.addEventListener("change", () => clearFieldError(field));
    });

  birthdayBookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();

    if (isSubmitting) return;

    if (honeypot && honeypot.value) {
      birthdayBookingForm.reset();
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!SCRIPT_URL || SCRIPT_URL === "PASTE_APPS_SCRIPT_URL_HERE") {
      setStatus("error", errorMessage);
      return;
    }

    isSubmitting = true;
    setLoading(true);

    const data = new FormData(birthdayBookingForm);
    const payload = {
      parentName: cleanFormValue(data.get("parentName")),
      phone: cleanFormValue(data.get("phone")),
      email: cleanFormValue(data.get("email")).toLowerCase(),
      childName: cleanFormValue(data.get("childName")),
      childAge: cleanFormValue(data.get("childAge")),
      partyDate: cleanFormValue(data.get("partyDate")),
      partyTime: cleanFormValue(data.get("partyTime")),
      guestCount: cleanFormValue(data.get("guestCount")),
      package: cleanFormValue(data.get("package")),
      specialRequests: cleanFormValue(data.get("specialRequests")),
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Birthday booking failed.");
      }

      birthdayBookingForm.reset();
      if (partyDate) partyDate.min = new Date().toISOString().slice(0, 10);
      setStatus("success", successMessage);
      setLoading(false);
      isSubmitting = false;
      submitLabel.textContent = "Submit Birthday Enquiry";
      statusBox?.focus?.();
    } catch (error) {
      console.error("Birthday booking submission failed:", error);
      setStatus("error", errorMessage);
      setLoading(false);
      isSubmitting = false;
    }
  });

  function validateForm() {
    let firstInvalid = null;

    fieldRules.forEach((rule) => {
      const field = birthdayBookingForm.elements[rule.name];
      if (!field) return;

      const message = getValidationMessage(field, rule);
      if (message) {
        setFieldError(field, message);
        if (!firstInvalid) firstInvalid = field;
      } else {
        clearFieldError(field);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }

    return true;
  }

  function getValidationMessage(field, rule) {
    if (field.type === "checkbox") {
      return rule.validate ? rule.validate(field, rule.label) : "";
    }

    const value = cleanFormValue(field.value);
    if (!value) return `${rule.label} is required.`;

    return rule.validate ? rule.validate(field, rule.label) : "";
  }

  function validateEmail(field) {
    const value = cleanFormValue(field.value);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? ""
      : "Enter a valid email address.";
  }

  function validatePhone(field) {
    const digits = cleanFormValue(field.value).replace(/\D/g, "");
    return digits.length >= 8 ? "" : "Enter a valid mobile number.";
  }

  function validatePartyDate(field) {
    const value = cleanFormValue(field.value);
    if (!value) return "Preferred party date is required.";

    const selected = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selected >= today ? "" : "Choose today or a future date.";
  }

  function validateTerms(field) {
    return field.checked ? "" : "Please accept the birthday party terms.";
  }

  function setFieldError(field, message) {
    const group = field.closest(".form-group");
    const error = getFieldError(field);

    group?.classList.add("has-error");
    field.setAttribute("aria-invalid", "true");
    if (error) error.textContent = message;
  }

  function clearFieldError(field) {
    const group = field.closest(".form-group");
    const error = getFieldError(field);

    group?.classList.remove("has-error");
    field.removeAttribute("aria-invalid");
    if (error) error.textContent = "";
  }

  function getFieldError(field) {
    return document.getElementById(`${field.id}-error`);
  }

  function setStatus(type, message) {
    if (!statusBox) return;
    statusBox.className = `register-status ${type} visible`;
    statusBox.textContent = message;
    statusBox.setAttribute("tabindex", "-1");
  }

  function clearStatus() {
    if (!statusBox) return;
    statusBox.className = "register-status";
    statusBox.textContent = "";
    statusBox.removeAttribute("tabindex");
  }

  function setLoading(isLoading) {
    if (!submitButton || !submitLabel) return;
    submitButton.disabled = isLoading;
    submitButton.classList.toggle("is-loading", isLoading);
    submitLabel.textContent = isLoading
      ? "Submitting..."
      : "Submit Birthday Enquiry";
  }

  function cleanFormValue(value) {
    return String(value || "").trim();
  }
}

// Hero carousel
const heroSlides = document.querySelectorAll(".hero-slide");
const progressBar = document.querySelector(".hero-progress-bar");

if (heroSlides.length && progressBar) {
  const SLIDE_DURATION = 6000;
  let currentSlide = 0;
  let carouselTimer = null;

  function goToSlide(index) {
    heroSlides[currentSlide].classList.remove("active");
    currentSlide = index;
    heroSlides[currentSlide].classList.add("active");
    resetProgress();
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }

  function resetProgress() {
    progressBar.classList.remove("animating");
    void progressBar.offsetWidth;
    progressBar.classList.add("animating");
    clearTimeout(carouselTimer);
    carouselTimer = setTimeout(nextSlide, SLIDE_DURATION);
  }

  resetProgress();

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY < window.innerHeight) {
        const offset = window.scrollY * 0.4;
        const activeVideo =
          heroSlides[currentSlide].querySelector(".hero-slide-video");
        if (activeVideo)
          activeVideo.style.transform = `translateY(${offset}px) scale(1.1)`;
      }
    },
    { passive: true },
  );
}
