document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('aiChatForm');
    const chatInput = document.getElementById('aiChatInput');
    const chatMessages = document.getElementById('aiChatMessagesBox');

    const configRes = await fetch('/api/config/keys');
    const configData = await configRes.json();
    const GEMINI_API_KEY = configData.geminiKey;

    let currentKeyIndex = 0;

    if (!chatForm || !chatInput || !chatMessages) return;

    const getUniqueId = () => 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

    async function fetchWithFallback(systemPrompt) {
        for (let i = currentKeyIndex; i < API_KEYS.length; i++) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEYS[i]}`;
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: systemPrompt }] }],
                        generationConfig: { responseMimeType: "application/json" }
                    })
                });

                if (response.status === 429 || response.status === 403 || response.status === 400) {
                    currentKeyIndex++;
                    continue;
                }

                if (!response.ok) throw new Error("API Error");
                return await response.json();
            } catch (error) {
                if (i === API_KEYS.length - 1) throw error;
                currentKeyIndex++;
            }
        }
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userText = chatInput.value.trim();
        if (!userText) return;

        appendMessage('Вы', userText, 'user-message');
        chatInput.value = '';

        const loadingId = appendMessage('Джуди Альварес', 'Думаю...', 'ai-message loading');

        try {
            let availableMovies = "";
            const movieCards = document.querySelectorAll('.movie-card');
            if (movieCards.length > 0) {
                movieCards.forEach(card => {
                    const title = card.querySelector('.movie-title')?.textContent || '';
                    const genreInfo = card.querySelector('.movie-genre')?.textContent || '';
                    availableMovies += `- ${title} (${genreInfo})\n`;
                });
            } else {
                availableMovies = "База фильмов загружается...";
            }

            const systemPrompt = `Ты ИИ-Джуди Альварес (в стиле Cyberpunk 2077), помощница сайта CineNova по кинотеатрам в городах Казахстана. 
            Учитывай стиль общения собеседника, ключевые моменты, располагай к себе. Отвечай кратко (не более 3-4 предложений), дерзко, но дружелюбно. Помогай с выбором фильмов.
            Одна из коронных фраз Джуди Альварес из игры Cyberpunk 2077 — «Я… чёрт, я не могу это сделать…». 
            Джуди — одна из самых талантливых монтажёров брейнданса и опытный техник. При желании она могла бы работать в индустрии развлечений и зарабатывать неплохие деньги, но поскольку ей важна независимость, она последовательно отклоняет такие предложения.
            Анархистка по духу, Джуди присоединилась к «Шельмам» в надежде, что эта группировка сможет изменить бездушный облик города.
            Не может пройти мимо несправедливости, а у таких людей в Найт-Сити часто бывают проблемы. Впрочем, некоторые считают эту черту характера главным достоинством Джуди.
            
            Запрос пользователя: "${userText}"

            ТЕКУЩАЯ АФИША КИНОТЕАТРА (рекомендуй ТОЛЬКО эти фильмы):
            ${availableMovies}

            ТВОИ ПРАВИЛА ОБЩЕНИЯ:
            1. ОБЯЗАТЕЛЬНО только если пользователь просит посоветовать фильм, назови 1-2 конкретных фильма из списка выше и кратко их опиши.
            2. Если фильмов нужного жанра сейчас нет в афише, честно скажи об этом и предложи лучшую альтернативу.
            3. Если пользователь просто общается, поддерживай диалог.

            Ты управляешь интерфейсом сайта. Выбери строго одно действие (action) из списка и нужный параметр (param):
            1. "filter_genre" -> фильтрация по жанру. param: "Комедия", "Мультфильм", "Фантастика", "Драма", "Ужасы", "Боевик", "Триллер".
            2. "sort_movies" -> сортировка. param: "ratingDesc", "ratingAsc", "yearDesc".
            3. "search" -> поиск фильма по названию. param: [название].
            4. "open_section" -> переход по разделам. param: "movies", "cinemas", "company", "collector", "about", "split-pay-hub".
            5. "toggle_theme" -> смена темы. param: пусто.
            6. "open_modal" -> открытие окон. param: "auth", "tickets".
            7. "change_city" -> смена города. param: город на английском.
            8. "none" -> для обычного общения.

            ОБЯЗАТЕЛЬНОЕ ПРАВИЛО: Твой ответ должен быть СТРОГО в формате валидного JSON-объекта, без дополнительных символов.
            {
                "answer": "твой текстовый ответ",
                "action": "одно действие из списка выше",
                "param": "параметр для действия, или пусто"
            }`;

            const data = await fetchWithFallback(systemPrompt);

            let aiText = data.candidates[0].content.parts[0].text;
            aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();

            removeMessage(loadingId);

            try {
                const aiLogic = JSON.parse(aiText);
                appendMessage('Джуди Альварес', aiLogic.answer, 'ai-message');
                executeAiCommand(aiLogic.action, aiLogic.param);
            } catch (parseError) {
                appendMessage('Джуди Альварес', aiText, 'ai-message');
            }

        } catch (error) {
            removeMessage(loadingId);
            appendMessage('Джуди Альварес', 'Извините, сеть перегружена.', 'ai-message error');
        }
    });

    function executeAiCommand(action, param) {
        if (!action || action === 'none') return;

        if (action === 'filter_genre' && param) {
            const select = document.getElementById('genreFilterSelect');
            if (select) {
                Array.from(select.options).forEach(opt => {
                    if (opt.value.toLowerCase().includes(param.toLowerCase())) select.value = opt.value;
                });
                select.dispatchEvent(new Event('change'));
                document.getElementById('movies').scrollIntoView({ behavior: 'smooth' });
            }
        }
        else if (action === 'sort_movies' && param) {
            const select = document.getElementById('sortDataSelect');
            if (select) {
                select.value = param;
                select.dispatchEvent(new Event('change'));
                document.getElementById('movies').scrollIntoView({ behavior: 'smooth' });
            }
        }
        else if (action === 'search' && param) {
            const searchInput = document.getElementById('movieSearch');
            if (searchInput) {
                searchInput.value = param;
                searchInput.dispatchEvent(new Event('input'));
                document.getElementById('movies').scrollIntoView({ behavior: 'smooth' });
            }
        }
        else if (action === 'open_section' && param) {
            const link = document.querySelector(`.main-nav a[data-id="${param}"], .action-btn-new[data-id="${param}"]`);
            if (link) {
                link.click();
            } else {
                const mod = document.getElementById(param);
                if (mod) {
                    mod.classList.remove('module-hidden');
                    mod.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
        else if (action === 'toggle_theme') {
            const themeBtn = document.getElementById('themeToggle');
            if (themeBtn) themeBtn.click();
        }
        else if (action === 'open_modal' && param) {
            if (param === 'auth') {
                document.getElementById('authModal').classList.add('show-modal');
            } else if (param === 'tickets') {
                const ticketsModal = document.getElementById('ticketsModal');
                if (ticketsModal) ticketsModal.classList.add('show-modal');
            }
        }
        else if (action === 'change_city' && param) {
            const cityItems = document.querySelectorAll('.select-items div');
            cityItems.forEach(item => {
                if (item.textContent.toLowerCase() === param.toLowerCase()) {
                    item.click();
                    if (window.showToast) window.showToast(`Город изменен на ${item.textContent}`, 'fa-map-location-dot');
                }
            });
        }
    }

    function appendMessage(sender, text, className) {
        const msgDiv = document.createElement('div');
        const msgId = getUniqueId();
        msgDiv.id = msgId;

        msgDiv.className = `chat-bubble ${className}`;
        msgDiv.style.marginBottom = '15px';
        msgDiv.style.padding = '10px 15px';
        msgDiv.style.borderRadius = '12px';
        msgDiv.style.backgroundColor = className.includes('user') ? 'rgba(0, 230, 168, 0.1)' : 'rgba(139, 149, 165, 0.1)';
        msgDiv.style.borderLeft = className.includes('user') ? 'none' : '3px solid #00e6a8';
        msgDiv.style.borderRight = className.includes('user') ? '3px solid #00e6a8' : 'none';
        msgDiv.style.textAlign = className.includes('user') ? 'right' : 'left';

        msgDiv.innerHTML = `<strong>${sender}:</strong> <div style="margin: 5px 0 0 0; line-height: 1.4;">${text.replace(/\n/g, '<br>')}</div>`;

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return msgId;
    }

    function removeMessage(id) {
        const msg = document.getElementById(id);
        if (msg) msg.remove();
    }
});