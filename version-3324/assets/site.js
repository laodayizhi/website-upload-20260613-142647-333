(function() {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function() {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function(panel) {
            var scope = panel.parentElement || document;
            var input = panel.querySelector("[data-filter-input]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var reset = panel.querySelector("[data-filter-reset]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var empty = scope.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q");

            if (initial && input) {
                input.value = initial;
            }

            function apply() {
                var q = normalize(input && input.value);
                var y = normalize(year && year.value);
                var t = normalize(type && type.value);
                var visible = 0;

                cards.forEach(function(card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var matched = true;

                    if (q && text.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (y && cardYear !== y) {
                        matched = false;
                    }
                    if (t && cardType !== t) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, year, type].forEach(function(control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function() {
                    if (input) {
                        input.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    apply();
                });
            }

            apply();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function(player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            var stream = player.getAttribute("data-stream");
            var attached = false;
            var hls = null;

            if (!video || !overlay || !stream) {
                return;
            }

            function attach() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function play() {
                attach();
                overlay.hidden = true;
                var action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(function() {
                        overlay.hidden = false;
                    });
                }
            }

            overlay.addEventListener("click", play);
            video.addEventListener("click", function() {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function() {
                overlay.hidden = true;
            });
            video.addEventListener("pause", function() {
                if (!video.ended) {
                    overlay.hidden = false;
                }
            });
            video.addEventListener("ended", function() {
                overlay.hidden = false;
            });
            video.addEventListener("error", function() {
                overlay.hidden = false;
            });
            window.addEventListener("beforeunload", function() {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function() {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
