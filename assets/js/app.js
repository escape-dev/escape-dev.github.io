const CONFIG = {
  BASE_URL: "./assets/js/data/",
  FILE_EXT: ".json",
};

const STATUS_TEXT = {
  200: "OK",
  422: "Unprocessable Entity",
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function syntaxHighlight(json) {
  if (typeof json !== "string") {
    json = JSON.stringify(json, undefined, 2);
  }

  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = "json-number";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "json-key" : "json-string";
      } else if (/true|false/.test(match)) {
        cls = "json-boolean";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return '<span class="' + cls + '">' + match + "</span>";
    }
  );
}

async function getContent(filename) {
  const response = await fetch(
    `${CONFIG.BASE_URL}${filename}${CONFIG.FILE_EXT}`
  );

  if (!response.ok) {
    throw new Error(`Request for "${filename}" failed (${response.status})`);
  }

  return response.json();
}

function initNavigation() {
  const header = document.querySelector("[data-header]");
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = Array.from(
    document.querySelectorAll('#site-nav a[href^="#"]')
  );

  if (!header || !nav || !toggle) return;

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  document.addEventListener("click", function (event) {
    if (!nav.classList.contains("is-open")) return;
    if (!event.target.closest(".site-header")) setMenu(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !nav.classList.contains("is-open")) return;
    setMenu(false);
    toggle.focus();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 860) setMenu(false);
  });

  const sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function updateActiveLink() {
    if (!sections.length) return;

    let current = "";
    const threshold = Math.max(140, window.innerHeight * 0.42);

    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= threshold) {
        current = section.id;
      }
    });

    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;

    if (atBottom) current = sections[sections.length - 1].id;

    navLinks.forEach(function (link) {
      const isActive = link.getAttribute("href") === `#${current}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(function () {
      updateHeader();
      updateActiveLink();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  updateHeader();
  updateActiveLink();
}

function initReveal() {
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    items.forEach(function (item) {
      item.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );

  items.forEach(function (item) {
    observer.observe(item);
  });
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  return new Promise(function (resolve, reject) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    try {
      document.execCommand("copy");
      resolve();
    } catch (error) {
      reject(error);
    } finally {
      textarea.remove();
    }
  });
}

function initCopyEmail() {
  const button = document.querySelector("[data-copy-email]");
  const status = document.querySelector("[data-copy-status]");
  if (!button) return;

  const label = button.querySelector("[data-copy-label]");
  const email = button.getAttribute("data-email");
  let resetTimer;

  button.addEventListener("click", async function () {
    if (!email) return;

    try {
      await copyText(email);
      button.classList.add("is-copied");
      if (label) label.textContent = "Copied";
      if (status) {
        status.textContent = `${email} copied to clipboard.`;
        status.classList.add("is-visible");
      }
    } catch (error) {
      if (status) {
        status.textContent = `Couldn't copy automatically. Email: ${email}`;
        status.classList.add("is-visible");
      }
    }

    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(function () {
      if (label) label.textContent = "Copy email";
      if (status) status.classList.remove("is-visible");
    }, 2600);
  });
}

function createEndpointHtml(content, contentJson) {
  const name = escapeHtml(content.name);
  const safeId = String(content.name).replace(/[^a-z0-9_-]/gi, "-");
  const method = escapeHtml(content.method);
  const url = escapeHtml(content.url);
  const description = escapeHtml(content.description);
  const status = Number(content.status);
  const statusText = STATUS_TEXT[status] || "Response";
  const statusClass =
    status >= 200 && status < 300
      ? "is-success"
      : status >= 400
      ? "is-error"
      : "is-warning";
  const keyCount =
    contentJson && typeof contentJson === "object"
      ? Object.keys(contentJson).length
      : 0;

  return `
    <div class="endpoint">
      <button class="endpoint-btn" type="button" id="endpoint-btn-${safeId}" aria-expanded="false" aria-controls="endpoint-${safeId}">
        <span class="method">${method}</span>
        <span class="endpoint-path">${url}</span>
        <span class="endpoint-desc">${description}</span>
        <svg class="icon endpoint-chevron" aria-hidden="true"><use href="#icon-chevron"></use></svg>
      </button>
      <div class="endpoint-panel" id="endpoint-${safeId}" role="region" aria-labelledby="endpoint-btn-${safeId}" aria-hidden="true" inert>
        <div class="endpoint-panel-inner">
          <div class="endpoint-panel-body">
            <div class="endpoint-status">
              <span class="status-code ${statusClass}">${status}</span>
              <span class="endpoint-status-text">${statusText}</span>
              <span class="endpoint-keys">${keyCount} top-level keys</span>
            </div>
            <pre class="json-viewer" tabindex="-1" aria-label="JSON response for ${name}">${syntaxHighlight(
              contentJson
            )}</pre>
          </div>
        </div>
      </div>
    </div>
  `;
}

function setEndpointOpen(endpoint, open) {
  const button = endpoint.querySelector(".endpoint-btn");
  const panel = endpoint.querySelector(".endpoint-panel");
  const viewer = endpoint.querySelector(".json-viewer");
  if (!button || !panel) return;

  endpoint.classList.toggle("is-open", open);
  button.setAttribute("aria-expanded", String(open));
  panel.setAttribute("aria-hidden", String(!open));
  if (viewer) viewer.tabIndex = open ? 0 : -1;

  if (open) {
    panel.removeAttribute("inert");
  } else {
    panel.setAttribute("inert", "");
  }
}

function bindEndpointToggles(root) {
  const endpoints = Array.from(root.querySelectorAll(".endpoint"));

  endpoints.forEach(function (endpoint) {
    const button = endpoint.querySelector(".endpoint-btn");
    if (!button) return;

    button.addEventListener("click", function () {
      const open = button.getAttribute("aria-expanded") !== "true";

      endpoints.forEach(function (other) {
        if (other !== endpoint) setEndpointOpen(other, false);
      });

      setEndpointOpen(endpoint, open);
    });
  });
}

async function renderApi() {
  const root = document.getElementById("api-content");
  if (!root) return;

  try {
    const listContents = await getContent("listContents");

    if (!listContents || !Array.isArray(listContents.data)) {
      throw new Error("Malformed endpoint index");
    }

    const contents = await Promise.all(
      listContents.data.map(async function (value) {
        const contentJson = await getContent(value.name);
        return { value, contentJson };
      })
    );

    root.innerHTML = contents
      .map(function (item) {
        return createEndpointHtml(item.value, item.contentJson);
      })
      .join("");

    bindEndpointToggles(root);
  } catch (error) {
    root.innerHTML = `
      <p class="api-error" role="alert">
        The live API view couldn't load. The rest of the resume is unaffected.
      </p>
    `;
    console.error("API explorer failed to load:", error);
  } finally {
    root.setAttribute("aria-busy", "false");
  }
}

function initFooter() {
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
}

initNavigation();
initReveal();
initCopyEmail();
initFooter();
renderApi();
