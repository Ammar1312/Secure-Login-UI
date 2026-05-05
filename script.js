const STORAGE_KEY = 'portfolioLoginUser';
const REMEMBER_KEY = 'portfolioLoginRemember';
const THEME_KEY = 'portfolioLoginTheme';
const SESSION_KEY = 'portfolioLoginSession';

const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const themeToggle = document.getElementById('themeToggle');
const logoutButton = document.getElementById('logoutButton');
const forgotPasswordButton = document.getElementById('forgotPasswordButton');
const clearAccountButton = document.getElementById('clearAccountButton');
const closeResetModal = document.getElementById('closeResetModal');
const container = document.getElementById('container');
const dashboard = document.getElementById('dashboard');
const dashboardName = document.getElementById('dashboardName');
const dashboardEmail = document.getElementById('dashboardEmail');
const dashboardAvatar = document.getElementById('dashboardAvatar');
const dashboardTheme = document.getElementById('dashboardTheme');
const dashboardMessage = document.getElementById('dashboardMessage');
const resetModal = document.getElementById('resetModal');
const resetForm = document.getElementById('resetForm');
const forms = document.querySelectorAll('.auth-form');
const passwordToggles = document.querySelectorAll('.toggle-password');
const strengthInput = document.querySelector('.strength-password');
const strengthMeter = document.querySelector('.strength-meter');
const strengthText = document.querySelector('.strength-text');

const getStoredUser = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');

const getInitial = (name) => name.trim().charAt(0).toUpperCase() || 'U';

const showDashboard = (user) => {
	dashboardName.textContent = user.name;
	dashboardEmail.textContent = user.email;
	dashboardAvatar.textContent = getInitial(user.name);
	dashboardTheme.textContent = document.documentElement.dataset.theme === 'dark' ? 'Dark mode' : 'Light mode';
	dashboardMessage.textContent = '';
	dashboardMessage.className = 'dashboard-message';
	container.hidden = true;
	dashboard.hidden = false;
};

const showAuth = () => {
	dashboard.hidden = true;
	container.hidden = false;
};

const setPanel = (panel) => {
	container.classList.toggle('right-panel-active', panel === 'sign-up');
	clearMessages();
};

const clearMessages = () => {
	forms.forEach((form) => {
		form.querySelector('.message').textContent = '';
		form.querySelector('.message').className = 'message';
		form.querySelectorAll('input').forEach((input) => input.classList.remove('error'));
	});
};

const setMessage = (form, text, type) => {
	const message = form.querySelector('.message');
	message.textContent = text;
	message.className = `message ${type}`;
};

const openResetModal = () => {
	const signInEmail = document.getElementById('signInForm').elements.email.value.trim();
	resetForm.elements.email.value = signInEmail || localStorage.getItem(REMEMBER_KEY) || '';
	setMessage(resetForm, '', '');
	resetForm.elements.email.classList.remove('error');
	resetModal.hidden = false;
	resetForm.elements.email.focus();
};

const closeModal = () => {
	resetModal.hidden = true;
};

const setLoading = (form, isLoading) => {
	const button = form.querySelector('.primary-button');

	if (!button.dataset.defaultText) {
		button.dataset.defaultText = button.textContent;
	}

	button.disabled = isLoading;
	button.textContent = isLoading ? 'Please wait...' : button.dataset.defaultText;
};

const delay = (time = 650) => new Promise((resolve) => {
	window.setTimeout(resolve, time);
});

const getPasswordStrength = (password) => {
	let score = 0;

	if (password.length >= 6) score += 1;
	if (password.length >= 10) score += 1;
	if (/[A-Z]/.test(password)) score += 1;
	if (/[0-9]/.test(password)) score += 1;
	if (/[^A-Za-z0-9]/.test(password)) score += 1;

	if (!password) return { label: 'Password strength', level: '' };
	if (score <= 2) return { label: 'Weak password', level: 'weak' };
	if (score <= 4) return { label: 'Medium password', level: 'medium' };
	return { label: 'Strong password', level: 'strong' };
};

const updatePasswordStrength = () => {
	const result = getPasswordStrength(strengthInput.value);
	strengthMeter.className = `strength-meter ${result.level}`.trim();
	strengthText.textContent = result.label;
};

const validateForm = (form) => {
	let isValid = true;
	const inputs = form.querySelectorAll('input[required]');

	inputs.forEach((input) => {
		const value = input.value.trim();
		const hasShortPassword = input.name === 'password' && value.length < 6;
		const hasInvalidEmail = input.type === 'email' && !input.validity.valid;
		const hasError = !value || hasShortPassword || hasInvalidEmail;

		input.classList.toggle('error', hasError);

		if (hasError) {
			isValid = false;
		}
	});

	return isValid;
};

const saveRememberedEmail = (form) => {
	const email = form.elements.email.value.trim();

	if (form.elements.remember.checked) {
		localStorage.setItem(REMEMBER_KEY, email);
		return;
	}

	localStorage.removeItem(REMEMBER_KEY);
};

