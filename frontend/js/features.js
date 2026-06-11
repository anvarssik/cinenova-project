let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

window.selectedMovieTitle = 'Выберите фильм';
window.currentPromoDiscount = 0;

function updateAuthUI() {
    const authBtn = document.getElementById('openAuthModal');
    const myTicketsBtn = document.getElementById('myTicketsBtn');
    if (authBtn) {
        if (isLoggedIn) {
            authBtn.textContent = 'Выход';
            if (myTicketsBtn) myTicketsBtn.classList.remove('hidden-element');
            authBtn.onclick = (e) => {
                e.preventDefault();
                window.setLoggedOut();
            };
        } else {
            authBtn.textContent = 'Sign In | Register';
            if (myTicketsBtn) myTicketsBtn.classList.add('hidden-element');
            authBtn.onclick = (e) => {
                e.preventDefault();
                document.getElementById('authModal').classList.add('show-modal');
            };
        }
    }
}

function checkAuthFlow() {
    if (!isLoggedIn) {
        document.getElementById('authModal').classList.add('show-modal');
        return false;
    }
    return true;
}

window.setLoggedIn = function () {
    isLoggedIn = true;
    localStorage.setItem('isLoggedIn', 'true');
    updateAuthUI();
};

window.setLoggedOut = function () {
    isLoggedIn = false;
    localStorage.removeItem('isLoggedIn');
    updateAuthUI();
    if (window.showToast) window.showToast('Вы вышли из системы', 'fa-sign-out-alt');
};

window.initSeatMap = function (layoutType = 'standard', cinemaName = 'Кинотеатр не выбран') {
    const seatMap = document.getElementById('seatMap');
    if (!seatMap) return;

    const mapTitle = document.querySelector('.map-header h2');
    if (mapTitle) {
        mapTitle.textContent = `Интерактивная карта: ${cinemaName}`;
    }

    seatMap.innerHTML = '';

    let rows, cols;
    if (layoutType === 'vip') {
        rows = 3;
        cols = 6;
    } else if (layoutType === 'imax') {
        rows = 8;
        cols = 14;
    } else {
        rows = 5;
        cols = 10;
    }

    for (let g = 0; g < rows; g++) {
        const group = document.createElement('div');
        group.className = 'seat-group';
        group.style.gridTemplateColumns = `repeat(${cols}, 25px)`;

        for (let i = 0; i < cols; i++) {
            const seat = document.createElement('div');
            const isOccupied = Math.random() > 0.7;
            seat.className = `seat ${isOccupied ? 'occupied' : 'available'}`;

            if (!isOccupied) {
                seat.addEventListener('click', function () {
                    this.classList.toggle('selected');
                    if (window.updateCheckoutMath) window.updateCheckoutMath();
                });
            }
            group.appendChild(seat);
        }
        seatMap.appendChild(group);
    }

    if (window.updateCheckoutMath) window.updateCheckoutMath();
}

window.updateCheckoutMath = function () {
    const selectedSeats = document.querySelectorAll('.seat.selected').length;
    const mapPayBtn = document.getElementById('mapPayBtn');

    if (selectedSeats > 0) {
        if (mapPayBtn) mapPayBtn.classList.remove('hidden-element');
    } else {
        if (mapPayBtn) mapPayBtn.classList.add('hidden-element');
    }

    const ticketPrice = 2500;
    let totalSum = selectedSeats * ticketPrice;

    totalSum = totalSum - (totalSum * window.currentPromoDiscount);

    const selectedBuddies = document.querySelectorAll('.buddy-select-item input[type="checkbox"]:checked').length;
    const splitEqual = document.getElementById('split-equal')?.checked;

    let yourShare = totalSum;

    if (splitEqual) {
        const totalPeople = 1 + selectedBuddies;
        yourShare = totalSum > 0 ? Math.ceil(totalSum / totalPeople) : 0;
    } else {
        yourShare = selectedSeats > 0 ? (ticketPrice - (ticketPrice * window.currentPromoDiscount)) : 0;
    }

    const elCount = document.getElementById('checkoutTicketCount');
    const elTotal = document.getElementById('checkoutTotalSum');
    const elShare = document.getElementById('checkoutYourShare');

    if (elCount) elCount.textContent = `${selectedSeats} шт.`;
    if (elTotal) elTotal.textContent = `${totalSum} ₸`;
    if (elShare) elShare.textContent = `${yourShare} ₸`;
};

window.currentCinemasData = [];

