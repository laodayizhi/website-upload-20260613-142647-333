(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function protectImages() {
    document.querySelectorAll("img").forEach(function (img) {
      function mark() {
        img.classList.add("is-missing");
      }
      img.addEventListener("error", mark);
      if (img.complete && img.naturalWidth === 0) {
        mark();
      }
    });
  }

  function bindMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
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

    show(0);
    restart();
  }

  function bindFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-card-list]"));
    if (!lists.length) {
      return;
    }

    var input = document.querySelector("[data-filter-input]");
    var region = document.querySelector("[data-filter-region]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");

    function norm(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var q = norm(input && input.value);
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      var y = year ? year.value : "";
      lists.forEach(function (list) {
        Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]")).forEach(function (card) {
          var search = norm(card.getAttribute("data-search"));
          var matchText = !q || search.indexOf(q) !== -1;
          var matchRegion = !r || card.getAttribute("data-region") === r;
          var matchType = !t || card.getAttribute("data-type") === t;
          var matchYear = !y || card.getAttribute("data-year") === y;
          card.classList.toggle("is-hidden", !(matchText && matchRegion && matchType && matchYear));
        });
      });
    }

    [input, region, type, year].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
  }

  ready(function () {
    protectImages();
    bindMenu();
    bindHero();
    bindFilters();
  });
})();
