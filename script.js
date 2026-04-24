const TMDB_API_KEY = "dc375cc5d8355f3483fe6fa990736b0e";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const VIDEO_SOURCES = {
    vidsrc: { name: "VidSrc", baseUrl: "https://vidsrc-embed.ru/embed/movie/", baseUrlTv: "https://vidsrc-embed.ru/embed/tv/", type: "embed" },
    smashy: { name: "Smashy", baseUrl: "https://vidsrcme.su/movie/", baseUrlTv: "https://vidsrcme.su/tv/", type: "embed" },
    vidsrcme: { name: "VidSrc.me", baseUrl: "https://vidsrc.icu/embed/", type: "embed" }
};

let allMovies = [], allSeries = [], shqipMovies = [], yuMovies = [];
let currentMovieData = null, currentSeriesData = null, currentSources = [];
let newMoviesSwiper = null;

function getImageUrl(path, size = 'w500') {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500&q=80';
}
function escapeQuote(text) {
    if (!text) return '';
    return text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}
function showNotification(message, type = 'info') {
    let notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i><span>${message}</span><button onclick="this.parentElement.remove()">&times;</button>`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 5000);
}
function animateCounter(elId, target, duration) {
    let el = document.getElementById(elId);
    if (!el) return;
    let start = 0, increment = target / (duration / 16), current = 0;
    let timer = setInterval(() => {
        current += increment;
        if (current >= target) { el.textContent = target.toLocaleString() + '+'; clearInterval(timer); }
        else el.textContent = Math.floor(current).toLocaleString() + '+';
    }, 16);
}
function addToWatchHistory(title, year, type, id) {
    try {
        let history = JSON.parse(localStorage.getItem('albatv_watch_history')) || [];
        history.unshift({ title, year, type, id, timestamp: new Date().toISOString() });
        history = history.slice(0, 50);
        localStorage.setItem('albatv_watch_history', JSON.stringify(history));
    } catch(e) {}
}
async function fetchTMDBData(endpoint, params = {}) {
    let defaultParams = { api_key: TMDB_API_KEY, language: 'en-US', ...params };
    let url = `${TMDB_BASE_URL}${endpoint}?${new URLSearchParams(defaultParams)}`;
    let res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

// ==================== LOCAL MOVIES ====================
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

// ==================== DETAILS (ACTORS, TRAILER) ====================
async function showDetails(type, id, title) {
    let modal = document.getElementById('detailsModal');
    let content = document.getElementById('detailsContent');
    modal.style.display = 'flex';
    content.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar...</div>';
    try {
        let endpoint = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
        let details = await fetchTMDBData(endpoint);
        let credits = await fetchTMDBData(`${endpoint}/credits`);
        let cast = credits.cast.slice(0, 8);
        let videos = await fetchTMDBData(`${endpoint}/videos`);
        let trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        let year = (details.release_date || details.first_air_date)?.slice(0,4) || 'N/A';
        let runtime = details.runtime ? `${details.runtime} min` : (details.episode_run_time?.[0] ? `${details.episode_run_time[0]} min` : 'N/A');
        let genres = details.genres.map(g => g.name).join(', ');
        content.innerHTML = `
            <h2>${details.title || details.name} (${year})</h2>
            <div style="display:flex; gap:20px; flex-wrap:wrap;">
                <img src="${getImageUrl(details.poster_path, 'w300')}" style="width:150px; border-radius:10px;">
                <div style="flex:1;">
                    <p><strong>Vlerësim:</strong> ⭐ ${details.vote_average?.toFixed(1)}/10 (${details.vote_count} vota)</p>
                    <p><strong>Zhanri:</strong> ${genres}</p>
                    <p><strong>Kohëzgjatja:</strong> ${runtime}</p>
                    <p><strong>Përmbajtja:</strong> ${details.overview || 'Nuk ka përshkrim.'}</p>
                    ${trailer ? `<button class="trailer-btn" onclick="watchTrailer('${trailer.key}')"><i class="fab fa-youtube"></i> Shiko Trailer</button>` : '<p><i>Trailer nuk disponohet</i></p>'}
                </div>
            </div>
            <h3>Aktorët kryesorë</h3>
            <div class="cast-list">
                ${cast.map(actor => `
                    <div class="cast-item">
                        <img src="${getImageUrl(actor.profile_path, 'w185')}" onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
                        <span>${actor.name}</span>
                        <small>${actor.character}</small>
                    </div>
                `).join('')}
            </div>
        `;
    } catch(e) { content.innerHTML = '<p style="color:red;">Dështoi ngarkimi i detajeve.</p>'; }
}
function showShqipDetails(id) {
    let movie = getShqipMovies().find(m => m.id === id);
    if (!movie) return;
    let content = document.getElementById('detailsContent');
    content.innerHTML = `<h2>${movie.title} (${movie.year})</h2><p><strong>Vlerësim:</strong> ⭐ ${movie.rating}/10</p><p>Film shqiptar.</p><button class="trailer-btn" onclick="closeDetailsModal()">Mbylle</button>`;
    document.getElementById('detailsModal').style.display = 'flex';
}
function showYUMovieDetails(id) {
    let movie = getYUMovies().find(m => m.id === id);
    if (!movie) return;
    let content = document.getElementById('detailsContent');
    content.innerHTML = `<h2>${movie.title} (${movie.year})</h2><p><strong>Vlerësim:</strong> ⭐ ${movie.rating}/10</p><p>Zhanri: ${movie.genre?.join(', ')}</p><button class="trailer-btn" onclick="closeDetailsModal()">Mbylle</button>`;
    document.getElementById('detailsModal').style.display = 'flex';
}
function watchTrailer(key) {
    document.getElementById('youtubeTitle').innerHTML = 'Trailer';
    document.getElementById('youtubeIframe').src = `https://www.youtube-nocookie.com/embed/${key}?autoplay=1`;
    document.getElementById('youtubeModal').style.display = 'flex';
    closeDetailsModal();
}
function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
    document.getElementById('detailsContent').innerHTML = '';
}

