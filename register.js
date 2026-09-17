const REGISTRATION_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxff9xbGbd3ujr3zbp-D4WTBSNECkLVzvcoA7S3qmhuM5Yk_hNj5jf9Ip8JmWxk_z-K/exec";

const registrationForm = document.getElementById("registration-form");

if (registrationForm) {
  const statusBox = document.getElementById("registration-status");
  const submitButton = document.getElementById("registration-submit");
  const dobInput = document.getElementById("child-dob");
  const ageGroupInput = document.getElementById("age-group");
  const ageGroupNote = document.getElementById("age-group-note");
  const mailingGroupInput = document.getElementById("mailing-group");
  const programInterestGroup = document.getElementById("program-interest-group");
  const honeypotInput = document.getElementById("website-url");
  const confirmationCard = document.getElementById("registration-confirmation");
  const formCard = document.getElementById("registration-form-card");

  const programMap = {
    fulltime: "Full-Time Program",
    parttime: "Part-Time Program",
    futsal: "Futsal Program",
    mini: "Mini Program",
  };

  const ageGroups = [
    { min: 5, max: 6, label: "U5-6" },
    { min: 7, max: 7, label: "U7" },
    { min: 8, max: 8, label: "U8" },
    { min: 9, max: 9, label: "U9" },
    { min: 10, max: 10, label: "U10" },
    { min: 11, max: 11, label: "U11" },
    { min: 12, max: 12, label: "U12" },
    { min: 13, max: 13, label: "U13" },
    { min: 14, max: 14, label: "U14" },
    { min: 15, max: 15, label: "U15" },
  ];

  const params = new URLSearchParams(window.location.search);
  const requestedProgram = params.get("program");
  const normalizedProgram = requestedProgram
    ? requestedProgram.trim().toLowerCase()
    : "";
  const programName = programMap[normalizedProgram] || requestedProgram || "";

  // Pre-check program checkbox if ?program= is in the URL
  if (programName) {
    const checkbox = programInterestGroup.querySelector(
      `input[value="${programName}"]`,
    );
    if (checkbox) checkbox.checked = true;
  }

  // Multi-select dropdown behaviour
  const programTrigger = document.getElementById("program-trigger");
  const programDropdown = document.getElementById("program-dropdown");
  const programValueLabel = programTrigger.querySelector(".multi-select-value");

  function updateProgramLabel() {
    const checked = [
      ...programInterestGroup.querySelectorAll("input:checked"),
    ];
    if (checked.length === 0) {
      programValueLabel.textContent = "Select programs";
      programValueLabel.classList.add("placeholder");
    } else {
      programValueLabel.textContent = checked
        .map((cb) => cb.value.replace(" Program", ""))
        .join(", ");
      programValueLabel.classList.remove("placeholder");
    }
  }

  programTrigger.addEventListener("click", () => {
    const isOpen = programDropdown.classList.contains("open");
    programDropdown.classList.toggle("open");
    programTrigger.setAttribute("aria-expanded", String(!isOpen));
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!programInterestGroup.contains(e.target)) {
      programDropdown.classList.remove("open");
      programTrigger.setAttribute("aria-expanded", "false");
    }
  });

  // Update label when checkboxes change
  programInterestGroup.addEventListener("change", updateProgramLabel);

  // Set initial label (handles URL pre-selection)
  updateProgramLabel();

  function setStatus(type, message) {
    statusBox.className = `register-status ${type} visible`;
    statusBox.textContent = message;
  }

  function clearStatus() {
    statusBox.className = "register-status";
    statusBox.textContent = "";
  }

  function parseChildDob(dateString) {
    const value = String(dateString || "").trim();
    if (!value) return null;

    let day;
    let month;
    let year;

    const auMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(value);
    const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);

    if (auMatch) {
      day = parseInt(auMatch[1], 10);
      month = parseInt(auMatch[2], 10);
      year = parseInt(auMatch[3], 10);
    } else if (isoMatch) {
      year = parseInt(isoMatch[1], 10);
      month = parseInt(isoMatch[2], 10);
      day = parseInt(isoMatch[3], 10);
    } else {
      return null;
    }

    const parsed = new Date(year, month - 1, day);
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }

    return { day, month, year };
  }

  function formatDobForBackend(dateString) {
    const parsed = parseChildDob(dateString);
    if (!parsed) return "";

    return [
      String(parsed.day).padStart(2, "0"),
      String(parsed.month).padStart(2, "0"),
      String(parsed.year),
    ].join("-");
  }

  function getSeasonAgeFromDate(dateString) {
    const parsed = parseChildDob(dateString);
    if (!parsed) return null;

    return new Date().getFullYear() - parsed.year;
  }

  function getAgeGroup(age) {
    if (typeof age !== "number") return null;
    return (
      ageGroups.find((group) => age >= group.min && age <= group.max) || null
    );
  }

  function syncAgeGroup() {
    const age = getSeasonAgeFromDate(dobInput.value);
    const group = getAgeGroup(age);

    if (!dobInput.value) {
      dobInput.setCustomValidity("");
      ageGroupInput.value = "";
      mailingGroupInput.value = "";
      ageGroupNote.textContent =
        "Enter a date of birth to calculate the age group.";
      return true;
    }

    if (!parseChildDob(dobInput.value)) {
      dobInput.setCustomValidity("Enter date of birth as DD/MM/YYYY, for example 20/06/2011.");
      ageGroupInput.value = "";
      mailingGroupInput.value = "";
      ageGroupNote.textContent =
        "Use DD/MM/YYYY, for example 20/06/2011.";
      return false;
    }

    dobInput.setCustomValidity("");

    if (!group) {
      ageGroupInput.value = "";
      mailingGroupInput.value = "";
      ageGroupNote.textContent =
        "This date of birth is outside the current U5-6 to U15 intake. Please contact us and we\u2019ll sort it manually.";
      return false;
    }

    ageGroupInput.value = group.label;
    mailingGroupInput.value = `${group.label} Parents`;
    ageGroupNote.textContent = `${group.label} calculated from birth year for the current season.`;
    return true;
  }

  // Auto-insert slashes as the user types so mobile numeric keyboards work fine
  dobInput.addEventListener("input", function (e) {
    const raw = dobInput.value.replace(/[^0-9]/g, "");
    let formatted = "";

    for (let i = 0; i < raw.length && i < 8; i++) {
      if (i === 2 || i === 4) formatted += "/";
      formatted += raw[i];
    }

    // Only rewrite if it actually changed (avoids cursor jump on desktop with /)
    if (dobInput.value !== formatted) {
      dobInput.value = formatted;
    }

    syncAgeGroup();
  });

  dobInput.addEventListener("change", syncAgeGroup);

  registrationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();

    // Honeypot check: if this hidden field has a value, it's a bot
    if (honeypotInput && honeypotInput.value) {
      formCard.style.display = "none";
      confirmationCard.classList.add("visible");
      return;
    }

    const ageGroupValid = syncAgeGroup();

    // Validate at least one program is selected
    const selectedPrograms = [
      ...programInterestGroup.querySelectorAll("input:checked"),
    ].map((cb) => cb.value);

    if (selectedPrograms.length === 0) {
      setStatus("error", "Please select at least one program.");
      return;
    }

    if (!registrationForm.reportValidity()) {
      return;
    }

    if (!ageGroupValid) {
      setStatus(
        "error",
        "This player sits outside the current online age groups. Please email us and we\u2019ll help manually.",
      );
      return;
    }

    if (
      !REGISTRATION_ENDPOINT ||
      REGISTRATION_ENDPOINT.includes("REPLACE_WITH")
    ) {
      setStatus(
        "error",
        "The registration endpoint is not connected yet. Contact the academy directly.",
      );
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    const formData = new FormData(registrationForm);
    // Combine checked programs into a single comma-separated value
    formData.delete("programInterest");
    formData.set("programInterest", selectedPrograms.join(", "));
    // Prepend the locked +61 prefix to the phone number
    const rawPhone = (formData.get("parentPhone") || "").trim();
    if (rawPhone) {
      formData.set("parentPhone", `+61 ${rawPhone}`);
    }
    // Normalise the code to uppercase before sending
    formData.set(
      "registrationCode",
      formData.get("registrationCode").trim().toUpperCase(),
    );
    // Store the Australian format the backend expects, no matter how the browser entered it.
    const formattedDob = formatDobForBackend(formData.get("childDateOfBirth"));
    if (formattedDob) {
      formData.set("childDateOfBirth", formattedDob);
    }
    // Don't send the honeypot value to the backend
    formData.delete("websiteUrl");

    const payload = new URLSearchParams(formData);

    try {
      const response = await fetch(REGISTRATION_ENDPOINT, {
        method: "POST",
        redirect: "follow",
        body: payload,
      });

      const result = await response.json();

      if (result.success) {
        formCard.style.display = "none";
        confirmationCard.classList.add("visible");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setStatus(
          "error",
          result.message ||
            "Something went wrong. Please try again or email us directly.",
        );
        submitButton.disabled = false;
        submitButton.textContent = "Submit Registration";
      }
    } catch (error) {
      console.error("Registration submission failed:", error);
      setStatus(
        "error",
        "Something went wrong while sending the registration. Please try again or email us directly.",
      );
      submitButton.disabled = false;
      submitButton.textContent = "Submit Registration";
    }
  });
}
