const TMDB_API_KEY = "dc375cc5d8355f3483fe6fa990736b0e";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const VIDEO_SOURCES = {
    vidsrc: { name: "VidSrc", baseUrl: "https://vidsrc.icu/embed/movie/", baseUrlTv: "https://vidsrc.icu/embed/tv/", type: "embed" },
    smashy: { name: "Smashy", baseUrl: "https://embed.smashystream.com/movie/", baseUrlTv: "https://embed.smashystream.com/tv/", type: "embed" },
    vidsrcme: { name: "VidSrc.me", baseUrl: "https://vidsrc.icu/embed/", type: "embed" }
};

let allMovies = [], allSeries = [], shqipMovies = [], yuMovies = [];
let currentMovieData = null, currentSeriesData = null, currentSources = [];

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
        {
            id: '1',
            title: "BESNIKERIA DHE BUJARIA",
            year: '2019',
            thumbnail: 'https://i.ytimg.com/vi/cbhgvrJfLx8/hqdefault.jpg',
            rating: '8.2',
            description: "Film klasik shqiptar",
            duration: '98 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=cbhgvrJfLx8',
                    type: 'youtube',
                    videoId: 'cbhgvrJfLx8'
                }
            ]
        },
        {
            id: '13',
            title: "EGO - Filmi i plote | 4K - English subtitles",
            year: '2019',
            thumbnail: 'https://i.ytimg.com/vi/-OzYN6oUjNQ/hqdefault.jpg',
            rating: '8.2',
            description: "Film klasik shqiptar",
            duration: '98 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=-OzYN6oUjNQ',
                    type: 'youtube',
                    videoId: '-OzYN6oUjNQ'
                }
            ]
        },
        {
            id: '2',
            title: "ZONJA NGA QYTETI",
            year: '1980',
            thumbnail: 'https://i.ytimg.com/vi/a8Ol-g13zAQ/hqdefault.jpg',
            rating: '8.2',
            description: 'Film shqiptar klasik',
            duration: '98 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=a8Ol-g13zAQ',
                    type: 'youtube',
                    videoId: 'a8Ol-g13zAQ'
                }
            ]
        },
        {
            id: '3',
            title: "A FRIEND FROM VILLAGE",
            year: '1980',
            thumbnail: 'https://i.ytimg.com/vi/Q8aFkR5VKuM/hqdefault.jpg',
            rating: '7.8',
            description: 'Film shqiptar',
            duration: '105 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=Q8aFkR5VKuM',
                    type: 'youtube',
                    videoId: 'Q8aFkR5VKuM'
                }
            ]
        },
        {
            id: '4',
            title: "ÇIFTI I LUMTUR",
            year: '1975',
            thumbnail: 'https://i.ytimg.com/vi/wHDRtwM6gUU/hqdefault.jpg',
            rating: '8.0',
            description: 'Komedi romantike shqiptare',
            duration: '95 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=wHDRtwM6gUU',
                    type: 'youtube',
                    videoId: 'wHDRtwM6gUU'
                }
            ]
        },
        {
            id: '5',
            title: "BESA E KUQE",
            year: '1982',
            thumbnail: 'https://i.ytimg.com/vi/FktxciPxG54/hqdefault.jpg',
            rating: '7.5',
            description: 'Dramë shqiptare',
            duration: '102 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=FktxciPxG54',
                    type: 'youtube',
                    videoId: 'FktxciPxG54'
                }
            ]
        },
        {
            id: '6',
            title: "FESTA E MADHE",
            year: '1981',
            thumbnail: 'https://i.ytimg.com/vi/eAUOydt6H44/hqdefault.jpg',
            rating: '8.5',
            description: 'Dokumentar shqiptar',
            duration: '90 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=eAUOydt6H44',
                    type: 'youtube',
                    videoId: 'eAUOydt6H44'
                }
            ]
        },
        {
            id: '7',
            title: "FRAKTURA",
            year: '1983',
            thumbnail: 'https://i.ytimg.com/vi/eB_lZBCfe9Y/hqdefault.jpg',
            rating: '8.1',
            description: 'Dramë shqiptare',
            duration: '102 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=eB_lZBCfe9Y',
                    type: 'youtube',
                    videoId: 'eB_lZBCfe9Y'
                }
            ]
        },
        {
            id: '8',
            title: "TANA",
            year: '1958',
            thumbnail: 'https://i.ytimg.com/vi/En051KxETvw/hqdefault.jpg',
            rating: '8.5',
            description: 'Film i parë shqiptar',
            duration: '102 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=En051KxETvw',
                    type: 'youtube',
                    videoId: 'En051KxETvw'
                }
            ]
        },
        {
            id: '9',
            title: "DEBATIK",
            year: '1961',
            thumbnail: 'https://i.ytimg.com/vi/mYaNJiVUGPQ/hqdefault.jpg',
            rating: '8.0',
            description: 'Film shqiptar klasik',
            duration: '105 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=mYaNJiVUGPQ',
                    type: 'youtube',
                    videoId: 'mYaNJiVUGPQ'
                }
            ]
        },
        {
            id: '10',
            title: "NJË DJALË DHE NJË VAJZË",
            year: '1980',
            thumbnail: 'https://i.ytimg.com/vi/xi3va550WP4/hqdefault.jpg',
            rating: '7.9',
            description: 'Romancë shqiptare',
            duration: '95 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=xi3va550WP4',
                    type: 'youtube',
                    videoId: 'xi3va550WP4'
                }
            ]
        },
        {
            id: '11',
            title: "Dashuria s'mjafton - Filmi i plote (with english subtitles)",
            year: '2019',
            thumbnail: 'https://i.ytimg.com/vi/fabFTlOQD_k/hqdefault.jpg',
            rating: '8.1',
            description: 'Film shqiptar: Krim, Aksion, Drame',
            duration: '96 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?si=9BT8W40T0G4i8yJt&v=fabFTlOQD_k&feature=youtu.be',
                    type: 'youtube',
                    videoId: 'fabFTlOQD_k'
                }
            ]
        },
        {
            id: '14',
            title: "Filmi Rikonstruksioni  ",
            year: '1988',
            thumbnail: 'https://i.ytimg.com/vi/OK99Ast0sSE/hqdefault.jpg',
            rating: '8.1',
            description: 'Film shqiptar',
            duration: '96 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=OK99Ast0sSE',
                    type: 'youtube',
                    videoId: 'OK99Ast0sSE'
                }
            ]
        },
        {
            id: '15',
            title: "Unë e dua Erën ",
            year: '1991',
            thumbnail: 'https://s1.dmcdn.net/1/Z3sIA1elov-uFoUyY/856x480f',
            rating: '8.1',
            description: 'Film shqiptar',
            duration: '96 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.dailymotion.com/embed/video/x9q7eru',
                    type: 'dailymotion',
                    videoId: 'x9q7eru'
                }
            ]
        },
        {
            id: '16',
            title: "Yjet e neteve te gjata",
            year: '1972',
            thumbnail: 'https://image.tmdb.org/t/p/w500/4B2XRnN0YyX6caqp5VAPFkn3rmq.jpg',
            rating: '8.1',
            description: 'Film shqiptar',
            duration: '96 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.dailymotion.com/embed/video/x9qbsdu',
                    type: 'dailymotion',
                    videoId: 'x9qbsdu'
                }
            ]
        },

        {
            id: '12',
            title: "BALLË PËR BALLË",
            year: '1979',
            thumbnail: 'https://i.ytimg.com/vi/cjFE0aOVv5w/hqdefault.jpg',
            rating: '8.3',
            description: 'Dramë shqiptare',
            duration: '98 min',
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=cjFE0aOVv5w',
                    type: 'youtube',
                    videoId: 'cjFE0aOVv5w'
                }
            ]
        }
    ];
}

