const TMDB_API_KEY = "dc375cc5d8355f3483fe6fa990736b0e";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const VIDEO_SOURCES = {
    vidsrc: { name: "VidSrc", baseUrl: "https://vsembed.ru/embed/movie/", baseUrlTv: "https://vsembed.ru/embed/tv/", type: "embed" },
    vidsrc: { name: "Smashy", baseUrl: "https://vidsrc.su/movie/", baseUrlTv: "https://vidsrc.su/tv/", type: "embed" },
    vidsrcme: { name: "VidSrc.me", baseUrl: "https://vidsrc.su/embed/", type: "embed" }
};

let allMovies = [], allSeries = [], shqipMovies = [], yuMovies = [];
let currentMovieData = null, currentSeriesData = null, currentSources = [];

function getImageUrl(path, size = 'w500') { return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500&q=80'; }
function escapeQuote(text) { if(!text) return ''; return text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"'); }
function showNotification(message, type = 'info') { 
    const existing = document.querySelector('.notification'); 
    if(existing) existing.remove(); 
    const notif = document.createElement('div'); 
    notif.className = `notification ${type}`; 
    notif.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i><span>${message}</span><button onclick="this.parentElement.remove()">&times;</button>`; 
    document.body.appendChild(notif); 
    setTimeout(() => { if(notif.parentElement) notif.remove(); }, 5000); 
}
function animateCounter(elementId, target, duration) { 
    const el = document.getElementById(elementId); 
    if(!el) return; 
    let start = 0, increment = target / (duration/16), current = 0; 
    const timer = setInterval(() => { 
        current += increment; 
        if(current >= target) { el.textContent = target.toLocaleString() + '+'; clearInterval(timer); } 
        else el.textContent = Math.floor(current).toLocaleString() + '+'; 
    }, 16); 
}
function addToWatchHistory(title, year, type, id) { 
    try { 
        let history = JSON.parse(localStorage.getItem('albatv_watch_history')) || []; 
        history.unshift({ title, year, type, id, timestamp: new Date().toISOString() }); 
        history = history.slice(0,50); 
        localStorage.setItem('albatv_watch_history', JSON.stringify(history)); 
    } catch(e){} 
}

async function fetchTMDBData(endpoint, params = {}) { 
    const defaultParams = { api_key: TMDB_API_KEY, language: 'en-US', ...params }; 
    const url = `${TMDB_BASE_URL}${endpoint}?${new URLSearchParams(defaultParams)}`; 
    const res = await fetch(url); 
    if(!res.ok) throw new Error(`HTTP ${res.status}`); 
    return res.json(); 
}

function getShqipMovies() { return [ /* ... listë e plotë ... */ ]; } // ruani të njëjtën listë
function getYUMovies() { return [ /* ... listë e plotë ... */ ]; }

async function loadFeaturedContent() { 
    try { 
        const movies = await fetchTMDBData('/movie/popular',{page:1}); 
        const series = await fetchTMDBData('/tv/popular',{page:1}); 
        const featuredMovies = document.getElementById('featuredMovies');
        const featuredSeries = document.getElementById('featuredSeries');
        const featuredYU = document.getElementById('featuredYU');
        if(featuredMovies) featuredMovies.innerHTML = movies.results.slice(0,6).map(m=>`<div class="featured-card" onclick="playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')"><img src="${getImageUrl(m.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${m.vote_average.toFixed(1)}</div><div class="type-badge">FILM</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0,4)||'N/A'}</div></div></div>`).join(''); 
        if(featuredSeries) featuredSeries.innerHTML = series.results.slice(0,6).map(s=>`<div class="featured-card" onclick="playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0,4)||''}')"><img src="${getImageUrl(s.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${s.vote_average.toFixed(1)}</div><div class="type-badge">SERI</div><div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0,4)||'N/A'}</div></div></div>`).join(''); 
        const yuFeatured = getYUMovies().slice(0,6); 
        if(featuredYU) featuredYU.innerHTML = yuFeatured.map(m=>`<div class="featured-card" onclick="playYUMovie('${m.id}')"><img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div><div class="type-badge yu-badge">EX YU</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div></div>`).join(''); 
    } catch(e){ console.error(e); } 
}
async function loadAllMovies() { 
    const grid = document.getElementById('moviesGrid'); 
    if(!grid) return;
    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar...</div>'; 
    const data = await fetchTMDBData('/movie/popular',{page:1}); 
    allMovies = data.results; 
    grid.innerHTML = allMovies.map(m=>`<div class="movie-card" onclick="playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')"><img src="${getImageUrl(m.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${m.vote_average.toFixed(1)}</div><div class="type-badge">FILM</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0,4)||'N/A'}</div></div></div>`).join(''); 
}
async function loadAllSeries() { 
    const grid = document.getElementById('seriesGrid'); 
    if(!grid) return;
    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar...</div>'; 
    const data = await fetchTMDBData('/tv/popular',{page:1}); 
    allSeries = data.results; 
    grid.innerHTML = allSeries.map(s=>`<div class="movie-card" onclick="playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0,4)||''}')"><img src="${getImageUrl(s.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${s.vote_average.toFixed(1)}</div><div class="type-badge">SERI</div><div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0,4)||'N/A'}</div></div></div>`).join(''); 
}
function loadShqipContent() { 
    shqipMovies = getShqipMovies(); 
    const grid = document.getElementById('shqipGrid'); 
    if(!grid) return;
    grid.innerHTML = shqipMovies.map(m=>`<div class="movie-card" onclick="playShqipMovie('${m.id}')"><img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div><div class="type-badge shqip-badge"><i class="fas fa-flag"></i> SHQIP</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div></div>`).join(''); 
}
function loadYUContent() { 
    yuMovies = getYUMovies(); 
    const grid = document.getElementById('yuGrid'); 
    if(!grid) return;
    grid.innerHTML = yuMovies.map(m=>`<div class="movie-card" onclick="playYUMovie('${m.id}')"><img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div><div class="type-badge yu-badge">EX YU</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div></div>`).join(''); 
}
async function loadTrending() { 
    const grid = document.getElementById('trendingGrid'); 
    if(!grid) return;
    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Duke ngarkuar...</div>'; 
    const data = await fetchTMDBData('/trending/all/day'); 
    grid.innerHTML = data.results.slice(0,12).map(i=>{ const isMovie=i.media_type==='movie'; const title=i.title||i.name; const year=(i.release_date||i.first_air_date)?.slice(0,4)||'N/A'; return `<div class="movie-card" onclick="${isMovie?`playMovie(${i.id},'${escapeQuote(title)}','${year}')`:`playTVSeries(${i.id},'${escapeQuote(title)}','${year}')`}"><img src="${getImageUrl(i.poster_path)}"><div class="rating"><i class="fas fa-fire" style="color:#ff6b6b;"></i> ${i.vote_average?.toFixed(1)||'N/A'}</div><div class="type-badge" style="background:#ff6b6b;">TRENDING</div><div class="card-content"><div class="card-title">${title}</div><div class="card-year">${year}</div></div></div>`; }).join(''); 
}

async function playMovie(id, title, year) { 
    currentMovieData = {id,title,year,type:'movie'}; 
    currentSeriesData=null; 
    const seriesControls = document.getElementById('seriesControls');
    const sourcesContainer = document.getElementById('sourcesContainer');
    const playerTitle = document.getElementById('playerTitle');
    const playerModal = document.getElementById('playerModal');
    if(seriesControls) seriesControls.style.display='none';
    if(sourcesContainer) sourcesContainer.style.display='block';
    if(playerTitle) playerTitle.innerHTML=title;
    if(playerModal) playerModal.style.display='flex';
    await loadMovieSources(id); 
    addToWatchHistory(title,year,'movie',id); 
}
async function playTVSeries(id, title, year) { 
    currentSeriesData={id,title,year,type:'series'}; 
    const seriesControls = document.getElementById('seriesControls');
    const sourcesContainer = document.getElementById('sourcesContainer');
    const playerTitle = document.getElementById('playerTitle');
    const playerModal = document.getElementById('playerModal');
    if(seriesControls) seriesControls.style.display='flex';
    if(sourcesContainer) sourcesContainer.style.display='block';
    if(playerTitle) playerTitle.innerHTML=title;
    if(playerModal) playerModal.style.display='flex';
    await loadSeriesSources(id); 
    addToWatchHistory(title,year,'series',id); 
}
function playShqipMovie(id) { 
    const movie = getShqipMovies().find(m=>m.id===id); 
    if(!movie) return; 
    if(movie.sources[0].type==='youtube'){ 
        const titleEl = document.getElementById('youtubeTitle');
        const iframe = document.getElementById('youtubeIframe');
        const modal = document.getElementById('youtubeModal');
        if(titleEl) titleEl.innerHTML=`${movie.title} (${movie.year}) - FILM SHQIP`;
        if(iframe) iframe.src=`https://www.youtube-nocookie.com/embed/${movie.sources[0].videoId}?autoplay=1&rel=0`;
        if(modal) modal.style.display='flex';
    } else { alert('Burim i panjohur'); } 
    addToWatchHistory(movie.title,movie.year,'shqip',id); 
}
function playYUMovie(id) { 
    const movie = getYUMovies().find(m=>m.id===id); 
    if(!movie) return; 
    if(movie.sources[0].type==='youtube'){ 
        const titleEl = document.getElementById('youtubeTitle');
        const iframe = document.getElementById('youtubeIframe');
        const modal = document.getElementById('youtubeModal');
        if(titleEl) titleEl.innerHTML=`${movie.title} (${movie.year}) - JUGOSLLAV FILM`;
        if(iframe) iframe.src=`https://www.youtube-nocookie.com/embed/${movie.sources[0].videoId}?autoplay=1&rel=0`;
        if(modal) modal.style.display='flex';
    } else { window.open(movie.sources[0].url,'_blank'); } 
    addToWatchHistory(movie.title,movie.year,'yu',id); 
}
async function loadMovieSources(movieId) { 
    const sources = [ 
        {id:'vidsrc',name:'VidSrc',url:`${VIDEO_SOURCES.vidsrc.baseUrl}${movieId}`},
        {id:'smashy',name:'Smashy',url:`${VIDEO_SOURCES.smashy.baseUrl}${movieId}`},
        {id:'vidsrcme',name:'VidSrc.me',url:`${VIDEO_SOURCES.vidsrcme.baseUrl}?tmdb=${movieId}`}
    ]; 
    currentSources = sources; 
    const btnsDiv = document.getElementById('sourcesButtons'); 
    if(btnsDiv) btnsDiv.innerHTML = sources.map((s,i)=>`<button class="source-btn ${i===0?'active-source':''}" onclick="loadSource('${s.id}')">${s.name}</button>`).join(''); 
    if(sources.length) loadSource(sources[0].id); 
}
async function loadSeriesSources(seriesId) { 
    const sources = [ 
        {id:'vidsrc',name:'VidSrc',url:`${VIDEO_SOURCES.vidsrc.baseUrlTv}${seriesId}/1/1`},
        {id:'smashy',name:'Smashy',url:`${VIDEO_SOURCES.smashy.baseUrlTv}${seriesId}/1/1`},
        {id:'vidsrcme',name:'VidSrc.me',url:`${VIDEO_SOURCES.vidsrcme.baseUrl}?tmdb=${seriesId}`}
    ]; 
    currentSources = sources; 
    const btnsDiv = document.getElementById('sourcesButtons'); 
    if(btnsDiv) btnsDiv.innerHTML = sources.map((s,i)=>`<button class="source-btn ${i===0?'active-source':''}" onclick="loadSource('${s.id}')">${s.name}</button>`).join(''); 
    if(sources.length) loadSource(sources[0].id); 
}
function loadSource(sourceId) { 
    const source = currentSources.find(s=>s.id===sourceId); 
    if(source){ 
        const playerFrame = document.getElementById('playerFrame');
        if(playerFrame) playerFrame.src = source.url; 
        document.querySelectorAll('.source-btn').forEach(btn=>btn.classList.remove('active-source')); 
        const activeBtn = document.querySelector(`.source-btn[onclick*="${sourceId}"]`);
        if(activeBtn) activeBtn.classList.add('active-source');
    } 
}
function playSelectedEpisode() { 
    if(!currentSeriesData) return; 
    const season = document.getElementById('seasonSelect')?.value; 
    const episode = document.getElementById('episodeSelect')?.value; 
    const active = currentSources.find(s=>document.querySelector(`.source-btn[onclick*="${s.id}"]`)?.classList.contains('active-source')); 
    const playerFrame = document.getElementById('playerFrame');
    if(active && active.id==='vidsrc' && playerFrame) 
        playerFrame.src = `${VIDEO_SOURCES.vidsrc.baseUrlTv}${currentSeriesData.id}/${season}/${episode}`; 
    else if(active && active.id==='smashy' && playerFrame) 
        playerFrame.src = `${VIDEO_SOURCES.smashy.baseUrlTv}${currentSeriesData.id}/${season}/${episode}`; 
}
function closePlayer() { 
    const modal = document.getElementById('playerModal');
    const frame = document.getElementById('playerFrame');
    if(modal) modal.style.display='none'; 
    if(frame) frame.src=''; 
    currentMovieData=null; currentSeriesData=null; 
}
function closeYouTubePlayer() { 
    const modal = document.getElementById('youtubeModal');
    const iframe = document.getElementById('youtubeIframe');
    if(modal) modal.style.display='none'; 
    if(iframe) iframe.src=''; 
}
function showSection(sectionId) { 
    ['home','movies','series','shqip','yu','trending'].forEach(s=>{ 
        const el = document.getElementById(s); 
        if(el) el.style.display='none'; 
    }); 
    const target = document.getElementById(sectionId); 
    if(target) target.style.display='block'; 
    document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active')); 
    // Aktualizon klasën aktive vetëm nëse eventi është klikim
    if(window.event && window.event.target && window.event.target.classList) {
        window.event.target.classList.add('active');
    } else {
        // Nëse thirret nga onload, gjej linkun që korrespondon me seksionin
        const activeLink = Array.from(document.querySelectorAll('.nav-link')).find(link => link.getAttribute('onclick')?.includes(sectionId));
        if(activeLink) activeLink.classList.add('active');
    }
    if(sectionId==='home'){ 
        loadFeaturedContent(); 
        animateCounter('movieCount',10000,3000); 
        animateCounter('seriesCount',2000,2500); 
        animateCounter('yuCount',500,2000); 
    } else if(sectionId==='movies') loadAllMovies(); 
    else if(sectionId==='series') loadAllSeries(); 
    else if(sectionId==='shqip') loadShqipContent(); 
    else if(sectionId==='yu') loadYUContent(); 
    else if(sectionId==='trending') loadTrending(); 
}
async function performSearch(query, sourceId) { 
    if(!query||query.length<2) return; 
    if(sourceId==='movieSearch'){ 
        const data = await fetchTMDBData('/search/movie',{query}); 
        const grid = document.getElementById('moviesGrid'); 
        if(grid) grid.innerHTML = data.results.map(m=>`<div class="movie-card" onclick="playMovie(${m.id},'${escapeQuote(m.title)}','${m.release_date?.slice(0,4)||''}')"><img src="${getImageUrl(m.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${m.vote_average?.toFixed(1)||'N/A'}</div><div class="type-badge">FILM</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.release_date?.slice(0,4)||'N/A'}</div></div></div>`).join(''); 
    } else if(sourceId==='seriesSearch'){ 
        const data = await fetchTMDBData('/search/tv',{query}); 
        const grid = document.getElementById('seriesGrid'); 
        if(grid) grid.innerHTML = data.results.map(s=>`<div class="movie-card" onclick="playTVSeries(${s.id},'${escapeQuote(s.name)}','${s.first_air_date?.slice(0,4)||''}')"><img src="${getImageUrl(s.poster_path)}"><div class="rating"><i class="fas fa-star"></i> ${s.vote_average?.toFixed(1)||'N/A'}</div><div class="type-badge">SERI</div><div class="card-content"><div class="card-title">${s.name}</div><div class="card-year">${s.first_air_date?.slice(0,4)||'N/A'}</div></div></div>`).join(''); 
    } else if(sourceId==='shqipSearch'){ 
        const filtered = getShqipMovies().filter(m=>m.title.toLowerCase().includes(query.toLowerCase())); 
        const grid = document.getElementById('shqipGrid'); 
        if(grid) grid.innerHTML = filtered.map(m=>`<div class="movie-card" onclick="playShqipMovie('${m.id}')"><img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div><div class="type-badge shqip-badge">SHQIP</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div></div>`).join(''); 
    } else if(sourceId==='yuSearch'){ 
        const filtered = getYUMovies().filter(m=>m.title.toLowerCase().includes(query.toLowerCase())); 
        const grid = document.getElementById('yuGrid'); 
        if(grid) grid.innerHTML = filtered.map(m=>`<div class="movie-card" onclick="playYUMovie('${m.id}')"><img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div><div class="type-badge yu-badge">EX YU</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div></div>`).join(''); 
    } else if(sourceId==='trendingSearch'){ 
        const data = await fetchTMDBData('/trending/all/day'); 
        const filtered = data.results.filter(i=>(i.title||i.name).toLowerCase().includes(query.toLowerCase())); 
        const grid = document.getElementById('trendingGrid'); 
        if(grid) grid.innerHTML = filtered.map(i=>{ const isMovie=i.media_type==='movie'; const title=i.title||i.name; const year=(i.release_date||i.first_air_date)?.slice(0,4)||'N/A'; return `<div class="movie-card" onclick="${isMovie?`playMovie(${i.id},'${escapeQuote(title)}','${year}')`:`playTVSeries(${i.id},'${escapeQuote(title)}','${year}')`}"><img src="${getImageUrl(i.poster_path)}"><div class="rating"><i class="fas fa-fire"></i> ${i.vote_average?.toFixed(1)||'N/A'}</div><div class="card-content"><div class="card-title">${title}</div><div class="card-year">${year}</div></div></div>`; }).join(''); 
    } 
}

function filterContent(type,cat){ if(type==='movies') loadAllMovies(); else loadAllSeries(); }
function filterShqip(cat){ loadShqipContent(); }
function filterYU(cat){ 
    const grid = document.getElementById('yuGrid'); 
    if(!grid) return; 
    if(cat==='all') loadYUContent(); 
    else { 
        const filtered = getYUMovies().filter(m=>m.genre.includes(cat)); 
        grid.innerHTML = filtered.map(m=>`<div class="movie-card" onclick="playYUMovie('${m.id}')"><img src="${m.thumbnail}"><div class="rating"><i class="fas fa-star"></i> ${m.rating}</div><div class="type-badge yu-badge">EX YU</div><div class="card-content"><div class="card-title">${m.title}</div><div class="card-year">${m.year}</div></div></div>`).join(''); 
    } 
}
function filterTrending(cat){ loadTrending(); }

function setupSearchEnter() {
    const searchIds = ['mainSearch', 'movieSearch', 'seriesSearch', 'shqipSearch', 'yuSearch', 'trendingSearch'];
    searchIds.forEach(id => {
        const input = document.getElementById(id);
        if(input) {
            input.addEventListener('keypress', function(e) {
                if(e.key === 'Enter') {
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
    
    ['movies','series','shqip','yu','trending'].forEach(s=>{ 
        const filtersDiv = document.getElementById(`${s}Filters`); 
        if(filtersDiv){ 
            const btns = s==='movies'?['all','action','comedy','drama']:s==='series'?['all','drama','fantasy']:s==='shqip'?['all','drama','classic','comedy']:s==='yu'?['all','war','comedy','drama']:['all']; 
            btns.forEach(val=>{ 
                const btn=document.createElement('button'); 
                btn.innerText=val.charAt(0).toUpperCase()+val.slice(1); 
                btn.classList.add('filter-btn'); 
                if(val==='all') btn.classList.add('active'); 
                btn.onclick = ()=>{ 
                    document.querySelectorAll(`#${s}Filters .filter-btn`).forEach(b=>b.classList.remove('active')); 
                    btn.classList.add('active'); 
                    if(s==='yu') filterYU(val); 
                    else if(s==='shqip') filterShqip(val); 
                    else if(s==='trending') filterTrending(val); 
                    else filterContent(s,val); 
                }; 
                filtersDiv.appendChild(btn); 
            }); 
        } 
    }); 
};
