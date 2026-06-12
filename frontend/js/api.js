let moviesData = [];
let cinemasData = [];
let querySearch = "";
let activeFilter = localStorage.getItem('kinoFilter') || "All";
let activeSort = localStorage.getItem('kinoSort') || "default";

document.addEventListener('DOMContentLoaded', () => {
    loadPremieres();
    loadMovieBuddies();
    loadCinemas();
});

async function loadCinemas() {
    const API_URL = 'http://localhost:3000/api/cinemas';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        const data = await response.json();

        if (data && data.length > 0) {
            cinemasData = data;
            console.log('Кинотеатры успешно загружены из БД:', cinemasData);
        }
    } catch (error) {
        console.error('Ошибка при загрузке кинотеатров с бэкенда:', error);
    }
}

async function loadPremieres() {
    const API_URL = 'http://localhost:3000/api/movies';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Ошибка сервера');
        const data = await response.json();
        if (data && data.length > 0) {
            moviesData = data;
            setupControls();
            updateMoviesUI();
        }
    } catch (error) {
        console.error('Ошибка при получении фильмов с бэкенда:', error);
    }
}

function setupControls() {
    if (document.getElementById('genreFilterSelect')) return;

    const moviesWrapper = document.querySelector('.movies-wrapper');
    const gridContainer = document.getElementById('moviesGrid');

    const controlsDiv = document.createElement('div');
    controlsDiv.style.display = 'flex';
    controlsDiv.style.gap = '15px';
    controlsDiv.style.marginBottom = '20px';

    controlsDiv.innerHTML = `
        <select id="genreFilterSelect" class="custom-filter-select">
            <option value="All">Все жанры</option>
            <option value="драма">Драма</option>
            <option value="комедия">Комедия</option>
            <option value="фантастика">Фантастика</option>
            <option value="боевик">Боевик</option>
            <option value="триллер">Триллер</option>
            <option value="мультфильм">Мультфильм</option>
        </select>
        <select id="sortDataSelect" class="custom-filter-select">
            <option value="default">Сортировка: По умолчанию</option>
            <option value="ratingDesc">Рейтинг: по убыванию</option>
            <option value="ratingAsc">Рейтинг: по возрастанию</option>
            <option value="yearDesc">Сначала новые</option>
            <option value="yearAsc">Сначала старые</option>
            <option value="titleAsc">По алфавиту (А-Я)</option>
            <option value="titleDesc">По алфавиту (Я-А)</option>
        </select>
    `;

    moviesWrapper.insertBefore(controlsDiv, gridContainer);

    const filterSelect = document.getElementById('genreFilterSelect');
    const sortSelect = document.getElementById('sortDataSelect');

    filterSelect.value = activeFilter;
    sortSelect.value = activeSort;

    const oldSearch = document.getElementById('movieSearch');
    const searchInput = oldSearch.cloneNode(true);
    oldSearch.parentNode.replaceChild(searchInput, oldSearch);

    searchInput.addEventListener('input', (e) => {
        querySearch = e.target.value;
        updateMoviesUI();
    });

    filterSelect.addEventListener('change', (e) => {
        activeFilter = e.target.value;
        localStorage.setItem('kinoFilter', activeFilter);
        updateMoviesUI();
    });

    sortSelect.addEventListener('change', (e) => {
        activeSort = e.target.value;
        localStorage.setItem('kinoSort', activeSort);
        updateMoviesUI();
    });
}

function getMovieTitle(movie) {
    return movie.nameRu || movie.nameOriginal || movie.nameEn || 'Без названия';
}

