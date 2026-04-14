function setAuthMessage(targetId, message, type = 'error') {
    const el = document.getElementById(targetId);
    if (!el) return;
    if (!message) {
        el.innerHTML = '';
        return;
    }
    el.innerHTML = `<div class="auth-${type}">${MovieRecUI.esc(message)}</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    if (MovieRecUI.getCurrentUser()) {
        window.location.href = 'index.html';
    }
});

async function handleLoginSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('loginName').value.trim();
    const password = document.getElementById('loginPassword').value;

    setAuthMessage('authMessage', '');

    try {
        const result = await loginUser(name, password);
        MovieRecUI.saveCurrentUser(result.user);
        window.location.href = 'index.html';
    } catch (error) {
        setAuthMessage('authMessage', error.message, 'error');
    }
}

async function handleSignupSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const ageValue = document.getElementById('signupAge').value;
    const age = ageValue ? Number(ageValue) : null;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupPasswordConfirm').value;

    setAuthMessage('authMessage', '');

    if (password !== confirmPassword) {
        setAuthMessage('authMessage', 'Password confirmation does not match', 'error');
        return;
    }

    try {
        const result = await registerUser(name, password, age);
        MovieRecUI.saveCurrentUser(result.user);
        setAuthMessage('authMessage', 'Account created. Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 700);
    } catch (error) {
        setAuthMessage('authMessage', error.message, 'error');
    }
}
