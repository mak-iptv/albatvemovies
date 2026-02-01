// ==================== KONFIGURIMET ====================
const TMDB_API_KEY = "dc375cc5d8355f3483fe6fa990736b0e";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Burimet e video (Streaming APIs)
const VIDEO_SOURCES = {
    vidsrc: {
        name: "VidSrc",
        baseUrl: "https://vidsrc.to/embed/movie/",
        baseUrlTv: "https://vidsrc.to/embed/tv/",
        type: "embed"
    },
    smashy: {
        name: "Smashy",
        baseUrl: "https://smashy.stream/movie/",
        baseUrlTv: "https://smashy.stream/tv/",
        type: "embed"
    },
    vidsrcme: {
        name: "VidSrc.me",
        baseUrl: "https://vidsrc.me/embed/",
        type: "embed"
    }
};

// ==================== VARIABLA GLOBALE ====================
let allMovies = [];
let allSeries = [];
let shqipMovies = [];
let yuMovies = [];
let trendingContent = [];
let currentMovieData = null;
let currentSeriesData = null;
let currentSources = [];

// ==================== FUNKSIONE NDIHMËSE ====================
function getImageUrl(path, size = 'w500') {
    if (!path) return 'https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

function escapeQuote(text) {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function showSection(sectionId) {
    const sections = ['home', 'movies', 'series', 'shqip', 'yu', 'trending'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if(section) section.style.display = 'none';
    });
    
    const section = document.getElementById(sectionId);
    if(section) section.style.display = 'block';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(sectionId)) {
            link.classList.add('active');
        }
    });
    
    if (sectionId === 'home') {
        loadFeaturedContent();
    } else if (sectionId === 'movies') {
        loadAllMovies();
    } else if (sectionId === 'series') {
        loadAllSeries();
    } else if (sectionId === 'shqip') {
        loadShqipContent();
    } else if (sectionId === 'yu') {
        loadYUContent();
    } else if (sectionId === 'trending') {
        loadTrending();
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function animateCounter(elementId, target, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let start = 0;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString() + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString() + '+';
        }
    }, 16);
}

function addToWatchHistory(title, year, type, id) {
    try {
        let watchHistory = JSON.parse(localStorage.getItem('albatv_watch_history')) || [];
        
        const watchItem = {
            title: title,
            year: year,
            type: type,
            id: id,
            timestamp: new Date().toISOString()
        };
        
        watchHistory.unshift(watchItem);
        watchHistory = watchHistory.slice(0, 50);
        
        localStorage.setItem('albatv_watch_history', JSON.stringify(watchHistory));
        
        console.log(`Shtuar në historik: ${title}`);
    } catch (error) {
        console.error("Gabim në ruajtjen e historikut:", error);
    }
}

// ==================== FUNKSIONET PËR API ====================
async function fetchTMDBData(endpoint, params = {}) {
    try {
        const defaultParams = {
            api_key: TMDB_API_KEY,
            language: 'en-US',
            ...params
        };
        
        const queryString = new URLSearchParams(defaultParams).toString();
        const url = `${TMDB_BASE_URL}${endpoint}?${queryString}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Gabim në fetchTMDBData për ${endpoint}:`, error);
        throw error;
    }
}

