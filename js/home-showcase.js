"use strict";
(function () {
  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  var reveals = document.querySelectorAll(".arnova-reveal");
  if (reduceMotion) {
    Array.prototype.forEach.call(reveals, function (el) {
      el.classList.add("is-inview");
    });
  } else if (reveals.length && "IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
          rio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(reveals, function (el) { rio.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) {
      el.classList.add("is-inview");
    });
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
})();
