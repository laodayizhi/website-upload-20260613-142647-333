(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function attach(video, url) {
    if (!url) {
      return Promise.resolve();
    }

    if (video.dataset.loaded === "1") {
      return Promise.resolve();
    }

    video.dataset.loaded = "1";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.load();
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
      return Promise.resolve();
    }

    video.src = url;
    video.load();
    return Promise.resolve();
  }

  function start(shell) {
    var video = shell.querySelector("video");
    var url = shell.getAttribute("data-play");
    if (!video || !url) {
      return;
    }
    shell.classList.add("is-started");
    attach(video, url).then(function () {
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    });
  }

  function bind() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var button = shell.querySelector(".player-launch");
      var video = shell.querySelector("video");
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          start(shell);
        });
      }
      shell.addEventListener("click", function (event) {
        if (event.target === video && shell.classList.contains("is-started")) {
          return;
        }
        if (!shell.classList.contains("is-started")) {
          start(shell);
        }
      });
    });
  }

  ready(bind);
})();
