document.addEventListener('DOMContentLoaded', () => {
    // Ждем чуть-чуть, чтобы localStorage успел прогрузиться
    setTimeout(() => {
        if (localStorage.getItem('isLoggedIn') === 'true') {
            loadUserProfile();
            if (typeof window.loadMyFriends === 'function') {
                window.loadMyFriends();
            }
        }
    }, 500);

    const privacyToggle = document.getElementById('privacyToggle');
    if (privacyToggle) {
        privacyToggle.addEventListener('change', async (e) => {
            const user = JSON.parse(localStorage.getItem('kinoUser'));
            if (!user) return;

            const isPrivate = e.target.checked ? 1 : 0;
            user.is_private = isPrivate;
            localStorage.setItem('kinoUser', JSON.stringify(user));

            await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, avatar_url: user.avatar_url, is_private: isPrivate })
            });
            if (window.showToast) window.showToast(isPrivate ? 'Профиль теперь скрыт' : 'Профиль публичный', 'fa-eye-slash');
        });
    }

    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            const user = JSON.parse(localStorage.getItem('kinoUser'));
            if (file && user) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const newAvatar = event.target.result;
                    document.getElementById('profileAvatar').src = newAvatar;
                    user.avatar_url = newAvatar;
                    localStorage.setItem('kinoUser', JSON.stringify(user));

                    await fetch('/api/users/profile', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: user.email, avatar_url: newAvatar, is_private: user.is_private })
                    });
                    if (window.showToast) window.showToast('Аватар обновлен', 'fa-image');
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem('kinoUser'));
    if (!user) return;

    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const avatarEl = document.getElementById('profileAvatar');
    const privacyEl = document.getElementById('privacyToggle');

    if (nameEl) nameEl.textContent = user.login || 'Пользователь';
    if (emailEl) emailEl.textContent = user.email || 'Нет email';
    if (avatarEl && user.avatar_url) avatarEl.src = user.avatar_url;
    if (privacyEl) privacyEl.checked = user.is_private === 1;
}

window.loadMyFriends = async function () {
    const user = JSON.parse(localStorage.getItem('kinoUser'));
    const container = document.getElementById('friendsContainer');
    if (!user || !container) return;

    try {
        const response = await fetch(`/api/users/${user.id}/friends`);
        if (!response.ok) throw new Error('Network error');

        const friends = await response.json();
        container.innerHTML = '';

        if (friends.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted); font-size: 14px;">У вас пока нет друзей или входящих заявок.</p>';
            return;
        }

        friends.forEach(f => {
            const card = document.createElement('div');
            card.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding: 10px; background: rgba(139,149,165,0.05); border-radius: 8px; cursor: pointer;';

            let actionHtml = '';
            if (f.status === 'pending' && f.user_id2 === user.id) {
                actionHtml = `<button class="btn-primary" style="padding: 5px 15px; font-size:12px;" onclick="event.stopPropagation(); acceptInviteReq(${f.user_id1}, ${f.user_id2})">Принять</button>`;
            } else if (f.status === 'pending' && f.user_id1 === user.id) {
                actionHtml = `<span style="font-size:12px; color:var(--text-muted);">Заявка отправлена</span>`;
            } else if (f.status === 'accepted') {
                actionHtml = `<span style="font-size:12px; color:var(--accent);"><i class="fa-solid fa-check-double"></i> Друзья</span>`;
            }

            card.innerHTML = `
                <div style="display:flex; align-items:center; gap: 10px;">
                    <img src="${f.avatar_url}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                    <strong style="font-size: 15px;">${f.login}</strong>
                </div>
                ${actionHtml}
            `;

            // Клик по карточке друга открывает его профиль
            card.onclick = () => {
                if (window.openPublicProfile) window.openPublicProfile(f.id);
            };
            container.appendChild(card);
        });
    } catch (e) {
        console.error('Ошибка загрузки друзей:', e);
        container.innerHTML = '<p style="color:#ff4757; font-size: 14px;">Ошибка соединения с сервером.</p>';
    }
};

window.acceptInviteReq = async function (user_id1, user_id2) {
    try {
        const res = await fetch('/api/users/invite/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id1, user_id2 })
        });
        if (res.ok) {
            if (window.showToast) window.showToast('Заявка в друзья принята!', 'fa-user-group');
            window.loadMyFriends();
        }
    } catch (error) {
        console.error(error);
    }
};

// Функция просмотра чужих профилей
window.openPublicProfile = async function (userId) {
    try {
        const res = await fetch(`/api/users/details/${userId}`);
        if (!res.ok) return;
        const data = await res.json();

        const modal = document.getElementById('publicProfileModal');
        if (!modal) return;

        document.getElementById('pubAvatar').src = data.avatar_url || 'img/avatar1.png';
        document.getElementById('pubName').textContent = data.login;

        const content = document.getElementById('pubDataContent');
        if (data.is_private) {
            content.innerHTML = '<p style="color:var(--text-muted);"><i class="fa-solid fa-lock"></i> Профиль скрыт настройками приватности</p>';
        } else {
            let ticketsHtml = data.tickets && data.tickets.length > 0
                ? data.tickets.map(t => `<span class="tag tag-outline">${t.movie_title}</span>`).join('')
                : 'Пока нет билетов';
            content.innerHTML = `
                <div style="margin-top:15px;">
                    <h4 style="margin-bottom:5px;">Смотрит:</h4>
                    <div class="tags" style="justify-content:center;">${ticketsHtml}</div>
                </div>
            `;
        }
        modal.classList.add('show-modal');
    } catch (e) {
        console.error('Ошибка загрузки чужого профиля', e);
    }
};