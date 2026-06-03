let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

function updateAuthUI() {
    const authBtn = document.getElementById('openAuthModal');
    if (authBtn) {
        if (isLoggedIn) {
            authBtn.textContent = 'Выход';
            authBtn.onclick = (e) => {
                e.preventDefault();
                window.setLoggedOut();
            };
        } else {
            authBtn.textContent = 'Sign In | Register';
            authBtn.onclick = (e) => {
                e.preventDefault();
                document.getElementById('authModal').classList.add('show-modal');
            };
        }
    }
}

function initSeatMap() {
    const seatMap = document.getElementById('seatMap');
    if (!seatMap) return;
    seatMap.innerHTML = '';

    for (let g = 0; g < 3; g++) {
        const group = document.createElement('div');
        group.className = 'seat-group';
        for (let i = 0; i < 12; i++) {
            const seat = document.createElement('div');
            const isOccupied = Math.random() > 0.7;
            seat.className = `seat ${isOccupied ? 'occupied' : 'available'}`;
            if (!isOccupied) {
                seat.addEventListener('click', function () {
                    this.classList.toggle('selected');
                    updateMapCheckout();
                });
            }
            group.appendChild(seat);
        }
        seatMap.appendChild(group);
    }
}

function updateMapCheckout() {
    const selectedSeats = document.querySelectorAll('.seat.selected').length;
    const mapPayBtn = document.getElementById('mapPayBtn');
    if (selectedSeats > 0) {
        mapPayBtn.classList.remove('hidden-element');
    } else {
        mapPayBtn.classList.add('hidden-element');
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

document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    initSeatMap();

    const moviesGrid = document.getElementById('moviesGrid');
    let ach1Unlocked = false;
    if (moviesGrid) {
        moviesGrid.addEventListener('scroll', () => {
            if (!ach1Unlocked && moviesGrid.scrollLeft + moviesGrid.clientWidth >= moviesGrid.scrollWidth - 20) {
                ach1Unlocked = true;
                const achIcon = document.getElementById('ach1');
                if (achIcon) {
                    achIcon.classList.remove('ach-locked');
                    achIcon.classList.add('ach-unlocked');
                    if (window.showToast) window.showToast('Достижение разблокировано: Киноман!', 'fa-trophy');
                }
            }
        });
    }

    const buyTicketsBtn = document.getElementById('buyTicketsBtn');
    if (buyTicketsBtn) {
        buyTicketsBtn.addEventListener('click', () => {
            if (checkAuthFlow()) {
                const mapSection = document.querySelector('.interactive-map');
                if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    const mapPayBtn = document.getElementById('mapPayBtn');
    if (mapPayBtn) {
        mapPayBtn.addEventListener('click', () => {
            if (checkAuthFlow()) {
                const selectedSeats = document.querySelectorAll('.seat.selected').length;
                document.getElementById('checkoutTicketCount').textContent = `${selectedSeats} шт.`;
                document.getElementById('checkoutTotalSum').textContent = `${selectedSeats * 2500} ₸`;
                document.getElementById('checkoutYourShare').textContent = `${Math.ceil((selectedSeats * 2500) / 3)} ₸`;

                const splitPayHub = document.getElementById('split-pay-hub');
                if (splitPayHub) {
                    splitPayHub.classList.remove('module-hidden');
                    splitPayHub.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    const restrictedActions = document.querySelectorAll('.action-restricted');
    restrictedActions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (checkAuthFlow()) {
                const action = btn.getAttribute('data-action');
                if (action === 'invite') if (window.showToast) window.showToast('Инвайт успешно отправлен!', 'fa-paper-plane');
                if (action === 'create') if (window.showToast) window.showToast('Генерация нового билета...', 'fa-wand-magic-sparkles');
                if (action === 'cases') if (window.showToast) window.showToast('Открываем кейс...', 'fa-box-open');
            }
        });
    });

    const finalPayBtn = document.getElementById('finalPayBtn');
    if (finalPayBtn) {
        finalPayBtn.addEventListener('click', () => {
            if (window.showToast) window.showToast('Оплата успешно проведена!', 'fa-check-circle');
            document.querySelectorAll('.seat.selected').forEach(s => {
                s.classList.remove('selected');
                s.classList.replace('available', 'occupied');
            });
            updateMapCheckout();
        });
    }
});