const handleSignUp = async (form) => {
	const user = {
		name: form.elements.name.value.trim(),
		email: form.elements.email.value.trim().toLowerCase(),
		password: form.elements.password.value,
	};

	setLoading(form, true);
	await delay();
	localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
	setLoading(form, false);

	setMessage(form, 'Account saved for this demo. You can sign in now.', 'success');
	form.reset();
	updatePasswordStrength();
	window.setTimeout(() => setPanel('sign-in'), 900);
};

const handleSignIn = async (form) => {
	const storedUser = getStoredUser();
	const email = form.elements.email.value.trim().toLowerCase();
	const password = form.elements.password.value;

	setLoading(form, true);
	await delay();
	setLoading(form, false);

	if (!storedUser) {
		setMessage(form, 'Create an account first, then sign in here.', 'error');
		return;
	}

	if (storedUser.email !== email || storedUser.password !== password) {
		setMessage(form, 'Email or password is not correct for this demo account.', 'error');
		form.elements.password.classList.add('error');
		return;
	}

	saveRememberedEmail(form);
	setMessage(form, `Welcome back, ${storedUser.name}.`, 'success');
	localStorage.setItem(SESSION_KEY, storedUser.email);
	form.reset();

	if (localStorage.getItem(REMEMBER_KEY)) {
		form.elements.email.value = email;
		form.elements.remember.checked = true;
	}

	window.setTimeout(() => showDashboard(storedUser), 450);
};

const applyTheme = (theme) => {
	const isDark = theme === 'dark';
	document.documentElement.dataset.theme = theme;
	themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
	themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
	dashboardTheme.textContent = isDark ? 'Dark mode' : 'Light mode';
	localStorage.setItem(THEME_KEY, theme);
};

const loadRememberedEmail = () => {
	const rememberedEmail = localStorage.getItem(REMEMBER_KEY);
	const signInForm = document.getElementById('signInForm');

	if (rememberedEmail) {
		signInForm.elements.email.value = rememberedEmail;
		signInForm.elements.remember.checked = true;
	}
};

signUpButton.addEventListener('click', () => setPanel('sign-up'));
signInButton.addEventListener('click', () => setPanel('sign-in'));

logoutButton.addEventListener('click', () => {
	localStorage.removeItem(SESSION_KEY);
	showAuth();
	setPanel('sign-in');
});

forgotPasswordButton.addEventListener('click', openResetModal);
closeResetModal.addEventListener('click', closeModal);

resetModal.addEventListener('click', (event) => {
	if (event.target === resetModal) {
		closeModal();
	}
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && !resetModal.hidden) {
		closeModal();
	}
});

clearAccountButton.addEventListener('click', () => {
	localStorage.removeItem(STORAGE_KEY);
	localStorage.removeItem(REMEMBER_KEY);
	localStorage.removeItem(SESSION_KEY);
	dashboardMessage.textContent = 'Demo account cleared.';
	dashboardMessage.className = 'dashboard-message success';
	window.setTimeout(() => {
		showAuth();
		setPanel('sign-up');
	}, 650);
});

themeToggle.addEventListener('click', () => {
	const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
	applyTheme(currentTheme);
});

passwordToggles.forEach((button) => {
	button.addEventListener('click', () => {
		const input = button.parentElement.querySelector('input');
		const icon = button.querySelector('i');
		const shouldShow = input.type === 'password';

		input.type = shouldShow ? 'text' : 'password';
		button.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
		icon.className = shouldShow ? 'far fa-eye-slash' : 'far fa-eye';
	});
});

forms.forEach((form) => {
	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		clearMessages();

		if (!validateForm(form)) {
			setMessage(form, 'Please check the highlighted fields.', 'error');
			return;
		}

		if (form.id === 'signUpForm') {
			await handleSignUp(form);
			return;
		}

		await handleSignIn(form);
	});
});

resetForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	if (!validateForm(resetForm)) {
		setMessage(resetForm, 'Enter a valid email address.', 'error');
		return;
	}

	const storedUser = getStoredUser();
	const email = resetForm.elements.email.value.trim().toLowerCase();

	setLoading(resetForm, true);
	await delay(500);
	setLoading(resetForm, false);

	if (!storedUser || storedUser.email !== email) {
		resetForm.elements.email.classList.add('error');
		setMessage(resetForm, 'No demo account found for this email.', 'error');
		return;
	}

	setMessage(resetForm, 'Reset preview ready. In a real app, an email would be sent.', 'success');
});

document.querySelectorAll('.social').forEach((link) => {
	link.addEventListener('click', (event) => {
		event.preventDefault();
	});
});

const addMobileSwitch = (form, label, panel) => {
	const button = document.createElement('button');
	button.className = 'mobile-switch';
	button.type = 'button';
	button.textContent = label;
	button.addEventListener('click', () => setPanel(panel));
	form.appendChild(button);
};

strengthInput.addEventListener('input', updatePasswordStrength);

addMobileSwitch(document.getElementById('signInForm'), 'Need an account? Sign Up', 'sign-up');
addMobileSwitch(document.getElementById('signUpForm'), 'Already registered? Sign In', 'sign-in');
applyTheme(localStorage.getItem(THEME_KEY) || 'light');
loadRememberedEmail();
updatePasswordStrength();

const activeUser = getStoredUser();
const activeSession = localStorage.getItem(SESSION_KEY);

if (activeUser && activeUser.email === activeSession) {
	showDashboard(activeUser);
}
