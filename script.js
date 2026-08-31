// ==================== ANTI-DEVTOOLS (PA AUTO REFRESH) ====================
(function() {
    let devToolsOpen = false;
    setInterval(() => {
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        if (widthDiff > 100 || heightDiff > 100) {
            if (!devToolsOpen) {
                devToolsOpen = true;
                console.clear();
                console.log("%cAlbaTV - DevTools u zbulua, por faqja vazhdon normalisht.", "color: orange; font-size: 14px;");
            }
        } else {
            devToolsOpen = false;
        }
    }, 3000);
})();

// ==================== KONFIGURIMI ====================
const TMDB_API_KEY = "dc375cc5d8355f3483fe6fa990736b0e";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// BURIME VIDEO ME MË PAK REKLAMA
const VIDEO_SOURCES = {
    embedSu: { name: "Embed.su", baseUrl: "https://vidsrc-embed.ru/embed/movie/", baseUrlTv: "https://vidsrc-embed.ru/embed/tv/", type: "embed" },
    twoEmbed: { name: "2Embed", baseUrl: "https://www.2embed.cc/embed/", baseUrlTv: "https://www.2embed.cc/embedtv/", type: "embed" },
    vidsrcPro: { name: "VidSrc.pro", baseUrl: "https://vidsrc.sbs/embed/movie/", baseUrlTv: "https://vidsrc.pro/embed/tv/", type: "embed" }
};

