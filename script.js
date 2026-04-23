const TMDB_API_KEY = "dc375cc5d8355f3483fe6fa990736b0e";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const VIDEO_SOURCES = {
    vidsrc: { name: "VidSrc", baseUrl: "https://vidsrc-embed.ru/embed/movie/", baseUrlTv: "https://vidsrc-embed.ru/embed/tv/", type: "embed" },
    smashy: { name: "Smashy", baseUrl: "https://vidsrcme.su/movie/", baseUrlTv: "https://vidsrcme.su/tv/", type: "embed" },
    vidsrcme: { name: "VidSrc.me", baseUrl: "https://vidsrc.icu/embed/", type: "embed" }
};

let allMovies = [], allSeries = [], shqipMovies = [], yuMovies = [];
let currentMovieData = null, currentSeriesData = null, currentSources = [];
let currentSeason = 1, currentEpisode = 1;
let newMoviesSwiper = null;

function getImageUrl(path, size = 'w500') {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500&q=80';
}

function escapeQuote(text) {
    if (!text) return '';
    return text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i><span>${message}</span><button onclick="this.parentElement.remove()">&times;</button>`;
    document.body.appendChild(notif);
    setTimeout(() => { if (notif.parentElement) notif.remove(); }, 5000);
}

function animateCounter(elementId, target, duration) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let start = 0, increment = target / (duration / 16), current = 0;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            el.textContent = target.toLocaleString() + '+';
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(current).toLocaleString() + '+';
        }
    }, 16);
}

function addToWatchHistory(title, year, type, id) {
    try {
        let history = JSON.parse(localStorage.getItem('albatv_watch_history')) || [];
        history.unshift({ title, year, type, id, timestamp: new Date().toISOString() });
        history = history.slice(0, 50);
        localStorage.setItem('albatv_watch_history', JSON.stringify(history));
    } catch (e) { }
}

async function fetchTMDBData(endpoint, params = {}) {
    const defaultParams = { api_key: TMDB_API_KEY, language: 'en-US', ...params };
    const url = `${TMDB_BASE_URL}${endpoint}?${new URLSearchParams(defaultParams)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

// ==================== FILMAT SHQIPTARE ====================
function getShqipMovies() {
    return [
        { id: '1', title: "BESNIKERIA DHE BUJARIA", year: '2019', thumbnail: 'https://i.ytimg.com/vi/cbhgvrJfLx8/hqdefault.jpg', rating: '8.2', sources: [{ type: 'youtube', videoId: 'cbhgvrJfLx8' }] },
        { id: '13', title: "EGO - Filmi i plote | 4K", year: '2019', thumbnail: 'https://i.ytimg.com/vi/-OzYN6oUjNQ/hqdefault.jpg', rating: '8.2', sources: [{ type: 'youtube', videoId: '-OzYN6oUjNQ' }] },
        { id: '2', title: "ZONJA NGA QYTETI", year: '1980', thumbnail: 'https://i.ytimg.com/vi/a8Ol-g13zAQ/hqdefault.jpg', rating: '8.2', sources: [{ type: 'youtube', videoId: 'a8Ol-g13zAQ' }] },
        { id: '3', title: "A FRIEND FROM VILLAGE", year: '1980', thumbnail: 'https://i.ytimg.com/vi/Q8aFkR5VKuM/hqdefault.jpg', rating: '7.8', sources: [{ type: 'youtube', videoId: 'Q8aFkR5VKuM' }] },
        { id: '4', title: "ÇIFTI I LUMTUR", year: '1975', thumbnail: 'https://i.ytimg.com/vi/wHDRtwM6gUU/hqdefault.jpg', rating: '8.0', sources: [{ type: 'youtube', videoId: 'wHDRtwM6gUU' }] },
        { id: '5', title: "BESA E KUQE", year: '1982', thumbnail: 'https://i.ytimg.com/vi/FktxciPxG54/hqdefault.jpg', rating: '7.5', sources: [{ type: 'youtube', videoId: 'FktxciPxG54' }] },
        { id: '6', title: "FESTA E MADHE", year: '1981', thumbnail: 'https://i.ytimg.com/vi/eAUOydt6H44/hqdefault.jpg', rating: '8.5', sources: [{ type: 'youtube', videoId: 'eAUOydt6H44' }] },
        { id: '7', title: "FRAKTURA", year: '1983', thumbnail: 'https://i.ytimg.com/vi/eB_lZBCfe9Y/hqdefault.jpg', rating: '8.1', sources: [{ type: 'youtube', videoId: 'eB_lZBCfe9Y' }] },
        { id: '8', title: "TANA", year: '1958', thumbnail: 'https://i.ytimg.com/vi/En051KxETvw/hqdefault.jpg', rating: '8.5', sources: [{ type: 'youtube', videoId: 'En051KxETvw' }] },
        { id: '9', title: "DEBATIK", year: '1961', thumbnail: 'https://i.ytimg.com/vi/mYaNJiVUGPQ/hqdefault.jpg', rating: '8.0', sources: [{ type: 'youtube', videoId: 'mYaNJiVUGPQ' }] },
        { id: '10', title: "NJË DJALË DHE NJË VAJZË", year: '1980', thumbnail: 'https://i.ytimg.com/vi/xi3va550WP4/hqdefault.jpg', rating: '7.9', sources: [{ type: 'youtube', videoId: 'xi3va550WP4' }] },
        { id: '11', title: "Dashuria s'mjafton", year: '2019', thumbnail: 'https://i.ytimg.com/vi/fabFTlOQD_k/hqdefault.jpg', rating: '8.1', sources: [{ type: 'youtube', videoId: 'fabFTlOQD_k' }] },
        { id: '14', title: "Filmi Rikonstruksioni", year: '1988', thumbnail: 'https://i.ytimg.com/vi/OK99Ast0sSE/hqdefault.jpg', rating: '8.1', sources: [{ type: 'youtube', videoId: 'OK99Ast0sSE' }] },
        { id: '15', title: "Unë e dua Erën", year: '1991', thumbnail: 'https://s1.dmcdn.net/1/Z3sIA1elov-uFoUyY/856x480f', rating: '8.1', sources: [{ type: 'dailymotion', videoId: 'x9q7eru', url: 'https://www.dailymotion.com/embed/video/x9q7eru' }] },
        { id: '16', title: "Yjet e neteve te gjata", year: '1972', thumbnail: 'https://image.tmdb.org/t/p/w500/4B2XRnN0YyX6caqp5VAPFkn3rmq.jpg', rating: '8.1', sources: [{ type: 'dailymotion', videoId: 'x9qbsdu', url: 'https://www.dailymotion.com/embed/video/x9qbsdu' }] },
        { id: '12', title: "BALLË PËR BALLË", year: '1979', thumbnail: 'https://i.ytimg.com/vi/cjFE0aOVv5w/hqdefault.jpg', rating: '8.3', sources: [{ type: 'youtube', videoId: 'cjFE0aOVv5w' }] }
    ];
}

// ==================== FILMAT JUGOSLLAVË ====================
function getYUMovies() {
    return [
        { id: 'yu1', title: "BALKAN EKSPRES", year: '1983', thumbnail: 'https://i.ytimg.com/vi/s1QoFXgzVpU/hqdefault.jpg', rating: '8.7', genre: ['comedy'], sources: [{ type: 'youtube', videoId: 's1QoFXgzVpU' }] },
        { id: 'yu2', title: "KO TO TAMO PEVA", year: '1980', thumbnail: 'https://i.ytimg.com/vi/ZwozSLas8DM/hqdefault.jpg', rating: '9.0', genre: ['war','comedy'], sources: [{ type: 'youtube', videoId: 'ZwozSLas8DM' }] },
        { id: 'yu3', title: "BITKA NA NERETVI", year: '1969', thumbnail: 'https://i.ytimg.com/vi/rOAlNgxKVHk/hqdefault.jpg', rating: '7.8', genre: ['war'], sources: [{ type: 'youtube', videoId: 'rOAlNgxKVHk' }] },
        { id: 'yu4', title: "MARATONCI TRCE PASTASNI KRUG", year: '1982', thumbnail: 'https://m.media-amazon.com/images/M/MV5BODViMmFmMmMtYTViNS00OGY3LTkwYzQtNzk5ZTVhNTZhZWZlXkEyXkFqcGc@._V1_FMjpg_UY3492_.jpg', rating: '8.5', genre: ['comedy'], sources: [{ type: 'dailymotion', videoId: 'x9mtnqq', url: 'https://www.dailymotion.com/embed/video/x9mtnqq' }] },
        { id: 'yu5', title: "SUTJESKA", year: '1973', thumbnail: 'https://i.ytimg.com/vi/At4tQRmduB4/hqdefault.jpg', rating: '7.5', genre: ['war'], sources: [{ type: 'youtube', videoId: 'At4tQRmduB4' }] },
        { id: 'yu6', title: "DOM ZA VESANJE", year: '1988', thumbnail: 'https://i.ytimg.com/vi/9rOoX3PDZzY/hqdefault.jpg', rating: '8.7', genre: ['drama'], sources: [{ type: 'youtube', videoId: '9rOoX3PDZzY' }] },
        { id: 'yu7', title: "OTAC NA SLUZBENOM PUTU", year: '1985', thumbnail: 'https://i.ytimg.com/vi/YdTdLIVk7pU/hqdefault.jpg', rating: '8.3', genre: ['drama'], sources: [{ type: 'youtube', videoId: 'YdTdLIVk7pU' }] },
        { id: 'yu8', title: "VALTER BRANI SARAJEVO", year: '1972', thumbnail: 'https://i.ytimg.com/vi/ZVHMocrBurQ/hqdefault.jpg', rating: '8.2', genre: ['war','action'], sources: [{ type: 'youtube', videoId: 'ZVHMocrBurQ' }] },
        { id: 'yu9', title: "TITO I JA", year: '1972', thumbnail: 'https://i0.wp.com/easterneuropeanmovies.com/wp-content/uploads/449-2.jpg?fit=740%2C1040&ssl=1', rating: '7.9', genre: ['comedy','war'], sources: [{ type: 'dailymotion', videoId: 'x90pw9g', url: 'https://www.dailymotion.com/embed/video/x90pw9g' }] },
        { id: 'yu10', title: "Nema problema - HD", year: '1984', thumbnail: 'https://i.ytimg.com/vi/2GliQKXYg_c/hqdefault.jpg', rating: '8.1', genre: ['comedy','romance'], sources: [{ type: 'youtube', videoId: '2GliQKXYg_c' }] },
        { id: 'yu11', title: "Ludi dani", year: '1974', thumbnail: 'https://i.ytimg.com/vi/PvRtv3GgYR8/hqdefault.jpg', rating: '7.7', genre: ['crime','drama'], sources: [{ type: 'youtube', videoId: 'PvRtv3GgYR8' }] },
        { id: 'yu12', title: "UZICKA REPUBLIKA", year: '1974', thumbnail: 'https://i.ytimg.com/vi/tWn8-LoFIi8/hqdefault.jpg', rating: '7.8', genre: ['war','history'], sources: [{ type: 'youtube', videoId: 'tWn8-LoFIi8' }] }
    ];
}

// ========== SEASONS & EPISODES FOR SERIES ==========
async function loadSeriesSeasonsEpisodes(seriesId) {
    try {
        const details = await fetchTMDBData(`/tv/${seriesId}`);
        const seasonSelect = document.getElementById('seasonSelect');
        const episodeSelect = document.getElementById('episodeSelect');
        if (!seasonSelect) return;
        seasonSelect.innerHTML = '';
        details.seasons.forEach(season => {
            if (season.season_number > 0 || season.season_number === 0) {
                const option = document.createElement('option');
                option.value = season.season_number;
                option.textContent = `Sezoni ${season.season_number} (${season.episode_count} episode)`;
                seasonSelect.appendChild(option);
            }
        });
        if (seasonSelect.options.length) {
            seasonSelect.value = 1;
            await populateEpisodes(seriesId, 1);
        }
        seasonSelect.addEventListener('change', async () => {
            const newSeason = parseInt(seasonSelect.value);
            await populateEpisodes(seriesId, newSeason);
        });
    } catch (e) { console.error(e); showNotification('Dështoi ngarkimi i sezoneve', 'error'); }
}

async function populateEpisodes(seriesId, seasonNum) {
    try {
        const seasonData = await fetchTMDBData(`/tv/${seriesId}/season/${seasonNum}`);
        const episodeSelect = document.getElementById('episodeSelect');
        if (!episodeSelect) return;
        episodeSelect.innerHTML = '';
        seasonData.episodes.forEach(ep => {
            const option = document.createElement('option');
            option.value = ep.episode_number;
            option.textContent = `Episodi ${ep.episode_number}: ${ep.name}`;
            episodeSelect.appendChild(option);
        });
        if (episodeSelect.options.length) {
            episodeSelect.value = 1;
            currentSeason = seasonNum;
            currentEpisode = 1;
        }
    } catch (e) { console.error(e); }
}

// ========== NEW MOVIES SLIDER ==========
async function loadNewMoviesSlider() {
    const wrapper = document.getElementById('newMoviesSliderWrapper');
    if (!wrapper) return;
    try {
        const data = await fetchTMDBData('/movie/now_playing', { page: 1 });
        const movies = data.results.slice(0, 15);
        wrapper.innerHTML = movies.map(m => `
            <div class="swiper-slide">
                <div class="movie-card" onclick="playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0, 4) || ''}')">
                    <img src="${getImageUrl(m.poster_path)}" loading="lazy">
                    <div class="rating"><i class="fas fa-star"></i> ${m.vote_average?.toFixed(1) || 'N/A'}</div>
                    <div class="type-badge" style="background:#2c3e66;">NEW</div>
                    <div class="card-content">
                        <div class="card-title">${m.title}</div>
                        <div class="card-year">${m.release_date?.slice(0, 4) || 'N/A'}</div>
                    </div>
                </div>
            </div>
        `).join('');
        if (window.newMoviesSwiper) window.newMoviesSwiper.destroy(true, true);
        window.newMoviesSwiper = new Swiper('.new-movies-swiper', {
            slidesPerView: 'auto',
            spaceBetween: 20,
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            pagination: { el: '.swiper-pagination', clickable: true },
            breakpoints: { 0: { slidesPerView: 2, spaceBetween: 12 }, 640: { slidesPerView: 3 }, 1024: { slidesPerView: 5 } }
        });
    } catch (error) {
        console.error(error);
        wrapper.innerHTML = '<div class="loading">Dështoi ngarkimi i filmave të rinj</div>';
    }
}

// ========== MAIN RENDERING ==========
async function loadFeaturedContent() {
    try {
        const movies = await fetchTMDBData('/movie/popular', { page: 1 });
        const series = await fetchTMDBData('/tv/popular', { page: 1 });
        const featuredMovies = document.getElementById('featuredMovies');
        const featuredSeries = document.getElementById('featuredSeries');
        const featuredYU = document.getElementById('featuredYU');
        if (featuredMovies) {
            featuredMovies.innerHTML = movies.results.slice(0, 6).map(m => `
                <div class="featured-card" onclick="playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0, 4) || ''}')">
                    <img src="${getImageUrl(m.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${m.vote_average.toFixed(1)}</div>
                    <div class="type-badge">FILM</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0, 4) || 'N/A'}</div></div>
                </div>
            `).join('');
        }
        if (featuredSeries) {
            featuredSeries.innerHTML = series.results.slice(0, 6).map(s => `
                <div class="featured-card" onclick="playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0, 4) || ''}')">
                    <img src="${getImageUrl(s.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${s.vote_average.toFixed(1)}</div>
                    <div class="type-badge">SERI</div><div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0, 4) || 'N/A'}</div></div>
                </div>
            `).join('');
        }
        const yuFeatured = getYUMovies().slice(0, 6);
        if (featuredYU) {
            featuredYU.innerHTML = yuFeatured.map(m => `
                <div class="featured-card" onclick="playYUMovie('${m.id}')">
                    <img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
                    <div class="type-badge yu-badge">EX YU</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
                </div>
            `).join('');
        }
    } catch (e) { console.error(e); }
}

async function loadAllMovies() {
    const grid = document.getElementById('moviesGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar...</div>';
    const data = await fetchTMDBData('/movie/popular', { page: 1 });
    allMovies = data.results;
    grid.innerHTML = allMovies.map(m => `
        <div class="movie-card" onclick="playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0, 4) || ''}')">
            <img src="${getImageUrl(m.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${m.vote_average.toFixed(1)}</div>
            <div class="type-badge">FILM</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0, 4) || 'N/A'}</div></div>
        </div>
    `).join('');
}

async function loadAllSeries() {
    const grid = document.getElementById('seriesGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar...</div>';
    const data = await fetchTMDBData('/tv/popular', { page: 1 });
    allSeries = data.results;
    grid.innerHTML = allSeries.map(s => `
        <div class="movie-card" onclick="playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0, 4) || ''}')">
            <img src="${getImageUrl(s.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${s.vote_average.toFixed(1)}</div>
            <div class="type-badge">SERI</div><div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0, 4) || 'N/A'}</div></div>
        </div>
    `).join('');
}

function loadShqipContent() {
    shqipMovies = getShqipMovies();
    const grid = document.getElementById('shqipGrid');
    if (!grid) return;
    grid.innerHTML = shqipMovies.map(m => `
        <div class="movie-card" onclick="playShqipMovie('${m.id}')">
            <img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
            <div class="type-badge shqip-badge"><i class="fas fa-flag"></i> SHQIP</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
        </div>
    `).join('');
}

function loadYUContent() {
    yuMovies = getYUMovies();
    const grid = document.getElementById('yuGrid');
    if (!grid) return;
    grid.innerHTML = yuMovies.map(m => `
        <div class="movie-card" onclick="playYUMovie('${m.id}')">
            <img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
            <div class="type-badge yu-badge">EX YU</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
        </div>
    `).join('');
}

async function loadTrending() {
    const grid = document.getElementById('trendingGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar...</div>';
    const data = await fetchTMDBData('/trending/all/day');
    grid.innerHTML = data.results.slice(0, 12).map(i => {
        const isMovie = i.media_type === 'movie';
        const title = i.title || i.name;
        const year = (i.release_date || i.first_air_date)?.slice(0, 4) || 'N/A';
        return `
            <div class="movie-card" onclick="${isMovie ? `playMovie(${i.id},'${escapeQuote(title)}','${year}')` : `playTVSeries(${i.id},'${escapeQuote(title)}','${year}')`}">
                <img src="${getImageUrl(i.poster_path)}"><div class="rating"><i class="fas fa-fire" style="color:#ff6b6b;"></i> ${i.vote_average?.toFixed(1) || 'N/A'}</div>
                <div class="type-badge" style="background:#ff6b6b;">TRENDING</div><div class="card-content"><div class="card-title">${title}</div><div class="card-year">${year}</div></div>
            </div>
        `;
    }).join('');
}

async function playMovie(id, title, year) {
    currentMovieData = { id, title, year, type: 'movie' };
    currentSeriesData = null;
    document.getElementById('seriesControls').style.display = 'none';
    document.getElementById('sourcesContainer').style.display = 'block';
    document.getElementById('playerTitle').innerHTML = title;
    document.getElementById('playerModal').style.display = 'flex';
    await loadMovieSources(id);
    addToWatchHistory(title, year, 'movie', id);
}

async function playTVSeries(id, title, year) {
    currentSeriesData = { id, title, year, type: 'series' };
    document.getElementById('seriesControls').style.display = 'flex';
    document.getElementById('sourcesContainer').style.display = 'block';
    document.getElementById('playerTitle').innerHTML = title;
    document.getElementById('playerModal').style.display = 'flex';
    await loadSeriesSources(id);
    await loadSeriesSeasonsEpisodes(id);
    addToWatchHistory(title, year, 'series', id);
}

function playShqipMovie(id) {
    const movie = getShqipMovies().find(m => m.id === id);
    if (!movie) return;
    const src = movie.sources[0];
    if (src.type === 'youtube') {
        document.getElementById('youtubeTitle').innerHTML = `${movie.title} (${movie.year}) - FILM SHQIP`;
        document.getElementById('youtubeIframe').src = `https://www.youtube-nocookie.com/embed/${src.videoId}?autoplay=1&rel=0`;
        document.getElementById('youtubeModal').style.display = 'flex';
    } else if (src.type === 'dailymotion') {
        window.open(src.url, '_blank');
    }
    addToWatchHistory(movie.title, movie.year, 'shqip', id);
}

function playYUMovie(id) {
    const movie = getYUMovies().find(m => m.id === id);
    if (!movie) return;
    const src = movie.sources[0];
    if (src.type === 'youtube') {
        document.getElementById('youtubeTitle').innerHTML = `${movie.title} (${movie.year}) - JUGOSLLAV FILM`;
        document.getElementById('youtubeIframe').src = `https://www.youtube-nocookie.com/embed/${src.videoId}?autoplay=1&rel=0`;
        document.getElementById('youtubeModal').style.display = 'flex';
    } else {
        window.open(src.url, '_blank');
    }
    addToWatchHistory(movie.title, movie.year, 'yu', id);
}

async function loadMovieSources(movieId) {
    const sources = [
        { id: 'vidsrc', name: 'VidSrc', url: `${VIDEO_SOURCES.vidsrc.baseUrl}${movieId}` },
        { id: 'smashy', name: 'Smashy', url: `${VIDEO_SOURCES.smashy.baseUrl}${movieId}` },
        { id: 'vidsrcme', name: 'VidSrc.me', url: `${VIDEO_SOURCES.vidsrcme.baseUrl}?tmdb=${movieId}` }
    ];
    currentSources = sources;
    const btnsDiv = document.getElementById('sourcesButtons');
    if (btnsDiv) {
        btnsDiv.innerHTML = sources.map((s, i) => `<button class="source-btn ${i === 0 ? 'active-source' : ''}" onclick="loadSource('${s.id}')">${s.name}</button>`).join('');
    }
    if (sources.length) loadSource(sources[0].id);
}

async function loadSeriesSources(seriesId) {
    const sources = [
        { id: 'vidsrc', name: 'VidSrc', url: `${VIDEO_SOURCES.vidsrc.baseUrlTv}${seriesId}/1/1` },
        { id: 'smashy', name: 'Smashy', url: `${VIDEO_SOURCES.smashy.baseUrlTv}${seriesId}/1/1` }
    ];
    currentSources = sources;
    const btnsDiv = document.getElementById('sourcesButtons');
    if (btnsDiv) {
        btnsDiv.innerHTML = sources.map((s, i) => `<button class="source-btn ${i === 0 ? 'active-source' : ''}" onclick="loadSource('${s.id}')">${s.name}</button>`).join('');
    }
    if (sources.length) loadSource(sources[0].id);
}

function loadSource(sourceId) {
    const source = currentSources.find(s => s.id === sourceId);
    if (!source) return;
    const playerFrame = document.getElementById('playerFrame');
    if (!playerFrame) return;
    if (currentSeriesData) {
        const season = document.getElementById('seasonSelect')?.value || 1;
        const episode = document.getElementById('episodeSelect')?.value || 1;
        if (sourceId === 'vidsrc') {
            playerFrame.src = `${VIDEO_SOURCES.vidsrc.baseUrlTv}${currentSeriesData.id}/${season}/${episode}`;
        } else if (sourceId === 'smashy') {
            playerFrame.src = `${VIDEO_SOURCES.smashy.baseUrlTv}${currentSeriesData.id}/${season}/${episode}`;
        } else {
            playerFrame.src = source.url;
        }
    } else {
        playerFrame.src = source.url;
    }
    document.querySelectorAll('.source-btn').forEach(btn => btn.classList.remove('active-source'));
    const activeBtn = document.querySelector(`.source-btn[onclick*="${sourceId}"]`);
    if (activeBtn) activeBtn.classList.add('active-source');
}

function playSelectedEpisode() {
    if (!currentSeriesData) return;
    const season = document.getElementById('seasonSelect')?.value;
    const episode = document.getElementById('episodeSelect')?.value;
    if (season && episode) {
        currentSeason = parseInt(season);
        currentEpisode = parseInt(episode);
        const activeSource = document.querySelector('.source-btn.active-source');
        if (activeSource) {
            const onclickAttr = activeSource.getAttribute('onclick');
            const match = onclickAttr?.match(/loadSource\('([^']+)'\)/);
            if (match) loadSource(match[1]);
        }
    }
}

function closePlayer() {
    document.getElementById('playerModal').style.display = 'none';
    document.getElementById('playerFrame').src = '';
    currentMovieData = null;
    currentSeriesData = null;
}

function closeYouTubePlayer() {
    document.getElementById('youtubeModal').style.display = 'none';
    document.getElementById('youtubeIframe').src = '';
}

function showSection(sectionId) {
    const sections = ['home', 'movies', 'series', 'shqip', 'yu', 'trending'];
    sections.forEach(s => { const el = document.getElementById(s); if (el) el.style.display = 'none'; });
    document.getElementById(sectionId).style.display = 'block';
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const activeLink = Array.from(document.querySelectorAll('.nav-link')).find(link => link.getAttribute('onclick')?.includes(`'${sectionId}'`));
    if (activeLink) activeLink.classList.add('active');
    if (sectionId === 'home') {
        loadFeaturedContent();
        animateCounter('movieCount', 10000, 3000);
        animateCounter('seriesCount', 2000, 2500);
        animateCounter('yuCount', 500, 2000);
        loadNewMoviesSlider();
    } else if (sectionId === 'movies') loadAllMovies();
    else if (sectionId === 'series') loadAllSeries();
    else if (sectionId === 'shqip') loadShqipContent();
    else if (sectionId === 'yu') loadYUContent();
    else if (sectionId === 'trending') loadTrending();
}

async function performSearch(query, sourceId) {
    if (!query || query.length < 2) return;
    if (sourceId === 'movieSearch') {
        const data = await fetchTMDBData('/search/movie', { query });
        document.getElementById('moviesGrid').innerHTML = data.results.map(m => `
            <div class="movie-card" onclick="playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4) || ''}')">
                <img src="${getImageUrl(m.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${m.vote_average?.toFixed(1) || 'N/A'}</div>
                <div class="type-badge">FILM</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0,4) || 'N/A'}</div></div>
            </div>
        `).join('');
    } else if (sourceId === 'seriesSearch') {
        const data = await fetchTMDBData('/search/tv', { query });
        document.getElementById('seriesGrid').innerHTML = data.results.map(s => `
            <div class="movie-card" onclick="playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0,4) || ''}')">
                <img src="${getImageUrl(s.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${s.vote_average?.toFixed(1) || 'N/A'}</div>
                <div class="type-badge">SERI</div><div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0,4) || 'N/A'}</div></div>
            </div>
        `).join('');
    } else if (sourceId === 'shqipSearch') {
        const filtered = getShqipMovies().filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
        document.getElementById('shqipGrid').innerHTML = filtered.map(m => `
            <div class="movie-card" onclick="playShqipMovie('${m.id}')">
                <img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
                <div class="type-badge shqip-badge">SHQIP</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
            </div>
        `).join('');
    } else if (sourceId === 'yuSearch') {
        const filtered = getYUMovies().filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
        document.getElementById('yuGrid').innerHTML = filtered.map(m => `
            <div class="movie-card" onclick="playYUMovie('${m.id}')">
                <img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
                <div class="type-badge yu-badge">EX YU</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
            </div>
        `).join('');
    } else if (sourceId === 'trendingSearch') {
        const data = await fetchTMDBData('/trending/all/day');
        const filtered = data.results.filter(i => (i.title || i.name).toLowerCase().includes(query.toLowerCase()));
        document.getElementById('trendingGrid').innerHTML = filtered.map(i => {
            const isMovie = i.media_type === 'movie';
            const title = i.title || i.name;
            const year = (i.release_date || i.first_air_date)?.slice(0,4) || 'N/A';
            return `<div class="movie-card" onclick="${isMovie ? `playMovie(${i.id},'${escapeQuote(title)}','${year}')` : `playTVSeries(${i.id},'${escapeQuote(title)}','${year}')`}">
                        <img src="${getImageUrl(i.poster_path)}"><div class="rating"><i class="fas fa-fire"></i> ${i.vote_average?.toFixed(1) || 'N/A'}</div>
                        <div class="card-content"><div class="card-title">${title}</div><div class="card-year">${year}</div></div>
                    </div>`;
        }).join('');
    }
}

function setupSearchEnter() {
    ['mainSearch', 'movieSearch', 'seriesSearch', 'shqipSearch', 'yuSearch', 'trendingSearch'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(e.target.value, id); });
    });
}

window.onload = () => {
    loadFeaturedContent();
    loadAllMovies();
    loadAllSeries();
    loadShqipContent();
    loadYUContent();
    loadTrending();
    loadNewMoviesSlider();
    showSection('home');
    setupSearchEnter();
    ['movies', 'series', 'shqip', 'yu', 'trending'].forEach(s => {
        const filtersDiv = document.getElementById(`${s}Filters`);
        if (filtersDiv) {
            let btns = s === 'movies' ? ['all','action','comedy','drama'] : (s === 'series' ? ['all','drama','fantasy'] : (s === 'shqip' ? ['all','drama','classic','comedy'] : (s === 'yu' ? ['all','war','comedy','drama'] : ['all'])));
            btns.forEach(val => {
                const btn = document.createElement('button');
                btn.innerText = val.charAt(0).toUpperCase() + val.slice(1);
                btn.classList.add('filter-btn');
                if (val === 'all') btn.classList.add('active');
                btn.onclick = () => {
                    document.querySelectorAll(`#${s}Filters .filter-btn`).forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    if (s === 'yu') { const filtered = (val === 'all') ? getYUMovies() : getYUMovies().filter(m => m.genre.includes(val)); document.getElementById('yuGrid').innerHTML = filtered.map(m => `<div class="movie-card" onclick="playYUMovie('${m.id}')"><img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div><div class="type-badge yu-badge">EX YU</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div></div>`).join(''); }
                    else if (s === 'shqip') loadShqipContent();
                    else if (s === 'trending') loadTrending();
                    else if (s === 'movies') loadAllMovies();
                    else if (s === 'series') loadAllSeries();
                };
                filtersDiv.appendChild(btn);
            });
        }
    });
};

// PWA Installation
let deferredPrompt;
const installBtn = document.getElementById('installButton');
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'flex';
});
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; installBtn.style.display = 'none'; }
    });
}
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(err => console.log(err)); }); }
