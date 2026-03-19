// ============================================================
//  contact-page.js — Logique de la page contact
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  // Initialiser les icônes
  UI.initIcons();

  // Hamburger menu
  const hamburger = document.getElementById("hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", () => UI.toggleMobileMenu());
  }

  // ── Formspree form submission ──────────────────────────────
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      btn.textContent = "Envoi en cours…";
      btn.disabled = true;

      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          form.style.display = "none";
          const successMsg = document.getElementById("form-success");
          if (successMsg) successMsg.style.display = "block";
        } else {
          btn.textContent = "Erreur — Réessayez";
          btn.disabled = false;
        }
      } catch (err) {
        console.error("Erreur d'envoi:", err);
        btn.textContent = "Erreur réseau — Réessayez";
        btn.disabled = false;
      }
    });
  }
});
