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

  var spySections = [
    { id: "top", key: "home" },
    { id: "about", key: "about" },
    { id: "services", key: "services" },
    { id: "pricing", key: "pricing" },
    { id: "faq", key: "faq" },
    { id: "contact", key: "contact" },
    { id: "privacy", key: "privacy" }
  ];

  function keyFromHash() {
    var hash = (window.location.hash || "").replace(/^#/, "");
    if (!hash || hash === "top" || hash === "main") return "home";
    if (hash === "services" || hash.indexOf("service-") === 0) return "services";
    if (hash === "pricing" || hash === "payment-methods" || hash === "payments" || hash === "packages" || hash === "one-time" || hash === "monthly" || hash === "yearly" || hash === "daily-care") return "pricing";
    if (hash === "faq") return "faq";
    if (hash === "about") return "about";
    if (hash === "contact") return "contact";
    if (hash === "privacy") return "privacy";
    return "";
  }

  function keyFromScroll() {
    var probe = Math.max(96, window.innerHeight * 0.28);
    var current = "home";
    for (var i = 0; i < spySections.length; i += 1) {
      var el = document.getElementById(spySections[i].id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= probe) current = spySections[i].key;
    }
    var rootEl = document.documentElement;
    if (window.scrollY + window.innerHeight >= rootEl.scrollHeight - 12) {
      current = "privacy";
    }
    return current;
  }

  function markActive(key) {
    if (typeof key !== "string" || !key) key = keyFromScroll() || keyFromHash() || "home";
    document.querySelectorAll("[data-nav]").forEach(function (el) {
      if (el.getAttribute("data-nav") === key) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
  }

  var spyTicking = false;
  function onSpy() {
    if (spyTicking) return;
    spyTicking = true;
    window.requestAnimationFrame(function () {
      markActive(keyFromScroll());
      spyTicking = false;
    });
  }
  markActive(keyFromHash() || keyFromScroll());
  window.addEventListener("scroll", onSpy, { passive: true });
  window.addEventListener("hashchange", function () {
    markActive(keyFromHash() || keyFromScroll());
  });
})();