window.updateCinemas = function (cityName) {
    const cityData = {
        "Petropavlovsk": [
            { name: "Новый свет", address: "ул. Казахстанской правды 71", tags: ["IMAX", "Dolby Atmos"], icon: "fa-film" },
            { name: "Atlas Cinema", address: "ул. Жумабаева 91", tags: ["3D", "VIP Seats"], icon: "fa-video" },
            { name: "Cinema Park", address: "ул. Шокана Уалиханова 56", tags: ["4DX", "Comfort"], icon: "fa-popcorn" }
        ],
        "Astana": [
            { name: "Keruen IMAX", address: "ул. Достык 9", tags: ["IMAX Laser", "VIP"], icon: "fa-film" },
            { name: "Mega Silk Way", address: "пр. Кабанбай батыра 62", tags: ["Dolby", "Lounge"], icon: "fa-video" }
        ],
        "Almaty": [
            { name: "Dostyk Plaza", address: "мкр. Самал-2, 111", tags: ["IMAX", "Comfort"], icon: "fa-film" },
            { name: "Esentai Mall", address: "пр. Аль-Фараби 77/8", tags: ["Premium VIP", "Boutique"], icon: "fa-star" }
        ]
    };

    window.currentCinemasData = cityData[cityName] || [];
    window.renderCinemasGrid(window.currentCinemasData, cityName);
};

window.renderCinemasGrid = function (cinemas, cityName) {
    const grid = document.getElementById('cinemasGridContainer');
    if (!grid) return;

    if (cinemas.length > 0) {
        grid.innerHTML = cinemas.map(c => {
            let layout = 'standard';
            if (c.tags.includes('VIP Seats') || c.tags.includes('VIP') || c.tags.includes('Premium VIP')) layout = 'vip';
            else if (c.tags.includes('IMAX') || c.tags.includes('IMAX Laser')) layout = 'imax';

            return `
            <div class="info-card cinema-card">
                <div class="cinema-icon"><i class="fa-solid ${c.icon}"></i></div>
                <h3>${c.name}</h3>
                <p><i class="fa-solid fa-location-dot"></i> ${c.address}</p>
                <div class="tags">${c.tags.map(t => `<span>${t}</span>`).join('')}</div>
                <button class="btn-outline w-100" onclick="window.initSeatMap('${layout}', '${c.name}'); window.showToast('Загружен зал кинотеатра: ${c.name}', 'fa-couch'); document.querySelector('.interactive-map').scrollIntoView({ behavior: 'smooth' });">Выбрать места</button>
            </div>
        `}).join('');
    } else {
        grid.innerHTML = `
            <div class="info-card" style="grid-column: 1 / -1; text-align: center; padding: 50px 20px;">
                <i class="fa-solid fa-person-digging" style="font-size: 48px; color: var(--accent); margin-bottom: 20px;"></i>
                <h3 style="font-size: 24px; margin-bottom: 10px;">Скоро в г. ${cityName || 'вашем городе'}!</h3>
                <p style="font-size: 15px;">Мы уже проектируем залы CineNova. Следите за обновлениями.</p>
            </div>
        `;
    }
}

window.unlockAchievement = function (id, title, icon) {
    const unlocked = JSON.parse(localStorage.getItem('userAchievements')) || [];
    if (!unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem('userAchievements', JSON.stringify(unlocked));

        if (window.showToast) {
            window.showToast(`🏆 Открыта новая ачивка: ${title}!`, icon);
        }
        window.checkAchievements();
    }
};

window.checkAchievements = function () {
    const unlocked = JSON.parse(localStorage.getItem('userAchievements')) || [];
    const achs = ['ach1', 'ach2', 'ach3'];
    achs.forEach(id => {
        const el = document.getElementById(id);
        if (el && unlocked.includes(id)) {
            el.classList.remove('ach-locked');
            el.classList.add('ach-unlocked');
        }
    });
};

window.renderMyTickets = function () {
    const container = document.getElementById('ticketsContainer');
    if (!container) return;
    container.innerHTML = '';

    const myTickets = JSON.parse(localStorage.getItem('myTickets')) || [];
    if (myTickets.length === 0) {
        container.innerHTML = '<p>У вас пока нет купленных билетов.</p>';
        return;
    }

    myTickets.forEach(ticket => {
        container.innerHTML += `
            <div class="my-ticket-card">
                <h3 style="font-size: 16px; margin-bottom: 5px;">${ticket.movie}</h3>
                <p style="margin:0; font-size: 13px;"><i class="fa-solid fa-calendar-days"></i> ${ticket.date}</p>
                <p style="margin:0; font-size: 13px;"><i class="fa-solid fa-ticket"></i> Мест: ${ticket.count} шт.</p>
            </div>
        `;
    });
};