// ==================== PLAYER & SOURCES ====================
async function loadMovieSources(movieId) {
    let sources = [
        { id: 'vidsrc', name: 'VidSrc', url: `${VIDEO_SOURCES.vidsrc.baseUrl}${movieId}` },
        { id: 'smashy', name: 'Smashy', url: `${VIDEO_SOURCES.smashy.baseUrl}${movieId}` },
        { id: 'vidsrcme', name: 'VidSrc.me', url: `${VIDEO_SOURCES.vidsrcme.baseUrl}?tmdb=${movieId}` }
    ];
    currentSources = sources;
    let btnsDiv = document.getElementById('sourcesButtons');
    btnsDiv.innerHTML = sources.map((s, i) => `<button class="source-btn ${i === 0 ? 'active-source' : ''}" onclick="loadSource('${s.id}')">${s.name}</button>`).join('');
    if (sources.length) loadSource(sources[0].id);
}
async function loadSeriesSources(seriesId) {
    let sources = [
        { id: 'vidsrc', name: 'VidSrc', url: `${VIDEO_SOURCES.vidsrc.baseUrlTv}${seriesId}/1/1` },
        { id: 'smashy', name: 'Smashy', url: `${VIDEO_SOURCES.smashy.baseUrlTv}${seriesId}/1/1` }
    ];
    currentSources = sources;
    let btnsDiv = document.getElementById('sourcesButtons');
    btnsDiv.innerHTML = sources.map((s, i) => `<button class="source-btn ${i === 0 ? 'active-source' : ''}" onclick="loadSource('${s.id}')">${s.name}</button>`).join('');
    if (sources.length) loadSource(sources[0].id);
}
function loadSource(sourceId) {
    let source = currentSources.find(s => s.id === sourceId);
    if (!source) return;
    let playerFrame = document.getElementById('playerFrame');
    if (currentSeriesData) {
        let season = document.getElementById('seasonSelect')?.value || 1;
        let episode = document.getElementById('episodeSelect')?.value || 1;
        if (sourceId === 'vidsrc') playerFrame.src = `${VIDEO_SOURCES.vidsrc.baseUrlTv}${currentSeriesData.id}/${season}/${episode}`;
        else if (sourceId === 'smashy') playerFrame.src = `${VIDEO_SOURCES.smashy.baseUrlTv}${currentSeriesData.id}/${season}/${episode}`;
        else playerFrame.src = source.url;
    } else playerFrame.src = source.url;
    document.querySelectorAll('.source-btn').forEach(btn => btn.classList.remove('active-source'));
    let activeBtn = document.querySelector(`.source-btn[onclick*="${sourceId}"]`);
    if (activeBtn) activeBtn.classList.add('active-source');
}
function playSelectedEpisode() {
    if (!currentSeriesData) return;
    let season = document.getElementById('seasonSelect')?.value;
    let episode = document.getElementById('episodeSelect')?.value;
    if (season && episode) {
        let activeSrc = document.querySelector('.source-btn.active-source');
        if (activeSrc) {
            let match = activeSrc.getAttribute('onclick')?.match(/loadSource\('([^']+)'\)/);
            if (match) loadSource(match[1]);
        }
    }
}
async function populateEpisodes(seriesId, seasonNum) {
    let seasonData = await fetchTMDBData(`/tv/${seriesId}/season/${seasonNum}`);
    let episodeSelect = document.getElementById('episodeSelect');
    episodeSelect.innerHTML = '';
    seasonData.episodes.forEach(ep => {
        let opt = document.createElement('option');
        opt.value = ep.episode_number;
        opt.textContent = `Episodi ${ep.episode_number}: ${ep.name}`;
        episodeSelect.appendChild(opt);
    });
    if (episodeSelect.options.length) episodeSelect.value = 1;
}
async function loadSeriesSeasonsEpisodes(seriesId) {
    let details = await fetchTMDBData(`/tv/${seriesId}`);
    let seasonSelect = document.getElementById('seasonSelect');
    seasonSelect.innerHTML = '';
    details.seasons.forEach(season => {
        if (season.season_number >= 0) {
            let opt = document.createElement('option');
            opt.value = season.season_number;
            opt.textContent = `Sezoni ${season.season_number} (${season.episode_count} episode)`;
            seasonSelect.appendChild(opt);
        }
    });
    if (seasonSelect.options.length) {
        seasonSelect.value = 1;
        await populateEpisodes(seriesId, 1);
    }
    seasonSelect.onchange = async () => { await populateEpisodes(seriesId, seasonSelect.value); playSelectedEpisode(); };
}
function playMovie(id, title, year) {
    currentMovieData = { id, title, year, type: 'movie' };
    currentSeriesData = null;
    document.getElementById('seriesControls').style.display = 'none';
    document.getElementById('playerTitle').innerHTML = title;
    document.getElementById('playerModal').style.display = 'flex';
    loadMovieSources(id);
    addToWatchHistory(title, year, 'movie', id);
}
function playTVSeries(id, title, year) {
    currentSeriesData = { id, title, year, type: 'series' };
    document.getElementById('seriesControls').style.display = 'flex';
    document.getElementById('playerTitle').innerHTML = title;
    document.getElementById('playerModal').style.display = 'flex';
    loadSeriesSources(id);
    loadSeriesSeasonsEpisodes(id);
    addToWatchHistory(title, year, 'series', id);
}
function playShqipMovie(id) {
    let movie = getShqipMovies().find(m => m.id === id);
    if (!movie) return;
    let src = movie.sources[0];
    if (src.type === 'youtube') {
        document.getElementById('youtubeTitle').innerHTML = `${movie.title} (${movie.year}) - SHQIP`;
        document.getElementById('youtubeIframe').src = `https://www.youtube-nocookie.com/embed/${src.videoId}?autoplay=1`;
        document.getElementById('youtubeModal').style.display = 'flex';
    } else if (src.type === 'dailymotion') window.open(src.url, '_blank');
    addToWatchHistory(movie.title, movie.year, 'shqip', id);
}
function playYUMovie(id) {
    let movie = getYUMovies().find(m => m.id === id);
    if (!movie) return;
    let src = movie.sources[0];
    if (src.type === 'youtube') {
        document.getElementById('youtubeTitle').innerHTML = `${movie.title} (${movie.year}) - EX YU`;
        document.getElementById('youtubeIframe').src = `https://www.youtube-nocookie.com/embed/${src.videoId}?autoplay=1`;
        document.getElementById('youtubeModal').style.display = 'flex';
    } else window.open(src.url, '_blank');
    addToWatchHistory(movie.title, movie.year, 'yu', id);
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

// ==================== RENDER FUNCTIONS ====================
async function loadNewMoviesSlider() {
    let wrapper = document.getElementById('newMoviesSliderWrapper');
    let data = await fetchTMDBData('/movie/now_playing', { page: 1 });
    let movies = data.results.slice(0, 15);
    wrapper.innerHTML = movies.map(m => `<div class="swiper-slide"><div class="movie-card" onclick="playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')">
        <img src="${getImageUrl(m.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${m.vote_average?.toFixed(1)}</div>
        <div class="type-badge">NEW</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0,4)||'N/A'}</div></div>
        <button class="info-btn" onclick="event.stopPropagation(); showDetails('movie',${m.id},'${escapeQuote(m.title)}')"><i class="fas fa-info-circle"></i></button>
        <div class="play-overlay"><i class="fas fa-play"></i></div></div></div>`).join('');
    if (window.newMoviesSwiper) window.newMoviesSwiper.destroy(true,true);
    window.newMoviesSwiper = new Swiper('.new-movies-swiper', { slidesPerView:'auto', spaceBetween:20, navigation:{nextEl:'.swiper-button-next',prevEl:'.swiper-button-prev'}, pagination:{el:'.swiper-pagination',clickable:true}, breakpoints:{0:{slidesPerView:2},640:{slidesPerView:3},1024:{slidesPerView:5}} });
}
async function loadFeaturedContent() {
    let movies = await fetchTMDBData('/movie/popular', { page:1 });
    let series = await fetchTMDBData('/tv/popular', { page:1 });
    let featuredMovies = document.getElementById('featuredMovies');
    let featuredSeries = document.getElementById('featuredSeries');
    let featuredYU = document.getElementById('featuredYU');
    featuredMovies.innerHTML = movies.results.slice(0,6).map(m => `<div class="movie-card" onclick="playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')"><img src="${getImageUrl(m.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${m.vote_average.toFixed(1)}</div><div class="type-badge">FILM</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0,4)||'N/A'}</div></div><button class="info-btn" onclick="event.stopPropagation(); showDetails('movie',${m.id},'${escapeQuote(m.title)}')"><i class="fas fa-info-circle"></i></button><div class="play-overlay"><i class="fas fa-play"></i></div></div>`).join('');
    featuredSeries.innerHTML = series.results.slice(0,6).map(s => `<div class="movie-card" onclick="playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0,4)||''}')"><img src="${getImageUrl(s.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${s.vote_average.toFixed(1)}</div><div class="type-badge">SERI</div><div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0,4)||'N/A'}</div></div><button class="info-btn" onclick="event.stopPropagation(); showDetails('tv',${s.id},'${escapeQuote(s.name)}')"><i class="fas fa-info-circle"></i></button><div class="play-overlay"><i class="fas fa-play"></i></div></div>`).join('');
    let yuFeatured = getYUMovies().slice(0,6);
    featuredYU.innerHTML = yuFeatured.map(m => `<div class="movie-card" onclick="playYUMovie('${m.id}')"><img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div><div class="type-badge yu-badge">EX YU</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div><button class="info-btn" onclick="event.stopPropagation(); showYUMovieDetails('${m.id}')"><i class="fas fa-info-circle"></i></button><div class="play-overlay"><i class="fas fa-play"></i></div></div>`).join('');
}
async function loadAllMovies() {
    let grid = document.getElementById('moviesGrid');
    let data = await fetchTMDBData('/movie/popular', { page:1 });
    allMovies = data.results;
    grid.innerHTML = allMovies.map(m => `<div class="movie-card" onclick="playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')"><img src="${getImageUrl(m.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${m.vote_average.toFixed(1)}</div><div class="type-badge">FILM</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0,4)||'N/A'}</div></div><button class="info-btn" onclick="event.stopPropagation(); showDetails('movie',${m.id},'${escapeQuote(m.title)}')"><i class="fas fa-info-circle"></i></button><div class="play-overlay"><i class="fas fa-play"></i></div></div>`).join('');
}
async function loadAllSeries() {
    let grid = document.getElementById('seriesGrid');
    let data = await fetchTMDBData('/tv/popular', { page:1 });
    allSeries = data.results;
    grid.innerHTML = allSeries.map(s => `<div class="movie-card" onclick="playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0,4)||''}')"><img src="${getImageUrl(s.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${s.vote_average.toFixed(1)}</div><div class="type-badge">SERI</div><div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0,4)||'N/A'}</div></div><button class="info-btn" onclick="event.stopPropagation(); showDetails('tv',${s.id},'${escapeQuote(s.name)}')"><i class="fas fa-info-circle"></i></button><div class="play-overlay"><i class="fas fa-play"></i></div></div>`).join('');
}
function loadShqipContent() {
    let grid = document.getElementById('shqipGrid');
    shqipMovies = getShqipMovies();
    grid.innerHTML = shqipMovies.map(m => `<div class="movie-card" onclick="playShqipMovie('${m.id}')"><img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div><div class="type-badge shqip-badge">SHQIP</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div><button class="info-btn" onclick="event.stopPropagation(); showShqipDetails('${m.id}')"><i class="fas fa-info-circle"></i></button><div class="play-overlay"><i class="fas fa-play"></i></div></div>`).join('');
}
function loadYUContent() {
    let grid = document.getElementById('yuGrid');
    yuMovies = getYUMovies();
    grid.innerHTML = yuMovies.map(m => `<div class="movie-card" onclick="playYUMovie('${m.id}')"><img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div><div class="type-badge yu-badge">EX YU</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div><button class="info-btn" onclick="event.stopPropagation(); showYUMovieDetails('${m.id}')"><i class="fas fa-info-circle"></i></button><div class="play-overlay"><i class="fas fa-play"></i></div></div>`).join('');
}
async function loadTrending() {
    let grid = document.getElementById('trendingGrid');
    let data = await fetchTMDBData('/trending/all/day');
    grid.innerHTML = data.results.slice(0,12).map(i => {
        let isMovie = i.media_type === 'movie';
        let title = i.title || i.name;
        let year = (i.release_date || i.first_air_date)?.slice(0,4) || 'N/A';
        let id = i.id;
        return `<div class="movie-card" onclick="${isMovie ? `playMovie(${id},'${escapeQuote(title)}','${year}')` : `playTVSeries(${id},'${escapeQuote(title)}','${year}')`}"><img src="${getImageUrl(i.poster_path)}"><div class="rating"><i class="fas fa-fire"></i> ${i.vote_average?.toFixed(1)}</div><div class="type-badge">TRENDING</div><div class="card-content"><div class="card-title">${title}</div><div class="card-year">${year}</div></div><button class="info-btn" onclick="event.stopPropagation(); ${isMovie ? `showDetails('movie',${id},'${escapeQuote(title)}')` : `showDetails('tv',${id},'${escapeQuote(title)}')`}"><i class="fas fa-info-circle"></i></button><div class="play-overlay"><i class="fas fa-play"></i></div></div>`;
    }).join('');
}
function showSection(sectionId) {
    ['home','movies','series','shqip','yu','trending'].forEach(s => { let el = document.getElementById(s); if(el) el.style.display = 'none'; });
    document.getElementById(sectionId).style.display = 'block';
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    let activeLink = Array.from(document.querySelectorAll('.nav-link')).find(link => link.getAttribute('onclick')?.includes(`'${sectionId}'`));
    if (activeLink) activeLink.classList.add('active');
    if (sectionId === 'home') { loadFeaturedContent(); animateCounter('movieCount', 10000, 3000); animateCounter('seriesCount', 2000, 2500); animateCounter('yuCount', 500, 2000); loadNewMoviesSlider(); }
    else if (sectionId === 'movies') loadAllMovies();
    else if (sectionId === 'series') loadAllSeries();
    else if (sectionId === 'shqip') loadShqipContent();
    else if (sectionId === 'yu') loadYUContent();
    else if (sectionId === 'trending') loadTrending();
}
function performSearch(query, sourceId) {
    if (!query || query.length < 2) return;
    if (sourceId === 'movieSearch') fetchTMDBData('/search/movie', { query }).then(data => { document.getElementById('moviesGrid').innerHTML = data.results.map(m => `<div class="movie-card" onclick="playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')"><img src="${getImageUrl(m.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${m.vote_average?.toFixed(1)}</div><div class="type-badge">FILM</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0,4)||'N/A'}</div></div><button class="info-btn" onclick="event.stopPropagation(); showDetails('movie',${m.id},'${escapeQuote(m.title)}')"><i class="fas fa-info-circle"></i></button><div class="play-overlay"><i class="fas fa-play"></i></div></div>`).join(''); });
    else if (sourceId === 'seriesSearch') fetchTMDBData('/search/tv', { query }).then(data => { document.getElementById('seriesGrid').innerHTML = data.results.map(s => `<div class="movie-card" onclick="playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0,4)||''}')"><img src="${getImageUrl(s.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${s.vote_average?.toFixed(1)}</div><div class="type-badge">SERI</div><div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0,4)||'N/A'}</div></div><button class="info-btn" onclick="event.stopPropagation(); showDetails('tv',${s.id},'${escapeQuote(s.name)}')"><i class="fas fa-info-circle"></i></button><div class="play-overlay"><i class="fas fa-play"></i></div></div>`).join(''); });
    else if (sourceId === 'shqipSearch') { let filtered = getShqipMovies().filter(m => m.title.toLowerCase().includes(query.toLowerCase())); document.getElementById('shqipGrid').innerHTML = filtered.map(m => `<div class="movie-card" onclick="playShqipMovie('${m.id}')"><img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div><div class="type-badge shqip-badge">SHQIP</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div><button class="info-btn" onclick="event.stopPropagation(); showShqipDetails('${m.id}')"><i class="fas fa-info-circle"></i></button><div class="play-overlay"><i class="fas fa-play"></i></div></div>`).join(''); }
    else if (sourceId === 'yuSearch') { let filtered = getYUMovies().filter(m => m.title.toLowerCase().includes(query.toLowerCase())); document.getElementById('yuGrid').innerHTML = filtered.map(m => `<div class="movie-card" onclick="playYUMovie('${m.id}')"><img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div><div class="type-badge yu-badge">EX YU</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div><button class="info-btn" onclick="event.stopPropagation(); showYUMovieDetails('${m.id}')"><i class="fas fa-info-circle"></i></button><div class="play-overlay"><i class="fas fa-play"></i></div></div>`).join(''); }
    else if (sourceId === 'trendingSearch') fetchTMDBData('/trending/all/day').then(data => { let filtered = data.results.filter(i => (i.title || i.name).toLowerCase().includes(query.toLowerCase())); document.getElementById('trendingGrid').innerHTML = filtered.map(i => { let isMovie = i.media_type === 'movie'; let title = i.title || i.name; let year = (i.release_date || i.first_air_date)?.slice(0,4)||'N/A'; return `<div class="movie-card" onclick="${isMovie ? `playMovie(${i.id},'${escapeQuote(title)}','${year}')` : `playTVSeries(${i.id},'${escapeQuote(title)}','${year}')`}"><img src="${getImageUrl(i.poster_path)}"><div class="rating"><i class="fas fa-fire"></i> ${i.vote_average?.toFixed(1)}</div><div class="card-content"><div class="card-title">${title}</div><div class="card-year">${year}</div></div><button class="info-btn" onclick="event.stopPropagation(); ${isMovie ? `showDetails('movie',${i.id},'${escapeQuote(title)}')` : `showDetails('tv',${i.id},'${escapeQuote(title)}')`}"><i class="fas fa-info-circle"></i></button><div class="play-overlay"><i class="fas fa-play"></i></div></div>`; }).join(''); });
}
function setupSearchEnter() {
    ['mainSearch', 'movieSearch', 'seriesSearch', 'shqipSearch', 'yuSearch', 'trendingSearch'].forEach(id => {
        let input = document.getElementById(id);
        if (input) input.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(e.target.value, id); });
    });
}
window.onload = () => {
    loadFeaturedContent(); loadAllMovies(); loadAllSeries(); loadShqipContent(); loadYUContent(); loadTrending(); loadNewMoviesSlider();
    showSection('home'); setupSearchEnter();
    // filters dummy
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; let btn = document.getElementById('installButton'); if(btn) btn.style.display = 'flex'; });
    document.getElementById('installButton')?.addEventListener('click', async () => { if(deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; document.getElementById('installButton').style.display = 'none'; } });
};
window.onclick = function(event) { let modal = document.getElementById('detailsModal'); if (event.target === modal) closeDetailsModal(); };
