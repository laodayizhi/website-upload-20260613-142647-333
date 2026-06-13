(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileNavigation() {
        var toggle = document.querySelector('.mobile-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var willOpen = nav.hasAttribute('hidden');
            if (willOpen) {
                nav.removeAttribute('hidden');
            } else {
                nav.setAttribute('hidden', '');
            }
            toggle.setAttribute('aria-expanded', String(willOpen));
        });
    }

    function setupHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle('active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        thumbs.forEach(function (thumb, index) {
            thumb.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        var hero = document.querySelector('.hero-section');
        if (hero) {
            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
        }
        show(0);
        start();
    }

    function setupFilters() {
        var grid = document.querySelector('.filter-grid');
        if (!grid) {
            return;
        }
        var input = document.querySelector('[data-filter-input]');
        var year = document.querySelector('[data-filter-year]');
        var region = document.querySelector('[data-filter-region]');
        var genre = document.querySelector('[data-filter-genre]');
        var count = document.querySelector('[data-filter-count]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function matchCard(card) {
            var keyword = normalize(input && input.value);
            var selectedYear = year ? year.value : 'all';
            var selectedRegion = region ? region.value : 'all';
            var selectedGenre = genre ? genre.value : 'all';
            var searchable = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags
            ].join(' '));
            var okKeyword = !keyword || searchable.indexOf(keyword) !== -1;
            var okYear = selectedYear === 'all' || card.dataset.year === selectedYear;
            var okRegion = selectedRegion === 'all' || card.dataset.region === selectedRegion;
            var okGenre = selectedGenre === 'all' || normalize(card.dataset.genre).indexOf(normalize(selectedGenre)) !== -1;
            return okKeyword && okYear && okRegion && okGenre;
        }

        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var matched = matchCard(card);
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = String(visible);
            }
        }

        [input, year, region, genre].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    ready(function () {
        setupMobileNavigation();
        setupHeroSlider();
        setupFilters();
    });
}());
