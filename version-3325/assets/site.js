(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initHeader();
        initMobileMenu();
        initBackTop();
        initHeroCarousel();
        initFilters();
        initPlayers();
    });

    function initHeader() {
        var header = document.querySelector("[data-header]");
        if (!header) {
            return;
        }
        var update = function () {
            header.classList.toggle("is-scrolled", window.scrollY > 18);
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
        });
        nav.addEventListener("click", function (event) {
            if (event.target.closest("a")) {
                nav.classList.remove("is-open");
                document.body.classList.remove("menu-open");
            }
        });
    }

    function initBackTop() {
        document.querySelectorAll("[data-back-top]").forEach(function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    }

    function initHeroCarousel() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        if (slides.length > 1) {
            restart();
        }
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var scope = panel.parentElement || document;
            var search = panel.querySelector("[data-filter-search]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

            function yearMatches(cardYear, value) {
                var numericYear = parseInt(cardYear || "0", 10);
                if (!value || value === "全部年份") {
                    return true;
                }
                if (value === "2026以后") {
                    return numericYear >= 2026;
                }
                if (value === "2020-2025") {
                    return numericYear >= 2020 && numericYear <= 2025;
                }
                if (value === "2010-2019") {
                    return numericYear >= 2010 && numericYear <= 2019;
                }
                if (value === "2000-2009") {
                    return numericYear >= 2000 && numericYear <= 2009;
                }
                if (value === "1999以前") {
                    return numericYear <= 1999;
                }
                return true;
            }

            function typeMatches(cardType, value) {
                if (!value || value === "全部类型") {
                    return true;
                }
                return (cardType || "").indexOf(value) !== -1 || (value === "动画" && (cardType || "").indexOf("动漫") !== -1);
            }

            function update() {
                var keyword = (search && search.value ? search.value : "").trim().toLowerCase();
                var yearValue = year ? year.value : "全部年份";
                var typeValue = type ? type.value : "全部类型";
                cards.forEach(function (card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.region,
                        card.dataset.tags,
                        card.dataset.category
                    ].join(" ").toLowerCase();
                    var matched = (!keyword || text.indexOf(keyword) !== -1) &&
                        yearMatches(card.dataset.year, yearValue) &&
                        typeMatches(card.dataset.type, typeValue);
                    card.classList.toggle("is-hidden", !matched);
                });
            }

            [search, year, type].forEach(function (item) {
                if (item) {
                    item.addEventListener("input", update);
                    item.addEventListener("change", update);
                }
            });
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".play-button");
            var state = player.querySelector(".player-state");
            var source = player.getAttribute("data-source");
            var loaded = false;
            var hlsInstance = null;

            if (!video || !button || !source) {
                return;
            }

            function setState(message) {
                if (state) {
                    state.textContent = message || "";
                }
            }

            function loadSource() {
                if (loaded) {
                    return Promise.resolve();
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return Promise.resolve();
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            setState("播放暂时不可用，请稍后重试");
                        }
                    });
                    return Promise.resolve();
                }
                video.src = source;
                return Promise.resolve();
            }

            function playVideo() {
                setState("");
                loadSource().then(function () {
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {
                            setState("点击视频控件继续播放");
                        });
                    }
                    player.classList.add("is-playing");
                });
            }

            button.addEventListener("click", playVideo);
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    player.classList.remove("is-playing");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }
})();
