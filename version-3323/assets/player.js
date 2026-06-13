(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    var configElement = document.getElementById('player-config');
    var video = document.querySelector('.movie-video');
    var overlay = document.querySelector('.play-overlay');
    if (!configElement || !video || !overlay) {
      return;
    }

    var config = {};
    try {
      config = JSON.parse(configElement.textContent || '{}');
    } catch (error) {
      config = {};
    }

    var src = config.src || '';
    if (!src) {
      return;
    }

    var hls = null;
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    function playVideo() {
      overlay.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function() {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('click', function() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function() {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function() {
      overlay.classList.remove('is-hidden');
    });
    video.addEventListener('ended', function() {
      overlay.classList.remove('is-hidden');
    });
    window.addEventListener('pagehide', function() {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
