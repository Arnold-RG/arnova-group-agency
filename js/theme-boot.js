"use strict";
(function () {
  document.documentElement.classList.add("js");
  try {
    if (localStorage.getItem("arnova-theme") === "dark") {
      document.documentElement.dataset.theme = "dark";
    }
  } catch (e) {}
})();
