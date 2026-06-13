(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function() {
        mobileNav.classList.toggle('is-open');
        document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      }

      function next() {
        show(current + 1);
      }

      function start() {
        stop();
        timer = window.setInterval(next, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      var prev = hero.querySelector('[data-hero-prev]');
      var nextBtn = hero.querySelector('[data-hero-next]');
      if (prev) {
        prev.addEventListener('click', function() {
          show(current - 1);
          start();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function() {
          show(current + 1);
          start();
        });
      }
      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      start();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function(panel) {
      var scope = panel.closest('main') || document;
      var list = scope.querySelector('[data-card-list]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      var input = panel.querySelector('[data-search-input]');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
      var clear = panel.querySelector('[data-clear-filter]');
      var empty = scope.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);

      if (input && params.get('q')) {
        input.value = params.get('q');
      }
      if (params.get('sort') === 'newest') {
        cards.sort(function(a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }).forEach(function(card) {
          list.appendChild(card);
        });
      }

      function matchCard(card) {
        var query = input ? input.value.trim().toLowerCase() : '';
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(' ').toLowerCase();
        if (query && text.indexOf(query) === -1) {
          return false;
        }
        for (var i = 0; i < selects.length; i += 1) {
          var select = selects[i];
          var key = select.getAttribute('data-filter-select');
          var value = select.value;
          if (value && (card.dataset[key] || '') !== value) {
            return false;
          }
        }
        return true;
      }

      function apply() {
        var visible = 0;
        cards.forEach(function(card) {
          var ok = matchCard(card);
          card.classList.toggle('is-hidden', !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function(select) {
        select.addEventListener('change', apply);
      });
      if (clear) {
        clear.addEventListener('click', function() {
          if (input) {
            input.value = '';
          }
          selects.forEach(function(select) {
            select.value = '';
          });
          apply();
        });
      }
      apply();
    });
  });
})();
