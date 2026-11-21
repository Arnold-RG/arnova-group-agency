"use strict";
(function () {
  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  var reveals = document.querySelectorAll(".arnova-reveal");

  function markInView(el) {
    if (el) el.classList.add("is-inview");
  }

  function revealAlreadySeen() {
    var vh = window.innerHeight || document.documentElement.clientHeight || 0;
    Array.prototype.forEach.call(reveals, function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top < vh) markInView(el);
    });
  }

  function revealHashTarget() {
    var id = (window.location.hash || "").replace(/^#/, "");
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    var top = target.getBoundingClientRect().top;
    Array.prototype.forEach.call(reveals, function (el) {
      if (target === el || target.contains(el) || el.contains(target) || el.getBoundingClientRect().top <= top + 1) {
        markInView(el);
      }
    });
  }

  function bootReveal() {
    revealAlreadySeen();
    revealHashTarget();
  }

  if (reduceMotion) {
    Array.prototype.forEach.call(reveals, markInView);
  } else if (reveals.length && "IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          markInView(entry.target);
          rio.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -8px 0px" });
    Array.prototype.forEach.call(reveals, function (el) { rio.observe(el); });
    bootReveal();
    window.addEventListener("hashchange", bootReveal);
    window.addEventListener("load", bootReveal);
    var revealTick = false;
    window.addEventListener("scroll", function () {
      if (revealTick) return;
      revealTick = true;
      window.requestAnimationFrame(function () {
        revealAlreadySeen();
        revealTick = false;
      });
    }, { passive: true });
    document.addEventListener("click", function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link) return;
      var id = (link.getAttribute("href") || "").replace(/^#/, "");
      if (!id) return;
      window.requestAnimationFrame(function () {
        revealHashTarget();
        revealAlreadySeen();
      });
    });
  } else {
    Array.prototype.forEach.call(reveals, markInView);
  }

  var steps = document.querySelectorAll(".arnova-process-list > li");
  var counter = document.querySelector(".arnova-process-counter");
  var total = steps.length;
  if (counter && total) {
    function setStep(index) {
      var n = String(index + 1).padStart(2, "0");
      var of = String(total).padStart(2, "0");
      counter.textContent = n + " / " + of;
    }
    setStep(0);
    if ("IntersectionObserver" in window) {
      var current = 0;
      var pio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var i = Array.prototype.indexOf.call(steps, entry.target);
          if (i >= 0) {
            current = i;
            setStep(i);
          }
        });
      }, { threshold: 0.55, rootMargin: "-20% 0px -30% 0px" });
      Array.prototype.forEach.call(steps, function (el) { pio.observe(el); });
    }
  }


  var dialogs = document.querySelectorAll("dialog.arnova-concept-dialog");
  var lastConcept = null;

  function conceptIdFromHash() {
    var hash = (window.location.hash || "").replace(/^#/, "");
    if (hash.indexOf("concept-") === 0) return hash;
    return "";
  }

  function openConcept(id, updateHash) {
    var dialog = document.getElementById(id);
    if (!dialog || typeof dialog.showModal !== "function") return;
    Array.prototype.forEach.call(dialogs, function (other) {
      if (other.open && other.id !== id) other.close();
    });
    if (!dialog.open) dialog.showModal();
    if (!lastConcept) {
      var key = id.replace(/^concept-/, "");
      lastConcept = document.querySelector('[data-concept="' + key + '"]');
    }
    if (updateHash && window.location.hash !== "#" + id) {
      try { history.replaceState(null, "", "#" + id); } catch (e) {}
    }
  }

  function closeConcept(dialog, clearHash) {
    if (dialog && dialog.open) dialog.close();
    if (clearHash && conceptIdFromHash()) {
      try { history.replaceState(null, "", "#work"); } catch (e) {}
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-concept]"), function (btn) {
    btn.addEventListener("click", function () {
      lastConcept = btn;
      openConcept("concept-" + btn.getAttribute("data-concept"), true);
    });
  });

  Array.prototype.forEach.call(dialogs, function (dialog) {
    var closeBtn = dialog.querySelector(".arnova-concept-dialog__close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () { closeConcept(dialog, true); });
    }
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeConcept(dialog, true);
    });
    dialog.addEventListener("close", function () {
      if (conceptIdFromHash() === dialog.id) {
        try { history.replaceState(null, "", "#work"); } catch (e) {}
      }
      if (lastConcept && typeof lastConcept.focus === "function") lastConcept.focus();
    });
  });

  function openFromHash() {
    var id = conceptIdFromHash();
    if (id) openConcept(id, false);
    else {
      Array.prototype.forEach.call(dialogs, function (dialog) {
        if (dialog.open) dialog.close();
      });
    }
  }
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
