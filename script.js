document.querySelectorAll('a[href="#pricing"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const pricingSection = document.querySelector("#pricing");
    if (!pricingSection) return;
    event.preventDefault();
    pricingSection.scrollIntoView({ behavior: "smooth" });
    history.pushState(null, "", "#pricing");
  });
});

document.querySelectorAll('[data-bs-ride="carousel"]').forEach((carousel) => {
  const instance = bootstrap.Carousel.getOrCreateInstance(carousel, {
    interval: 4000,
    pause: false,
    ride: "carousel",
    touch: true,
    wrap: true,
  });
  instance.cycle();
});

document.querySelectorAll("[data-plan]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#selectedPlan").value = button.dataset.plan;
  });
});

document.querySelectorAll(".billing-option").forEach((button) => {
  button.addEventListener("click", () => {
    const period = button.dataset.billing;

    document.querySelectorAll(".billing-option").forEach((option) => {
      const selected = option === button;
      option.classList.toggle("btn-primary", selected);
      option.classList.toggle("btn-light", !selected);
      option.setAttribute("aria-pressed", String(selected));
    });

    document.querySelectorAll("[data-monthly][data-yearly]").forEach((price) => {
      price.textContent = price.dataset[period];
    });

    document.querySelectorAll(".billing-note").forEach((note) => {
      note.textContent = period === "yearly"
        ? "Billed yearly. Save 20%."
        : "Billed monthly. Cancel anytime.";
    });

    const disclosure = document.querySelector("#pricingDisclosure");
    if (disclosure) {
      disclosure.textContent = period === "yearly"
        ? "Monthly equivalent shown; yearly payment is charged upfront. Taxes may apply."
        : "Prices shown above are monthly. Taxes may apply based on billing location.";
    }
  });
});

document.querySelectorAll("#navbarNav a").forEach((link) => {
  link.addEventListener("click", () => {
    const menu = document.querySelector("#navbarNav");
    if (menu?.classList.contains("show")) {
      bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }
  });
});

const accountForm = document.querySelector("#accountForm");
accountForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = document.querySelector("#accountStatus");
  const password = document.querySelector("#accountPassword");
  const confirmation = document.querySelector("#confirmPassword");

  if (password.value !== confirmation.value) {
    confirmation.setCustomValidity("Passwords do not match.");
    confirmation.reportValidity();
    status.className = "form-status mb-0 text-danger";
    status.textContent = "Please make sure both passwords match.";
    return;
  }

  confirmation.setCustomValidity("");
  status.className = "form-status mb-0 text-success";
  status.textContent =
    "Looks good! Connect this form to your hosting backend to create real accounts.";
});

document.querySelector("#confirmPassword")?.addEventListener("input", (event) => {
  event.target.setCustomValidity("");
});

document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const field = document.getElementById(button.dataset.passwordTarget);
    if (!field) return;
    const showing = field.type === "text";
    field.type = showing ? "password" : "text";
    button.textContent = showing ? "Show" : "Hide";
    button.setAttribute("aria-label", showing ? "Show password" : "Hide password");
  });
});

document.querySelector("#accountPassword")?.addEventListener("input", (event) => {
  const value = event.target.value;
  const checks = [
    value.length >= 8,
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["not entered", "weak", "fair", "good", "strong", "excellent"];
  const colors = ["#dc3545", "#dc3545", "#fd7e14", "#ffc107", "#198754", "#0d6efd"];
  const meter = document.querySelector("#passwordMeterBar");
  const status = document.querySelector("#passwordStrength");

  meter.style.width = value ? `${score * 20}%` : "0";
  meter.style.backgroundColor = colors[score];
  status.textContent = `Password strength: ${value ? labels[score] : labels[0]}`;
});

document.querySelector("#loginForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = document.querySelector("#loginStatus");
  status.className = "form-status px-3 mb-0 text-primary";
  status.textContent =
    "Demo mode: connect this form to your authentication service to log in.";
});

document.querySelector("#contactForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = document.querySelector("#contactStatus");
  status.className = "form-status mb-0 text-success";
  status.textContent =
    "Thanks! This demo is ready to connect to your email or support service.";
  event.currentTarget.reset();
});

const backToTop = document.querySelector("#backToTop");
const updateBackToTop = () => {
  backToTop?.classList.toggle("is-visible", window.scrollY > 600);
};

window.addEventListener("scroll", updateBackToTop, { passive: true });
updateBackToTop();
backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const navigationLinks = [...document.querySelectorAll('#navbarNav a[href^="#"]')]
  .filter((link) => link.getAttribute("href").length > 1);
const observedSections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;

      navigationLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${current.target.id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-20% 0px -65%", threshold: [0, 0.25, 0.5] },
  );
  observedSections.forEach((section) => sectionObserver.observe(section));
}