// ==================== FILMAT JUGOSLLAVË ====================
function getYUMovies() {
    return [
        {
            id: 'yu1',
            title: "BALKAN EKSPRES",
            year: '1983',
            thumbnail: 'https://i.ytimg.com/vi/s1QoFXgzVpU/hqdefault.jpg',
            rating: '8.7',
            description: "Komedi klasike jugosllave",
            duration: '102 min',
            genre: ['comedy', 'classic'],
            director: "Branko Baletic",
            country: "Jugoslavia",
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=s1QoFXgzVpU',
                    type: 'youtube',
                    videoId: 's1QoFXgzVpU'
                }
            ]
        },
        {
            id: 'yu2',
            title: "KO TO TAMO PEVA",
            year: '1980',
            thumbnail: 'https://i.ytimg.com/vi/ZwozSLas8DM/hqdefault.jpg',
            rating: '9.0',
            description: "Film antilufte klasik",
            duration: '96 min',
            genre: ['war', 'comedy', 'classic'],
            director: "Slobodan Sijan",
            country: "Jugoslavia",
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=ZwozSLas8DM',
                    type: 'youtube',
                    videoId: 'ZwozSLas8DM'
                }
            ]
        },
        {
            id: 'yu3',
            title: "BITKA NA NERETVI",
            year: '1969',
            thumbnail: 'https://i.ytimg.com/vi/rOAlNgxKVHk/hqdefault.jpg',
            rating: '7.8',
            description: "Epik lufte me Yul Brynner",
            duration: '175 min',
            genre: ['war', 'drama', 'classic'],
            director: "Veljko Bulajic",
            country: "Jugoslavia",
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=rOAlNgxKVHk',
                    type: 'youtube',
                    videoId: 'rOAlNgxKVHk'
                }
            ]
        },
        {
            id: 'yu4',
            title: "MARATONCI TRCE PASTASNI KRUG",
            year: '1982',
            thumbnail: 'https://m.media-amazon.com/images/M/MV5BODViMmFmMmMtYTViNS00OGY3LTkwYzQtNzk5ZTVhNTZhZWZlXkEyXkFqcGc@._V1_FMjpg_UY3492_.jpg',
            rating: '8.5',
            description: "Satirë sociale",
            duration: '120 min',
            genre: ['comedy', 'drama', 'classic'],
            director: "Slobodan Sijan",
            country: "Jugoslavia",
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.dailymotion.com/embed/video/x9mtnqq',
                    type: 'dailymotion',
                    videoId: 'x9mtnqq'
                }
            ]
        },
        {
            id: 'yu5',
            title: "SUTJESKA",
            year: '1973',
            thumbnail: 'https://i.ytimg.com/vi/At4tQRmduB4/hqdefault.jpg',
            rating: '7.5',
            description: "Film lufte me Richard Burton",
            duration: '117 min',
            genre: ['war', 'drama', 'classic'],
            director: "Stipe Delic",
            country: "Jugoslavia",
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=At4tQRmduB4',
                    type: 'youtube',
                    videoId: 'At4tQRmduB4'
                }
            ]
        },
        {
            id: 'yu6',
            title: "DOM ZA VESANJE",
            year: '1988',
            thumbnail: 'https://i.ytimg.com/vi/9rOoX3PDZzY/hqdefault.jpg',
            rating: '8.7',
            description: "Dramë rome",
            duration: '142 min',
            genre: ['drama', 'classic'],
            director: "Emir Kusturica",
            country: "Jugoslavia",
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=9rOoX3PDZzY',
                    type: 'youtube',
                    videoId: '9rOoX3PDZzY'
                }
            ]
        },
        {
            id: 'yu7',
            title: "OTAC NA SLUZBENOM PUTU",
            year: '1985',
            thumbnail: 'https://i.ytimg.com/vi/YdTdLIVk7pU/hqdefault.jpg',
            rating: '8.3',
            description: "Dramë familjare",
            duration: '136 min',
            genre: ['drama', 'classic'],
            director: "Emir Kusturica",
            country: "Jugoslavia",
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=YdTdLIVk7pU',
                    type: 'youtube',
                    videoId: 'YdTdLIVk7pU'
                }
            ]
        },
        {
            id: 'yu8',
            title: "VALTER BRANI SARAJEVO",
            year: '1972',
            thumbnail: 'https://i.ytimg.com/vi/ZVHMocrBurQ/hqdefault.jpg',
            rating: '8.2',
            description: "Klasik i luftës",
            duration: '133 min',
            genre: ['war', 'action', 'classic'],
            director: "Hajrudin Krvavac",
            country: "Jugoslavia",
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=ZVHMocrBurQ',
                    type: 'youtube',
                    videoId: 'ZVHMocrBurQ'
                }
            ]
        },
        {
            id: 'yu9',
            title: "TITO I JA",
            year: '1972',
            thumbnail: 'https://i0.wp.com/easterneuropeanmovies.com/wp-content/uploads/449-2.jpg?fit=740%2C1040&ssl=1',
            rating: '7.9',
            description: "Komedi partizane",
            duration: '91 min',
            genre: ['comedy', 'war'],
            director: "Miodrag Popovic",
            country: "Jugoslavia",
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.dailymotion.com/embed/video/x90pw9g',
                    type: 'dailymotion',
                    videoId: 'x90pw9g'
                }
            ]
        },
        {
            id: 'yu10',
            title: "Nema problema - HD ",
            year: '1984',
            thumbnail: 'https://i.ytimg.com/vi/2GliQKXYg_c/hqdefault.jpg',
            rating: '8.1',
            description: "Komedi romantike",
            duration: '92 min',
            genre: ['comedy', 'romance'],
            director: "Rajko Grlic",
            country: "Jugoslavia",
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=2GliQKXYg_c',
                    type: 'youtube',
                    videoId: '2GliQKXYg_c'
                }
            ]
        },
        {
            id: 'yu11',
            title: "Ludi dani",
            year: '1974',
            thumbnail: 'https://i.ytimg.com/vi/PvRtv3GgYR8/hqdefault.jpg',
            rating: '7.7',
            description: "Kriminal thriller",
            duration: '94 min',
            genre: ['crime', 'drama'],
            director: "Zivojin Pavlovic",
            country: "Jugoslavia",
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=PvRtv3GgYR8',
                    type: 'youtube',
                    videoId: 'PvRtv3GgYR8'
                }
            ]
        },
        {
            id: 'yu12',
            title: "UZICKA REPUBLIKA",
            year: '1974',
            thumbnail: 'https://i.ytimg.com/vi/tWn8-LoFIi8/hqdefault.jpg',
            rating: '7.8',
            description: "Epik historik",
            duration: '170 min',
            genre: ['war', 'history'],
            director: "Zika Mitrovic",
            country: "Jugoslavia",
            sources: [
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=tWn8-LoFIi8',
                    type: 'youtube',
                    videoId: 'tWn8-LoFIi8'
                }
            ]
        }
    ];
}

