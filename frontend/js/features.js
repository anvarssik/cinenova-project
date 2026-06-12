let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let isAdmin = localStorage.getItem('isAdmin') === 'true';

window.selectedMovieTitle = 'Выберите фильм';
window.currentPromoDiscount = 0;

function updateAuthUI() {
    const authBtn = document.getElementById('openAuthModal');
    const myTicketsBtn = document.getElementById('myTicketsBtn');
    const adminPanelBtn = document.getElementById('adminPanelBtn');

    if (authBtn) {
        if (isLoggedIn) {
            authBtn.textContent = 'Выход';
            if (myTicketsBtn) myTicketsBtn.classList.remove('hidden-element');
            if (isAdmin && adminPanelBtn) adminPanelBtn.classList.remove('hidden-element');

            authBtn.onclick = (e) => {
                e.preventDefault();
                window.setLoggedOut();
            };
        } else {
            authBtn.textContent = 'Sign In | Register';
            if (myTicketsBtn) myTicketsBtn.classList.add('hidden-element');
            if (adminPanelBtn) adminPanelBtn.classList.add('hidden-element');

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

window.setLoggedIn = function (adminFlag = false) {
    isLoggedIn = true;
    isAdmin = adminFlag;
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('isAdmin', adminFlag ? 'true' : 'false');
    updateAuthUI();
};

window.setLoggedOut = function () {
    isLoggedIn = false;
    isAdmin = false;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    updateAuthUI();
    if (window.showToast) window.showToast('Вы вышли из системы', 'fa-sign-out-alt');
};

window.initSeatMap = function (layoutType = 'atlas_standard', cinemaName = 'Кинотеатр не выбран') {
    const seatMap = document.getElementById('seatMap');
    if (!seatMap) return;

    const mapTitle = document.querySelector('.map-header h2');
    if (mapTitle) {
        mapTitle.textContent = `Интерактивная карта: ${cinemaName}`;
    }

    const styleId = 'dynamic-seat-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .seat-matrix-group { display: flex; flex-direction: column; gap: 12px; align-items: center; margin: 0 auto; width: 100%; overflow-x: auto; padding-bottom: 20px;}
            .seat-matrix-row-wrapper { display: flex; align-items: center; justify-content: center; gap: 15px; }
            .seat-matrix-row { display: flex; gap: 8px; justify-content: center; }
            .seat-matrix-num { font-size: 11px; color: var(--text-muted, #8b95a5); width: 15px; text-align: center; font-weight: bold; }
            .seat.empty { background: transparent !important; border: none !important; box-shadow: none !important; cursor: default; pointer-events: none; }
            .seat.disabled-dot { background: transparent !important; border: none !important; pointer-events: none; position: relative; }
            .seat.disabled-dot::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 6px; height: 6px; background: #8b95a5; border-radius: 50%; }
            .seat.vip { background-color: #ff0000 !important; width: 38px !important; border-radius: 6px !important; border-bottom: 3px solid #b30000 !important; transition: transform 0.2s;}
            .seat.vip:not(.occupied):hover { transform: scale(1.1); box-shadow: 0 0 10px rgba(255,0,0,0.5); }
            .seat.standard { background-color: #00a651 !important; border-bottom: 3px solid #007a3b !important; transition: transform 0.2s; }
            .seat.standard:not(.occupied):hover { transform: scale(1.1); box-shadow: 0 0 10px rgba(0,166,81,0.5); }
            .seat.occupied { background-color: #8b95a5 !important; border-bottom: 3px solid #6b7280 !important; opacity: 0.6; cursor: not-allowed; transform: none !important; box-shadow: none !important;}
            .seat.selected { background-color: var(--accent, #00e6a8) !important; border-bottom: 3px solid #00b383 !important; transform: scale(1.1); box-shadow: 0 0 15px var(--accent, #00e6a8) !important; }
        `;
        document.head.appendChild(style);
    }

    seatMap.innerHTML = `
        <div style="width: 100%; max-width: 400px; margin: 0 auto 40px auto; text-align: center;">
            <div style="height: 15px; background: rgba(139, 149, 165, 0.3); border-radius: 50% / 100% 100% 0 0; box-shadow: 0 -5px 15px rgba(255, 255, 255, 0.05);"></div>
            <div style="font-size: 10px; color: var(--text-muted, #8b95a5); letter-spacing: 3px; text-transform: uppercase; margin-top: 10px;">Экран</div>
        </div>
    `;

    const layouts = {
        'atlas_standard': [
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0]
        ],
        'atlas_zal2': [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0]
        ],
        'atlas_zal5': [
            [1, 1, 1, 1, 1, 1, 1, 3, 3, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0]
        ],
        'cinema_park': [
            [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
            [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
            [0, 2, 0, 2, 0, 0, 2, 0, 2, 0]
        ],
        'standard': [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ]
    };

    const currentLayout = layouts[layoutType] || layouts['standard'];
    const group = document.createElement('div');
    group.className = 'seat-matrix-group';

    currentLayout.forEach((rowArray, rowIndex) => {
        const rowWrapper = document.createElement('div');
        rowWrapper.className = 'seat-matrix-row-wrapper';

        const leftNum = document.createElement('div');
        leftNum.className = 'seat-matrix-num';
        leftNum.textContent = rowIndex + 1;
        rowWrapper.appendChild(leftNum);

        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-matrix-row';

        rowArray.forEach((seatType) => {
            const seat = document.createElement('div');
            seat.classList.add('seat');

            if (seatType === 0) {
                seat.classList.add('empty');
            } else if (seatType === 3) {
                seat.classList.add('disabled-dot');
            } else {
                const isOccupied = Math.random() > 0.85;
                const typeClass = seatType === 1 ? 'standard' : 'vip';

                seat.classList.add(typeClass);
                if (isOccupied) seat.classList.add('occupied');

                seat.dataset.price = seatType === 1 ? '1900' : '5000';

                if (!isOccupied) {
                    seat.addEventListener('click', function () {
                        this.classList.toggle('selected');
                        if (window.updateCheckoutMath) window.updateCheckoutMath();
                    });
                }
            }
            rowDiv.appendChild(seat);
        });

        rowWrapper.appendChild(rowDiv);

        const rightNum = document.createElement('div');
        rightNum.className = 'seat-matrix-num';
        rightNum.textContent = rowIndex + 1;
        rowWrapper.appendChild(rightNum);

        group.appendChild(rowWrapper);
    });

    seatMap.appendChild(group);
    if (window.updateCheckoutMath) window.updateCheckoutMath();
};

window.updateCheckoutMath = function () {
    const selectedSeatsElements = document.querySelectorAll('.seat.selected');
    const selectedSeats = selectedSeatsElements.length;
    const mapPayBtn = document.getElementById('mapPayBtn');

    if (selectedSeats > 0) {
        if (mapPayBtn) mapPayBtn.classList.remove('hidden-element');
    } else {
        if (mapPayBtn) mapPayBtn.classList.add('hidden-element');
    }

    let totalSum = 0;
    selectedSeatsElements.forEach(seat => {
        totalSum += parseInt(seat.dataset.price || 1900);
    });

    totalSum = totalSum - (totalSum * window.currentPromoDiscount);

    const selectedBuddies = document.querySelectorAll('.buddy-select-item input[type="checkbox"]:checked').length;
    const splitEqual = document.getElementById('split-equal')?.checked;

    let yourShare = totalSum;

    if (splitEqual) {
        const totalPeople = 1 + selectedBuddies;
        yourShare = totalSum > 0 ? Math.ceil(totalSum / totalPeople) : 0;
    }

    const elCount = document.getElementById('checkoutTicketCount');
    const elTotal = document.getElementById('checkoutTotalSum');
    const elShare = document.getElementById('checkoutYourShare');

    if (elCount) elCount.textContent = `${selectedSeats} шт.`;
    if (elTotal) elTotal.textContent = `${totalSum} ₸`;
    if (elShare) elShare.textContent = `${yourShare} ₸`;
};

window.currentCinemasData = [];

window.updateCinemas = function () {
    const citySelect = document.getElementById('citySelect');
    const grid = document.getElementById('cinemasGrid');

    if (!citySelect || !grid) return;

    const selectedCity = citySelect.value;
    grid.innerHTML = '';

    const sourceData = typeof cinemasData !== 'undefined' ? cinemasData : window.currentCinemasData;
    const cityCinemas = sourceData.filter(c => c.city === selectedCity || c.city === 'Petropavlovsk');

    if (cityCinemas.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">В этом городе пока нет доступных кинотеатров.</p>';
        return;
    }

    cityCinemas.forEach(c => {
        const card = document.createElement('div');
        card.className = 'info-card cinema-card';
        const tagsHtml = c.tags ? c.tags.map(tag => `<span class="tag tag-outline">${tag}</span>`).join('') : '';

        let layoutType = 'atlas_standard';
        const lowerName = c.name ? c.name.toLowerCase() : '';

        if (lowerName.includes('зал 2')) layoutType = 'atlas_zal2';
        if (lowerName.includes('зал 5')) layoutType = 'atlas_zal5';
        if (lowerName.includes('cinema park') || lowerName.includes('синема парк')) layoutType = 'cinema_park';

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                <div>
                    <h3 style="margin-bottom: 5px;">${c.name}</h3>
                    <p style="color: var(--text-muted); font-size: 13px;">
                        <i class="fa-solid fa-location-dot"></i> ${c.address}
                    </p>
                </div>
                <i class="fa-solid ${c.icon || 'fa-film'}" style="color: var(--accent); font-size: 24px;"></i>
            </div>
            <div class="tags" style="margin-bottom: 20px;">
                ${tagsHtml}
            </div>
            <button class="btn-outline w-100" onclick="window.initSeatMap('${layoutType}', '${c.name}'); document.querySelector('.interactive-map').scrollIntoView({ behavior: 'smooth' });">Выбрать места</button>
        `;

        grid.appendChild(card);
    });
};

window.renderCinemasGrid = function (cinemas, cityName) {
    const grid = document.getElementById('cinemasGridContainer');
    if (!grid) return;

    if (cinemas.length > 0) {
        grid.innerHTML = cinemas.map(c => {
            let layout = 'atlas_standard';
            const lowerName = c.name ? c.name.toLowerCase() : '';
            if (lowerName.includes('зал 2')) layout = 'atlas_zal2';
            if (lowerName.includes('зал 5')) layout = 'atlas_zal5';
            if (lowerName.includes('cinema park')) layout = 'cinema_park';

            return `
            <div class="info-card cinema-card">
                <div class="cinema-icon"><i class="fa-solid ${c.icon || 'fa-film'}"></i></div>
                <h3>${c.name}</h3>
                <p><i class="fa-solid fa-location-dot"></i> ${c.address}</p>
                <div class="tags">${c.tags ? c.tags.map(t => `<span>${t}</span>`).join('') : ''}</div>
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

window.adminAddMovie = async function (movieData) {
    if (!isAdmin) {
        if (window.showToast) window.showToast('Ошибка: Недостаточно прав', 'fa-lock');
        return false;
    }
    if (window.showToast) window.showToast('Успешно: Фильм добавлен в прокат', 'fa-film');
    return true;
};

window.adminDeleteMovie = async function (id) {
    if (!isAdmin) {
        if (window.showToast) window.showToast('Ошибка: Недостаточно прав', 'fa-lock');
        return false;
    }
    if (window.showToast) window.showToast('Успешно: Фильм снят с показа', 'fa-trash');
    return true;
};

window.adminAddSession = async function (sessionData) {
    if (!isAdmin) {
        if (window.showToast) window.showToast('Ошибка: Недостаточно прав', 'fa-lock');
        return false;
    }
    if (window.showToast) window.showToast('Успешно: Новый сеанс создан', 'fa-calendar-plus');
    return true;
};

document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    window.checkAchievements();
    window.renderMyTickets();

    const cinemaSearchInput = document.getElementById('cinemaSearchInput');
    if (cinemaSearchInput) {
        cinemaSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const sourceData = typeof cinemasData !== 'undefined' ? cinemasData : window.currentCinemasData;
            const filtered = sourceData.filter(c => c.name.toLowerCase().includes(query));
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