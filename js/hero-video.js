"use strict";
(function () {
  var video = document.querySelector(".arnova-film-video");
  var film = document.querySelector(".arnova-film");
  var button = document.querySelector(".arnova-video-toggle");
  if (!video || !film) return;

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  var userPaused = false;
  var inView = false;

  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = false;
  video.removeAttribute("autoplay");

  function setPlaying(playing) {
    film.classList.toggle("is-playing", playing);
    if (!button) return;
    button.setAttribute("aria-pressed", playing ? "true" : "false");
    button.textContent = playing ? "Pause" : "Play";
  }

  function play() {
    return video.play().then(function () {
      setPlaying(true);
    }).catch(function () {
      setPlaying(false);
    });
  }

  function pause() {
    video.pause();
    setPlaying(false);
  }

  function maybePlay() {
    if (reduceMotion || userPaused || document.hidden || !inView) {
      pause();
      return;
    }
    play();
  }

  if (button) {
    button.addEventListener("click", function () {
      if (video.paused) {
        userPaused = false;
        play();
      } else {
        userPaused = true;
        pause();
      }
    });
  }

  video.addEventListener("playing", function () { setPlaying(true); });
  video.addEventListener("pause", function () { setPlaying(false); });
  video.addEventListener("error", function () { setPlaying(false); });

  if (reduceMotion) {
    pause();
    if (button) {
      button.setAttribute("aria-pressed", "false");
      button.textContent = "Play";
    }
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      inView = entries.some(function (entry) { return entry.isIntersecting; });
      maybePlay();
    }, { threshold: 0.2 });
    io.observe(film);
  } else {
    inView = true;
    maybePlay();
  }

  document.addEventListener("visibilitychange", function () {
    maybePlay();
  });
})();