// ================================================================

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
                    <img src="${getImageUrl(m.poster_path)}">
                    <div class="rating"><i class="fas fa-star"></i> ${m.vote_average.toFixed(1)}</div>
                    <div class="type-badge">FILM</div>
                    <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0, 4) || 'N/A'}</div></div>
                </div>
            `).join('');
        }
        if (featuredSeries) {
            featuredSeries.innerHTML = series.results.slice(0, 6).map(s => `
                <div class="featured-card" onclick="playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0, 4) || ''}')">
                    <img src="${getImageUrl(s.poster_path)}">
                    <div class="rating"><i class="fas fa-star"></i> ${s.vote_average.toFixed(1)}</div>
                    <div class="type-badge">SERI</div>
                    <div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0, 4) || 'N/A'}</div></div>
                </div>
            `).join('');
        }
        const yuFeatured = getYUMovies().slice(0, 6);
        if (featuredYU) {
            featuredYU.innerHTML = yuFeatured.map(m => `
                <div class="featured-card" onclick="playYUMovie('${m.id}')">
                    <img src="${m.thumbnail}">
                    <div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
                    <div class="type-badge yu-badge">EX YU</div>
                    <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
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
            <img src="${getImageUrl(m.poster_path)}">
            <div class="rating"><i class="fas fa-star"></i> ${m.vote_average.toFixed(1)}</div>
            <div class="type-badge">FILM</div>
            <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0, 4) || 'N/A'}</div></div>
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
            <img src="${getImageUrl(s.poster_path)}">
            <div class="rating"><i class="fas fa-star"></i> ${s.vote_average.toFixed(1)}</div>
            <div class="type-badge">SERI</div>
            <div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0, 4) || 'N/A'}</div></div>
        </div>
    `).join('');
}

function loadShqipContent() {
    shqipMovies = getShqipMovies();
    const grid = document.getElementById('shqipGrid');
    if (!grid) return;
    grid.innerHTML = shqipMovies.map(m => `
        <div class="movie-card" onclick="playShqipMovie('${m.id}')">
            <img src="${m.thumbnail}">
            <div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
            <div class="type-badge shqip-badge"><i class="fas fa-flag"></i> SHQIP</div>
            <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
        </div>
    `).join('');
}

function loadYUContent() {
    yuMovies = getYUMovies();
    const grid = document.getElementById('yuGrid');
    if (!grid) return;
    grid.innerHTML = yuMovies.map(m => `
        <div class="movie-card" onclick="playYUMovie('${m.id}')">
            <img src="${m.thumbnail}">
            <div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
            <div class="type-badge yu-badge">EX YU</div>
            <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
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
                <img src="${getImageUrl(i.poster_path)}">
                <div class="rating"><i class="fas fa-fire" style="color:#ff6b6b;"></i> ${i.vote_average?.toFixed(1) || 'N/A'}</div>
                <div class="type-badge" style="background:#ff6b6b;">TRENDING</div>
                <div class="card-content"><div class="card-title">${title}</div><div class="card-year">${year}</div></div>
            </div>
        `;
    }).join('');
}

async function playMovie(id, title, year) {
    currentMovieData = { id, title, year, type: 'movie' };
    currentSeriesData = null;
    const seriesControls = document.getElementById('seriesControls');
    const sourcesContainer = document.getElementById('sourcesContainer');
    const playerTitle = document.getElementById('playerTitle');
    const playerModal = document.getElementById('playerModal');
    if (seriesControls) seriesControls.style.display = 'none';
    if (sourcesContainer) sourcesContainer.style.display = 'block';
    if (playerTitle) playerTitle.innerHTML = title;
    if (playerModal) playerModal.style.display = 'flex';
    await loadMovieSources(id);
    addToWatchHistory(title, year, 'movie', id);
}

async function playTVSeries(id, title, year) {
    currentSeriesData = { id, title, year, type: 'series' };
    const seriesControls = document.getElementById('seriesControls');
    const sourcesContainer = document.getElementById('sourcesContainer');
    const playerTitle = document.getElementById('playerTitle');
    const playerModal = document.getElementById('playerModal');
    if (seriesControls) seriesControls.style.display = 'flex';
    if (sourcesContainer) sourcesContainer.style.display = 'block';
    if (playerTitle) playerTitle.innerHTML = title;
    if (playerModal) playerModal.style.display = 'flex';
    await loadSeriesSources(id);
    addToWatchHistory(title, year, 'series', id);
}

function playShqipMovie(id) {
    const movie = getShqipMovies().find(m => m.id === id);
    if (!movie) return;
    if (movie.sources[0].type === 'youtube') {
        const titleEl = document.getElementById('youtubeTitle');
        const iframe = document.getElementById('youtubeIframe');
        const modal = document.getElementById('youtubeModal');
        if (titleEl) titleEl.innerHTML = `${movie.title} (${movie.year}) - FILM SHQIP`;
        if (iframe) iframe.src = `https://www.youtube-nocookie.com/embed/${movie.sources[0].videoId}?autoplay=1&rel=0`;
        if (modal) modal.style.display = 'flex';
    } else {
        alert('Burim i panjohur');
    }
    addToWatchHistory(movie.title, movie.year, 'shqip', id);
}

