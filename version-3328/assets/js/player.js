(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function showMessage(shell, message) {
        var box = shell.querySelector('[data-player-message]');
        if (box) {
            box.textContent = message;
            box.hidden = false;
        }
    }

    function setupPlayer() {
        var shell = document.querySelector('[data-player-shell]');
        var video = document.querySelector('#moviePlayer');
        var start = document.querySelector('[data-player-start]');
        if (!shell || !video || !start) {
            return;
        }
        var source = video.getAttribute('data-hls');
        var hls = null;
        var initialized = false;

        function initialize() {
            if (!source) {
                showMessage(shell, '当前影片未绑定播放源。');
                return;
            }
            if (!initialized) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    initialized = true;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showMessage(shell, '播放源连接失败，可刷新页面后重试。');
                        }
                    });
                    initialized = true;
                } else {
                    showMessage(shell, '当前浏览器不支持 HLS 播放。');
                    return;
                }
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    showMessage(shell, '浏览器阻止了自动播放，请再次点击播放按钮。');
                });
            }
        }

        start.addEventListener('click', initialize);
        video.addEventListener('play', function () {
            shell.classList.add('playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                shell.classList.remove('playing');
            }
        });
        video.addEventListener('ended', function () {
            shell.classList.remove('playing');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(setupPlayer);
}());
