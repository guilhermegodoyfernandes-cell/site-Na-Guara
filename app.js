/* =========================================================
   Na'Guara — aplicação
   Vanilla JS · catálogo, sacola, WhatsApp e PWA
   ========================================================= */

(() => {
  "use strict";

  /* -------------------------------------------------------
     Configurações da loja
     Troque o número do WhatsApp e os dados abaixo antes de publicar.
     ------------------------------------------------------- */
  const STORE = {
    name: "Na'Guara",
    whatsapp: "5511999999999",
    deliveryFee: 690,
    freeDeliveryFrom: 8000,
    currency: "BRL",
  };

  const CART_KEY = "naguara:cart";
  const CUSTOMER_KEY = "naguara:customer";
  const MAX_QTY = 20;

  const PRODUCTS = [
    {
      id: "teq-classicos",
      name: "Tequeños Clássicos",
      category: "tequeños",
      meta: "6 unidades",
      description: "Massa fininha e crocante por fora, com muito queijo branco derretido por dentro.",
      price: 2490,
      image: "assets/images/tequenos-clasicos.webp",
      alt: "Tequeños dourados com queijo derretido",
      badge: "Mais pedido",
      popular: true,
    },
    {
      id: "teq-compartilhar",
      name: "Tequeños para Compartilhar",
      category: "tequeños",
      meta: "12 unidades",
      description: "A porção generosa para dividir na mesa — ou não. Servidos bem quentinhos.",
      price: 4490,
      image: "assets/images/tequenos-guayaba.webp",
      alt: "Cesta com tequeños artesanais",
      badge: "Para dividir",
      popular: false,
    },
    {
      id: "teq-picantes",
      name: "Tequeños Picantes",
      category: "tequeños",
      meta: "6 unidades",
      description: "O clássico com um toque de pimenta e mel. Para quem gosta de um pouco de ousadia.",
      price: 2790,
      image: "assets/images/tequenos-tocineta.webp",
      alt: "Tequeños crocantes com flocos de pimenta",
      badge: "Novo",
      popular: false,
    },
    {
      id: "arepa-reina",
      name: "Arepa Reina Pepiada",
      category: "arepas",
      meta: "Arepa recheada",
      description: "Frango desfiado, abacate, maionese da casa e coentro fresco. Cremosa de verdade.",
      price: 2890,
      image: "assets/images/arepa-reina.webp",
      alt: "Arepa reina pepiada recheada com abacate",
      badge: "Favorita",
      popular: true,
    },
    {
      id: "arepa-queso",
      name: "Arepa de Queso Llanero",
      category: "arepas",
      meta: "Arepa recheada",
      description: "Queijo llanero derretido no ponto, na arepa quentinha feita na chapa.",
      price: 2290,
      image: "assets/images/arepa-queso.webp",
      alt: "Arepa recheada com queijo derretido",
      badge: "",
      popular: false,
    },
    {
      id: "arepa-carne",
      name: "Arepa de Carne Mechada",
      category: "arepas",
      meta: "Arepa recheada",
      description: "Carne desfiada cozida lentamente, queijo e nosso molho de pimenta da casa.",
      price: 3290,
      image: "assets/images/arepa-carne.webp",
      alt: "Arepa recheada com carne desfiada e queijo",
      badge: "Da casa",
      popular: false,
    },
    {
      id: "combo-pareja",
      name: "Combo Pareja",
      category: "combos",
      meta: "Serve 2 pessoas",
      description: "6 tequeños clássicos + 2 arepas (reina e queijo) + 2 papelones con limón.",
      price: 7490,
      image: "assets/images/combo-pareja.webp",
      alt: "Combo com arepa reina pepiada e tequeños",
      badge: "Economize R$ 12",
      popular: true,
    },
    {
      id: "combo-familiar",
      name: "Combo Familiar",
      category: "combos",
      meta: "Serve 4 pessoas",
      description: "12 tequeños + 4 arepas + 4 bebidas. A mesa cheia do jeito que a gente gosta.",
      price: 13990,
      image: "assets/images/combo-familiar.webp",
      alt: "Combo familiar com tequeños, arepas e bebidas",
      badge: "Melhor valor",
      popular: false,
    },
    {
      id: "bebida-papelon",
      name: "Papelón con Limón",
      category: "bebidas",
      meta: "350 ml",
      description: "Doce de cana, limão e gelo. Refrescante, brasileiro e venezuelano ao mesmo tempo.",
      price: 990,
      image: "assets/images/papelon.webp",
      alt: "Copo de papelón con limón com limão e hortelã",
      badge: "",
      popular: true,
    },
    {
      id: "bebida-tizana",
      name: "Tizana",
      category: "bebidas",
      meta: "400 ml",
      description: "Suco de frutas com laranja, abacaxi e um toque de limão. Fica ainda melhor com gelo.",
      price: 1290,
      image: "assets/images/tizana.webp",
      alt: "Copo de tizana venezuelana com frutas",
      badge: "",
      popular: false,
    },
  ];

  const CATEGORY_LABELS = {
    populares: "Mais pedidos",
    tequeños: "Tequeños",
    arepas: "Arepas",
    combos: "Combos",
    bebidas: "Bebidas",
  };

  const money = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: STORE.currency,
  });

  const formatMoney = (cents) => money.format(cents / 100);
  const getProduct = (id) => PRODUCTS.find((product) => product.id === id);
  const imageBase = (path) => path.replace(/\.webp$/, "");

  /* -------------------------------------------------------
     Estado
     ------------------------------------------------------- */
  let cart = loadCart();
  let activeCategory = "populares";
  let fulfillment = "delivery";
  let deferredInstallPrompt = null;
  let toastTimer = null;
  let isInstalled = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  const dom = {
    body: document.body,
    header: document.querySelector(".site-header"),
    productGrid: document.getElementById("product-grid"),
    tabs: Array.from(document.querySelectorAll(".tab")),
    cartDialog: document.getElementById("cart-dialog"),
    cartToggle: document.getElementById("cart-toggle"),
    cartClose: document.getElementById("cart-close"),
    cartBody: document.getElementById("cart-body"),
    cartEmpty: document.getElementById("cart-empty"),
    cartEmptyCta: document.getElementById("cart-empty-cta"),
    cartItems: document.getElementById("cart-items"),
    cartCheckout: document.getElementById("cart-checkout"),
    subtotal: document.getElementById("cart-subtotal"),
    delivery: document.getElementById("cart-delivery"),
    deliveryLabel: document.getElementById("cart-delivery-label"),
    total: document.getElementById("cart-total"),
    freeShippingNote: document.getElementById("free-shipping-note"),
    customerName: document.getElementById("customer-name"),
    customerAddress: document.getElementById("customer-address"),
    addressField: document.getElementById("address-field"),
    checkoutError: document.getElementById("checkout-error"),
    checkoutBtn: document.getElementById("checkout-btn"),
    cartCounts: Array.from(document.querySelectorAll("[data-cart-count]")),
    fulfillmentButtons: Array.from(document.querySelectorAll("[data-fulfillment]")),
    toast: document.getElementById("toast"),
    toastMessage: document.getElementById("toast-message"),
    offlineBanner: document.getElementById("offline-banner"),
    installDialog: document.getElementById("install-dialog"),
    installDialogText: document.getElementById("install-dialog-text"),
    installSteps: document.getElementById("install-steps"),
    installDialogAction: document.getElementById("install-dialog-action"),
    installDialogClose: document.getElementById("install-dialog-close"),
    installHeader: document.getElementById("install-header"),
    installCta: document.getElementById("install-cta"),
    installTab: document.getElementById("install-tab"),
    installHint: document.getElementById("install-hint"),
    mobileTabbar: document.querySelector(".mobile-tabbar"),
    mobileTabs: Array.from(document.querySelectorAll(".mobile-tabbar__item")),
    currentYear: document.getElementById("current-year"),
  };

  /* -------------------------------------------------------
     Inicialização
     ------------------------------------------------------- */
  function init() {
    updateWhatsAppLinks();
    renderMenu();
    updateCartUI();
    prefillCustomer();
    bindEvents();
    setupReveal();
    setupHeaderState();
    setupTabbarState();
    setupNetworkStatus();
    setupPwa();
    handleIncomingRoute();

    if (dom.currentYear) {
      dom.currentYear.textContent = String(new Date().getFullYear());
    }
  }

  /* -------------------------------------------------------
     Menu
     ------------------------------------------------------- */
  function renderMenu() {
    const items =
      activeCategory === "populares"
        ? PRODUCTS.filter((product) => product.popular)
        : PRODUCTS.filter((product) => product.category === activeCategory);

    dom.productGrid.innerHTML = items
      .map((product, index) => {
        const base = imageBase(product.image);
        return `
          <article class="product-card" aria-labelledby="product-${product.id}">
            <div class="product-card__media">
              <img src="${base}-480.webp" srcset="${base}-480.webp 480w, ${base}-600.webp 600w, ${product.image} 900w" sizes="(min-width: 1080px) 22vw, (min-width: 560px) 29vw, 126px" alt="${product.alt}" width="900" height="675" loading="${index < 2 ? "eager" : "lazy"}" decoding="async">
              ${product.badge ? `<span class="product-card__badge${product.id === "arepa-queso" ? " product-card__badge--green" : ""}">${product.badge}</span>` : ""}
            </div>
            <div class="product-card__body">
              <p class="product-card__meta">${product.meta}</p>
              <h3 id="product-${product.id}">${product.name}</h3>
              <p class="product-card__desc">${product.description}</p>
              <div class="product-card__footer">
                <span class="product-card__price"><small>preço</small><strong>${formatMoney(product.price)}</strong></span>
                <button class="add-button" type="button" data-add="${product.id}" aria-label="Adicionar ${product.name} à sacola">
                  <svg class="icon" aria-hidden="true"><use href="#icon-plus"></use></svg>
                  Adicionar
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    dom.productGrid.dataset.count = String(items.length);
    const activeTab = dom.tabs.find((tab) => tab.dataset.category === activeCategory);
    if (activeTab) {
      dom.productGrid.setAttribute("aria-labelledby", activeTab.id);
    }
  }

  function setCategory(category, focusTab = false) {
    if (!CATEGORY_LABELS[category]) return;
    activeCategory = category;

    dom.tabs.forEach((tab) => {
      const isActive = tab.dataset.category === category;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      if (isActive && focusTab) {
        tab.focus();
        tab.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
      }
    });

    renderMenu();
  }

  function handleTabKeyboard(event) {
    const currentIndex = dom.tabs.indexOf(document.activeElement);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % dom.tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + dom.tabs.length) % dom.tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = dom.tabs.length - 1;
    else return;

    event.preventDefault();
    setCategory(dom.tabs[nextIndex].dataset.category, true);
  }

  /* -------------------------------------------------------
     Sacola
     ------------------------------------------------------- */
  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

      return Object.fromEntries(
        Object.entries(parsed)
          .filter(([id, qty]) => getProduct(id) && Number.isInteger(qty) && qty > 0)
          .map(([id, qty]) => [id, Math.min(qty, MAX_QTY)]),
      );
    } catch {
      return {};
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // O carrinho continua funcionando nesta sessão mesmo sem localStorage.
    }
  }

  function getCartQuantity() {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }

  function getSubtotal() {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = getProduct(id);
      return product ? sum + product.price * qty : sum;
    }, 0);
  }

  function getDeliveryFee(subtotal) {
    if (fulfillment === "pickup" || subtotal >= STORE.freeDeliveryFrom) return 0;
    return STORE.deliveryFee;
  }

  function addToCart(id, quantity = 1) {
    const product = getProduct(id);
    if (!product) return;

    const nextQuantity = Math.min((cart[id] || 0) + quantity, MAX_QTY);
    cart[id] = nextQuantity;
    saveCart();
    updateCartUI(true);
    showToast(`${product.name} adicionado à sacola`);
  }

  function changeQuantity(id, delta) {
    if (!cart[id] || !getProduct(id)) return;

    cart[id] += delta;
    if (cart[id] <= 0) delete cart[id];
    if (cart[id] > MAX_QTY) cart[id] = MAX_QTY;

    saveCart();
    updateCartUI();
  }

  function removeFromCart(id) {
    delete cart[id];
    saveCart();
    updateCartUI();
  }

  function updateCartUI(bumpCount = false) {
    const quantity = getCartQuantity();
    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee(subtotal);
    const total = subtotal + deliveryFee;
    const hasItems = quantity > 0;

    dom.cartCounts.forEach((counter) => {
      counter.textContent = String(quantity);
      counter.hidden = quantity === 0;
      if (bumpCount && quantity > 0) {
        counter.classList.remove("is-bumping");
        void counter.offsetWidth;
        counter.classList.add("is-bumping");
      }
    });

    dom.cartEmpty.hidden = hasItems;
    dom.cartItems.hidden = !hasItems;
    dom.cartCheckout.hidden = !hasItems;

    if (!hasItems) {
      dom.cartItems.innerHTML = "";
    } else {
      dom.cartItems.innerHTML = Object.entries(cart)
        .map(([id, qty]) => {
          const product = getProduct(id);
          if (!product) return "";
          return `
            <div class="cart-item" data-id="${id}">
              <div class="cart-item__image">
                <img src="${imageBase(product.image)}-480.webp" alt="" width="132" height="132" loading="lazy">
              </div>
              <div class="cart-item__content">
                <p class="cart-item__title">${product.name}</p>
                <span class="cart-item__unit">${product.meta} · ${formatMoney(product.price)}</span>
                <div class="cart-item__controls">
                  <div class="qty-stepper" aria-label="Quantidade de ${product.name}">
                    <button type="button" data-cart-action="decrease" data-id="${id}" aria-label="Diminuir quantidade de ${product.name}">
                      <svg class="icon" aria-hidden="true"><use href="#icon-minus"></use></svg>
                    </button>
                    <span aria-live="polite">${qty}</span>
                    <button type="button" data-cart-action="increase" data-id="${id}" aria-label="Aumentar quantidade de ${product.name}">
                      <svg class="icon" aria-hidden="true"><use href="#icon-plus"></use></svg>
                    </button>
                  </div>
                  <button class="cart-item__remove" type="button" data-cart-action="remove" data-id="${id}" aria-label="Remover ${product.name} da sacola">
                    <svg class="icon" aria-hidden="true"><use href="#icon-trash"></use></svg>
                  </button>
                </div>
              </div>
              <span class="cart-item__price">${formatMoney(product.price * qty)}</span>
            </div>
          `;
        })
        .join("");
    }

    dom.subtotal.textContent = formatMoney(subtotal);
    dom.total.textContent = formatMoney(total);
    dom.deliveryLabel.textContent = fulfillment === "pickup" ? "Retirada" : "Entrega";

    dom.delivery.textContent = deliveryFee === 0 ? "Grátis" : formatMoney(deliveryFee);

    updateFreeShipping(subtotal, hasItems);
    updateFulfillmentUI();
  }

  function updateFreeShipping(subtotal, hasItems) {
    if (!hasItems || fulfillment === "pickup") {
      dom.freeShippingNote.hidden = true;
      dom.freeShippingNote.classList.remove("is-reached");
      return;
    }

    const missing = STORE.freeDeliveryFrom - subtotal;
    dom.freeShippingNote.hidden = false;

    if (missing > 0) {
      dom.freeShippingNote.classList.remove("is-reached");
      dom.freeShippingNote.textContent = `Faltam ${formatMoney(missing)} para você ganhar frete grátis.`;
    } else {
      dom.freeShippingNote.classList.add("is-reached");
      dom.freeShippingNote.textContent = "Você ganhou frete grátis! 🎉";
    }
  }

  function setFulfillment(value) {
    fulfillment = value === "pickup" ? "pickup" : "delivery";
    updateFulfillmentUI();
    updateCartUI();
  }

  function updateFulfillmentUI() {
    const isPickup = fulfillment === "pickup";

    dom.fulfillmentButtons.forEach((button) => {
      const active = button.dataset.fulfillment === fulfillment;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    dom.addressField.hidden = isPickup;
    dom.customerAddress.required = !isPickup;
    if (dom.checkoutError.hidden === false && isPickup) clearCheckoutError();
  }

  function openCart() {
    if (typeof dom.cartDialog.showModal !== "function") return;
    updateCartUI();
    clearCheckoutError();
    if (!dom.cartDialog.open) dom.cartDialog.showModal();
    syncBodyLock();
    requestAnimationFrame(() => dom.cartClose.focus());
  }

  function closeCart() {
    if (dom.cartDialog.open) dom.cartDialog.close();
    syncBodyLock();
  }

  function clearCheckoutError() {
    dom.checkoutError.hidden = true;
    dom.checkoutError.textContent = "";
    dom.customerName.closest(".field").classList.remove("has-error");
    dom.customerAddress.closest(".field").classList.remove("has-error");
  }

  function showCheckoutError(message, field) {
    dom.checkoutError.textContent = message;
    dom.checkoutError.hidden = false;
    if (field) {
      field.closest(".field").classList.add("has-error");
      field.focus();
    }
  }

  function prefillCustomer() {
    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "{}");
      if (saved.name) dom.customerName.value = saved.name;
      if (saved.address) dom.customerAddress.value = saved.address;
    } catch {
      // Sem dados salvos.
    }
  }

  function persistCustomer(name, address) {
    try {
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name, address }));
    } catch {
      // Sem localStorage, sem problema.
    }
  }

  function checkout() {
    clearCheckoutError();

    if (getCartQuantity() === 0) {
      closeCart();
      return;
    }

    const name = dom.customerName.value.trim();
    const address = dom.customerAddress.value.trim();

    if (name.length < 2) {
      showCheckoutError("Conta pra gente como podemos te chamar.", dom.customerName);
      return;
    }

    if (fulfillment === "delivery" && address.length < 8) {
      showCheckoutError("Digite o endereço completo, com número e bairro.", dom.customerAddress);
      return;
    }

    persistCustomer(name, address);

    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee(subtotal);
    const total = subtotal + deliveryFee;
    const itemLines = Object.entries(cart)
      .map(([id, qty]) => {
        const product = getProduct(id);
        return product ? `• ${qty}x ${product.name} — ${formatMoney(product.price * qty)}` : "";
      })
      .filter(Boolean)
      .join("\n");

    const message = [
      `*NOVO PEDIDO — ${STORE.name}* 🌞`,
      "",
      `*Nome:* ${name}`,
      `*Forma:* ${fulfillment === "delivery" ? "Entrega" : "Retirada na loja"}`,
      fulfillment === "delivery" ? `*Endereço:* ${address}` : "",
      "",
      "*Itens do pedido:*",
      itemLines,
      "",
      `*Subtotal:* ${formatMoney(subtotal)}`,
      `*${fulfillment === "delivery" ? "Entrega" : "Retirada"}:* ${deliveryFee === 0 ? "Grátis" : formatMoney(deliveryFee)}`,
      `*Total:* ${formatMoney(total)}`,
      "",
      "Pedido enviado pelo site da Na'Guara 💛",
    ]
      .filter((line) => line !== null)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");

    const url = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();

    showToast("Pedido pronto! Agora é só confirmar no WhatsApp.");
  }

  /* -------------------------------------------------------
     WhatsApp
     ------------------------------------------------------- */
  function updateWhatsAppLinks() {
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
      link.href = `https://wa.me/${STORE.whatsapp}`;
    });
  }

  /* -------------------------------------------------------
     PWA / instalação
     ------------------------------------------------------- */
  function setupPwa() {
    updateInstallState();

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      updateInstallState();
    });

    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      isInstalled = true;
      updateInstallState();
      showToast("Na'Guara instalada no seu dispositivo. Até já!");
    });

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", registerServiceWorker, { once: true });
    }

    dom.installHeader?.addEventListener("click", handleInstallRequest);
    dom.installCta?.addEventListener("click", handleInstallRequest);
    dom.installTab?.addEventListener("click", handleInstallRequest);
    document.getElementById("footer-install-link")?.addEventListener("click", (event) => {
      event.preventDefault();
      handleInstallRequest();
    });

    dom.installDialogClose?.addEventListener("click", closeInstallDialog);
    dom.installDialogAction?.addEventListener("click", closeInstallDialog);
    dom.installDialog?.addEventListener("click", (event) => {
      if (event.target === dom.installDialog) closeInstallDialog();
    });
    dom.installDialog?.addEventListener("close", syncBodyLock);
  }

  function updateInstallState() {
    if (!dom.installHeader) return;

    if (isInstalled) {
      dom.installHeader.hidden = true;
      if (dom.installCta) {
        dom.installCta.innerHTML = `
          <svg class="icon" aria-hidden="true"><use href="#icon-check"></use></svg>
          Aplicativo instalado
        `;
      }
      if (dom.installHint) dom.installHint.textContent = "Você já pode abrir a Na'Guara direto da tela inicial.";
      if (dom.installTab) {
        dom.installTab.innerHTML = `
          <svg class="icon" aria-hidden="true"><use href="#icon-check"></use></svg>
          <span>Instalado</span>
        `;
      }
      return;
    }

    dom.installHeader.hidden = !deferredInstallPrompt;
    if (dom.installCta) {
      dom.installCta.innerHTML = `
        <svg class="icon" aria-hidden="true"><use href="#icon-download"></use></svg>
        Instalar aplicativo
        <span class="btn__spark" aria-hidden="true">✨</span>
      `;
    }
    if (dom.installHint) dom.installHint.textContent = "Funciona no Android, iPhone e computador.";
    if (dom.installTab) {
      dom.installTab.innerHTML = `
        <svg class="icon" aria-hidden="true"><use href="#icon-download"></use></svg>
        <span>Instalar</span>
      `;
    }
  }

  async function handleInstallRequest() {
    if (isInstalled) {
      showToast("A Na'Guara já está instalada neste dispositivo.");
      return;
    }

    if (deferredInstallPrompt) {
      const promptEvent = deferredInstallPrompt;
      deferredInstallPrompt = null;

      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;

        if (choice.outcome === "accepted") {
          showToast("Instalando a Na'Guara…");
        } else {
          showToast("Tudo bem! Você pode instalar quando quiser.");
        }
      } catch {
        showInstallInstructions();
      } finally {
        updateInstallState();
      }
      return;
    }

    showInstallInstructions();
  }

  function showInstallInstructions() {
    if (!dom.installDialog) return;

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
      dom.installDialogText.textContent = "No Safari do iPhone ou iPad, siga estes passos para adicionar a Na'Guara à tela inicial:";
      dom.installSteps.hidden = false;
      dom.installDialogAction.textContent = "Entendi";
    } else {
      dom.installDialogText.textContent =
        "Abra o menu do seu navegador e escolha “Instalar aplicativo” ou “Adicionar à tela inicial”. Em alguns navegadores, o ícone de instalação aparece na barra de endereços.";
      dom.installSteps.hidden = true;
      dom.installDialogAction.textContent = "Fechar";
    }

    if (!dom.installDialog.open) dom.installDialog.showModal();
    syncBodyLock();
    requestAnimationFrame(() => dom.installDialogClose?.focus());
  }

  function closeInstallDialog() {
    if (dom.installDialog?.open) dom.installDialog.close();
    syncBodyLock();
  }

  function registerServiceWorker() {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              showToast("Nova versão disponível. Recarregue para atualizar.");
            }
          });
        });
      })
      .catch((error) => {
        console.warn("Service worker não registrado:", error);
      });
  }

  function setupNetworkStatus() {
    const update = () => {
      const online = navigator.onLine;
      dom.offlineBanner.hidden = online;
      document.documentElement.classList.toggle("is-offline", !online);
    };

    window.addEventListener("online", () => {
      update();
      showToast("Conexão restabelecida. Tudo certo!");
    });
    window.addEventListener("offline", update);
    update();
  }

  /* -------------------------------------------------------
     Toasts, diálogos e utilidades
     ------------------------------------------------------- */
  function showToast(message) {
    if (!dom.toast) return;
    window.clearTimeout(toastTimer);
    dom.toastMessage.textContent = message;
    dom.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      dom.toast.classList.remove("is-visible");
    }, 3200);
  }

  function syncBodyLock() {
    const hasOpenDialog = Boolean(dom.cartDialog?.open || dom.installDialog?.open);
    dom.body.classList.toggle("is-locked", hasOpenDialog);
  }

  function handleIncomingRoute() {
    const params = new URLSearchParams(window.location.search);
    const route = params.get("open");

    if (route === "cart") {
      window.setTimeout(openCart, 150);
    } else if (route === "menu") {
      window.setTimeout(() => {
        document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }

  /* -------------------------------------------------------
     Eventos
     ------------------------------------------------------- */
  function bindEvents() {
    dom.tabs.forEach((tab) => {
      tab.addEventListener("click", () => setCategory(tab.dataset.category));
    });

    document.querySelector(".tabs")?.addEventListener("keydown", handleTabKeyboard);

    dom.productGrid.addEventListener("click", (event) => {
      const addButton = event.target.closest("[data-add]");
      if (!addButton) return;
      addToCart(addButton.dataset.add);
    });

    document.querySelectorAll("[data-open-cart]").forEach((button) => {
      button.addEventListener("click", openCart);
    });

    dom.cartToggle.addEventListener("click", openCart);
    dom.cartClose.addEventListener("click", closeCart);

    dom.cartDialog.addEventListener("click", (event) => {
      if (event.target === dom.cartDialog) closeCart();
    });
    dom.cartDialog.addEventListener("close", syncBodyLock);
    dom.cartDialog.addEventListener("cancel", syncBodyLock);

    dom.cartEmptyCta.addEventListener("click", () => {
      closeCart();
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    dom.cartItems.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-cart-action]");
      if (!actionButton) return;

      const { cartAction, id } = actionButton.dataset;
      if (cartAction === "increase") changeQuantity(id, 1);
      else if (cartAction === "decrease") changeQuantity(id, -1);
      else if (cartAction === "remove") removeFromCart(id);
    });

    dom.fulfillmentButtons.forEach((button) => {
      button.addEventListener("click", () => setFulfillment(button.dataset.fulfillment));
    });

    dom.customerName.addEventListener("input", clearCheckoutError);
    dom.customerAddress.addEventListener("input", clearCheckoutError);
    dom.checkoutBtn.addEventListener("click", checkout);

    document.querySelectorAll("[data-category-link]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        setCategory(link.dataset.categoryLink);
        document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function setupReveal() {
    const elements = document.querySelectorAll(".reveal");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -25px 0px" },
    );

    elements.forEach((element) => observer.observe(element));
  }

  function setupHeaderState() {
    let ticking = false;

    const update = () => {
      dom.header?.classList.toggle("is-scrolled", window.scrollY > 12);
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true },
    );

    update();
  }

  function setupTabbarState() {
    if (!dom.mobileTabbar) return;

    const updateActiveTab = () => {
      const activeName = window.scrollY < window.innerHeight * 0.55 ? "inicio" : "menu";
      dom.mobileTabs.forEach((item) => {
        if (item.dataset.tab === "inicio" || item.dataset.tab === "menu") {
          item.classList.toggle("is-active", item.dataset.tab === activeName);
        }
      });
    };

    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          updateActiveTab();
          ticking = false;
        });
      },
      { passive: true },
    );
    updateActiveTab();
  }

  init();
})();
