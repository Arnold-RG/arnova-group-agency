"use strict";
(function () {
  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  var object = document.querySelector(".arnova-hero-object[data-parallax]");
  if (!object || reduceMotion) return;

  var ticking = false;
  function update() {
    ticking = false;
    var rect = object.getBoundingClientRect();
    var view = window.innerHeight || 1;
    if (rect.bottom < 0 || rect.top > view) return;
    var progress = (view / 2 - (rect.top + rect.height / 2)) / view;
    var shift = Math.max(-16, Math.min(16, progress * 28));
    object.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0)";
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  update();
})();
