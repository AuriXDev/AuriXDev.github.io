let isGold = false;
const DAILY_TOKEN_LIMIT = 1000;

function getTokensKey() {
    return 'cubik_tokens_' + new Date().toDateString();
}

function getUsedTokens() {
    for (let k of Object.keys(localStorage)) {
        if (k.startsWith('cubik_tokens_') && k !== getTokensKey()) {
            localStorage.removeItem(k);
        }
    }
    return parseInt(localStorage.getItem(getTokensKey()) || '0');
}

function addUsedTokens(count) {
    const key = getTokensKey();
    const used = getUsedTokens() + count;
    localStorage.setItem(key, used);
    updateTokenCounter();
}

function getRemainingTokens() {
    return Math.max(0, DAILY_TOKEN_LIMIT - getUsedTokens());
}

function hasEnoughTokens(needed = 1) {
    return getRemainingTokens() >= needed;
}

window.TOKENS = function(amount) {
    if (amount === undefined) {
        console.log(`ост ток: ${getRemainingTokens()}/${DAILY_TOKEN_LIMIT}`);
        return getRemainingTokens();
    }
    const key = getTokensKey();
    const current = getUsedTokens();
    const newAmount = Math.max(0, current - amount);
    localStorage.setItem(key, newAmount);
    updateTokenCounter();
    console.log(`добавлено ${amount} ток`);
    return getRemainingTokens();
};

window.addTokens = window.TOKENS;

function updateTokenCounter() {
    const used = getUsedTokens();
    const remaining = Math.max(0, DAILY_TOKEN_LIMIT - used);
    const percent = Math.max(0, ((DAILY_TOKEN_LIMIT - remaining) / DAILY_TOKEN_LIMIT) * 100);
    
    const el = document.getElementById('tokenCounterText');
    const fill = document.getElementById('tokenProgressFill');
    
    if (el) el.textContent = `${remaining}/${DAILY_TOKEN_LIMIT}`;
    if (fill) {
        fill.style.width = `${Math.min(100, percent)}%`;
        if (remaining < 100) {
            fill.style.background = '#ff4444';
            fill.style.opacity = '0.3';
        } else if (remaining < 300) {
            fill.style.background = '#ff8800';
            fill.style.opacity = '0.25';
        } else {
            fill.style.background = '#667eea';
            fill.style.opacity = '0.2';
        }
    }
}

function getUser() {
    const u = localStorage.getItem('cubik_user');
    return u ? JSON.parse(u) : null;
}

function saveUser(obj) {
    localStorage.setItem('cubik_user', JSON.stringify(obj));
}

function loadAccountState() {
    const user = getUser();
    const btn = document.getElementById('accountBtn');
    const label = document.getElementById('accountBtnLabel');
    if (!btn || !label) return;
    if (user) {
        const avatar = user.avatar;
        if (avatar) {
            btn.innerHTML = `<img src="${avatar}" alt="avatar">`;
        } else {
            label.textContent = (user.nickname || '?')[0].toUpperCase();
            btn.innerHTML = '';
            btn.appendChild(label);
        }
    } else {
        label.textContent = '?';
        btn.innerHTML = '';
        btn.appendChild(label);
    }
}

function openAccountOverlay() {
    document.getElementById('accountOverlay').classList.remove('hidden');
    const user = getUser();
    if (user) {
        showAccountSettings(user);
    } else {
        document.getElementById('authForm').classList.remove('hidden');
        document.getElementById('accountSettings').classList.add('hidden');
    }
}

function showAccountSettings(user) {
    document.getElementById('authForm').classList.add('hidden');
    const s = document.getElementById('accountSettings');
    s.classList.remove('hidden');
    document.getElementById('settingsNick').textContent = user.nickname || '';
    document.getElementById('settingsEmail').textContent = user.email || '';
    const imgEl = document.getElementById('settingsAvatarImg');
    const letEl = document.getElementById('settingsAvatarLetter');
    if (user.avatar) {
        imgEl.src = user.avatar;
        imgEl.classList.remove('hidden');
        letEl.classList.add('hidden');
    } else {
        letEl.textContent = (user.nickname || '?')[0].toUpperCase();
        letEl.classList.remove('hidden');
        imgEl.classList.add('hidden');
    }
    const sel = document.getElementById('defaultModelSelect');
    const saved = localStorage.getItem('cubik_default_model') || 'fast';
    if (sel) sel.value = saved;
}

function setGold(val) {
    isGold = val;
    updateModelDropdownAvailability();
}

function updateModelDropdownAvailability() {
    const options = document.querySelectorAll('.model-option');
    options.forEach(opt => {
        const model = opt.dataset.model;
        const isGoldRequired = ['coder', 'think', 'master'].includes(model);
        if (isGoldRequired && !isGold) {
            opt.classList.add('disabled');
        } else {
            opt.classList.remove('disabled');
        }
    });
}

const GOLD_CHECK_URL = 'https://';

async function checkGoldStatus(email) {
    if (!email) return false;
    try {
        const response = await fetch(GOLD_CHECK_URL);
        if (!response.ok) return false;
        const data = await response.json();
        if (Array.isArray(data) && data.includes(email)) {
            setGold(true);
            return true;
        }
    } catch (e) {
        console.warn('Gold check failed', e);
    }
    return false;
}

function getMaxFiles() {
    return isGold ? 3 : 1;
}