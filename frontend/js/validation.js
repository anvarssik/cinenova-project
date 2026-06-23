function showError(input, message) {
    input.classList.add('input-error');
    const errorContainer = input.parentElement.classList.contains('input-group')
        ? input.parentElement.nextElementSibling
        : input.nextElementSibling;

    if (errorContainer && errorContainer.classList.contains('error-text')) {
        errorContainer.textContent = message;
    }
}

function clearError(input) {
    input.classList.remove('input-error');
    const errorContainer = input.parentElement.classList.contains('input-group')
        ? input.parentElement.nextElementSibling
        : input.nextElementSibling;

    if (errorContainer && errorContainer.classList.contains('error-text')) {
        errorContainer.textContent = '';
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    const re = /^\+?[0-9\s\-\(\)]{10,20}$/;
    return re.test(String(phone).trim());
}

function handleInputEvents(inputs) {
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') return;
        input.addEventListener('input', () => {
            clearError(input);
        });
    });
}

function validateContactForm(e) {
    e.preventDefault();
    let isValid = true;

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const phoneInput = document.getElementById('contactPhone');
    const messageInput = document.getElementById('contactMessage');

    clearError(nameInput);
    clearError(emailInput);
    clearError(phoneInput);
    clearError(messageInput);

    if (!nameInput.value.trim()) {
        showError(nameInput, 'Введите ваше имя');
        isValid = false;
    } else if (nameInput.value.trim().length < 2) {
        showError(nameInput, 'Имя слишком короткое');
        isValid = false;
    }

    if (!emailInput.value.trim()) {
        showError(emailInput, 'Введите Email');
        isValid = false;
    } else if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'Email введён неверно');
        isValid = false;
    }

    if (!phoneInput.value.trim()) {
        showError(phoneInput, 'Введите номер телефона');
        isValid = false;
    } else if (!validatePhone(phoneInput.value)) {
        showError(phoneInput, 'Номер телефона введён неверно');
        isValid = false;
    }

    if (!messageInput.value.trim()) {
        showError(messageInput, 'Введите сообщение');
        isValid = false;
    } else if (messageInput.value.trim().length < 10) {
        showError(messageInput, 'Сообщение должно содержать не менее 10 символов');
        isValid = false;
    }

    if (isValid) {
        if (window.showToast) window.showToast('Сообщение успешно отправлено!', 'fa-check');
        document.getElementById('contactForm').reset();
    }
}

async function validateRegisterForm(e) {
    e.preventDefault();
    let isValid = true;

    const nameInput = document.getElementById('regName');
    const emailInput = document.getElementById('regEmail');
    const phoneInput = document.getElementById('regPhone');
    const passwordInput = document.getElementById('regPassword');
    const termsInput = document.getElementById('regTerms');
    const termsError = document.getElementById('regTermsError');

    clearError(nameInput);
    clearError(emailInput);
    clearError(phoneInput);
    clearError(passwordInput);
    termsError.textContent = '';

    if (!nameInput.value.trim()) {
        showError(nameInput, 'Введите логин');
        isValid = false;
    } else if (nameInput.value.trim().length < 4 || nameInput.value.trim().length > 15) {
        showError(nameInput, 'Логин должен быть от 4 до 15 символов');
        isValid = false;
    }

    if (!emailInput.value.trim()) {
        showError(emailInput, 'Введите Email');
        isValid = false;
    } else if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'Email введён неверно');
        isValid = false;
    }

    if (!phoneInput.value.trim()) {
        showError(phoneInput, 'Введите номер телефона');
        isValid = false;
    } else if (!validatePhone(phoneInput.value)) {
        showError(phoneInput, 'Номер телефона введён неверно');
        isValid = false;
    }

    if (!passwordInput.value.trim()) {
        showError(passwordInput, 'Введите пароль');
        isValid = false;
    } else if (passwordInput.value.length < 8) {
        showError(passwordInput, 'Пароль слишком короткий (минимум 8 символов)');
        isValid = false;
    }

    if (!termsInput.checked) {
        termsError.textContent = 'Необходимо принять условия использования';
        isValid = false;
    }

    if (isValid) {
        const userData = {
            login: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            password: passwordInput.value.trim()
        };

        try {
            const submitBtn = document.querySelector('#registerForm .submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Регистрация...';
            submitBtn.disabled = true;

            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            if (response.ok) {
                if (window.setLoggedIn) window.setLoggedIn(data.user.role === 'admin');
                document.getElementById('authModal').classList.remove('show-modal');
                if (window.showToast) window.showToast('Аккаунт успешно создан!', 'fa-user-check');
                document.getElementById('registerForm').reset();
            } else {
                showError(emailInput, data.error || 'Произошла ошибка при регистрации');
                if (window.showToast) window.showToast('Ошибка регистрации', 'fa-circle-xmark');
            }

        } catch (error) {
            console.error('Ошибка сети:', error);
            showError(emailInput, 'Ошибка соединения с сервером');
        }
    }
}

async function validateLoginForm(e) {
    e.preventDefault();
    let isValid = true;

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    clearError(emailInput);
    clearError(passwordInput);

    if (!emailInput.value.trim()) {
        showError(emailInput, 'Введите Email');
        isValid = false;
    } else if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'Email введён неверно');
        isValid = false;
    }

    if (!passwordInput.value.trim()) {
        showError(passwordInput, 'Введите пароль');
        isValid = false;
    }

    if (isValid) {
        const loginData = {
            email: emailInput.value.trim(),
            password: passwordInput.value.trim()
        };

        try {
            const submitBtn = document.querySelector('#loginForm .submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Вход...';
            submitBtn.disabled = true;

            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            if (response.ok) {
                localStorage.setItem('kinoUser', JSON.stringify(data.user));
                if (window.setLoggedIn) window.setLoggedIn();
                document.getElementById('authModal').classList.remove('show-modal');
                if (window.showToast) window.showToast('Вы успешно вошли в систему!', 'fa-user-check');
                document.getElementById('loginForm').reset();
            } else {
                showError(passwordInput, data.error || 'Ошибка авторизации');
            }
        } catch (error) {
            showError(emailInput, 'Ошибка соединения с сервером');
        }
    }
}
function validateNewsletterForm(e) {
    e.preventDefault();
    let isValid = true;

    const emailInput = document.getElementById('newsletterEmail');
    clearError(emailInput);

    if (!emailInput.value.trim()) {
        showError(emailInput, 'Введите Email');
        isValid = false;
    } else if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'Email введён неверно');
        isValid = false;
    }

    if (isValid) {
        if (window.showToast) window.showToast('Вы успешно подписались на рассылку!', 'fa-envelope-open-text');
        document.getElementById('newsletterForm').reset();
    }
}

function validateChatForm(e) {
    e.preventDefault();
    const input = document.getElementById('chatMessageInput');
    if (input.value.trim() !== '') {
        input.value = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const newsletterForm = document.getElementById('newsletterForm');

    if (contactForm) {
        contactForm.addEventListener('submit', validateContactForm);
        handleInputEvents(contactForm.querySelectorAll('input, textarea'));
    }

    if (registerForm) {
        registerForm.addEventListener('submit', validateRegisterForm);
        handleInputEvents(registerForm.querySelectorAll('input'));

        const termsInput = document.getElementById('regTerms');
        if (termsInput) {
            termsInput.addEventListener('change', () => {
                document.getElementById('regTermsError').textContent = '';
            });
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', validateLoginForm);
        handleInputEvents(loginForm.querySelectorAll('input'));
    }

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', validateNewsletterForm);
        handleInputEvents(newsletterForm.querySelectorAll('input'));
    }
});