"use strict";
(function () {
  try {
    if (localStorage.getItem("arnova-theme") === "dark") {
      document.documentElement.dataset.theme = "dark";
    }
  } catch (e) {}
})();
