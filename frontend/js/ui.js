window.addEventListener('load', () => {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.classList.add('loader-hidden');
        setTimeout(() => loader.remove(), 500);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const burgerBtn = document.getElementById('burgerMenu');
    const headerMenu = document.getElementById('headerMenu');

    if (burgerBtn && headerMenu) {
        burgerBtn.addEventListener('click', () => {
            headerMenu.classList.toggle('active');
            const icon = burgerBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-xmark');
            }
        });
    }

    const savedTheme = localStorage.getItem('kinoTheme');
    const themeToggle = document.getElementById('themeToggle');

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const icon = themeToggle?.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('kinoTheme', isLight ? 'light' : 'dark');

            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-sun');
                icon.classList.toggle('fa-moon');
            }
        });
    }

    const customSelect = document.getElementById('citySelect');
    if (customSelect) {
        const selected = customSelect.querySelector('.select-selected');
        const itemsList = customSelect.querySelector('.select-items');
        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            itemsList.classList.toggle('select-hide');
        });
        const items = itemsList.querySelectorAll('div');
        items.forEach(item => {
            item.addEventListener('click', function (e) {
                e.stopPropagation();
                selected.innerHTML = this.innerHTML;
                itemsList.classList.add('select-hide');
                if (window.updateCinemas) window.updateCinemas(this.innerHTML.trim());
            });
        });
        document.addEventListener('click', () => {
            itemsList.classList.add('select-hide');
        });
    }

    const savedModules = JSON.parse(localStorage.getItem('openCineModules')) || [];
    const navLinks = document.querySelectorAll('.main-nav a, .nav-trigger');
    savedModules.forEach(id => {
        const mod = document.getElementById(id);
        if (mod) mod.classList.remove('module-hidden');
        const link = document.querySelector(`.main-nav a[data-id="${id}"]`);
        if (link) link.classList.add('active-nav');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href')?.substring(1);
            if (targetId === 'movies') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (window.innerWidth <= 1024 && headerMenu.classList.contains('active')) {
                    burgerBtn.click();
                }
                return;
            }
            if (targetId) {
                e.preventDefault();
                const targetModule = document.getElementById(targetId);
                if (targetModule && targetModule.classList.contains('toggleable-module')) {
                    const isHidden = targetModule.classList.contains('module-hidden');
                    if (isHidden) {
                        targetModule.classList.remove('module-hidden');
                        document.querySelector(`.main-nav a[data-id="${targetId}"]`)?.classList.add('active-nav');
                        let currentStorage = JSON.parse(localStorage.getItem('openCineModules')) || [];
                        if (!currentStorage.includes(targetId)) {
                            currentStorage.push(targetId);
                            localStorage.setItem('openCineModules', JSON.stringify(currentStorage));
                        }
                    }
                    targetModule.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (window.innerWidth <= 1024 && headerMenu.classList.contains('active')) {
                        burgerBtn.click();
                    }
                }
            }
        });
    });

    const closeModuleBtns = document.querySelectorAll('.close-module-btn');
    closeModuleBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const moduleToClose = this.closest('.toggleable-module');
            if (moduleToClose) {
                moduleToClose.classList.add('module-hidden');
                const modId = moduleToClose.id;
                document.querySelector(`.main-nav a[data-id="${modId}"]`)?.classList.remove('active-nav');
                let currentStorage = JSON.parse(localStorage.getItem('openCineModules')) || [];
                currentStorage = currentStorage.filter(id => id !== modId);
                localStorage.setItem('openCineModules', JSON.stringify(currentStorage));
            }
        });
    });

    const aiChat = document.getElementById('aiChatWindow');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const floatingChatBtn = document.getElementById('floatingChatBtn');
    if (closeChatBtn && aiChat && floatingChatBtn) {
        closeChatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            aiChat.style.display = 'none';
            floatingChatBtn.style.display = 'flex';
        });
        floatingChatBtn.addEventListener('click', () => {
            floatingChatBtn.style.display = 'none';
            aiChat.style.display = 'flex';
        });
    }

    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const logoLink = document.getElementById('logoLink');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    if (logoLink) {
        logoLink.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const modal = document.getElementById('authModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('show-modal');
        });
    }

    const movieModal = document.getElementById('movieModal');
    const closeMovieModalBtn = document.getElementById('closeMovieModalBtn');
    if (closeMovieModalBtn && movieModal) {
        closeMovieModalBtn.addEventListener('click', () => {
            movieModal.classList.remove('show-modal');
        });
    }

    const footerLinks = document.querySelectorAll('.footer-col a, .footer-bottom a');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#' || href === '') {
                e.preventDefault();
                const sectionName = link.textContent.trim();
                if (!link.classList.contains('action-restricted')) {
                    if (window.showToast) window.showToast(`Раздел «${sectionName}» в разработке`, 'fa-person-digging');
                }
            }
        });
    });
});

function showToast(message, icon = 'fa-trophy') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';

    const iconElem = document.createElement('i');
    iconElem.className = `fa-solid ${icon}`;

    const textElem = document.createElement('div');
    textElem.textContent = message;

    toast.appendChild(iconElem);
    toast.appendChild(textElem);
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

window.showToast = showToast;