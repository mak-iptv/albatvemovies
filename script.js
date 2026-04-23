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
let swiperInstance = null;

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

// ========== SEASONS & EPISODES ==========
async function loadSeriesSeasonsEpisodes(seriesId) { ... } // i njëjtë
async function populateEpisodes(seriesId, seasonNum) { ... }

// ========== NEW MOVIES SLIDER (ME GABIME) ==========
async function loadNewMoviesSlider() {
    const wrapper = document.getElementById('newMoviesSliderWrapper');
    if (!wrapper) {
        console.error('Slider wrapper not found!');
        return;
    }
    try {
        wrapper.innerHTML = '<div class="swiper-slide">Duke marrë filmat e rinj...</div>';
        const data = await fetchTMDBData('/movie/now_playing', { page: 1 });
        const movies = data.results.slice(0, 15);
        
        if (!movies.length) throw new Error('No movies found');
        
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
        
        // Shkatërro instance ekzistuese nëse ka
        if (swiperInstance) swiperInstance.destroy(true, true);
        
        // Inicializo Swiper-in
        swiperInstance = new Swiper('.new-movies-swiper', {
            slidesPerView: 'auto',
            spaceBetween: 20,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                0: { slidesPerView: 2, spaceBetween: 12 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
            },
            on: {
                init: function() { console.log('Swiper initialized successfully'); },
                error: function(e) { console.error('Swiper error:', e); }
            }
        });
    } catch (error) {
        console.error('Slider error:', error);
        wrapper.innerHTML = '<div class="swiper-slide" style="text-align:center; color:red;">Dështoi ngarkimi i filmave të rinj. Kontrollo lidhjen e internetit.</div>';
        showNotification('Nuk mund të ngarkohen filmat e rinj. Sigurohu që je duke përdorur një server lokal (http://)', 'error');
    }
}

// ========== FUNKSIONET KRYESORE ==========
async function loadFeaturedContent() { ... } // i njëjtë
async function loadAllMovies() { ... }
async function loadAllSeries() { ... }
function loadShqipContent() { ... }
function loadYUContent() { ... }
async function loadTrending() { ... }
async function playMovie(id, title, year) { ... }
async function playTVSeries(id, title, year) { ... }
function playShqipMovie(id) { ... }
function playYUMovie(id) { ... }
async function loadMovieSources(movieId) { ... }
async function loadSeriesSources(seriesId) { ... }
function loadSource(sourceId) { ... }
function playSelectedEpisode() { ... }
function closePlayer() { ... }
function closeYouTubePlayer() { ... }

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
        loadNewMoviesSlider(); // RILOGON SLIDER-IN SA HERTE HAPET HOME
    } else if (sectionId === 'movies') loadAllMovies();
    else if (sectionId === 'series') loadAllSeries();
    else if (sectionId === 'shqip') loadShqipContent();
    else if (sectionId === 'yu') loadYUContent();
    else if (sectionId === 'trending') loadTrending();
}

async function performSearch(query, sourceId) { ... } // i njëjtë
function setupSearchEnter() { ... }

// ========== INIT ==========
window.addEventListener('DOMContentLoaded', () => {
    loadFeaturedContent();
    loadAllMovies();
    loadAllSeries();
    loadShqipContent();
    loadYUContent();
    loadTrending();
    loadNewMoviesSlider();
    showSection('home');
    setupSearchEnter();
    
    // Krijimi i filtrave (i njëjtë)
    ['movies', 'series', 'shqip', 'yu', 'trending'].forEach(s => {
        const filtersDiv = document.getElementById(`${s}Filters`);
        if (!filtersDiv) return;
        let btns = s === 'movies' ? ['all','action','comedy','drama'] : (s === 'series' ? ['all','drama','fantasy'] : (s === 'shqip' ? ['all','drama','classic','comedy'] : (s === 'yu' ? ['all','war','comedy','drama'] : ['all'])));
        btns.forEach(val => {
            const btn = document.createElement('button');
            btn.innerText = val.charAt(0).toUpperCase() + val.slice(1);
            btn.classList.add('filter-btn');
            if (val === 'all') btn.classList.add('active');
            btn.onclick = () => {
                document.querySelectorAll(`#${s}Filters .filter-btn`).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (s === 'yu') { const filtered = (val === 'all') ? getYUMovies() : getYUMovies().filter(m => m.genre.includes(val)); document.getElementById('yuGrid').innerHTML = filtered.map(...); }
                else if (s === 'shqip') loadShqipContent();
                else if (s === 'trending') loadTrending();
                else if (s === 'movies') loadAllMovies();
                else if (s === 'series') loadAllSeries();
            };
            filtersDiv.appendChild(btn);
        });
    });
});

// PWA Installation (i njëjtë)
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
