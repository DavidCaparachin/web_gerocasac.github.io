const mobilityGrid = document.getElementById("mobility-grid");
const page = document.body.getAttribute("data-page");

const pageLinks = {
  inicio: "./index.html",
  productos: "./productos.html",
  "sobre-nosotros": "./sobre-nosotros.html",
  contactos: "./contactos.html",
};

const productTypeAliases = {
  auto: "auto",
  camioneta: "camioneta",
  van: "camioneta",
  suv: "suv",
  moto: "moto",
  camion: "camion",
};

const getProductKeyFromType = (type) => {
  if (!type) return "";
  const normalized = type.trim().toLowerCase();
  return productTypeAliases[normalized] || normalized;
};

const clearFocusedProducts = () => {
  document
    .querySelectorAll(".category-card.is-focused")
    .forEach((card) => card.classList.remove("is-focused"));
};

const setActiveMobilityButton = (typeOrProduct) => {
  if (!mobilityGrid) return;

  const requested = (typeOrProduct || "").trim().toLowerCase();
  const buttons = Array.from(mobilityGrid.querySelectorAll(".mobility-item"));

  let targetButton = buttons.find((button) => button.getAttribute("data-type") === requested);

  if (!targetButton) {
    const productKey = getProductKeyFromType(requested);
    targetButton = buttons.find(
      (button) => getProductKeyFromType(button.getAttribute("data-type")) === productKey
    );
  }

  if (!targetButton) return;

  buttons.forEach((button) => button.classList.remove("active"));
  targetButton.classList.add("active");
};

const focusProductByType = (
  type,
  { scroll = false, updateUrl = false } = {}
) => {
  if (page !== "productos") return false;

  const productKey = getProductKeyFromType(type);
  const targetCard = document.querySelector(`.category-card[data-product="${productKey}"]`);

  if (!targetCard) return false;

  clearFocusedProducts();
  targetCard.classList.add("is-focused");

  if (updateUrl) {
    const params = new URLSearchParams(window.location.search);
    params.set("filtro", productKey);
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", nextUrl);
  }

  if (scroll) {
    window.requestAnimationFrame(() => {
      targetCard.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return true;
};

const getQuoteMessageFromCard = (card) => {
  const name = card.querySelector("h3")?.textContent?.trim() || "Producto";
  const title = card.querySelector(".label")?.textContent?.trim() || "Cotización";
  const description =
    card.querySelector(".feature-lead")?.textContent?.trim() ||
    card.querySelector("p")?.textContent?.trim() ||
    "Solicito más información.";

  return [
    "Hola GEROCASAC, quiero cotizar esta opción:",
    `Nombre: ${name}`,
    `Título: ${title}`,
    `Descripción: ${description}`,
  ].join("\n");
};

const setupProductQuoteButtons = () => {
  if (page !== "productos") return;

  document.querySelectorAll(".category-card .btn.btn-primary").forEach((button) => {
    const card = button.closest(".category-card");
    if (!card) return;

    const message = getQuoteMessageFromCard(card);
    const whatsappUrl = `https://wa.me/51920453610?text=${encodeURIComponent(message)}`;

    button.setAttribute("href", whatsappUrl);
    button.setAttribute("target", "_blank");
    button.setAttribute("rel", "noopener noreferrer");
  });
};

const setupSocialPointerEffect = () => {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll(".social-link").forEach((link) => {
    link.addEventListener("mousemove", (event) => {
      const rect = link.getBoundingClientRect();
      link.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      link.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });

    link.addEventListener("mouseleave", () => {
      link.style.removeProperty("--mx");
      link.style.removeProperty("--my");
    });
  });
};

const currentHref = pageLinks[page];

if (currentHref) {
  document.querySelectorAll(".main-nav a:not(.nav-mobile-cta)").forEach((link) => {
    const normalized = link.getAttribute("href");
    if (normalized === currentHref) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

document.querySelectorAll(".topbar").forEach((topbar) => {
  const menuToggle = topbar.querySelector(".menu-toggle");
  const mainNav = topbar.querySelector(".main-nav");

  if (!menuToggle || !mainNav) return;

  const closeMenu = () => {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    document.body.classList.remove("menu-open");
  };

  const openMenu = () => {
    mainNav.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Cerrar menú");
    document.body.classList.add("menu-open");
  };

  menuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    if (mainNav.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!topbar.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 640) {
      closeMenu();
    }
  });
});

if (mobilityGrid) {
  mobilityGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".mobility-item");
    if (!button) return;

    mobilityGrid
      .querySelectorAll(".mobility-item")
      .forEach((item) => item.classList.remove("active"));

    button.classList.add("active");

    if (page === "inicio") {
      const selectedType = button.getAttribute("data-type");
      const targetProduct = getProductKeyFromType(selectedType);

      if (targetProduct) {
        window.location.href = `./productos.html?filtro=${encodeURIComponent(targetProduct)}`;
      }
    }

    if (page === "productos") {
      const selectedType = button.getAttribute("data-type");
      focusProductByType(selectedType, { scroll: true, updateUrl: true });
    }
  });
}

if (page === "productos") {
  const params = new URLSearchParams(window.location.search);
  const filter = params.get("filtro");

  setupProductQuoteButtons();

  if (filter) {
    const normalized = filter.trim().toLowerCase();
    setActiveMobilityButton(normalized);
    focusProductByType(normalized, { scroll: true, updateUrl: false });
  }
}

setupSocialPointerEffect();