function playYUMovie(id) {
    const movie = getYUMovies().find(m => m.id === id);
    if (!movie) return;
    if (movie.sources[0].type === 'youtube') {
        const titleEl = document.getElementById('youtubeTitle');
        const iframe = document.getElementById('youtubeIframe');
        const modal = document.getElementById('youtubeModal');
        if (titleEl) titleEl.innerHTML = `${movie.title} (${movie.year}) - JUGOSLLAV FILM`;
        if (iframe) iframe.src = `https://www.youtube-nocookie.com/embed/${movie.sources[0].videoId}?autoplay=1&rel=0`;
        if (modal) modal.style.display = 'flex';
    } else {
        window.open(movie.sources[0].url, '_blank');
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
        { id: 'smashy', name: 'Smashy', url: `${VIDEO_SOURCES.smashy.baseUrlTv}${seriesId}/1/1` },
        { id: 'vidsrcme', name: 'VidSrc.me', url: `${VIDEO_SOURCES.vidsrcme.baseUrl}?tmdb=${seriesId}` }
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
    if (source) {
        const playerFrame = document.getElementById('playerFrame');
        if (playerFrame) playerFrame.src = source.url;
        document.querySelectorAll('.source-btn').forEach(btn => btn.classList.remove('active-source'));
        const activeBtn = document.querySelector(`.source-btn[onclick*="${sourceId}"]`);
        if (activeBtn) activeBtn.classList.add('active-source');
    }
}

function playSelectedEpisode() {
    if (!currentSeriesData) return;
    const season = document.getElementById('seasonSelect')?.value;
    const episode = document.getElementById('episodeSelect')?.value;
    const activeBtn = document.querySelector('.source-btn.active-source');
    let activeSourceId = null;
    if (activeBtn) {
        const onclickAttr = activeBtn.getAttribute('onclick');
        if (onclickAttr) {
            const match = onclickAttr.match(/loadSource\('([^']+)'\)/);
            if (match) activeSourceId = match[1];
        }
    }
    const activeSource = currentSources.find(s => s.id === activeSourceId);
    const playerFrame = document.getElementById('playerFrame');
    if (activeSource && activeSource.id === 'vidsrc' && playerFrame) {
        playerFrame.src = `${VIDEO_SOURCES.vidsrc.baseUrlTv}${currentSeriesData.id}/${season}/${episode}`;
    } else if (activeSource && activeSource.id === 'smashy' && playerFrame) {
        playerFrame.src = `${VIDEO_SOURCES.smashy.baseUrlTv}${currentSeriesData.id}/${season}/${episode}`;
    }
}

function closePlayer() {
    const modal = document.getElementById('playerModal');
    const frame = document.getElementById('playerFrame');
    if (modal) modal.style.display = 'none';
    if (frame) frame.src = '';
    currentMovieData = null;
    currentSeriesData = null;
}

function closeYouTubePlayer() {
    const modal = document.getElementById('youtubeModal');
    const iframe = document.getElementById('youtubeIframe');
    if (modal) modal.style.display = 'none';
    if (iframe) iframe.src = '';
}

function showSection(sectionId) {
    const sections = ['home', 'movies', 'series', 'shqip', 'yu', 'trending'];
    sections.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = 'none';
    });
    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const activeLink = Array.from(document.querySelectorAll('.nav-link')).find(link => {
        const onclick = link.getAttribute('onclick');
        return onclick && onclick.includes(`'${sectionId}'`);
    });
    if (activeLink) activeLink.classList.add('active');

    if (sectionId === 'home') {
        loadFeaturedContent();
        animateCounter('movieCount', 10000, 3000);
        animateCounter('seriesCount', 2000, 2500);
        animateCounter('yuCount', 500, 2000);
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
        const grid = document.getElementById('moviesGrid');
        if (grid) {
            grid.innerHTML = data.results.map(m => `
                <div class="movie-card" onclick="playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0, 4) || ''}')">
                    <img src="${getImageUrl(m.poster_path)}">
                    <div class="rating"><i class="fas fa-star"></i> ${m.vote_average?.toFixed(1) || 'N/A'}</div>
                    <div class="type-badge">FILM</div>
                    <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0, 4) || 'N/A'}</div></div>
                </div>
            `).join('');
        }
    } else if (sourceId === 'seriesSearch') {
        const data = await fetchTMDBData('/search/tv', { query });
        const grid = document.getElementById('seriesGrid');
        if (grid) {
            grid.innerHTML = data.results.map(s => `
                <div class="movie-card" onclick="playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0, 4) || ''}')">
                    <img src="${getImageUrl(s.poster_path)}">
                    <div class="rating"><i class="fas fa-star"></i> ${s.vote_average?.toFixed(1) || 'N/A'}</div>
                    <div class="type-badge">SERI</div>
                    <div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0, 4) || 'N/A'}</div></div>
                </div>
            `).join('');
        }
    } else if (sourceId === 'shqipSearch') {
        const filtered = getShqipMovies().filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
        const grid = document.getElementById('shqipGrid');
        if (grid) {
            grid.innerHTML = filtered.map(m => `
                <div class="movie-card" onclick="playShqipMovie('${m.id}')">
                    <img src="${m.thumbnail}">
                    <div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
                    <div class="type-badge shqip-badge">SHQIP</div>
                    <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
                </div>
            `).join('');
        }
    } else if (sourceId === 'yuSearch') {
        const filtered = getYUMovies().filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
        const grid = document.getElementById('yuGrid');
        if (grid) {
            grid.innerHTML = filtered.map(m => `
                <div class="movie-card" onclick="playYUMovie('${m.id}')">
                    <img src="${m.thumbnail}">
                    <div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
                    <div class="type-badge yu-badge">EX YU</div>
                    <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
                </div>
            `).join('');
        }
    } else if (sourceId === 'trendingSearch') {
        const data = await fetchTMDBData('/trending/all/day');
        const filtered = data.results.filter(i => (i.title || i.name).toLowerCase().includes(query.toLowerCase()));
        const grid = document.getElementById('trendingGrid');
        if (grid) {
            grid.innerHTML = filtered.map(i => {
                const isMovie = i.media_type === 'movie';
                const title = i.title || i.name;
                const year = (i.release_date || i.first_air_date)?.slice(0, 4) || 'N/A';
                return `
                    <div class="movie-card" onclick="${isMovie ? `playMovie(${i.id},'${escapeQuote(title)}','${year}')` : `playTVSeries(${i.id},'${escapeQuote(title)}','${year}')`}">
                        <img src="${getImageUrl(i.poster_path)}">
                        <div class="rating"><i class="fas fa-fire"></i> ${i.vote_average?.toFixed(1) || 'N/A'}</div>
                        <div class="card-content"><div class="card-title">${title}</div><div class="card-year">${year}</div></div>
                    </div>
                `;
            }).join('');
        }
    }
}

