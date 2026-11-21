"use strict";
(function () {
  var dock = document.querySelector(".arnova-mobile-dock");
  var sheet = document.querySelector(".arnova-dock-sheet");
  var servicesBtn = dock ? dock.querySelector('[data-dock-link="services"]') : null;
  var fab = dock ? dock.querySelector(".arnova-mobile-dock__fab") : null;
  var bar = dock ? dock.querySelector(".arnova-mobile-dock__bar") : null;
  var indicator = dock ? dock.querySelector(".arnova-mobile-dock__indicator") : null;
  var sheetClose = sheet ? sheet.querySelector(".arnova-dock-sheet__close") : null;
  var sheetBackdrop = sheet ? sheet.querySelector(".arnova-dock-sheet__backdrop") : null;
  var sheetPanel = sheet ? sheet.querySelector(".arnova-dock-sheet__panel") : null;
  var lastFocus = null;
  var currentKey = "home";

  function motionOk() {
    return !window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isSheetOpen() {
    return !!(sheet && !sheet.hidden);
  }

  function updateSheetOverflow() {
    if (!sheetPanel) return;
    var list = sheetPanel.querySelector(".arnova-dock-sheet__list");
    if (!list) return;
    var more = list.scrollHeight - list.scrollTop - list.clientHeight > 8;
    sheetPanel.classList.toggle("has-more-below", more);
  }

  function openSheet() {
    if (!sheet || !servicesBtn) return;
    lastFocus = document.activeElement;
    sheet.hidden = false;
    sheet.classList.add("is-open");
    servicesBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-dock-sheet-open");
    if (sheetClose) sheetClose.focus();
    else if (sheetPanel) {
      var first = sheetPanel.querySelector("a,button");
      if (first) first.focus();
    }
    if (dock) dock.classList.add("is-sheet-open");
    updateSheetOverflow();
    placeIndicator("services");
  }

  function closeSheet() {
    if (!sheet || !servicesBtn) return;
    sheet.hidden = true;
    sheet.classList.remove("is-open");
    servicesBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-dock-sheet-open");
    if (dock) dock.classList.remove("is-sheet-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    placeIndicator(currentKey);
  }

  function placeIndicator(key) {
    if (!dock || !bar || !indicator) return;
    var tab = null;
    if (key && key !== "contact") {
      tab = bar.querySelector('[data-dock-link="' + key + '"]');
    }
    if (!tab) {
      indicator.style.setProperty("--nav-indicator-opacity", "0");
      return;
    }
    var br = bar.getBoundingClientRect();
    var tr = tab.getBoundingClientRect();
    var x = tr.left - br.left + tr.width / 2;
    indicator.style.setProperty("--nav-indicator-x", x + "px");
    indicator.style.setProperty("--nav-indicator-opacity", "1");
  }

  function markDock(key) {
    currentKey = key || "home";
    if (!dock) return;
    dock.querySelectorAll("[data-dock-link]").forEach(function (el) {
      if (key && el.getAttribute("data-dock-link") === key) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
    placeIndicator(isSheetOpen() ? "services" : currentKey);
  }

  function spyKey() {
    var rootStyle = getComputedStyle(document.documentElement);
    var headerRaw = rootStyle.getPropertyValue("--space-header-offset-narrow") || rootStyle.getPropertyValue("--space-header-offset") || "66px";
    var header = parseFloat(headerRaw) || 66;
    var pad = parseFloat(rootStyle.scrollPaddingTop) || 0;
    var margin = 0;
    var sample = document.getElementById("top") || document.getElementById("services") || document.getElementById("about");
    if (sample) margin = parseFloat(getComputedStyle(sample).scrollMarginTop) || 0;
    /* Landings use scroll-margin plus html scroll-padding, so the probe sits just below that line. */
    var probe = Math.max(header + 20, pad + margin + 24, window.innerHeight * 0.25);
    var sections = [
      { key: "home", el: document.getElementById("top") },
      { key: "services", el: document.getElementById("services") },
      { key: "pricing", el: document.getElementById("pricing") },
      { key: "about", el: document.getElementById("about") },
      { key: "contact", el: document.getElementById("contact") }
    ].filter(function (s) { return !!s.el; });
    var key = sections.length ? sections[0].key : "home";
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].el.getBoundingClientRect().top <= probe + 1) key = sections[i].key;
    }
    var doc = document.documentElement;
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 80) {
      if (document.getElementById("contact")) key = "contact";
    }
    return key;
  }

  function syncSpy() {
    if (isSheetOpen()) return;
    markDock(spyKey());
  }

  function scrollToId(id) {
    var behavior = motionOk() ? "smooth" : "auto";
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: behavior });
      return true;
    }
    var el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior: behavior, block: "start" });
    return true;
  }

  if (servicesBtn && sheet) {
    servicesBtn.addEventListener("click", function () {
      if (isSheetOpen()) closeSheet();
      else openSheet();
    });
    if (sheetPanel) {
      var list = sheetPanel.querySelector(".arnova-dock-sheet__list");
      if (list) list.addEventListener("scroll", updateSheetOverflow, { passive: true });
    }
    if (sheetClose) sheetClose.addEventListener("click", closeSheet);
    if (sheetBackdrop) sheetBackdrop.addEventListener("click", closeSheet);
    sheet.addEventListener("click", function (event) {
      var link = event.target.closest(".arnova-dock-sheet__list a, .arnova-dock-sheet__footer a");
      if (!link) return;
      closeSheet();
      var href = link.getAttribute("href") || "";
      var hash = href.split("#")[1];
      if (hash && document.getElementById(hash)) {
        event.preventDefault();
        if (history && history.pushState) history.pushState(null, "", "#" + hash);
        scrollToId(hash);
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isSheetOpen()) {
        event.preventDefault();
        closeSheet();
      }
    });
    sheet.addEventListener("keydown", function (event) {
      if (!isSheetOpen() || event.key !== "Tab" || !sheetPanel) return;
      var items = Array.prototype.slice.call(
        sheetPanel.querySelectorAll('a,button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
      ).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  if (dock) {
    dock.addEventListener("click", function (event) {
      var link = event.target.closest("a[href]");
      if (!link || !dock.contains(link)) return;
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      var id = href.slice(1);
      if (!id || !document.getElementById(id)) return;
      event.preventDefault();
      if (isSheetOpen()) closeSheet();
      if (history && history.pushState) history.pushState(null, "", "#" + id);
      scrollToId(id);
      markDock(id === "top" ? "home" : id === "contact" ? "contact" : link.getAttribute("data-dock-link") || spyKey());
    });
  }

  var sectionIds = ["top", "services", "pricing", "about", "contact"];
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function () { syncSpy(); }, {
      root: null,
      rootMargin: "-70px 0px -40% 0px",
      threshold: [0, 0.15, 0.35, 0.6, 1]
    });
    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      syncSpy();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener("resize", function () {
    placeIndicator(isSheetOpen() ? "services" : currentKey);
    updateSheetOverflow();
    syncSpy();
  });
  window.addEventListener("hashchange", function () {
    var hash = (window.location.hash || "").replace(/^#/, "");
    if (hash && document.getElementById(hash)) {
      markDock(hash === "top" ? "home" : hash.indexOf("service-") === 0 ? "services" : hash);
    } else {
      syncSpy();
    }
  });
  window.addEventListener("load", function () {
    placeIndicator(currentKey);
    syncSpy();
  });
  markDock(spyKey());
})();
