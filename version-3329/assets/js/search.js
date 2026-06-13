(function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-search-type]');
    var result = document.querySelector('[data-search-results]');
    var note = document.querySelector('[data-search-note]');

    if (!form || !input || !typeSelect || !result || !note || typeof MOVIE_DATA === 'undefined') {
        return;
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (item) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[item];
        });
    }

    function render(items) {
        result.innerHTML = items.map(function (movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '<article class="movie-card">' +
                '<a class="movie-card-link" href="' + escapeHtml(movie.href) + '">' +
                    '<div class="poster-wrap">' +
                        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                        '<span class="play-badge">▶</span>' +
                        '<span class="score-badge">' + escapeHtml(movie.rating) + '</span>' +
                    '</div>' +
                    '<div class="movie-card-body">' +
                        '<h3>' + escapeHtml(movie.title) + '</h3>' +
                        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                        '<div class="movie-meta">' +
                            '<span>' + escapeHtml(movie.region) + '</span>' +
                            '<span>' + escapeHtml(movie.year) + '</span>' +
                            '<span>' + escapeHtml(movie.type) + '</span>' +
                        '</div>' +
                        '<div class="tag-row">' + tags + '</div>' +
                    '</div>' +
                '</a>' +
            '</article>';
        }).join('');
    }

    function search() {
        var keyword = input.value.trim().toLowerCase();
        var type = typeSelect.value;
        var items = MOVIE_DATA.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.oneLine,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();
            var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
            var typeMatched = !type || movie.type === type;
            return keywordMatched && typeMatched;
        }).sort(function (a, b) {
            return b.hot - a.hot;
        });

        note.textContent = items.length ? '找到 ' + items.length + ' 部相关影片' : '没有找到匹配影片';
        render(items.slice(0, 72));
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        search();
    });

    input.addEventListener('input', search);
    typeSelect.addEventListener('change', search);
    search();
})();