function filterContent(type, cat) {
    if (type === 'movies') loadAllMovies();
    else loadAllSeries();
}

function filterShqip(cat) {
    loadShqipContent();
}

function filterYU(cat) {
    const grid = document.getElementById('yuGrid');
    if (!grid) return;
    if (cat === 'all') {
        loadYUContent();
    } else {
        const filtered = getYUMovies().filter(m => m.genre && m.genre.includes(cat));
        grid.innerHTML = filtered.map(m => `
            <div class="movie-card" onclick="playYUMovie('${m.id}')">
                <img src="${m.thumbnail}">
                <div class="rating"><i class="fas fa-star"></i> ${m.rating}</div>
                <div class="type-badge yu-badge">EX YU</div>
                <div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div>
            </div>
        `).join('');
    }
}

function filterTrending(cat) {
    loadTrending();
}

function setupSearchEnter() {
    const searchIds = ['mainSearch', 'movieSearch', 'seriesSearch', 'shqipSearch', 'yuSearch', 'trendingSearch'];
    searchIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    performSearch(this.value, id);
                }
            });
        }
    });
}

window.onload = () => {
    loadFeaturedContent();
    loadAllMovies();
    loadAllSeries();
    loadShqipContent();
    loadYUContent();
    loadTrending();
    showSection('home');
    setupSearchEnter();

    const sections = ['movies', 'series', 'shqip', 'yu', 'trending'];
    sections.forEach(s => {
        const filtersDiv = document.getElementById(`${s}Filters`);
        if (filtersDiv) {
            let btns = [];
            if (s === 'movies') btns = ['all', 'action', 'comedy', 'drama'];
            else if (s === 'series') btns = ['all', 'drama', 'fantasy'];
            else if (s === 'shqip') btns = ['all', 'drama', 'classic', 'comedy'];
            else if (s === 'yu') btns = ['all', 'war', 'comedy', 'drama'];
            else btns = ['all'];

            btns.forEach(val => {
                const btn = document.createElement('button');
                btn.innerText = val.charAt(0).toUpperCase() + val.slice(1);
                btn.classList.add('filter-btn');
                if (val === 'all') btn.classList.add('active');
                btn.onclick = () => {
                    document.querySelectorAll(`#${s}Filters .filter-btn`).forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    if (s === 'yu') filterYU(val);
                    else if (s === 'shqip') filterShqip(val);
                    else if (s === 'trending') filterTrending(val);
                    else filterContent(s, val);
                };
                filtersDiv.appendChild(btn);
            });
        }
    });
};
