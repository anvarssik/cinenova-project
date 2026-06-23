const translations = {
    ru: {
        nav_movies: "Фильмы",
        nav_cinemas: "Кинотеатры",
        nav_about: "О нас",
        nav_profile: "Профиль",
        hero_btn: "Смотреть афишу"
    },
    en: {
        nav_movies: "Movies",
        nav_cinemas: "Cinemas",
        nav_about: "About Us",
        nav_profile: "Profile",
        hero_btn: "View Schedule"
    },
    kz: {
        nav_movies: "Фильмдер",
        nav_cinemas: "Кинотеатрлар",
        nav_about: "Біз туралы",
        nav_profile: "Профиль",
        hero_btn: "Афишаны көру"
    }
};

function setLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    localStorage.setItem('lang', lang);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('lang') || 'ru';
    setLanguage(savedLang);

    document.getElementById('langSelect').value = savedLang;
    document.getElementById('langSelect').addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });
});