document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    window.checkAchievements();
    window.renderMyTickets();

    if (window.updateCinemas) {
        window.updateCinemas('Petropavlovsk');
    }

    initSeatMap('standard', 'Кинотеатр не выбран');

    const cinemaSearchInput = document.getElementById('cinemaSearchInput');
    if (cinemaSearchInput) {
        cinemaSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = window.currentCinemasData.filter(c => c.name.toLowerCase().includes(query));
            window.renderCinemasGrid(filtered, document.querySelector('.select-selected').textContent);
        });
    }

    const buyTicketsBtn = document.getElementById('buyTicketsBtn');
    if (buyTicketsBtn) {
        buyTicketsBtn.addEventListener('click', () => {
            if (checkAuthFlow()) {
                const cinemasSection = document.querySelector('#cinemas');
                if (cinemasSection) cinemasSection.scrollIntoView({ behavior: 'smooth' });
                window.showToast('Выберите кинотеатр для сеанса', 'fa-location-dot');
            }
        });
    }

    const modalBuyBtn = document.getElementById('modalBuyBtn');
    if (modalBuyBtn) {
        modalBuyBtn.addEventListener('click', () => {
            document.getElementById('movieModal').classList.remove('show-modal');
            if (checkAuthFlow()) {
                const cinemasSection = document.querySelector('#cinemas');
                if (cinemasSection) cinemasSection.scrollIntoView({ behavior: 'smooth' });
                window.showToast('Выберите кинотеатр для сеанса', 'fa-location-dot');
            }
        });
    }

    const applyPromoBtn = document.getElementById('applyPromoBtn');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', () => {
            const promo = document.getElementById('promoInput').value.toUpperCase();
            if (promo === 'CINENOVA') {
                window.currentPromoDiscount = 0.2;
                if (window.showToast) window.showToast('Промокод применен! Скидка 20%', 'fa-tag');
                window.updateCheckoutMath();
            } else {
                if (window.showToast) window.showToast('Неверный промокод', 'fa-circle-xmark');
            }
        });
    }

    const mapPayBtn = document.getElementById('mapPayBtn');
    if (mapPayBtn) {
        mapPayBtn.addEventListener('click', () => {
            if (checkAuthFlow()) {
                const splitPayHub = document.getElementById('split-pay-hub');
                if (splitPayHub) {
                    splitPayHub.classList.remove('module-hidden');
                    splitPayHub.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    const buddyCheckboxes = document.querySelectorAll('.buddy-select-item input[type="checkbox"]');
    buddyCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateCheckoutMath);
    });

    const splitTypeRadios = document.querySelectorAll('input[name="split-type"]');
    splitTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateCheckoutMath);
    });

    const restrictedActions = document.querySelectorAll('.action-restricted');
    restrictedActions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (checkAuthFlow()) {
                const action = btn.getAttribute('data-action');
                if (action === 'create') {
                    if (window.showToast) window.showToast('Билет сгенерирован!', 'fa-wand-magic-sparkles');
                    window.unlockAchievement('ach3', 'Творец', 'fa-palette');
                }
                if (action === 'cases') if (window.showToast) window.showToast('Открываем кейс...', 'fa-box-open');
            }
        });
    });

    const finalPayBtn = document.getElementById('finalPayBtn');
    if (finalPayBtn) {
        finalPayBtn.addEventListener('click', () => {
            const seats = document.querySelectorAll('.seat.selected');
            if (seats.length === 0) return;

            const ticketCount = seats.length;
            const tDate = new Date().toLocaleString();
            let myTickets = JSON.parse(localStorage.getItem('myTickets')) || [];

            myTickets.push({ count: ticketCount, date: tDate, movie: window.selectedMovieTitle });
            localStorage.setItem('myTickets', JSON.stringify(myTickets));

            window.unlockAchievement('ach1', 'Первый ряд', 'fa-ticket');

            seats.forEach(s => {
                s.classList.remove('selected');
                s.classList.replace('available', 'occupied');
            });

            document.getElementById('receiptIdBox').textContent = 'ID: #' + Math.floor(Math.random() * 90000 + 10000);
            window.updateCheckoutMath();
            window.renderMyTickets();
            if (window.showToast) window.showToast('Оплата успешно проведена!', 'fa-check-circle');
        });
    }

    const myTicketsBtn = document.getElementById('myTicketsBtn');
    const ticketsModal = document.getElementById('ticketsModal');
    const closeTicketsModalBtn = document.getElementById('closeTicketsModalBtn');

    if (myTicketsBtn && ticketsModal) {
        myTicketsBtn.addEventListener('click', () => {
            ticketsModal.classList.add('show-modal');
        });
    }

    if (closeTicketsModalBtn) {
        closeTicketsModalBtn.addEventListener('click', () => {
            ticketsModal.classList.remove('show-modal');
        });
    }
});