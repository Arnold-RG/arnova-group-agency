"use strict";
(function () {
  var root = document.documentElement;
  var header = document.querySelector(".arnova-site-header");
  var themeBtn = document.querySelector(".theme-toggle");
  var dropdown = document.querySelector(".nav-dropdown");
  var toggle = dropdown ? dropdown.querySelector(".nav-dropdown__toggle") : null;
  var menu = dropdown ? dropdown.querySelector(".nav-dropdown__menu") : null;

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    if (!themeBtn) return;
    var isDark = theme === "dark";
    themeBtn.setAttribute("aria-pressed", String(isDark));
    themeBtn.setAttribute("aria-label", "Switch to " + (isDark ? "light" : "dark") + " theme");
    var label = themeBtn.querySelector("span");
    if (label) label.textContent = isDark ? "Light" : "Dark";
    try {
      localStorage.setItem("arnova-theme", theme);
    } catch (e) {}
  }

  var saved = null;
  try {
    saved = localStorage.getItem("arnova-theme");
  } catch (e) {}
  setTheme(saved === "dark" ? "dark" : "light");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function closeMenu() {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  }

  function openMenu() {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "true");
    menu.hidden = false;
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      if (toggle.getAttribute("aria-expanded") === "true") closeMenu();
      else openMenu();
    });
    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
        toggle.focus();
      }
      if (event.key === "ArrowDown" && document.activeElement === toggle) {
        event.preventDefault();
        openMenu();
        var first = menu.querySelector("a");
        if (first) first.focus();
      }
    });
    menu.addEventListener("keydown", function (event) {
      var items = Array.prototype.slice.call(menu.querySelectorAll("a"));
      var index = items.indexOf(document.activeElement);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        items[(index + 1) % items.length].focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        items[(index - 1 + items.length) % items.length].focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        items[0].focus();
      } else if (event.key === "End") {
        event.preventDefault();
        items[items.length - 1].focus();
      } else if (event.key === "Tab" && !event.shiftKey && index === items.length - 1) {
        closeMenu();
      } else if (event.key === "Tab" && event.shiftKey && index <= 0) {
        closeMenu();
      }
    });
  }

  function pageKey() {
    var path = (window.location.pathname || "").replace(/\/+$/, "");
    if (/\/pricing(?:\/index\.html)?$/.test(path)) return "pricing";
    var isInner = /\/blog\//.test(path) || /\/blog$/.test(path) || /\/privacy(?:\/|\.html)?$/.test(path);
    if (isInner) return "";
    var hash = (window.location.hash || "").replace(/^#/, "");
    if (hash === "contact") return "contact";
    if (hash === "about") return "about";
    if (hash === "services" || hash.indexOf("service-") === 0) return "services";
    return "home";
  }

  function markActive() {
    var key = pageKey();
    document.querySelectorAll("[data-nav]").forEach(function (el) {
      if (key && el.getAttribute("data-nav") === key) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
    document.querySelectorAll("[data-dock-link]").forEach(function (el) {
      if (key && el.getAttribute("data-dock-link") === key) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
  }

  var dock = document.querySelector(".arnova-mobile-dock");
  var sheet = document.querySelector(".arnova-dock-sheet");
  var servicesBtn = dock ? dock.querySelector('[data-dock-link="services"]') : null;
  var sheetClose = sheet ? sheet.querySelector(".arnova-dock-sheet__close") : null;
  var sheetBackdrop = sheet ? sheet.querySelector(".arnova-dock-sheet__backdrop") : null;
  var sheetPanel = sheet ? sheet.querySelector(".arnova-dock-sheet__panel") : null;
  var lastFocus = null;

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
    if (dock) {
      dock.classList.remove("is-away");
      dock.classList.add("is-sheet-open");
    }
    updateSheetOverflow();
  }

  function closeSheet() {
    if (!sheet || !servicesBtn) return;
    sheet.hidden = true;
    sheet.classList.remove("is-open");
    servicesBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-dock-sheet-open");
    if (dock) dock.classList.remove("is-sheet-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
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
      if (event.target.closest(".arnova-dock-sheet__list a, .arnova-dock-sheet__footer a")) closeSheet();
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

  var lastY = window.scrollY || 0;
  var scrollTicking = false;
  function onDockScroll() {
    if (!dock) return;
    var y = window.scrollY || 0;
    if (isSheetOpen()) {
      dock.classList.remove("is-away");
      lastY = y;
      return;
    }
    if (y > lastY + 10 && y > 48) dock.classList.add("is-away");
    else if (y < lastY - 10) dock.classList.remove("is-away");
    lastY = y;
  }
  window.addEventListener("scroll", function () {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(function () {
      onDockScroll();
      scrollTicking = false;
    });
  }, { passive: true });

  window.addEventListener("resize", function () { updateSheetOverflow(); });
  markActive();
  window.addEventListener("hashchange", markActive);
})();
