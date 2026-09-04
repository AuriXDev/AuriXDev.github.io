let starsDimmed = false;

function initStars() {
    const canvas = document.getElementById('starsCanvas');
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    const stars = [];
    const STAR_COUNT = 200;
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2,
            alpha: Math.random() * 0.5 + 0.2,
            speedX: (Math.random() - 0.5) * 0.2,
            speedY: (Math.random() - 0.5) * 0.15,
            twinkle: Math.random() * 0.04,
        });
    }
    function animateStars() {
        if (!canvas.isConnected) return;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);
        for (let s of stars) {
            s.x += s.speedX;
            s.y += s.speedY;
            if (s.x < 0) s.x = width;
            if (s.x > width) s.x = 0;
            if (s.y < 0) s.y = height;
            if (s.y > height) s.y = 0;
            let twinkleAlpha = s.alpha + Math.sin(Date.now() * s.twinkle) * 0.12;
            twinkleAlpha = Math.min(0.7, Math.max(0.1, twinkleAlpha));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 250, 220, ${twinkleAlpha * (starsDimmed ? 0.5 : 1)})`;
            ctx.fill();
        }
        requestAnimationFrame(animateStars);
    }
    animateStars();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        width = canvas.width;
        height = canvas.height;
    });
}

function setStarsDimmed(dimmed) {
    starsDimmed = dimmed;
    if (dimmed) document.body.classList.add('stars-dimmed');
    else document.body.classList.remove('stars-dimmed');
}

function showNotification(text) {
    const notification = document.getElementById('notification');
    notification.textContent = text;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function getLoadingSVG() {
    return `
        <div style="display:flex; justify-content:center; align-items:center; padding:12px 0; width:100%;">
            <div style="width:32px; height:32px; perspective:1000px;">
                <svg viewBox="0 0 300 300" style="width:100%; height:100%; overflow:visible;">
                    <defs>
                        <style>
                            .svg-tri1 {
                                transform-origin: 150px 150px;
                                animation: tri1Anim 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                            }
                            .svg-tri2 {
                                transform-origin: 150px 150px;
                                animation: tri2Anim 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                            }
                            @keyframes tri1Anim {
                                0%, 15% { transform: rotateX(0deg) rotateZ(0deg); }
                                35%, 45% { transform: rotateX(-180deg) rotateZ(0deg); }
                                65% { transform: rotateX(-180deg) rotateZ(180deg); }
                                85%, 100% { transform: rotateX(-360deg) rotateZ(360deg); }
                            }
                            @keyframes tri2Anim {
                                0%, 15% { transform: rotateX(0deg) rotateZ(0deg); }
                                35%, 45% { transform: rotateX(0deg) rotateZ(0deg); }
                                65% { transform: rotateX(0deg) rotateZ(-180deg); }
                                85%, 100% { transform: rotateX(0deg) rotateZ(-360deg); }
                            }
                        </style>
                    </defs>
                    <polygon class="svg-tri1" points="70,250 230,250 150,50" fill="none" stroke="white" stroke-width="8" stroke-linejoin="round"/>
                    <polygon class="svg-tri2" points="70,250 230,250 150,50" fill="none" stroke="white" stroke-width="8" stroke-linejoin="round"/>
                </svg>
            </div>
        </div>
    `;
}

function showModal(title, htmlContent) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').innerHTML = htmlContent;
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
}

function showPromptModal(title, defaultText, callback) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px;">
            <input type="text" id="promptInput" value="${defaultText || ''}" style="background:#1e1e24; border:1px solid #444; color:white; padding:10px; border-radius:8px; font-size:14px; width:100%;">
            <div style="display:flex; gap:8px; justify-content:flex-end;">
                <button id="promptCancelBtn" class="settings-row-btn" style="width:auto; padding:8px 20px;">Отмена</button>
                <button id="promptOkBtn" class="settings-row-btn" style="width:auto; padding:8px 20px; background:#667eea;">OK</button>
            </div>
        </div>
    `;
    document.getElementById('modalOverlay').classList.remove('hidden');
    const input = document.getElementById('promptInput');
    input.focus();
    input.select();
    const closeModalFn = () => {
        document.getElementById('modalOverlay').classList.add('hidden');
    };
    document.getElementById('promptCancelBtn').onclick = closeModalFn;
    document.getElementById('promptOkBtn').onclick = () => {
        const val = input.value.trim();
        closeModalFn();
        if (val) callback(val);
    };
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('promptOkBtn').click();
        }
        if (e.key === 'Escape') {
            document.getElementById('promptCancelBtn').click();
        }
    });
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    closeSidebarMenu();
}

function closeSidebarMenu() {
    document.getElementById('sidebarMenu').classList.add('hidden');
}

function toggleSidebarMenu() {
    document.getElementById('sidebarMenu').classList.toggle('hidden');
}

function showDotMenu(x, y, chatId) {
    const dotMenu = document.getElementById('dotMenu');
    dotMenu.style.left = x + 'px';
    dotMenu.style.top = y + 'px';
    dotMenu.classList.remove('hidden');
    window.activeDotChatId = chatId;
    if (window.dotMenuTimeout) clearTimeout(window.dotMenuTimeout);
    window.dotMenuTimeout = setTimeout(() => {
        dotMenu.classList.add('hidden');
    }, 3000);
}

const CHAR_LIMIT = 1000;

function setupCharCounter(textarea, wrapperEl) {
    const parent = wrapperEl.parentElement;
    let counter = parent.querySelector('.char-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.className = 'char-counter';
        parent.insertBefore(counter, wrapperEl);
    }
    function update() {
        const len = textarea.value.length;
        counter.textContent = `${len} / ${CHAR_LIMIT}`;
        counter.className = 'char-counter' + (len > CHAR_LIMIT ? ' over' : len > CHAR_LIMIT * 0.85 ? ' warn' : '');
        if (len > CHAR_LIMIT) textarea.value = textarea.value.substring(0, CHAR_LIMIT);
    }
    textarea.addEventListener('input', update);
    update();
}

async function loadMarkdownAndShow(title, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const mdText = await response.text();
        if (!mdText || mdText.trim() === '') {
            throw new Error('Файл пуст');
        }
        const htmlContent = convertMarkdownToHtml(mdText);
        showModal(title, htmlContent);
    } catch (err) {
        console.error('Failed to load markdown:', err);
        showModal(title, `<p style="color: #ff8888;">Ошибка загрузки: ${escapeHtml(err.message)}</p>
                         <p>Проверьте наличие файла "${escapeHtml(filePath)}" и доступ к нему.</p>
                         <p>Если вы открываете сайт локально (через file://), используйте локальный веб-сервер.</p>`);
    }
}