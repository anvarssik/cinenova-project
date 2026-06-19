/*const moviesData = [
    { id: 1, title: "Супер Марио: Галактическое кино", genre: "Мультфильм", rating: 6.6, year: 2023, poster: "img/mario-poster-small.png" },
    { id: 2, title: "Холоп 3", genre: "Комедия", rating: 7.2, year: 2024, poster: "img/ai-art1.png" },
    { id: 3, title: "Шрек 5", genre: "Мультфильм", rating: 8.5, year: 2025, poster: "img/ai-art2.png" },
    { id: 4, title: "Мстители: Секретные войны", genre: "Фантастика", rating: 8.0, year: 2026, poster: "img/achivment (1).png" },
    { id: 5, title: "Дюна: Часть третья", genre: "Фантастика", rating: 8.8, year: 2026, poster: "img/achivment (2).png" },
    { id: 6, title: "Мастер и Маргарита", genre: "Драма", rating: 7.9, year: 2024, poster: "img/achivment (3).png" },
    { id: 7, title: "Дэдпул и Росомаха", genre: "Комедия", rating: 7.5, year: 2024, poster: "img/ai-art1.png" },
    { id: 8, title: "Головоломка 2", genre: "Мультфильм", rating: 8.1, year: 2024, poster: "img/ai-art2.png" }
];

let querySearch = "";
let activeFilter = "All";
let activeSort = "default";

document.addEventListener('DOMContentLoaded', () => {
    const moviesWrapper = document.querySelector('.movies-wrapper');
    const gridContainer = document.getElementById('moviesGrid');

    const controlsDiv = document.createElement('div');
    controlsDiv.style.display = 'flex';
    controlsDiv.style.gap = '15px';
    controlsDiv.style.marginBottom = '20px';

    controlsDiv.innerHTML = `
        <select id="genreFilterSelect" style="background: var(--bg-panel); color: var(--text-main); border: 1px solid rgba(139, 149, 165, 0.2); padding: 8px 15px; border-radius: 20px; outline: none; font-family: inherit;">
            <option value="All">Все жанры</option>
            <option value="Мультфильм">Мультфильм</option>
            <option value="Комедия">Комедия</option>
            <option value="Фантастика">Фантастика</option>
            <option value="Драма">Драма</option>
        </select>
        <select id="sortDataSelect" style="background: var(--bg-panel); color: var(--text-main); border: 1px solid rgba(139, 149, 165, 0.2); padding: 8px 15px; border-radius: 20px; outline: none; font-family: inherit;">
            <option value="default">Сортировка: По умолчанию</option>
            <option value="ratingDesc">Рейтинг: по убыванию</option>
            <option value="ratingAsc">Рейтинг: по возрастанию</option>
            <option value="yearDesc">Сначала новые</option>
        </select>
    `;

    moviesWrapper.insertBefore(controlsDiv, gridContainer);

    const oldSearch = document.getElementById('movieSearch');
    const searchInput = oldSearch.cloneNode(true);
    oldSearch.parentNode.replaceChild(searchInput, oldSearch);

    const filterSelect = document.getElementById('genreFilterSelect');
    const sortSelect = document.getElementById('sortDataSelect');

    function updateMoviesUI() {
        let processedData = moviesData.filter(movie => 
            movie.title.toLowerCase().includes(querySearch.toLowerCase())
        );

        if (activeFilter !== "All") {
            processedData = processedData.filter(movie => movie.genre === activeFilter);
        }

        if (activeSort === "ratingDesc") {
            processedData.sort((a, b) => b.rating - a.rating);
        } else if (activeSort === "ratingAsc") {
            processedData.sort((a, b) => a.rating - b.rating);
        } else if (activeSort === "yearDesc") {
            processedData.sort((a, b) => b.year - a.year);
        }

        gridContainer.innerHTML = '';

        processedData.forEach(movie => {
            const card = document.createElement('article');
            card.className = 'movie-card';

            const posterDiv = document.createElement('div');
            posterDiv.className = 'poster-wrapper';

            const img = document.createElement('img');
            img.src = movie.poster;
            img.className = 'movie-poster';

            const title = document.createElement('h3');
            title.className = 'movie-title';
            title.textContent = movie.title;

            const meta = document.createElement('p');
            meta.className = 'movie-genre';
            meta.textContent = `${movie.genre} • ⭐ ${movie.rating} • ${movie.year}`;

            posterDiv.appendChild(img);
            card.appendChild(posterDiv);
            card.appendChild(title);
            card.appendChild(meta);

            gridContainer.appendChild(card);
        });
    }

    searchInput.addEventListener('input', (e) => {
        querySearch = e.target.value;
        updateMoviesUI();
    });

    filterSelect.addEventListener('change', (e) => {
        activeFilter = e.target.value;
        updateMoviesUI();
    });

    sortSelect.addEventListener('change', (e) => {
        activeSort = e.target.value;
        updateMoviesUI();
    });

    setTimeout(updateMoviesUI, 100);
});*/