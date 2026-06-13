(function () {
    function bindPlayer(player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('[data-play-cover]');
        var stream = player.getAttribute('data-stream');
        var hls = null;

        if (!video || !stream) {
            return;
        }

        function prepare() {
            if (video.getAttribute('data-ready') === 'true') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            video.setAttribute('data-ready', 'true');
        }

        function start() {
            prepare();
            player.classList.add('is-playing');
            video.controls = true;
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('[data-stream]').forEach(bindPlayer);
})();