// ==================== NGARKIMI I TË DHËNAVE ====================
async function loadFeaturedContent() {
    try {
        // Ngarko filmat e popullarizuara
        const moviesData = await fetchTMDBData('/movie/popular', { page: 1 });
        
        const featuredMoviesGrid = document.getElementById('featuredMovies');
        if (featuredMoviesGrid) {
            featuredMoviesGrid.innerHTML = moviesData.results.slice(0, 6).map(movie => `
                <div class="featured-card" onclick="playMovie(${movie.id}, '${escapeQuote(movie.title)}', '${movie.release_date?.slice(0,4) || ''}')">
                    <img src="${getImageUrl(movie.poster_path)}" alt="${movie.title}" loading="lazy">
                    <div class="rating"><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</div>
                    <div class="type-badge">FILM</div>
                    <div class="card-content">
                        <div class="card-title">${movie.title}</div>
                        <div class="card-year">${movie.release_date?.slice(0,4) || 'N/A'}</div>
                    </div>
                </div>
            `).join('');
        }
        
        // Ngarko serialet e popullarizuara
        const seriesData = await fetchTMDBData('/tv/popular', { page: 1 });
        
        const featuredSeriesGrid = document.getElementById('featuredSeries');
        if (featuredSeriesGrid) {
            featuredSeriesGrid.innerHTML = seriesData.results.slice(0, 6).map(series => `
                <div class="featured-card" onclick="playTVSeries(${series.id}, '${escapeQuote(series.name)}', '${series.first_air_date?.slice(0,4) || ''}')">
                    <img src="${getImageUrl(series.poster_path)}" alt="${series.name}" loading="lazy">
                    <div class="rating"><i class="fas fa-star"></i> ${series.vote_average.toFixed(1)}</div>
                    <div class="type-badge">SERI</div>
                    <div class="card-content">
                        <div class="card-title">${series.name}</div>
                        <div class="card-year">${series.first_air_date?.slice(0,4) || 'N/A'}</div>
                    </div>
                </div>
            `).join('');
        }
        
        // Ngarko filmat jugosllavë featured
        const featuredYUGrid = document.getElementById('featuredYU');
        if (featuredYUGrid) {
            const yuMoviesFeatured = getYUMovies().slice(0, 6);
            featuredYUGrid.innerHTML = yuMoviesFeatured.map(movie => `
                <div class="featured-card" onclick="playYUMovie('${movie.id}')">
                    <img src="${movie.thumbnail}" alt="${movie.title}" loading="lazy">
                    <div class="rating"><i class="fas fa-star"></i> ${movie.rating}</div>
                    <div class="type-badge yu-badge"><i class="fas fa-star"></i> EX YU</div>
                    <div class="card-content">
                        <div class="card-title">${movie.title}</div>
                        <div class="card-year">${movie.year}</div>
                    </div>
                </div>
            `).join('');
        }
        
    } catch(error) {
        console.error("Gabim në ngarkimin e përmbajtjes kryesore:", error);
        showNotification('Gabim në ngarkimin e të dhënave.', 'error');
    }
}

async function loadAllMovies(page = 1) {
    try {
        const moviesGrid = document.getElementById('moviesGrid');
        if (!moviesGrid) return;
        
        moviesGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar filmat...</div>';
        
        const moviesData = await fetchTMDBData('/movie/popular', { page: page });
        
        allMovies = moviesData.results;
        
        moviesGrid.innerHTML = allMovies.map(movie => `
            <div class="movie-card" onclick="playMovie(${movie.id}, '${escapeQuote(movie.title)}', '${movie.release_date?.slice(0,4) || ''}')">
                <img src="${getImageUrl(movie.poster_path)}" alt="${movie.title}" loading="lazy">
                <div class="rating"><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</div>
                <div class="type-badge">FILM</div>
                <div class="card-content">
                    <div class="card-title">${movie.title}</div>
                    <div class="card-year">${movie.release_date?.slice(0,4) || 'N/A'}</div>
                </div>
            </div>
        `).join('');
        
    } catch(error) {
        console.error("Gabim në ngarkimin e filmave:", error);
        showError('moviesGrid', 'Gabim në ngarkim të filmave.');
    }
}

