(function () {
    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function card(movie) {
        return [
            '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">',
            '    <a class="poster-link" href="' + escapeHtml(movie.href) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
            '        <span class="poster-gradient"></span>',
            '        <span class="play-chip">播放</span>',
            '    </a>',
            '    <div class="card-body">',
            '        <div class="card-meta">',
            '            <span>' + escapeHtml(movie.year) + '</span>',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '        </div>',
            '        <h3><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="card-tags">',
            '            <a href="' + escapeHtml(movie.categoryHref) + '">' + escapeHtml(movie.categoryName) + '</a>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '        </div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function render() {
        var input = document.querySelector('#siteSearchInput');
        var results = document.querySelector('#searchResults');
        var meta = document.querySelector('#searchMeta');
        var movies = window.MOVIE_INDEX || [];
        if (!input || !results || !meta) {
            return;
        }
        var query = normalize(input.value);
        var matched = movies.filter(function (movie) {
            if (!query) {
                return true;
            }
            return normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags,
                movie.oneLine,
                movie.categoryName
            ].join(' ')).indexOf(query) !== -1;
        });
        var limited = matched.slice(0, 120);
        results.innerHTML = limited.map(card).join('\n');
        meta.innerHTML = '找到 <strong>' + matched.length + '</strong> 个结果，当前展示 ' + limited.length + ' 个。';
    }

    document.addEventListener('DOMContentLoaded', function () {
        var input = document.querySelector('#siteSearchInput');
        var form = document.querySelector('#siteSearchForm');
        if (!input) {
            return;
        }
        input.value = getQuery();
        input.addEventListener('input', render);
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = input.value.trim();
                var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
                window.history.replaceState(null, '', url);
                render();
            });
        }
        render();
    });
}());