let allMovies = [], allSeries = [], shqipMovies = [], yuMovies = [];
let currentMovieData = null, currentSeriesData = null, currentSources = [];
let newMoviesSwiper = null;
let lastActiveSection = 'home'; // Për kthim pas kërkimit

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
    setTimeout(() => notif.remove(), 4000);
}
function animateCounter(elId, target, duration) {
    let el = document.getElementById(elId);
    if (!el) return;
    let increment = target / (duration / 16), current = 0;
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
        { id: '12', title: "BALLË PËR BALLË", year: '1979', thumbnail: 'https://i.ytimg.com/vi/cjFE0aOVv5w/hqdefault.jpg', rating: '8.3', sources: [{ type: 'youtube', videoId: 'cjFE0aOVv5w' }] },
        { id: '17', title: "Triumf Pa Lavdi | Filmi i plotë 2026", year: '2026', thumbnail: 'https://i.ytimg.com/vi/YfMWLJZxT1U/maxresdefault.jpg', rating: '8.3', sources: [{ type: 'youtube', videoId: 'YfMWLJZxT1U' }] },
        { id: '18', title: "Golden Brothers 2 - Filmi i plote - 2026 (4K) | Filmi i plotë 2026", year: '2026', thumbnail: 'https://i.ytimg.com/vi/uoKqqCJvNnY/maxresdefault.jpg', rating: '8.3', sources: [{ type: 'youtube', videoId: 'uoKqqCJvNnY' }] }
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

// ==================== INFO POSHTE PLAYER ====================
async function displayPlayerInfo(type, id, title) {
    const infoDiv = document.getElementById('playerInfo');
    if (!infoDiv) return;
    infoDiv.style.display = 'block';
    infoDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar informacionin...</div>';
    try {
        const endpoint = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
        const [details, credits, videos] = await Promise.all([
            fetchTMDBData(endpoint),
            fetchTMDBData(`${endpoint}/credits`),
            fetchTMDBData(`${endpoint}/videos`)
        ]);
        const cast = credits.cast ? credits.cast.slice(0, 8) : [];
        const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        const year = (details.release_date || details.first_air_date)?.slice(0,4) || 'N/A';
        const runtime = details.runtime ? `${details.runtime} min` : (details.episode_run_time?.[0] ? `${details.episode_run_time[0]} min` : 'N/A');
        const genres = details.genres.map(g => g.name).join(', ');
        
        let castHtml = '';
        if (cast.length) {
            castHtml = `
                <h3><i class="fas fa-users"></i> Aktorët kryesorë</h3>
                <div class="cast-horizontal">
                    ${cast.map(actor => `
                        <div class="cast-card">
                            <img src="${getImageUrl(actor.profile_path, 'w185')}" onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
                            <div class="name">${actor.name}</div>
                            <div class="character">${actor.character || ''}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            castHtml = `<p><i>Nuk ka informacion për aktorët.</i></p>`;
        }
        
        infoDiv.innerHTML = `
            <div class="player-info-container">
                <div class="player-info-left">
                    <h2><i class="fas fa-info-circle"></i> ${details.title || details.name} (${year})</h2>
                    <p><strong>Vlerësim:</strong> ⭐ ${details.vote_average?.toFixed(1)}/10 (${details.vote_count} vota)</p>
                    <p><strong>Zhanri:</strong> ${genres || 'N/A'}</p>
                    <p><strong>Kohëzgjatja:</strong> ${runtime}</p>
                    <p><strong>Përmbajtja:</strong> ${details.overview || 'Nuk ka përshkrim.'}</p>
                    ${trailer ? `<button class="trailer-btn" onclick="playTrailerInPlayer('${trailer.key}')"><i class="fab fa-youtube"></i> Shiko Trailer</button>` : '<p><i>Trailer nuk disponohet</i></p>'}
                </div>
                <div class="player-info-right">
                    ${castHtml}
                </div>
            </div>
        `;
    } catch(e) {
        console.error(e);
        infoDiv.innerHTML = '<p style="color:red;">Dështoi ngarkimi i informacionit.</p>';
    }
}
function displayShqipPlayerInfo(movie) {
    const infoDiv = document.getElementById('playerInfo');
    if (!infoDiv) return;
    infoDiv.style.display = 'block';
    infoDiv.innerHTML = `
        <div class="player-info-container">
            <div class="player-info-left">
                <h2><i class="fas fa-flag"></i> ${movie.title} (${movie.year})</h2>
                <p><strong>Vlerësim:</strong> ⭐ ${movie.rating}/10</p>
                <p><strong>Përshkrimi:</strong> Film shqiptar i vitit ${movie.year}.</p>
            </div>
            <div class="player-info-right">
                <p><i>Aktorët kryesorë: do të shtohen së shpejti.</i></p>
            </div>
        </div>
    `;
}
function displayYUPlayerInfo(movie) {
    const infoDiv = document.getElementById('playerInfo');
    if (!infoDiv) return;
    infoDiv.style.display = 'block';
    infoDiv.innerHTML = `
        <div class="player-info-container">
            <div class="player-info-left">
                <h2><i class="fas fa-landmark"></i> ${movie.title} (${movie.year})</h2>
                <p><strong>Vlerësim:</strong> ⭐ ${movie.rating}/10</p>
                <p><strong>Zhanri:</strong> ${movie.genre?.join(', ')}</p>
                <p><strong>Përshkrimi:</strong> Film klasik jugosllav.</p>
            </div>
            <div class="player-info-right">
                <p><i>Aktorët: Velimir Bata Živojinović, Ljubiša Samardžić etj.</i></p>
            </div>
        </div>
    `;
}
function playTrailerInPlayer(trailerKey) {
    const playerFrame = document.getElementById('playerFrame');
    if (playerFrame) {
        playerFrame.src = `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1`;
        showNotification("Traileri po luhet. Mbyll player-in për të vazhduar filmin.", "info");
    }
}

// ==================== PLAYER & SOURCES ====================
async function loadMovieSources(movieId) {
    let sources = [
        { id: 'embedSu', name: 'Embed.su', url: `${VIDEO_SOURCES.embedSu.baseUrl}${movieId}` },
        { id: 'twoEmbed', name: '2Embed', url: `${VIDEO_SOURCES.twoEmbed.baseUrl}${movieId}` },
        { id: 'vidsrcPro', name: 'VidSrc.pro', url: `${VIDEO_SOURCES.vidsrcPro.baseUrl}${movieId}` }
    ];
    currentSources = sources;
    let btnsDiv = document.getElementById('sourcesButtons');
    if (btnsDiv) btnsDiv.innerHTML = sources.map((s, i) => `<button class="source-btn ${i === 0 ? 'active-source' : ''}" onclick="loadSource('${s.id}')">${s.name}</button>`).join('');
    if (sources.length) loadSource(sources[0].id);
}
async function loadSeriesSources(seriesId) {
    let sources = [
        { id: 'embedSu', name: 'Embed.su', url: `${VIDEO_SOURCES.embedSu.baseUrlTv}${seriesId}/1/1` },
        { id: 'twoEmbed', name: '2Embed', url: `${VIDEO_SOURCES.twoEmbed.baseUrlTv}${seriesId}/1/1` },
        { id: 'vidsrcPro', name: 'VidSrc.pro', url: `${VIDEO_SOURCES.vidsrcPro.baseUrlTv}${seriesId}/1/1` }
    ];
    currentSources = sources;
    let btnsDiv = document.getElementById('sourcesButtons');
    if (btnsDiv) btnsDiv.innerHTML = sources.map((s, i) => `<button class="source-btn ${i === 0 ? 'active-source' : ''}" onclick="loadSource('${s.id}')">${s.name}</button>`).join('');
    if (sources.length) loadSource(sources[0].id);
}
function loadSource(sourceId) {
    let source = currentSources.find(s => s.id === sourceId);
    if (!source) return;
    let playerFrame = document.getElementById('playerFrame');
    if (!playerFrame) return;
    if (currentSeriesData) {
        let season = document.getElementById('seasonSelect')?.value || 1;
        let episode = document.getElementById('episodeSelect')?.value || 1;
        if (sourceId === 'embedSu') playerFrame.src = `${VIDEO_SOURCES.embedSu.baseUrlTv}${currentSeriesData.id}/${season}/${episode}`;
        else if (sourceId === 'twoEmbed') playerFrame.src = `${VIDEO_SOURCES.twoEmbed.baseUrlTv}${currentSeriesData.id}/${season}/${episode}`;
        else if (sourceId === 'vidsrcPro') playerFrame.src = `${VIDEO_SOURCES.vidsrcPro.baseUrlTv}${currentSeriesData.id}/${season}/${episode}`;
        else playerFrame.src = source.url;
    } else {
        playerFrame.src = source.url;
    }
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
    if (!episodeSelect) return;
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
    if (!seasonSelect) return;
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
    const seriesControls = document.getElementById('seriesControls');
    if (seriesControls) seriesControls.style.display = 'none';
    const playerTitle = document.getElementById('playerTitle');
    if (playerTitle) playerTitle.innerHTML = title;
    const playerModal = document.getElementById('playerModal');
    if (playerModal) playerModal.style.display = 'flex';
    const playerInfo = document.getElementById('playerInfo');
    if (playerInfo) playerInfo.style.display = 'none';
    loadMovieSources(id);
    addToWatchHistory(title, year, 'movie', id);
    displayPlayerInfo('movie', id, title);
}
function playTVSeries(id, title, year) {
    currentSeriesData = { id, title, year, type: 'series' };
    const seriesControls = document.getElementById('seriesControls');
    if (seriesControls) seriesControls.style.display = 'flex';
    const playerTitle = document.getElementById('playerTitle');
    if (playerTitle) playerTitle.innerHTML = title;
    const playerModal = document.getElementById('playerModal');
    if (playerModal) playerModal.style.display = 'flex';
    const playerInfo = document.getElementById('playerInfo');
    if (playerInfo) playerInfo.style.display = 'none';
    loadSeriesSources(id);
    loadSeriesSeasonsEpisodes(id);
    addToWatchHistory(title, year, 'series', id);
    displayPlayerInfo('tv', id, title);
}
function playShqipMovie(id) {
    let movie = getShqipMovies().find(m => m.id === id);
    if (!movie) return;
    let src = movie.sources[0];
    currentMovieData = { id: movie.id, title: movie.title, year: movie.year, type: 'shqip' };
    currentSeriesData = null;
    const seriesControls = document.getElementById('seriesControls');
    if (seriesControls) seriesControls.style.display = 'none';
    const playerTitle = document.getElementById('playerTitle');
    if (playerTitle) playerTitle.innerHTML = movie.title;
    const playerModal = document.getElementById('playerModal');
    if (playerModal) playerModal.style.display = 'flex';
    const playerInfo = document.getElementById('playerInfo');
    if (playerInfo) playerInfo.style.display = 'none';
    const playerFrame = document.getElementById('playerFrame');
    if (playerFrame) {
        if (src.type === 'youtube') {
            playerFrame.src = `https://www.youtube-nocookie.com/embed/${src.videoId}?autoplay=1`;
        } else if (src.type === 'dailymotion') {
            playerFrame.src = src.url;
        }
    }
    addToWatchHistory(movie.title, movie.year, 'shqip', id);
    displayShqipPlayerInfo(movie);
}
function playYUMovie(id) {
    let movie = getYUMovies().find(m => m.id === id);
    if (!movie) return;
    let src = movie.sources[0];
    currentMovieData = { id: movie.id, title: movie.title, year: movie.year, type: 'yu' };
    currentSeriesData = null;
    const seriesControls = document.getElementById('seriesControls');
    if (seriesControls) seriesControls.style.display = 'none';
    const playerTitle = document.getElementById('playerTitle');
    if (playerTitle) playerTitle.innerHTML = movie.title;
    const playerModal = document.getElementById('playerModal');
    if (playerModal) playerModal.style.display = 'flex';
    const playerInfo = document.getElementById('playerInfo');
    if (playerInfo) playerInfo.style.display = 'none';
    const playerFrame = document.getElementById('playerFrame');
    if (playerFrame) {
        if (src.type === 'youtube') {
            playerFrame.src = `https://www.youtube-nocookie.com/embed/${src.videoId}?autoplay=1`;
        } else if (src.type === 'dailymotion') {
            playerFrame.src = src.url;
        }
    }
    addToWatchHistory(movie.title, movie.year, 'yu', id);
    displayYUPlayerInfo(movie);
}
function closePlayer() {
    const playerModal = document.getElementById('playerModal');
    if (playerModal) playerModal.style.display = 'none';
    const playerFrame = document.getElementById('playerFrame');
    if (playerFrame) playerFrame.src = '';
    const playerInfo = document.getElementById('playerInfo');
    if (playerInfo) {
        playerInfo.style.display = 'none';
        playerInfo.innerHTML = '';
    }
    currentMovieData = null;
    currentSeriesData = null;
}
function closeYouTubePlayer() {
    const youtubeModal = document.getElementById('youtubeModal');
    if (youtubeModal) youtubeModal.style.display = 'none';
    const youtubeIframe = document.getElementById('youtubeIframe');
    if (youtubeIframe) youtubeIframe.src = '';
}

// ==================== RENDER FUNCTIONS ====================
async function loadNewMoviesSlider() {
    let wrapper = document.getElementById('newMoviesSliderWrapper');
    if (!wrapper) return;
    try {
        let data = await fetchTMDBData('/movie/now_playing', { page: 1 });
        let movies = data.results.slice(0, 15);
        wrapper.innerHTML = movies.map(m => `
            <div class="swiper-slide">
                <div class="movie-card">
                    <img src="${getImageUrl(m.poster_path)}" loading="lazy">
                    <div class="rating"><i class="fas fa-star"></i> ${m.vote_average?.toFixed(1) || 'N/A'}</div>
                    <div class="type-badge" style="background:#2c3e66;">NEW</div>
                    <div class="card-content">
                        <div class="card-title">${m.title}</div>
                        <div class="card-year">${m.release_date?.slice(0,4) || 'N/A'}</div>
                    </div>
                    <button class="info-btn" onclick="event.stopPropagation(); playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')"><i class="fas fa-info-circle"></i></button>
                    <div class="play-center" onclick="event.stopPropagation(); playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')"><i class="fas fa-play"></i></div>
                </div>
            </div>
        `).join('');
        if (window.newMoviesSwiper) window.newMoviesSwiper.destroy(true,true);
        window.newMoviesSwiper = new Swiper('.new-movies-swiper', {
            slidesPerView: 'auto',
            spaceBetween: 20,
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            pagination: { el: '.swiper-pagination', clickable: true },
            breakpoints: { 0: { slidesPerView: 2 }, 640: { slidesPerView: 3 }, 1024: { slidesPerView: 5 } }
        });
    } catch(e) { console.error(e); wrapper.innerHTML = '<div class="loading">Dështoi ngarkimi</div>'; }
}
async function loadFeaturedContent() {
    try {
        let movies = await fetchTMDBData('/movie/popular', { page:1 });
        let series = await fetchTMDBData('/tv/popular', { page:1 });
        let featuredMovies = document.getElementById('featuredMovies');
        let featuredSeries = document.getElementById('featuredSeries');
        let featuredYU = document.getElementById('featuredYU');
        if (featuredMovies) featuredMovies.innerHTML = movies.results.slice(0,6).map(m => `
            <div class="movie-card">
                <img src="${getImageUrl(m.poster_path)}">
                <div class="rating"><i class="fas fa-star"></i> ${m.vote_average.toFixed(1)}</div>
                <div class="type-badge">FILM</div>
                <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0,4)||'N/A'}</div></div>
                <button class="info-btn" onclick="event.stopPropagation(); playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')"><i class="fas fa-info-circle"></i></button>
                <div class="play-center" onclick="event.stopPropagation(); playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')"><i class="fas fa-play"></i></div>
            </div>
        `).join('');
        if (featuredSeries) featuredSeries.innerHTML = series.results.slice(0,6).map(s => `
            <div class="movie-card">
                <img src="${getImageUrl(s.poster_path)}">
                <div class="rating"><i class="fas fa-star"></i> ${s.vote_average.toFixed(1)}</div>
                <div class="type-badge">SERI</div>
                <div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0,4)||'N/A'}</div></div>
                <button class="info-btn" onclick="event.stopPropagation(); playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0,4)||''}')"><i class="fas fa-info-circle"></i></button>
                <div class="play-center" onclick="event.stopPropagation(); playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0,4)||''}')"><i class="fas fa-play"></i></div>
            </div>
        `).join('');
        let yuFeatured = getYUMovies().slice(0,6);
        if (featuredYU) featuredYU.innerHTML = yuFeatured.map(m => `
            <div class="movie-card">
                <img src="${m.thumbnail}">
                <div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
                <div class="type-badge yu-badge">EX YU</div>
                <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
                <button class="info-btn" onclick="event.stopPropagation(); playYUMovie('${m.id}')"><i class="fas fa-info-circle"></i></button>
                <div class="play-center" onclick="event.stopPropagation(); playYUMovie('${m.id}')"><i class="fas fa-play"></i></div>
            </div>
        `).join('');
    } catch(e) { console.error(e); }
}
async function loadAllMovies() {
    let grid = document.getElementById('moviesGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar...</div>';
    let data = await fetchTMDBData('/movie/popular', { page:1 });
    allMovies = data.results;
    grid.innerHTML = allMovies.map(m => `
        <div class="movie-card">
            <img src="${getImageUrl(m.poster_path)}">
            <div class="rating"><i class="fas fa-star"></i> ${m.vote_average.toFixed(1)}</div>
            <div class="type-badge">FILM</div>
            <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0,4)||'N/A'}</div></div>
            <button class="info-btn" onclick="event.stopPropagation(); playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')"><i class="fas fa-info-circle"></i></button>
            <div class="play-center" onclick="event.stopPropagation(); playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')"><i class="fas fa-play"></i></div>
        </div>
    `).join('');
}
async function loadAllSeries() {
    let grid = document.getElementById('seriesGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar...</div>';
    let data = await fetchTMDBData('/tv/popular', { page:1 });
    allSeries = data.results;
    grid.innerHTML = allSeries.map(s => `
        <div class="movie-card">
            <img src="${getImageUrl(s.poster_path)}">
            <div class="rating"><i class="fas fa-star"></i> ${s.vote_average.toFixed(1)}</div>
            <div class="type-badge">SERI</div>
            <div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0,4)||'N/A'}</div></div>
            <button class="info-btn" onclick="event.stopPropagation(); playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0,4)||''}')"><i class="fas fa-info-circle"></i></button>
            <div class="play-center" onclick="event.stopPropagation(); playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0,4)||''}')"><i class="fas fa-play"></i></div>
        </div>
    `).join('');
}
function loadShqipContent() {
    let grid = document.getElementById('shqipGrid');
    if (!grid) return;
    shqipMovies = getShqipMovies();
    grid.innerHTML = shqipMovies.map(m => `
        <div class="movie-card">
            <img src="${m.thumbnail}">
            <div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
            <div class="type-badge shqip-badge">SHQIP</div>
            <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
            <button class="info-btn" onclick="event.stopPropagation(); playShqipMovie('${m.id}')"><i class="fas fa-info-circle"></i></button>
            <div class="play-center" onclick="event.stopPropagation(); playShqipMovie('${m.id}')"><i class="fas fa-play"></i></div>
        </div>
    `).join('');
}
function loadYUContent() {
    let grid = document.getElementById('yuGrid');
    if (!grid) return;
    yuMovies = getYUMovies();
    grid.innerHTML = yuMovies.map(m => `
        <div class="movie-card">
            <img src="${m.thumbnail}">
            <div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
            <div class="type-badge yu-badge">EX YU</div>
            <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
            <button class="info-btn" onclick="event.stopPropagation(); playYUMovie('${m.id}')"><i class="fas fa-info-circle"></i></button>
            <div class="play-center" onclick="event.stopPropagation(); playYUMovie('${m.id}')"><i class="fas fa-play"></i></div>
        </div>
    `).join('');
}
async function loadTrending() {
    let grid = document.getElementById('trendingGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar...</div>';
    let data = await fetchTMDBData('/trending/all/day');
    grid.innerHTML = data.results.slice(0,12).map(i => {
        let isMovie = i.media_type === 'movie';
        let title = i.title || i.name;
        let year = (i.release_date || i.first_air_date)?.slice(0,4) || 'N/A';
        let id = i.id;
        return `
            <div class="movie-card">
                <img src="${getImageUrl(i.poster_path)}">
                <div class="rating"><i class="fas fa-fire"></i> ${i.vote_average?.toFixed(1)}</div>
                <div class="type-badge">TRENDING</div>
                <div class="card-content"><div class="card-title">${title}</div><div class="card-year">${year}</div></div>
                <button class="info-btn" onclick="event.stopPropagation(); ${isMovie ? `playMovie(${id},'${escapeQuote(title)}','${year}')` : `playTVSeries(${id},'${escapeQuote(title)}','${year}')`}"><i class="fas fa-info-circle"></i></button>
                <div class="play-center" onclick="event.stopPropagation(); ${isMovie ? `playMovie(${id},'${escapeQuote(title)}','${year}')` : `playTVSeries(${id},'${escapeQuote(title)}','${year}')`}"><i class="fas fa-play"></i></div>
            </div>
        `;
    }).join('');
}

// ==================== NDRYSHO SHOWSECTION PËR TË MBajtur lastActiveSection ====================
function showSection(sectionId) {
    const sections = ['home', 'movies', 'series', 'shqip', 'yu', 'trending'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const searchSection = document.getElementById('searchResults');
    if (searchSection) searchSection.style.display = 'none';
    
    const activeSection = document.getElementById(sectionId);
    if (!activeSection) {
        console.error(`Seksioni "${sectionId}" nuk u gjet në HTML.`);
        return;
    }
    activeSection.style.display = 'block';
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const activeLink = Array.from(document.querySelectorAll('.nav-link')).find(link => link.getAttribute('onclick')?.includes(`'${sectionId}'`));
    if (activeLink) activeLink.classList.add('active');
    
    // Ruaj sektorin e fundit aktiv për t'u kthyer pas kërkimit
    lastActiveSection = sectionId;
    
    if (sectionId === 'home') { loadFeaturedContent(); animateCounter('movieCount', 10000, 3000); animateCounter('seriesCount', 2000, 2500); animateCounter('yuCount', 500, 2000); loadNewMoviesSlider(); }
    else if (sectionId === 'movies') loadAllMovies();
    else if (sectionId === 'series') loadAllSeries();
    else if (sectionId === 'shqip') loadShqipContent();
    else if (sectionId === 'yu') loadYUContent();
    else if (sectionId === 'trending') loadTrending();
}

// ==================== KËRKIMI GLOBAL I PËRMIRËSUAR ====================
let searchDebounceTimer;
function resetToLastSection() {
    const mainSearch = document.getElementById('mainSearch');
    if (mainSearch && mainSearch.value.trim() === '') {
        const searchSection = document.getElementById('searchResults');
        if (searchSection && searchSection.style.display === 'block') {
            searchSection.style.display = 'none';
            showSection(lastActiveSection);
        }
    }
}

async function performSearch(query, sourceId) {
    if (!query || query.trim().length < 2) return;

    if (sourceId === 'mainSearch') {
        // Fshih të gjithë seksionet dhe shfaq searchResults
        const sections = ['home', 'movies', 'series', 'shqip', 'yu', 'trending'];
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const searchSection = document.getElementById('searchResults');
        if (searchSection) searchSection.style.display = 'block';
        const querySpan = document.getElementById('searchQueryText');
        if (querySpan) querySpan.innerText = query;

        const grid = document.getElementById('globalSearchGrid');
        if (!grid) return;
        grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke kërkuar...</div>';

        try {
            // Kërko njëkohësisht në TMDB dhe lokalet
            const [movieResults, tvResults] = await Promise.all([
                fetchTMDBData('/search/movie', { query: query }),
                fetchTMDBData('/search/tv', { query: query })
            ]);

            const shqipFiltered = getShqipMovies().filter(m => 
                m.title.toLowerCase().includes(query.toLowerCase())
            );
            const yuFiltered = getYUMovies().filter(m => 
                m.title.toLowerCase().includes(query.toLowerCase())
            );

            let combined = [];

            movieResults.results.forEach(m => {
                combined.push({
                    type: 'movie',
                    id: m.id,
                    title: m.title,
                    year: m.release_date?.slice(0,4) || 'N/A',
                    rating: m.vote_average?.toFixed(1),
                    poster: getImageUrl(m.poster_path)
                });
            });
            tvResults.results.forEach(s => {
                combined.push({
                    type: 'tv',
                    id: s.id,
                    title: s.name,
                    year: s.first_air_date?.slice(0,4) || 'N/A',
                    rating: s.vote_average?.toFixed(1),
                    poster: getImageUrl(s.poster_path)
                });
            });
            shqipFiltered.forEach(m => {
                combined.push({
                    type: 'shqip',
                    id: m.id,
                    title: m.title,
                    year: m.year,
                    rating: m.rating,
                    poster: m.thumbnail
                });
            });
            yuFiltered.forEach(m => {
                combined.push({
                    type: 'yu',
                    id: m.id,
                    title: m.title,
                    year: m.year,
                    rating: m.rating,
                    poster: m.thumbnail
                });
            });

            if (combined.length === 0) {
                grid.innerHTML = `<div style="text-align:center; padding:40px;"><i class="fas fa-search"></i> Nuk u gjet asnjë rezultat për "<strong>${escapeQuote(query)}</strong>".<br>Provo me një fjalë tjetër.</div>`;
                return;
            }

            grid.innerHTML = combined.map(item => {
                let badgeClass = '', badgeText = '', playFn = '';
                if (item.type === 'movie') {
                    badgeClass = 'type-badge';
                    badgeText = 'FILM';
                    playFn = `playMovie(${item.id},'${escapeQuote(item.title)}','${item.year}')`;
                } else if (item.type === 'tv') {
                    badgeClass = 'type-badge';
                    badgeText = 'SERI';
                    playFn = `playTVSeries(${item.id},'${escapeQuote(item.title)}','${item.year}')`;
                } else if (item.type === 'shqip') {
                    badgeClass = 'type-badge shqip-badge';
                    badgeText = 'SHQIP';
                    playFn = `playShqipMovie('${item.id}')`;
                } else if (item.type === 'yu') {
                    badgeClass = 'type-badge yu-badge';
                    badgeText = 'EX YU';
                    playFn = `playYUMovie('${item.id}')`;
                }
                return `
                    <div class="movie-card">
                        <img src="${item.poster}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                        <div class="rating"><i class="fas fa-star"></i> ${item.rating || '?'}</div>
                        <div class="${badgeClass}">${badgeText}</div>
                        <div class="card-content">
                            <div class="card-title">${item.title}</div>
                            <div class="card-year">${item.year}</div>
                        </div>
                        <button class="info-btn" onclick="event.stopPropagation(); ${playFn}"><i class="fas fa-info-circle"></i></button>
                        <div class="play-center" onclick="event.stopPropagation(); ${playFn}"><i class="fas fa-play"></i></div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            console.error('Gabim në kërkim:', err);
            grid.innerHTML = '<div style="color:red; text-align:center;"><i class="fas fa-exclamation-triangle"></i> Dështoi lidhja me serverin. Kontrollo internetin dhe provo përsëri.</div>';
        }
        return;
    }

    // Kërkime specifike për seksione (movieSearch, seriesSearch, etj.)
    if (sourceId === 'movieSearch') {
        fetchTMDBData('/search/movie', { query }).then(data => {
            document.getElementById('moviesGrid').innerHTML = data.results.map(m => `
                <div class="movie-card">
                    <img src="${getImageUrl(m.poster_path)}">
                    <div class="rating"><i class="fas fa-star"></i> ${m.vote_average?.toFixed(1)}</div>
                    <div class="type-badge">FILM</div>
                    <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0,4)||'N/A'}</div></div>
                    <button class="info-btn" onclick="event.stopPropagation(); playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')"><i class="fas fa-info-circle"></i></button>
                    <div class="play-center" onclick="event.stopPropagation(); playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')"><i class="fas fa-play"></i></div>
                </div>
            `).join('');
        }).catch(() => showNotification('Gabim në kërkimin e filmave', 'error'));
    } 
    else if (sourceId === 'seriesSearch') {
        fetchTMDBData('/search/tv', { query }).then(data => {
            document.getElementById('seriesGrid').innerHTML = data.results.map(s => `
                <div class="movie-card">
                    <img src="${getImageUrl(s.poster_path)}">
                    <div class="rating"><i class="fas fa-star"></i> ${s.vote_average?.toFixed(1)}</div>
                    <div class="type-badge">SERI</div>
                    <div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0,4)||'N/A'}</div></div>
                    <button class="info-btn" onclick="event.stopPropagation(); playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0,4)||''}')"><i class="fas fa-info-circle"></i></button>
                    <div class="play-center" onclick="event.stopPropagation(); playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0,4)||''}')"><i class="fas fa-play"></i></div>
                </div>
            `).join('');
        }).catch(() => showNotification('Gabim në kërkimin e serialeve', 'error'));
    }
    else if (sourceId === 'shqipSearch') {
        let filtered = getShqipMovies().filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
        document.getElementById('shqipGrid').innerHTML = filtered.map(m => `
            <div class="movie-card">
                <img src="${m.thumbnail}">
                <div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
                <div class="type-badge shqip-badge">SHQIP</div>
                <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
                <button class="info-btn" onclick="event.stopPropagation(); playShqipMovie('${m.id}')"><i class="fas fa-info-circle"></i></button>
                <div class="play-center" onclick="event.stopPropagation(); playShqipMovie('${m.id}')"><i class="fas fa-play"></i></div>
            </div>
        `).join('');
    }
    else if (sourceId === 'yuSearch') {
        let filtered = getYUMovies().filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
        document.getElementById('yuGrid').innerHTML = filtered.map(m => `
            <div class="movie-card">
                <img src="${m.thumbnail}">
                <div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
                <div class="type-badge yu-badge">EX YU</div>
                <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
                <button class="info-btn" onclick="event.stopPropagation(); playYUMovie('${m.id}')"><i class="fas fa-info-circle"></i></button>
                <div class="play-center" onclick="event.stopPropagation(); playYUMovie('${m.id}')"><i class="fas fa-play"></i></div>
            </div>
        `).join('');
    }
    else if (sourceId === 'trendingSearch') {
        fetchTMDBData('/trending/all/day').then(data => {
            let filtered = data.results.filter(i => (i.title || i.name).toLowerCase().includes(query.toLowerCase()));
            document.getElementById('trendingGrid').innerHTML = filtered.map(i => {
                let isMovie = i.media_type === 'movie';
                let title = i.title || i.name;
                let year = (i.release_date || i.first_air_date)?.slice(0,4) || 'N/A';
                return `
                    <div class="movie-card">
                        <img src="${getImageUrl(i.poster_path)}">
                        <div class="rating"><i class="fas fa-fire"></i> ${i.vote_average?.toFixed(1)}</div>
                        <div class="type-badge">TRENDING</div>
                        <div class="card-content"><div class="card-title">${title}</div><div class="card-year">${year}</div></div>
                        <button class="info-btn" onclick="event.stopPropagation(); ${isMovie ? `playMovie(${i.id},'${escapeQuote(title)}','${year}')` : `playTVSeries(${i.id},'${escapeQuote(title)}','${year}')`}"><i class="fas fa-info-circle"></i></button>
                        <div class="play-center" onclick="event.stopPropagation(); ${isMovie ? `playMovie(${i.id},'${escapeQuote(title)}','${year}')` : `playTVSeries(${i.id},'${escapeQuote(title)}','${year}')`}"><i class="fas fa-play"></i></div>
                    </div>
                `;
            }).join('');
        }).catch(() => showNotification('Gabim në kërkimin e trendit', 'error'));
    }
}

function setupSearchEvents() {
    const searchIds = ['mainSearch', 'movieSearch', 'seriesSearch', 'shqipSearch', 'yuSearch', 'trendingSearch'];
    searchIds.forEach(id => {
        let input = document.getElementById(id);
        if (input) {
            input.addEventListener('keypress', e => {
                if (e.key === 'Enter') performSearch(e.target.value, id);
            });
            // Kërkimi live vetëm për kërkimin global
            if (id === 'mainSearch') {
                input.addEventListener('input', (e) => {
                    const val = e.target.value;
                    if (val.trim().length >= 2) {
                        clearTimeout(searchDebounceTimer);
                        searchDebounceTimer = setTimeout(() => performSearch(val, id), 500);
                    } else if (val.trim() === '') {
                        resetToLastSection();
                    }
                });
            }
        }
    });

    // Ikona e xhamit
    const searchIcon = document.querySelector('.search-container .search-icon');
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            const query = document.getElementById('mainSearch').value;
            if (query.trim().length >= 2) {
                performSearch(query, 'mainSearch');
            } else {
                showNotification('Shkruani të paktën 2 shkronja për të kërkuar', 'info');
            }
        });
    }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedContent();
    loadAllMovies();
    loadAllSeries();
    loadShqipContent();
    loadYUContent();
    loadTrending();
    loadNewMoviesSlider();
    showSection('home');
    setupSearchEvents();
});

window.onload = () => {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        let btn = document.getElementById('installButton');
        if (btn) btn.style.display = 'flex';
    });
    document.getElementById('installButton')?.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            document.getElementById('installButton').style.display = 'none';
        }
    });
};

console.log("%c💡 Këshillë: Për një përvojë pa reklama, instaloni shtesën uBlock Origin në shfletuesin tuaj.", "color: #4CAF50; font-size: 14px;");
