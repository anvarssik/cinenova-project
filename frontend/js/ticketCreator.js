const configRes = await fetch('/api/config/keys');
const configData = await configRes.json();
const GEMINI_API_KEY = configData.geminiKey;

document.addEventListener('DOMContentLoaded', () => {
    const ticketForm = document.getElementById('aiTicketForm');

    if (ticketForm) {
        ticketForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const theme = document.getElementById('ticketTheme').value.trim();
            const movie = document.getElementById('ticketMovie').value.trim();
            const count = parseInt(document.getElementById('ticketCount').value) || 1;

            const btn = document.getElementById('generateTicketBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Рисуем нейро-билет...';
            btn.disabled = true;

            await generateAITicket(theme, movie, count);

            btn.innerHTML = originalText;
            btn.disabled = false;
        });
    }
});

// Авто-переводчик 
async function translatePrompt(text) {
    try {
        if (/[а-яА-ЯЁё]/.test(text)) {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=${encodeURIComponent(text)}`;
            const response = await fetch(url);
            const data = await response.json();
            return data[0][0][0];
        }
        return text;
    } catch (error) {
        return text;
    }
}

// Gemini как строгий Промпт-Инженер
async function generateImagePromptWithGemini(userIdea) {
    const englishIdea = await translatePrompt(userIdea);
    const fallbackPrompt = "cinematic background, abstract dark shapes, beautiful lighting, 8k resolution, empty center";

    if (!GEMINI_API_KEY || GEMINI_API_KEY === "ТВОЙ_КЛЮЧ_ЗДЕСЬ") {
        return fallbackPrompt;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        // СТРОГОЕ УКАЗАНИЕ: Максимум 40 слов, одно предложение, никаких переносов строк.
        const systemPrompt = `You are an expert AI image prompt engineer. Create a highly detailed but CONCISE prompt (MAX 40 WORDS, ONE SINGLE SENTENCE) for an image generator based on this idea: "${englishIdea}". The image will be used as a background for a cinematic movie ticket. Focus on atmosphere, cinematic lighting, and style. NO text, NO letters, NO watermarks. DO NOT use line breaks or paragraphs. Return ONLY the prompt text.`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        if (!response.ok) return fallbackPrompt;

        const data = await response.json();
        let promptText = data.candidates[0].content.parts[0].text.trim();

        // ОЧИСТКА: Удаляем любые случайные переносы строк (\n) и лишние пробелы, чтобы не ломать URL
        promptText = promptText.replace(/\n|\r/g, ' ').replace(/\s+/g, ' ');

        return promptText;

    } catch (error) {
        return fallbackPrompt;
    }
}

async function generateAITicket(themePrompt, movieName, quantity) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 300;

    // 1. Получаем чистый и емкий промпт от Gemini
    const detailedPrompt = await generateImagePromptWithGemini(themePrompt);
    const cacheBuster = Date.now();

    // Для резервного абстрактного фона берем только первые 50 символов, чтобы не перегружать ссылку
    const shortSeed = encodeURIComponent(detailedPrompt.substring(0, 50));

    // 2. Бронебойный КАСКАД источников
    const imageSources = [
        `https://image.pollinations.ai/prompt/${encodeURIComponent(detailedPrompt)}?width=800&height=300&nologo=true&seed=${cacheBuster}`,
        `https://api.dicebear.com/9.x/glass/png?seed=${shortSeed}-${cacheBuster}&width=800&height=300`
    ];

    let imageLoaded = false;
    const image = new Image();
    image.crossOrigin = "Anonymous";

    // 3. Пытаемся загрузить картинки по очереди
    for (const imgUrl of imageSources) {
        try {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error("Timeout")), 15000);

                image.onload = () => {
                    clearTimeout(timeout);
                    imageLoaded = true;
                    resolve();
                };

                image.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error("Load Error"));
                };

                image.src = imgUrl;
            });

            if (imageLoaded) break; // Успех! Выходим из цикла.

        } catch (e) {
            console.warn("Источник недоступен, переключаемся на резервный...");
            imageLoaded = false;
        }
    }

    // 4. Отрисовка билета
    try {
        for (let i = 0; i < quantity; i++) {
            ctx.clearRect(0, 0, 800, 300);

            // ФОРМА БИЛЕТА
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(20, 0);
            ctx.lineTo(780, 0);
            ctx.quadraticCurveTo(800, 0, 800, 20);
            ctx.lineTo(800, 120);
            ctx.arc(800, 150, 30, Math.PI * 1.5, Math.PI * 0.5, true);
            ctx.lineTo(800, 280);
            ctx.quadraticCurveTo(800, 300, 780, 300);
            ctx.lineTo(20, 300);
            ctx.quadraticCurveTo(0, 300, 0, 280);
            ctx.lineTo(0, 180);
            ctx.arc(0, 150, 30, Math.PI * 0.5, Math.PI * 1.5, true);
            ctx.lineTo(0, 20);
            ctx.quadraticCurveTo(0, 0, 20, 0);
            ctx.closePath();
            ctx.clip();

            // ОТРИСОВКА ФОНА
            if (imageLoaded) {
                ctx.drawImage(image, 0, 0, 800, 300);
            } else {
                const bgGrad = ctx.createLinearGradient(0, 0, 800, 300);
                bgGrad.addColorStop(0, "#0f172a");
                bgGrad.addColorStop(1, "#1e1b4b");
                ctx.fillStyle = bgGrad;
                ctx.fillRect(0, 0, 800, 300);
            }

            // ЗАТЕМНЕНИЕ
            const overlayGrad = ctx.createLinearGradient(0, 0, 800, 0);
            overlayGrad.addColorStop(0, "rgba(11, 15, 25, 0.95)");
            overlayGrad.addColorStop(0.4, "rgba(11, 15, 25, 0.4)");
            overlayGrad.addColorStop(1, "rgba(11, 15, 25, 0.95)");
            ctx.fillStyle = overlayGrad;
            ctx.fillRect(0, 0, 800, 300);

            // ПУНКТИР
            ctx.beginPath();
            ctx.setLineDash([8, 8]);
            ctx.moveTo(620, 20);
            ctx.lineTo(620, 280);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            // ТЕНИ
            ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            // ТЕКСТ
            ctx.fillStyle = "#00e6a8";
            ctx.font = "900 32px 'Montserrat', sans-serif";
            ctx.fillText("CINENOVA", 45, 65);

            ctx.fillStyle = "#ffffff";
            ctx.font = "900 46px 'Montserrat', sans-serif";
            ctx.fillText("VIP TICKET", 45, 120);

            ctx.fillStyle = "#00e6a8";
            ctx.font = "700 14px 'Montserrat', sans-serif";
            ctx.fillText("MOVIE", 45, 175);

            ctx.fillStyle = "#ffffff";
            ctx.font = "800 28px 'Montserrat', sans-serif";
            ctx.fillText(movieName.toUpperCase(), 45, 205, 520);

            ctx.fillStyle = "#8b95a5";
            ctx.font = "600 14px 'Montserrat', sans-serif";
            ctx.fillText("DATE: OPEN", 45, 245);
            ctx.fillText("TIME: ANY", 180, 245);
            ctx.fillText("SEAT: FREE", 310, 245);

            const uniqueId = 'TCK-' + Math.random().toString(36).substring(2, 8).toUpperCase();

            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.font = "500 12px 'Montserrat', sans-serif";
            ctx.fillText(`NO. ${i + 1}/${quantity}  |  ID: ${uniqueId}`, 45, 275);

            // КОРЕШОК
            ctx.shadowColor = "transparent";
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            for (let x = 655; x < 745; x += Math.random() * 4 + 2) {
                const lineWidth = Math.random() * 2 + 1;
                ctx.fillRect(x, 50, lineWidth, 140);
            }

            ctx.save();
            ctx.translate(765, 230);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = "#00e6a8";
            ctx.font = "900 24px 'Montserrat', sans-serif";
            ctx.fillText("ADMIT ONE", 0, 0);
            ctx.restore();

            // СКАЧИВАНИЕ
            const downloadLink = document.createElement('a');
            downloadLink.download = `CineNova_${uniqueId}.png`;
            downloadLink.href = canvas.toDataURL('image/png');
            downloadLink.click();

            await new Promise(res => setTimeout(res, 600));
        }

        if (window.showToast) window.showToast(`Успешно создано: ${quantity} шт.`, 'fa-check');

    } catch (error) {
        console.error("Глобальная ошибка генерации:", error);
        if (window.showToast) window.showToast(`Произошла системная ошибка`, 'fa-xmark');
    }
}