async function loadAllSeries(page = 1) {
    try {
        const seriesGrid = document.getElementById('seriesGrid');
        if (!seriesGrid) return;
        
        seriesGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar serialet...</div>';
        
        const seriesData = await fetchTMDBData('/tv/popular', { page: page });
        
        allSeries = seriesData.results;
        
        seriesGrid.innerHTML = allSeries.map(series => `
            <div class="movie-card" onclick="playTVSeries(${series.id}, '${escapeQuote(series.name)}', '${series.first_air_date?.slice(0,4) || ''}')">
                <img src="${getImageUrl(series.poster_path)}" alt="${series.name}" loading="lazy">
                <div class="rating"><i class="fas fa-star"></i> ${series.vote_average.toFixed(1)}</div>
                <div class="type-badge">SERI</div>
                <div class="card-content">
                    <div class="card-title">${series.name}</div>
                    <div class="card-year">${series.first_air_date?.slice(0,4) || 'N/A'}</div>
                </div>
            </div>
        `).join('');
        
    } catch(error) {
        console.error("Gabim në ngarkimin e serialeve:", error);
        showError('seriesGrid', 'Gabim në ngarkim të serialeve.');
    }
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

function loadShqipContent() {
    const shqipGrid = document.getElementById('shqipGrid');
    if (!shqipGrid) return;
    
    shqipGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar filmat shqiptare...</div>';
    
    shqipMovies = getShqipMovies();
    
    setTimeout(() => {
        shqipGrid.innerHTML = shqipMovies.map(movie => `
            <div class="movie-card" onclick="playShqipMovie('${movie.id}')">
                <img src="${movie.thumbnail}" alt="${movie.title}" loading="lazy">
                <div class="rating"><i class="fas fa-star"></i> ${movie.rating}</div>
                <div class="type-badge shqip-badge"><i class="fas fa-flag"></i> SHQIP</div>
                <div class="card-content">
                    <div class="card-title">${movie.title}</div>
                    <div class="card-year">${movie.year}</div>
                </div>
            </div>
        `).join('');
    }, 500);
}

function loadYUContent() {
    const yuGrid = document.getElementById('yuGrid');
    if (!yuGrid) return;
    
    yuGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar filmat jugosllavë...</div>';
    
    yuMovies = getYUMovies();
    
    setTimeout(() => {
        yuGrid.innerHTML = yuMovies.map(movie => `
            <div class="movie-card" onclick="playYUMovie('${movie.id}')">
                <img src="${movie.thumbnail}" alt="${movie.title}" loading="lazy">
                <div class="rating"><i class="fas fa-star"></i> ${movie.rating}</div>
                <div class="type-badge yu-badge"><i class="fas fa-star"></i> EX YU</div>
                <div class="card-content">
                    <div class="card-title">${movie.title}</div>
                    <div class="card-year">${movie.year} • ${movie.country}</div>
                </div>
            </div>
        `).join('');
    }, 500);
}

// ==================== PLAYER FUNKSIONET ====================
async function playMovie(movieId, movieTitle, movieYear = '') {
    console.log(`Duke luajtur filmin: ${movieTitle} (ID: ${movieId})`);
    
    currentMovieData = { id: movieId, title: movieTitle, year: movieYear, type: 'movie' };
    currentSeriesData = null;
    
    const modal = document.getElementById('playerModal');
    const playerTitle = document.getElementById('playerTitle');
    const seriesControls = document.getElementById('seriesControls');
    const sourcesContainer = document.getElementById('sourcesContainer');
    
    seriesControls.style.display = 'none';
    sourcesContainer.style.display = 'block';
    
    playerTitle.textContent = movieTitle;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    await loadMovieSources(movieId, movieTitle, movieYear);
}

async function playTVSeries(seriesId, seriesTitle, seriesYear = '') {
    console.log(`Duke luajtur serialin: ${seriesTitle} (ID: ${seriesId})`);
    
    currentSeriesData = { id: seriesId, title: seriesTitle, year: seriesYear, type: 'series' };
    currentMovieData = null;
    
    const modal = document.getElementById('playerModal');
    const playerTitle = document.getElementById('playerTitle');
    const seriesControls = document.getElementById('seriesControls');
    const sourcesContainer = document.getElementById('sourcesContainer');
    
    seriesControls.style.display = 'flex';
    sourcesContainer.style.display = 'block';
    
    playerTitle.textContent = seriesTitle;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    await loadSeriesSources(seriesId, seriesTitle, seriesYear);
}

function playShqipMovie(movieId) {
    const movie = shqipMovies.find(m => m.id === movieId);
    
    if (!movie) {
        showNotification('Film nuk u gjet!', 'error');
        return;
    }
    
    console.log(`Duke luajtur filmin shqiptar: ${movie.title}`);
    
    if (movie.sources[0].type === 'youtube' || movie.sources[0].type === 'youtube_playlist') {
        const youtubeModal = document.getElementById('youtubeModal');
        const youtubeTitle = document.getElementById('youtubeTitle');
        const youtubeIframe = document.getElementById('youtubeIframe');
        
        youtubeTitle.textContent = `${movie.title} (${movie.year}) - FILM SHQIP`;
        
        if (movie.sources[0].type === 'youtube') {
            youtubeIframe.src = `https://www.youtube-nocookie.com/embed/${movie.sources[0].videoId}?autoplay=1&rel=0&modestbranding=1`;
        } else {
            youtubeIframe.src = `https://www.youtube-nocookie.com/embed/videoseries?list=${movie.sources[0].playlistId}&autoplay=1&rel=0`;
        }
        
        youtubeModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
    } else {
        currentMovieData = { 
            id: movieId, 
            title: movie.title, 
            year: movie.year, 
            type: 'shqip',
            sources: movie.sources 
        };
        
        const modal = document.getElementById('playerModal');
        const playerTitle = document.getElementById('playerTitle');
        const seriesControls = document.getElementById('seriesControls');
        const sourcesContainer = document.getElementById('sourcesContainer');
        const sourcesButtons = document.getElementById('sourcesButtons');
        
        seriesControls.style.display = 'none';
        sourcesContainer.style.display = 'block';
        
        playerTitle.textContent = `${movie.title} (${movie.year}) - FILM SHQIP`;
        
        sourcesButtons.innerHTML = movie.sources.map((source, index) => `
            <button class="source-btn ${index === 0 ? 'active' : ''}" 
                    onclick="loadShqipSource('${source.type}', '${source.url}')">
                <i class="fas fa-${source.type === 'youtube' ? 'youtube' : 'play-circle'}"></i> ${source.name}
            </button>
        `).join('');
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        if (movie.sources.length > 0) {
            loadShqipSource(movie.sources[0].type, movie.sources[0].url);
        }
    }
    
    addToWatchHistory(movie.title, movie.year, 'shqip', movieId);
}

function playYUMovie(movieId) {
    const movie = yuMovies.find(m => m.id === movieId);
    
    if (!movie) {
        showNotification('Film jugosllav nuk u gjet!', 'error');
        return;
    }
    
    console.log(`Duke luajtur filmin jugosllav: ${movie.title}`);
    
    if (movie.sources[0].type === 'youtube') {
        const youtubeModal = document.getElementById('youtubeModal');
        const youtubeTitle = document.getElementById('youtubeTitle');
        const youtubeIframe = document.getElementById('youtubeIframe');
        
        youtubeTitle.textContent = `${movie.title} (${movie.year}) - JUGOSLLAV FILM`;
        
        youtubeIframe.src = `https://www.youtube-nocookie.com/embed/${movie.sources[0].videoId}?autoplay=1&rel=0&modestbranding=1`;
        
        youtubeModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        showNotification(`Po luhet: ${movie.title} - ${movie.description}`, 'info');
    } else {
        currentMovieData = { 
            id: movieId, 
            title: movie.title, 
            year: movie.year, 
            type: 'yu',
            sources: movie.sources 
        };
        
        const modal = document.getElementById('playerModal');
        const playerTitle = document.getElementById('playerTitle');
        const seriesControls = document.getElementById('seriesControls');
        const sourcesContainer = document.getElementById('sourcesContainer');
        const sourcesButtons = document.getElementById('sourcesButtons');
        
        seriesControls.style.display = 'none';
        sourcesContainer.style.display = 'block';
        
        playerTitle.textContent = `${movie.title} (${movie.year}) - EX YU FILM`;
        
        sourcesButtons.innerHTML = movie.sources.map((source, index) => `
            <button class="source-btn ${index === 0 ? 'active' : ''}" 
                    onclick="loadYUSource('${source.type}', '${source.url}')">
                <i class="fas fa-${source.type === 'youtube' ? 'youtube' : 'play-circle'}"></i> ${source.name}
            </button>
        `).join('');
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        if (movie.sources.length > 0) {
            loadYUSource(movie.sources[0].type, movie.sources[0].url);
        }
    }
    
    addToWatchHistory(movie.title, movie.year, 'yu', movieId);
}

function loadShqipSource(sourceType, sourceUrl) {
    const playerFrame = document.getElementById('playerFrame');
    
    if (sourceType === 'youtube' || sourceType === 'youtube_playlist') {
        window.open(sourceUrl, '_blank');
        showNotification('Filmi po hapet në YouTube', 'info');
    } else {
        playerFrame.src = sourceUrl;
    }
}

function loadYUSource(sourceType, sourceUrl) {
    const playerFrame = document.getElementById('playerFrame');
    
    if (sourceType === 'youtube') {
        window.open(sourceUrl, '_blank');
        showNotification('Filmi jugosllav po hapet në YouTube', 'info');
    } else {
        playerFrame.src = sourceUrl;
    }
}

async function loadMovieSources(movieId, movieTitle, movieYear) {
    const sourcesButtons = document.getElementById('sourcesButtons');
    sourcesButtons.innerHTML = '<div style="color:#ccc; padding:10px;">Duke ngarkuar burimet...</div>';
    
    currentSources = [
        {
            id: 'vidsrc',
            name: 'VidSrc',
            url: `${VIDEO_SOURCES.vidsrc.baseUrl}${movieId}`,
            type: 'embed'
        },
        {
            id: 'smashy',
            name: 'Smashy',
            url: `${VIDEO_SOURCES.smashy.baseUrl}${movieId}`,
            type: 'embed'
        },
        {
            id: 'vidsrcme',
            name: 'VidSrc.me',
            url: `${VIDEO_SOURCES.vidsrcme.baseUrl}?tmdb=${movieId}`,
            type: 'embed'
        }
    ];
    
    sourcesButtons.innerHTML = currentSources.map((source, index) => `
        <button class="source-btn ${index === 0 ? 'active' : ''}" 
                onclick="loadSource('${source.id}')">
            <i class="fas fa-play-circle"></i> ${source.name}
        </button>
    `).join('');
    
    if (currentSources.length > 0) {
        loadSource(currentSources[0].id);
    }
}

async function loadSeriesSources(seriesId, seriesTitle, seriesYear) {
    const sourcesButtons = document.getElementById('sourcesButtons');
    sourcesButtons.innerHTML = '<div style="color:#ccc; padding:10px;">Duke ngarkuar burimet...</div>';
    
    currentSources = [
        {
            id: 'vidsrc',
            name: 'VidSrc',
            url: `${VIDEO_SOURCES.vidsrc.baseUrlTv}${seriesId}/1/1`,
            type: 'embed'
        },
        {
            id: 'smashy',
            name: 'Smashy',
            url: `${VIDEO_SOURCES.smashy.baseUrlTv}${seriesId}/1/1`,
            type: 'embed'
        },
        {
            id: 'vidsrcme',
            name: 'VidSrc.me',
            url: `${VIDEO_SOURCES.vidsrcme.baseUrl}?tmdb=${seriesId}`,
            type: 'embed'
        }
    ];
    
    sourcesButtons.innerHTML = currentSources.map((source, index) => `
        <button class="source-btn ${index === 0 ? 'active' : ''}" 
                onclick="loadSource('${source.id}')">
            <i class="fas fa-play-circle"></i> ${source.name}
        </button>
    `).join('');
    
    if (currentSources.length > 0) {
        loadSource(currentSources[0].id);
    }
}

function loadSource(sourceId) {
    const playerFrame = document.getElementById('playerFrame');
    const source = currentSources.find(s => s.id === sourceId);
    
    if (!source) return;
    
    document.querySelectorAll('.source-btn').forEach(btn => btn.classList.remove('active'));
    const sourceBtn = document.querySelector(`.source-btn[onclick*="${sourceId}"]`);
    if (sourceBtn) {
        sourceBtn.classList.add('active');
    }
    
    if (source.type === 'embed') {
        playerFrame.src = source.url;
    } else {
        window.open(source.url, '_blank');
    }
    
    console.log(`Duke ngarkuar burimin: ${source.name}`);
}

function playSelectedEpisode() {
    if (!currentSeriesData) return;
    
    const seasonSelect = document.getElementById('seasonSelect');
    const episodeSelect = document.getElementById('episodeSelect');
    const playerFrame = document.getElementById('playerFrame');
    
    const season = seasonSelect.value;
    const episode = episodeSelect.value;
    
    const activeSource = currentSources.find(source => {
        const btn = document.querySelector(`.source-btn[onclick*="${source.id}"]`);
        return btn && btn.classList.contains('active');
    });
    
    if (activeSource && activeSource.id === 'vidsrc') {
        playerFrame.src = `${VIDEO_SOURCES.vidsrc.baseUrlTv}${currentSeriesData.id}/${season}/${episode}`;
    } else if (activeSource && activeSource.id === 'smashy') {
        playerFrame.src = `${VIDEO_SOURCES.smashy.baseUrlTv}${currentSeriesData.id}/${season}/${episode}`;
    }
    
    console.log(`Duke luajtur Sezon ${season}, Episod ${episode}`);
}

function closePlayer() {
    const modal = document.getElementById('playerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        const playerFrame = document.getElementById('playerFrame');
        playerFrame.src = '';
        
        currentMovieData = null;
        currentSeriesData = null;
        currentSources = [];
    }
}

function closeYouTubePlayer() {
    const modal = document.getElementById('youtubeModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        const youtubeIframe = document.getElementById('youtubeIframe');
        youtubeIframe.src = '';
    }
}

// ==================== SEARCH FUNKSIONET ====================
function setupSearch() {
    const searchInputs = ['mainSearch', 'movieSearch', 'seriesSearch', 'trendingSearch', 'shqipSearch', 'yuSearch'];
    
    searchInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', debounce(function() {
                performSearch(this.value, inputId);
            }, 500));
            
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performSearch(this.value, inputId);
                }
            });
        }
    });
}

