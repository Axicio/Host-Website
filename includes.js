async function loadSections() {
  const placeholders = [...document.querySelectorAll("[data-include]")];

  await Promise.all(
    placeholders.map(async (placeholder) => {
      const source = placeholder.dataset.include;
      const response = await fetch(source, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Could not load ${source} (${response.status})`);
      }

      placeholder.outerHTML = await response.text();
    }),
  );

  const appScript = document.createElement("script");
  appScript.src = "./script.js";
  document.body.appendChild(appScript);
}

loadSections().catch((error) => {
  console.error(error);
  const message = document.createElement("div");
  message.className = "container alert alert-danger my-4";
  message.setAttribute("role", "alert");
  message.textContent =
    "Some page sections could not load. Please refresh the page or restart the local server.";
  document.body.prepend(message);
});
