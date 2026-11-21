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
    if (hash === "pricing") return "pricing";
    if (hash === "services" || hash.indexOf("service-") === 0) return "services";
    return "home";
  }

  function markActive() {
    var key = pageKey();
    document.querySelectorAll("[data-nav]").forEach(function (el) {
      if (key && el.getAttribute("data-nav") === key) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
  }

  markActive();
  window.addEventListener("hashchange", markActive);
})();
