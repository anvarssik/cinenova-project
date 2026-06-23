let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let isAdmin = localStorage.getItem('isAdmin') === 'true';

window.selectedMovieTitle = 'Выберите фильм';
window.currentPromoDiscount = 0;

function updateAuthUI() {
    const authBtn = document.getElementById('openAuthModal');
    const myTicketsBtn = document.getElementById('myTicketsBtn');
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    const profileLink = document.getElementById('navProfileLink');
    if (authBtn) {
        if (isLoggedIn) {
            authBtn.textContent = 'Выход';
            if (myTicketsBtn) myTicketsBtn.classList.remove('hidden-element');
            if (profileLink) profileLink.classList.remove('hidden-element');
            if (isAdmin && adminPanelBtn) adminPanelBtn.classList.remove('hidden-element');

            authBtn.onclick = (e) => {
                e.preventDefault();
                window.setLoggedOut();
            };
            window.checkAchievements();
        } else {
            authBtn.textContent = 'Sign In | Register';
            if (myTicketsBtn) myTicketsBtn.classList.add('hidden-element');
            if (adminPanelBtn) adminPanelBtn.classList.add('hidden-element');

            authBtn.onclick = (e) => {
                e.preventDefault();
                document.getElementById('authModal').classList.add('show-modal');
            };
            window.checkAchievements();
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
    localStorage.clear();
    updateAuthUI();
    if (window.showToast) window.showToast('Вы вышли из системы. Очистка сессии...', 'fa-sign-out-alt');
    setTimeout(() => location.reload(), 800);
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
            .seat-matrix-group { display: flex; flex-direction: column; gap: 10px; align-items: center; margin: 0 auto; width: 100%; overflow-x: auto; padding-bottom: 20px;}
            .seat-matrix-row-wrapper { display: flex; align-items: center; justify-content: center; gap: 15px; }
            .seat-matrix-row { display: flex; gap: 8px; justify-content: center; }
            .seat-matrix-num { font-size: 13px; color: var(--text-muted, #8b95a5); width: 20px; text-align: center; font-weight: bold; }
            .seat { width: 30px; height: 30px; border-radius: 6px; cursor: pointer; flex-shrink: 0; transition: transform 0.2s, box-shadow 0.2s; box-sizing: border-box; }
            .seat.empty { background: transparent !important; border: none !important; box-shadow: none !important; cursor: default; pointer-events: none; }
            .seat.disabled-dot { background: transparent !important; border: none !important; pointer-events: none; position: relative; }
            .seat.disabled-dot::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: #8b95a5; border-radius: 50%; }
            .seat.vip { width: 45px; height: 40px; background-color: #ff0000 !important; border-radius: 8px !important; border-bottom: 4px solid #b30000 !important; }
            .seat.vip:not(.occupied):hover { transform: scale(1.1); box-shadow: 0 0 10px rgba(255,0,0,0.5); }
            .seat.standard { background-color: #00a651 !important; border-bottom: 4px solid #007a3b !important; }
            .seat.standard:not(.occupied):hover { transform: scale(1.1); box-shadow: 0 0 10px rgba(0,166,81,0.5); }
            .seat.occupied { background-color: #4b5563 !important; border-bottom: 4px solid #374151 !important; opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important;}
            .seat.selected { background-color: var(--accent, #00e6a8) !important; border-bottom: 4px solid #00b383 !important; transform: scale(1.1); box-shadow: 0 0 15px var(--accent, #00e6a8) !important; }
        `;
        document.head.appendChild(style);
    }

    seatMap.innerHTML = `
        <div style="width: 100%; max-width: 500px; margin: 0 auto 40px auto; text-align: center;">
            <div style="height: 15px; background: rgba(139, 149, 165, 0.3); border-radius: 50% / 100% 100% 0 0; box-shadow: 0 -5px 15px rgba(255, 255, 255, 0.05);"></div>
            <div style="font-size: 11px; color: var(--text-muted, #8b95a5); letter-spacing: 4px; text-transform: uppercase; margin-top: 10px; font-weight: bold;">Экран</div>
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

function buildCinemaCardNode(c) {
    const card = document.createElement('div');
    card.className = 'info-card cinema-card';
    const tagsHtml = c.tags ? c.tags.map(tag => `<span class="tag tag-outline">${tag}</span>`).join('') : '';

    const lowerName = c.name ? c.name.toLowerCase() : '';
    let hallsHtml = '';

    if (lowerName.includes('atlas') || lowerName.includes('атлас')) {
        hallsHtml = `
            <div style="display:flex; gap:8px; margin-top:15px; flex-wrap:wrap;">
                <button class="btn-outline" style="padding: 6px 12px; font-size:13px;" onclick="window.initSeatMap('atlas_standard', '${c.name} - Зал 1'); document.querySelector('.interactive-map').scrollIntoView({ behavior: 'smooth' });">Зал 1</button>
                <button class="btn-outline" style="padding: 6px 12px; font-size:13px;" onclick="window.initSeatMap('atlas_zal2', '${c.name} - Зал 2 (Пропасть)'); document.querySelector('.interactive-map').scrollIntoView({ behavior: 'smooth' });">Зал 2</button>
                <button class="btn-outline" style="padding: 6px 12px; font-size:13px;" onclick="window.initSeatMap('atlas_zal5', '${c.name} - Зал 5 (Богатыри)'); document.querySelector('.interactive-map').scrollIntoView({ behavior: 'smooth' });">Зал 5</button>
            </div>
        `;
    } else {
        hallsHtml = `
            <div style="display:flex; gap:8px; margin-top:15px; flex-wrap:wrap;">
                <button class="btn-outline" style="padding: 6px 12px; font-size:13px;" onclick="window.initSeatMap('cinema_park', '${c.name} - Зал 1'); document.querySelector('.interactive-map').scrollIntoView({ behavior: 'smooth' });">Зал 1</button>
                <button class="btn-outline" style="padding: 6px 12px; font-size:13px;" onclick="window.initSeatMap('cinema_park', '${c.name} - Зал 2'); document.querySelector('.interactive-map').scrollIntoView({ behavior: 'smooth' });">Зал 2</button>
            </div>
        `;
    }

    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div>
                <h3 style="margin-bottom: 5px;">${c.name}</h3>
                <p style="color: var(--text-muted); font-size: 13px;">
                    <i class="fa-solid fa-location-dot"></i> ${c.address}
                </p>
            </div>
            <i class="fa-solid ${c.icon || 'fa-film'}" style="color: var(--accent); font-size: 24px;"></i>
        </div>
        <div class="tags">
            ${tagsHtml}
        </div>
        ${hallsHtml}
    `;
    return card;
}

window.updateCinemas = function (cityName) {
    const citySelect = document.getElementById('citySelect');
    const grid = document.getElementById('cinemasGrid') || document.getElementById('cinemasGridContainer');

    if (!citySelect || !grid) return;

    const selectedCity = cityName || citySelect.querySelector('.select-selected').textContent.trim();
    grid.innerHTML = '';

    const sourceData = typeof cinemasData !== 'undefined' && cinemasData.length > 0 ? cinemasData : window.currentCinemasData;
    const cityCinemas = sourceData.filter(c => c.city === selectedCity);

    if (cityCinemas.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">В этом городе пока нет доступных кинотеатров.</p>';
        return;
    }

    cityCinemas.forEach(c => {
        grid.appendChild(buildCinemaCardNode(c));
    });
};

window.renderCinemasGrid = function (cinemas, cityName) {
    const grid = document.getElementById('cinemasGridContainer') || document.getElementById('cinemasGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (cinemas.length > 0) {
        cinemas.forEach(c => {
            grid.appendChild(buildCinemaCardNode(c));
        });
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

window.unlockAchievement = async function (achCode, title, icon) {
    const currentUser = JSON.parse(localStorage.getItem('kinoUser'));
    if (!currentUser || !currentUser.id) return;

    const achElement = document.getElementById(achCode);
    if (achElement && achElement.classList.contains('ach-unlocked')) return;

    const achId = parseInt(achCode.replace('ach', ''));
    try {
        const response = await fetch('/api/users/achievements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUser.id, achievement_id: achId })
        });
        if (response.ok) {
            if (window.showToast) window.showToast(`🏆 Открыта ачивка: ${title}!`, icon);
            window.checkAchievements();
        }
    } catch (error) { }
};

window.checkAchievements = async function () {
    const achs = ['ach1', 'ach2', 'ach3'];
    achs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('ach-unlocked');
            el.classList.add('ach-locked');
        }
    });

    const currentUser = JSON.parse(localStorage.getItem('kinoUser'));
    if (!currentUser || !currentUser.id) return;

    try {
        const response = await fetch(`/api/users/${currentUser.id}/achievements`);
        if (!response.ok) return;
        const achievements = await response.json();

        achievements.forEach(ach => {
            const el = document.getElementById(`ach${ach.id}`);
            if (el) {
                el.classList.remove('ach-locked');
                el.classList.add('ach-unlocked');
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки ачивок из БД:', error);
    }
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

    const waitData = setInterval(() => {
        if (typeof cinemasData !== 'undefined' && cinemasData.length > 0) {
            window.updateCinemas();
            clearInterval(waitData);
        }
    }, 200);
    setTimeout(() => clearInterval(waitData), 5000);

    const cinemaSearchInput = document.getElementById('cinemaSearchInput');
    if (cinemaSearchInput) {
        cinemaSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const sourceData = typeof cinemasData !== 'undefined' && cinemasData.length > 0 ? cinemasData : window.currentCinemasData;
            const filtered = sourceData.filter(c => c.name.toLowerCase().includes(query));
            window.renderCinemasGrid(filtered, document.querySelector('.select-selected')?.textContent || '');
        });
    }

    const buyTicketsBtn = document.getElementById('buyTicketsBtn');
    if (buyTicketsBtn) {
        buyTicketsBtn.addEventListener('click', () => {
            if (checkAuthFlow()) {
                const cinemasSection = document.querySelector('#cinemas');
                if (cinemasSection) cinemasSection.scrollIntoView({ behavior: 'smooth' });
                window.updateCinemas();
                window.showToast('Выберите кинотеатр и зал для сеанса', 'fa-location-dot');
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
                window.updateCinemas();
                window.showToast('Выберите кинотеатр и зал для сеанса', 'fa-location-dot');
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
        finalPayBtn.addEventListener('click', async () => {
            const seats = document.querySelectorAll('.seat.selected');
            if (seats.length === 0) return;

            const currentUser = JSON.parse(localStorage.getItem('kinoUser'));
            if (!currentUser || !currentUser.id) {
                if (window.showToast) window.showToast('Пожалуйста, войдите в аккаунт перед покупкой!', 'fa-lock');
                document.getElementById('authModal').classList.add('show-modal');
                return;
            }

            const ticketsToBuy = Array.from(seats).map((s, index) => ({
                seat: index + 10,
                movie: window.selectedMovieTitle
            }));

            try {
                const originalText = finalPayBtn.textContent;
                finalPayBtn.textContent = 'Обработка транзакции...';
                finalPayBtn.disabled = true;

                const response = await fetch('/api/tickets/buy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: currentUser.id,
                        session_id: window.selectedSessionId || 1,
                        tickets: ticketsToBuy
                    })
                });

                finalPayBtn.textContent = originalText;
                finalPayBtn.disabled = false;

                if (response.ok) {
                    window.unlockAchievement('ach1', 'Первый ряд', 'fa-ticket');

                    seats.forEach(s => {
                        s.classList.remove('selected');
                        s.classList.add('occupied');
                    });

                    document.getElementById('receiptIdBox').textContent = 'ID: #' + Math.floor(Math.random() * 90000 + 10000);
                    window.updateCheckoutMath();
                    if (window.showToast) window.showToast('Оплата проведена, билеты в БД!', 'fa-check-circle');
                }
            } catch (error) {
                console.error('Ошибка покупки:', error);
                if (window.showToast) window.showToast('Ошибка сервера при оплате', 'fa-times-circle');
                finalPayBtn.disabled = false;
            }
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

async function loadSplitPayFriends() {
    const currentUser = JSON.parse(localStorage.getItem('kinoUser'));
    const container = document.querySelector('.buddy-selector-group');
    if (!currentUser || !container) return;

    try {
        const response = await fetch(`/api/users/${currentUser.id}/friends`);
        const friends = await response.json();

        container.innerHTML = '';
        const acceptedFriends = friends.filter(f => f.status === 'accepted');

        if (acceptedFriends.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">У вас пока нет друзей для совместной оплаты.</p>';
            return;
        }

        acceptedFriends.forEach(f => {
            container.innerHTML += `
                <div class="buddy-select-item">
                    <input type="checkbox" id="buddy-${f.id}">
                    <label for="buddy-${f.id}">
                        <img src="${f.avatar_url}" alt="${f.login}">
                        <div class="buddy-meta">
                            <span>${f.login}</span>
                            <small>Готов скинуться</small>
                        </div>
                    </label>
                </div>
            `;
        });

        document.querySelectorAll('.buddy-select-item input').forEach(cb => {
            cb.addEventListener('change', window.updateCheckoutMath);
        });

    } catch (error) { }
}

async function fetchDynamicWeatherPricing() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=54.87&longitude=69.13&current_weather=true');
        const data = await response.json();
        const temp = data.current_weather.temperature;

        if (temp <= -25) {
            window.currentPromoDiscount = 0.15;
            if (window.showToast) window.showToast(`На улице ${temp}°C. Включена морозная скидка 15% и вызов InDrive!`, 'fa-snowflake');
            window.updateCheckoutMath();

            const btnContainer = document.querySelector('.payment-methods');
            if (btnContainer && !document.getElementById('indriveBtn')) {
                const taxiBtn = document.createElement('button');
                taxiBtn.id = 'indriveBtn';
                taxiBtn.className = 'btn-outline w-100';
                taxiBtn.style.marginTop = '10px';
                taxiBtn.style.borderColor = '#b3ff00';
                taxiBtn.style.color = '#b3ff00';
                taxiBtn.innerHTML = '<i class="fa-solid fa-car"></i> Вызвать InDrive ко входу';
                btnContainer.appendChild(taxiBtn);
            }
        }
    } catch (error) { }
}

async function renderMovieSessions(movieId) {
    try {
        const response = await fetch(`/api/sessions/${movieId}`);
        const sessions = await response.json();

        const modalDesc = document.getElementById('modalMovieDesc');
        let sessionsHtml = '<div class="sessions-badges" style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px;">';

        sessions.forEach(s => {
            sessionsHtml += `<button class="btn-outline session-time-btn" data-id="${s.id}" data-time="${s.show_time}" style="padding: 5px 10px; font-size:13px;">${s.show_time}</button>`;
        });
        sessionsHtml += '</div><div id="aiSnackSuggestion" style="margin-top:15px; font-size:13px; color:var(--accent);"></div>';

        modalDesc.innerHTML = 'Выберите время сеанса:' + sessionsHtml;

        document.querySelectorAll('.session-time-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.session-time-btn').forEach(b => b.style.background = 'transparent');
                this.style.background = 'var(--accent)';
                this.style.color = '#000';
                window.selectedSessionId = this.getAttribute('data-id');

                const timeStr = this.getAttribute('data-time');
                const hour = parseInt(timeStr.split(':')[0]);
                const snackBox = document.getElementById('aiSnackSuggestion');

                if (hour < 12) {
                    snackBox.innerHTML = '<i class="fa-solid fa-robot"></i> CineAI: На утренний сеанс предлагаю свежий сок и сладкий попкорн со скидкой 10%!';
                } else if (hour > 18) {
                    snackBox.innerHTML = '<i class="fa-solid fa-robot"></i> CineAI: К вечернему просмотру отлично подойдут начос с острым соусом и кола!';
                } else {
                    snackBox.innerHTML = '<i class="fa-solid fa-robot"></i> CineAI: Добавьте стандартное комбо в заказ.';
                }
            });
        });
    } catch (e) { }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('split-pay-hub')) {
        document.querySelector('a[data-id="split-pay-hub"]').addEventListener('click', loadSplitPayFriends);
    }
    fetchDynamicWeatherPricing();
});

window.swipeMovie = function (liked) {
    if (liked) {
        if (window.showToast) window.showToast('Мэтч! Ваш друг Александр тоже хочет пойти на этот фильм.', 'fa-heart');
        document.getElementById('swipeRadar').style.display = 'none';

        const splitPayHub = document.getElementById('split-pay-hub');
        if (splitPayHub) {
            splitPayHub.classList.remove('module-hidden');
            splitPayHub.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        document.getElementById('radarTitle').textContent = "Дюна: Часть третья";
        document.getElementById('radarPoster').src = "movie-tesha.png";
        document.getElementById('radarPoster').src = "movie-holop.png";
        document.getElementById('radarPoster').src = "movie-shreak5.png.png";
        document.getElementById('radarPoster').src = "movie-kuzya.png";
        document.getElementById('radarPoster').src = "movie-scarymovie.png";
        document.getElementById('radarPoster').src = "movie-lida.png";
        document.getElementById('radarPoster').src = "movie-point.png";
        document.getElementById('radarPoster').src = "movie-raspakovka.png";
        document.getElementById('swipeRadar').style.display = 'none';
    }
};

window.swipeMovie = function (liked) {
    if (liked) {
        if (window.showToast) window.showToast('Мэтч! Ваш друг тоже хочет пойти на этот фильм.', 'fa-heart');
        document.getElementById('swipeRadar').style.display = 'none';

        const splitPayHub = document.getElementById('split-pay-hub');
        if (splitPayHub) {
            splitPayHub.classList.remove('module-hidden');
            splitPayHub.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        document.getElementById('radarTitle').textContent = "Дюна: Часть третья";
        document.getElementById('radarPoster').src = "img/achivment (2).png";
    }
};



window.testAddMovie = async function () {
    const user = JSON.parse(localStorage.getItem('kinoUser'));
    if (!user) return alert('Сначала войдите в аккаунт!');

    try {
        const response = await fetch('/api/movies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-email': user.email
            },
            body: JSON.stringify({ title: 'Тестовый фильм', genre: 'Боевик', release_year: 2026, rating: 10 })
        });

        if (response.ok) {
            if (window.showToast) window.showToast('Успех! Сервер разрешил добавить фильм.', 'fa-check');
        } else if (response.status === 403) {
            alert('ОШИБКА 403: СЕРВЕР ЗАБЛОКИРОВАЛ ЗАПРОС! У вас нет прав.');
        }
    } catch (error) {
        console.error(error);
    }
};