async function performSearch(query, sourceId) {
    if (!query || query.length < 2) {
        resetSearchView(sourceId);
        return;
    }
    
    console.log(`Kërkim për: "${query}" në ${sourceId}`);
    
    try {
        let searchResults = [];
        
        if (sourceId === 'movieSearch' || sourceId === 'mainSearch') {
            const data = await fetchTMDBData('/search/movie', { query: query });
            searchResults = data.results || [];
            
            const grid = document.getElementById('moviesGrid');
            if (grid) {
                displaySearchResults(searchResults, grid, 'movie');
            }
        }
        else if (sourceId === 'seriesSearch') {
            const data = await fetchTMDBData('/search/tv', { query: query });
            searchResults = data.results || [];
            
            const grid = document.getElementById('seriesGrid');
            if (grid) {
                displaySearchResults(searchResults, grid, 'series');
            }
        }
        else if (sourceId === 'shqipSearch') {
            searchResults = shqipMovies.filter(movie => 
                movie.title.toLowerCase().includes(query.toLowerCase()) ||
                movie.description.toLowerCase().includes(query.toLowerCase())
            );
            
            const grid = document.getElementById('shqipGrid');
            if (grid) {
                if (searchResults.length === 0) {
                    grid.innerHTML = `
                        <div style="grid-column: 1/-1; text-align:center; padding:60px; color:#ff6b6b;">
                            <i class="fas fa-search" style="font-size:48px;"></i>
                            <h3>Nuk u gjet asnjë film shqiptar</h3>
                        </div>
                    `;
                } else {
                    grid.innerHTML = searchResults.map(movie => `
                        <div class="movie-card" onclick="playShqipMovie('${movie.id}')">
                            <img src="${movie.thumbnail}" alt="${movie.title}" loading="lazy">
                            <div class="rating"><i class="fas fa-star"></i> ${movie.rating}</div>
                            <div class="type-badge shqip-badge"><i class="fas fa-flag"></i> SHQIP</div>
                            <div class="card-content">
                                <div class="card-title">${movie.title}</div>
                                <div class="card-year">${movie.year}</div>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }
        else if (sourceId === 'yuSearch') {
            searchResults = yuMovies.filter(movie => 
                movie.title.toLowerCase().includes(query.toLowerCase()) ||
                movie.description.toLowerCase().includes(query.toLowerCase()) ||
                movie.director.toLowerCase().includes(query.toLowerCase())
            );
            
            const grid = document.getElementById('yuGrid');
            if (grid) {
                if (searchResults.length === 0) {
                    grid.innerHTML = `
                        <div style="grid-column: 1/-1; text-align:center; padding:60px; color:#ff6b6b;">
                            <i class="fas fa-search" style="font-size:48px;"></i>
                            <h3>Nuk u gjet asnjë film jugosllav</h3>
                        </div>
                    `;
                } else {
                    grid.innerHTML = searchResults.map(movie => `
                        <div class="movie-card" onclick="playYUMovie('${movie.id}')">
                            <img src="${movie.thumbnail}" alt="${movie.title}" loading="lazy">
                            <div class="rating"><i class="fas fa-star"></i> ${movie.rating}</div>
                            <div class="type-badge yu-badge"><i class="fas fa-star"></i> EX YU</div>
                            <div class="card-content">
                                <div class="card-title">${movie.title}</div>
                                <div class="card-year">${movie.year} • ${movie.country}</div>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }
        
    } catch(error) {
        console.error("Gabim në kërkim:", error);
        showNotification('Gabim në kërkim. Ju lutem provoni përsëri.', 'error');
    }
}

function displaySearchResults(results, grid, type) {
    if (results.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:60px; color:#ff6b6b;">
                <i class="fas fa-search" style="font-size:48px;"></i>
                <h3>Nuk u gjet asnjë rezultat</h3>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = results.map(item => {
        const isMovie = type === 'movie';
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date)?.slice(0,4) || 'N/A';
        const posterPath = item.poster_path || '';
        
        return `
            <div class="movie-card" onclick="${isMovie ? `playMovie(${item.id}, '${escapeQuote(title)}', '${year}')` : `playTVSeries(${item.id}, '${escapeQuote(title)}', '${year}')`}">
                <img src="${getImageUrl(posterPath)}" alt="${title}" loading="lazy">
                <div class="rating"><i class="fas fa-star"></i> ${item.vote_average?.toFixed(1) || 'N/A'}</div>
                <div class="type-badge">${isMovie ? 'FILM' : 'SERI'}</div>
                <div class="card-content">
                    <div class="card-title">${title}</div>
                    <div class="card-year">${year}</div>
                </div>
            </div>
        `;
    }).join('');
}

function resetSearchView(sourceId) {
    switch(sourceId) {
        case 'movieSearch':
            loadAllMovies();
            break;
        case 'seriesSearch':
            loadAllSeries();
            break;
        case 'shqipSearch':
            loadShqipContent();
            break;
        case 'yuSearch':
            loadYUContent();
            break;
        case 'trendingSearch':
            loadTrending();
            break;
        case 'mainSearch':
            break;
    }
}

// ==================== FILTRIMI ====================
function filterContent(type, category) {
    const container = document.getElementById(type === 'movies' ? 'movies' : 'series');
    const filterBtns = container.querySelectorAll('.filter-buttons .filter-btn');
    
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    console.log(`Duke filtruar ${type} sipas: ${category}`);
    
    if (type === 'movies') {
        loadAllMovies();
    } else if (type === 'series') {
        loadAllSeries();
    }
}

function filterShqip(category) {
    const filterBtns = document.querySelectorAll('#shqip + .movies-container .filter-buttons .filter-btn');
    
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    loadShqipContent();
}

function filterYU(category) {
    const filterBtns = document.querySelectorAll('#yu + .movies-container .filter-buttons .filter-btn');
    
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const yuGrid = document.getElementById('yuGrid');
    if (!yuGrid) return;
    
    if (category === 'all') {
        loadYUContent();
    } else {
        const filteredMovies = yuMovies.filter(movie => 
            movie.genre.includes(category)
        );
        
        yuGrid.innerHTML = filteredMovies.map(movie => `
            <div class="movie-card" onclick="playYUMovie('${movie.id}')">
                <img src="${movie.thumbnail}" alt="${movie.title}" loading="lazy">
                <div class="rating"><i class="fas fa-star"></i> ${movie.rating}</div>
                <div class="type-badge yu-badge"><i class="fas fa-star"></i> EX YU</div>
                <div class="card-content">
                    <div class="card-title">${movie.title}</div>
                    <div class="card-year">${movie.year} • ${movie.country}</div>
                </div>
            </div>
        `).join('');
    }
}

function filterTrending(category) {
    const filterBtns = document.querySelectorAll('#trending + .movies-container .filter-buttons .filter-btn');
    
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    loadTrending();
}

// ==================== TRENDING ====================
async function loadTrending() {
    try {
        const trendingGrid = document.getElementById('trendingGrid');
        if (!trendingGrid) return;
        
        trendingGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar trendin...</div>';
        
        const data = await fetchTMDBData('/trending/all/day');
        
        trendingGrid.innerHTML = data.results.slice(0, 12).map(item => {
            const isMovie = item.media_type === 'movie';
            const title = item.title || item.name;
            const year = (item.release_date || item.first_air_date)?.slice(0,4) || 'N/A';
            const posterPath = item.poster_path || '';
            
            return `
                <div class="movie-card" onclick="${isMovie ? `playMovie(${item.id}, '${escapeQuote(title)}', '${year}')` : `playTVSeries(${item.id}, '${escapeQuote(title)}', '${year}')`}">
                    <img src="${getImageUrl(posterPath)}" alt="${title}" loading="lazy">
                    <div class="rating"><i class="fas fa-fire" style="color: #ff6b6b;"></i> ${item.vote_average?.toFixed(1) || 'N/A'}</div>
                    <div class="type-badge" style="background: #ff6b6b;">TRENDING</div>
                    <div class="card-content">
                        <div class="card-title">${title}</div>
                        <div class="card-year">${year} • ${isMovie ? 'FILM' : 'SERIAL'}</div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch(error) {
        console.error("Gabim në ngarkimin e trendit:", error);
        showError('trendingGrid', 'Gabim në ngarkimin e trendit');
    }
}

// ==================== FUNKSIONE NDIHMËSE ====================
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:60px; color:#ff6b6b;">
                <i class="fas fa-exclamation-triangle" style="font-size:48px;"></i>
                <h3>${message}</h3>
            </div>
        `;
    }
}

// ==================== INICIALIZIMI ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("ALBATV Premium Streaming me filmat jugosllavë u ngarkua");
    
    // Nis të dhënat
    loadFeaturedContent();
    loadAllMovies();
    loadAllSeries();
    loadShqipContent();
    loadYUContent();
    loadTrending();
    
    setupEventListeners();
    setupSearch();
    
    // Animoj statistikat
    setTimeout(() => {
        animateCounter('movieCount', 10000, 3000);
        animateCounter('seriesCount', 2000, 2500);
        animateCounter('yuCount', 500, 2000);
    }, 1000);
});

function setupEventListeners() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePlayer();
            closeYouTubePlayer();
        }
    });
    
    document.getElementById('playerModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closePlayer();
        }
    });
    
    document.getElementById('youtubeModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeYouTubePlayer();
        }
    });
}

console.log("ALBATV Premium Streaming me filmat jugosllavë u ngarkua me sukses!");
console.log("Versioni: 4.1 - Me seksionin Jugosllav");
