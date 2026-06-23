process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const db = require('./database/db');
const API_KEY = '4f10976f-818f-42b0-87c3-f1c58f949014'; 

async function syncMovies() {
    console.log('🔄 Начинаю загрузку фильмов с Кинопоиска...');
    
    try {
        let allMovies = [];
        for (let page = 1; page <= 5; page++) {
            const API_URL = `https://kinopoiskapiunofficial.tech/api/v2.2/films?order=NUM_VOTE&type=FILM&yearFrom=2024&yearTo=2027&page=${page}`;
            
            console.log(`Загружаю страницу ${page}...`);
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'X-API-KEY': API_KEY,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP на странице ${page}: ${response.status}`);
            }

            const data = await response.json();

            if (data.items && data.items.length > 0) {
                allMovies = allMovies.concat(data.items);
            }
        }

        if (allMovies.length > 0) {
            console.log(`📥 Итого получено фильмов для записи: ${allMovies.length}`);
            
            db.serialize(() => {
                db.run('DELETE FROM movies', (err) => {
                    if (err) console.error('Ошибка при очистке таблицы:', err.message);
                    else console.log('Таблица movies очищена от старых записей.');
                });

                const stmt = db.prepare(`
                    INSERT INTO movies (title, genre, release_year, rating, poster_url) 
                    VALUES (?, ?, ?, ?, ?)
                `);

                const moviesToSave = allMovies.slice(0, 100);
                
                moviesToSave.forEach(movie => {
                    const title = movie.nameRu || movie.nameOriginal || 'Без названия';
                    const genre = movie.genres && movie.genres.length > 0 ? movie.genres[0].genre : 'Кино';
                    const year = movie.year || 2026;
                    const rating = movie.ratingKinopoisk || 0;
                    const poster = movie.posterUrlPreview || '';

                    stmt.run([title, genre, year, rating, poster], (err) => {
                        if (err) console.error(`Ошибка при добавлении "${title}":`, err.message);
                    });
                });

                stmt.finalize(() => {
                    console.log(`Синхронизация успешно завершена! Добавлено фильмов: ${moviesToSave.length}`);
                    db.close((err) => {
                        if (err) console.error('Ошибка при закрытии БД:', err.message);
                        else console.log('Соединение с базой данных закрыто.');
                    });
                });
            });
        } else {
            console.log('Фильмы не найдены в ответах API.');
            db.close();
        }
    } catch (error) {
        console.error('Критическая ошибка синхронизации:', error);
        db.close();
    }
}

syncMovies();