function updateMoviesUI() {
    let processedData = moviesData.filter(movie => {
        return getMovieTitle(movie).toLowerCase().includes(querySearch.toLowerCase());
    });

    if (activeFilter !== "All") {
        processedData = processedData.filter(movie => {
            if (!movie.genres) return false;
            return movie.genres.some(g => g.genre.toLowerCase() === activeFilter.toLowerCase());
        });
    }

    if (activeSort === "ratingDesc") {
        processedData.sort((a, b) => (b.ratingKinopoisk || 0) - (a.ratingKinopoisk || 0));
    } else if (activeSort === "ratingAsc") {
        processedData.sort((a, b) => (a.ratingKinopoisk || 0) - (b.ratingKinopoisk || 0));
    } else if (activeSort === "yearDesc") {
        processedData.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (activeSort === "yearAsc") {
        processedData.sort((a, b) => (a.year || 0) - (b.year || 0));
    } else if (activeSort === "titleAsc") {
        processedData.sort((a, b) => getMovieTitle(a).localeCompare(getMovieTitle(b), 'ru'));
    } else if (activeSort === "titleDesc") {
        processedData.sort((a, b) => getMovieTitle(b).localeCompare(getMovieTitle(a), 'ru'));
    }

    renderMovies(processedData);
}

function renderMovies(movies) {
    const container = document.getElementById('moviesGrid');
    if (!container) return;
    container.innerHTML = '';

    movies.forEach(movie => {
        let genresText = 'Кино';
        if (movie.genres && Array.isArray(movie.genres) && movie.genres.length > 0) {
            genresText = movie.genres.map(g => g.genre).slice(0, 2).join(', ');
        }

        const movieYear = movie.year ? movie.year : '';
        const metaText = movieYear ? `${genresText} • ${movieYear}` : genresText;
        const titleText = getMovieTitle(movie);

        const article = document.createElement('article');
        article.className = 'movie-card';
        article.style.cursor = 'pointer';

        article.addEventListener('click', () => {
            const modal = document.getElementById('movieModal');
            document.getElementById('modalMoviePoster').src = movie.posterUrlPreview;
            document.getElementById('modalMovieTitle').textContent = titleText;
            document.getElementById('modalMovieMeta').textContent = `${metaText} | Рейтинг: ${movie.ratingKinopoisk || 'N/A'}`;
            window.selectedMovieTitle = titleText;
            document.getElementById('checkoutMovieTitle').textContent = titleText;
            modal.classList.add('show-modal');
        });

        const posterWrapper = document.createElement('div');
        posterWrapper.className = 'poster-wrapper';

        const img = document.createElement('img');
        img.src = movie.posterUrlPreview;
        img.alt = titleText;
        img.className = 'movie-poster';

        const title = document.createElement('h3');
        title.className = 'movie-title';
        title.textContent = titleText;

        const genre = document.createElement('p');
        genre.className = 'movie-genre';
        genre.textContent = metaText;

        posterWrapper.appendChild(img);
        article.appendChild(posterWrapper);
        article.appendChild(title);
        article.appendChild(genre);

        container.appendChild(article);
    });
}

async function loadMovieBuddies() {
    const API_URL = 'http://localhost:3000/api/users';
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Ошибка при получении пользователей');

        const users = await response.json();
        renderBuddies(users);

        window.buddiesListData = users;
    } catch (error) {
        console.error('Не удалось загрузить друзей из БД:', error);
    }
}

function renderBuddies(users) {
    const grid = document.querySelector('#company .cards-grid');
    if (!grid) return;

    grid.innerHTML = '';

    users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'info-card buddy-card';

        card.innerHTML = `
            <div class="buddy-header">
                <img src="${user.avatar}" alt="${user.name}">
                <div>
                    <h3>${user.name}, ${user.age}</h3>
                    <span class="match-rate"><i class="fa-solid fa-fire"></i> Совпадение на ${user.match}%</span>
                </div>
            </div>
            <p>Wants to see: <strong>${user.wantsToSee}</strong></p>
            <button class="btn-primary w-100 action-restricted" data-action="invite">Send Invite</button>
        `;

        const inviteBtn = card.querySelector('button');
        inviteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof checkAuthFlow === 'function' && checkAuthFlow()) {
                if (window.showToast) window.showToast('Инвайт успешно отправлен!', 'fa-paper-plane');
                if (window.unlockAchievement) window.unlockAchievement('ach2', 'Душа компании', 'fa-users');
            }
        });

        grid.appendChild(card);
    });
}