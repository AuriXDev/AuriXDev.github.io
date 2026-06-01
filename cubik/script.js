let currentChatId = null;
let chats = {};
let chatCounter = 1;
let starsDimmed = false;
let lastUserMessage = '';
let modelSelectionLocked = false;

const VPS_URL = "http://80.66.72.139:8080/api/groq";
const API_KEY = "CUBIK54J2VV3884RI7YOF1KQME71RC98ZLO";

const starsCanvas = document.getElementById('starsCanvas');
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const chatListDiv = document.getElementById('chatList');
const chatWindow = document.getElementById('chatWindow');
const messageInput = document.getElementById('messageInput');
const messageInputWelcome = document.getElementById('messageInputWelcome');
const sendBtn = document.getElementById('sendBtn');
const sendBtnWelcome = document.getElementById('sendBtnWelcome');
const dotMenu = document.getElementById('dotMenu');
const dynamicContainer = document.getElementById('dynamicContainer');
const modelDropdownBtn = document.getElementById('modelDropdownBtn');
const modelDropdown = document.getElementById('modelDropdown');
const currentModelName = document.getElementById('currentModelName');
const notification = document.getElementById('notification');

let activeDotChatId = null;
let dotMenuTimeout = null;

const MODEL_NAMES = {
    'fast': 'CubikAI 1.7-FLASH',
    'think': 'CubikAI 2.0-Think',
    'master': 'Cubik 2.6-ultra',
    'custom': 'CubikAI 1.3-darkness'
};

function initStars() {
    const ctx = starsCanvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    starsCanvas.width = width;
    starsCanvas.height = height;
    
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
        if (!starsCanvas.isConnected) return;
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
            ctx.fillStyle = `rgba(255, 250, 220, ${twinkleAlpha * (starsDimmed ? 0.25 : 1)})`;
            ctx.fill();
        }
        requestAnimationFrame(animateStars);
    }
    animateStars();

    window.addEventListener('resize', () => {
        starsCanvas.width = window.innerWidth;
        starsCanvas.height = window.innerHeight;
        width = starsCanvas.width;
        height = starsCanvas.height;
    });
}

function setStarsDimmed(dimmed) {
    starsDimmed = dimmed;
    if (dimmed) document.body.classList.add('stars-dimmed');
    else document.body.classList.remove('stars-dimmed');
}

function updateChatLayout() {
    if (!currentChatId) return;
    const hasMessages = chats[currentChatId] && chats[currentChatId].messages.length > 0;
    
    if (hasMessages) {
        dynamicContainer.classList.remove('center-mode');
        dynamicContainer.classList.add('chat-mode');
        document.getElementById('chatInputWrapper').classList.remove('hidden');
        modelSelectionLocked = true;
        modelDropdownBtn.disabled = true;
        modelDropdownBtn.style.opacity = '0.5';
        modelDropdownBtn.style.cursor = 'not-allowed';
    } else {
        dynamicContainer.classList.add('center-mode');
        dynamicContainer.classList.remove('chat-mode');
        document.getElementById('chatInputWrapper').classList.add('hidden');
        modelSelectionLocked = false;
        modelDropdownBtn.disabled = false;
        modelDropdownBtn.style.opacity = '1';
        modelDropdownBtn.style.cursor = 'pointer';
    }
    
    updateDarknessMode();
    updatePlaceholder();
}

function updatePlaceholder() {
    if (!currentChatId || !chats[currentChatId]) return;
    const isDarkness = chats[currentChatId].model === 'custom';
    const placeholderText = isDarkness ? 'Ты уверен?' : 'Чем я могу помочь вам сегодня?';
    messageInputWelcome.placeholder = placeholderText;
    messageInput.placeholder = isDarkness ? 'Сообщение...' : 'Сообщение...';
}

function updateDarknessMode() {
    if (!currentChatId || !chats[currentChatId]) return;
    const isDarkness = chats[currentChatId].model === 'custom';
    const welcomeWrapper = document.getElementById('welcomeInputWrapper');
    const chatWrapper = document.getElementById('chatInputWrapper');
    const sendBtnIcon = document.getElementById('sendBtn');
    const sendBtnIconWelcome = document.getElementById('sendBtnWelcome');
    
    if (isDarkness) {
        if (welcomeWrapper) welcomeWrapper.classList.add('darkness-mode');
        if (chatWrapper) chatWrapper.classList.add('darkness-mode');
        if (sendBtnIcon) sendBtnIcon.classList.add('darkness-mode');
        if (sendBtnIconWelcome) sendBtnIconWelcome.classList.add('darkness-mode');
    } else {
        if (welcomeWrapper) welcomeWrapper.classList.remove('darkness-mode');
        if (chatWrapper) chatWrapper.classList.remove('darkness-mode');
        if (sendBtnIcon) sendBtnIcon.classList.remove('darkness-mode');
        if (sendBtnIconWelcome) sendBtnIconWelcome.classList.remove('darkness-mode');
    }
}

function saveChatsToLocal() {
    localStorage.setItem('cubik_chats', JSON.stringify(chats));
    localStorage.setItem('cubik_currentChat', currentChatId);
    localStorage.setItem('cubik_counter', chatCounter);
}

function loadChatsFromLocal() {
    const saved = localStorage.getItem('cubik_chats');
    if(saved) {
        chats = JSON.parse(saved);
        currentChatId = localStorage.getItem('cubik_currentChat');
        chatCounter = parseInt(localStorage.getItem('cubik_counter')) || 1;
        if(!chats || Object.keys(chats).length === 0) createNewChat();
    } else {
        createNewChat();
    }
    renderChatList();
    if(currentChatId && chats[currentChatId]) {
        renderMessages(currentChatId);
        updateChatLayout();
        updateCurrentModelDisplay();
    } else if(Object.keys(chats).length) {
        switchChat(Object.keys(chats)[0]);
    }
    
    const anyMessages = Object.values(chats).some(c => c.messages.length > 0);
    if(anyMessages) setStarsDimmed(true);
}

function createNewChat() {
    if(Object.keys(chats).length >= 10) {
        showNotification("Достигнут лимит: не более 10 чатов на устройство");
        return null;
    }
    const chatId = Date.now() + '_' + Math.random();
    chats[chatId] = {
        messages: [],
        model: 'fast',
        name: `Чат ${chatCounter++}`,
        pinned: false
    };
    saveChatsToLocal();
    renderChatList();
    switchChat(chatId);
    updateChatLayout();
    return chatId;
}

function switchChat(chatId) {
    if(!chats[chatId]) return;
    currentChatId = chatId;
    renderMessages(chatId);
    renderChatList();
    updateCurrentModelDisplay();
    updateChatLayout();
    saveChatsToLocal();
}

function deleteChat(chatId) {
    if(Object.keys(chats).length === 1) {
        showNotification("Нельзя удалить последний чат.");
        return;
    }
    delete chats[chatId];
    if(currentChatId === chatId) {
        const firstChat = Object.keys(chats)[0];
        if(firstChat) switchChat(firstChat);
        else createNewChat();
    }
    saveChatsToLocal();
    renderChatList();
    updateChatLayout();
}

function togglePinChat(chatId) {
    if(chats[chatId]) {
        chats[chatId].pinned = !chats[chatId].pinned;
        saveChatsToLocal();
        renderChatList();
        showNotification(chats[chatId].pinned ? "Чат закреплён" : "Чат откреплён");
    }
}

function renderChatList() {
    const sortedChats = Object.entries(chats).sort((a, b) => {
        if(a[1].pinned && !b[1].pinned) return -1;
        if(!a[1].pinned && b[1].pinned) return 1;
        return 0;
    });
    
    chatListDiv.innerHTML = '';
    for(let [id, chat] of sortedChats) {
        const div = document.createElement('div');
        div.className = 'chat-item' + (currentChatId === id ? ' active' : '') + (chat.pinned ? ' pinned' : '');
        div.innerHTML = `
            <span class="chat-name">${escapeHtml(chat.name)}${chat.pinned ? ' 📌' : ''}</span>
            <button class="chat-options" data-chatid="${id}">⁝</button>
        `;
        
        const optsBtn = div.querySelector('.chat-options');
        optsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showDotMenu(e.clientX, e.clientY, id);
        });
        
        const chatName = div.querySelector('.chat-name');
        chatName.addEventListener('click', (e) => {
            e.stopPropagation();
            switchChat(id);
            closeSidebar();
        });
        
        chatListDiv.appendChild(div);
    }
}

function renderMessages(chatId) {
    chatWindow.innerHTML = '';
    const msgs = chats[chatId].messages;
    
    for(let i = 0; i < msgs.length; i++) {
        const msg = msgs[i];
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${msg.role === 'user' ? 'user-message' : 'bot-message'}`;
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        
        if (msg.role === 'bot') {
            msgDiv.innerHTML = formatMessageContent(msg.content);
        } else {
            msgDiv.innerText = msg.content;
        }
        
        wrapper.appendChild(msgDiv);
        
        if (msg.role === 'bot') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'message-action-btn';
            copyBtn.innerHTML = 'C';
            copyBtn.title = 'Копировать';
            copyBtn.onclick = () => copyMessage(i);
            
            const regenBtn = document.createElement('button');
            regenBtn.className = 'message-action-btn';
            regenBtn.innerHTML = 'R';
            regenBtn.title = 'Перегенерировать';
            regenBtn.onclick = () => regenerateMessage(i);
            
            const reportBtn = document.createElement('button');
            reportBtn.className = 'message-action-btn';
            reportBtn.innerHTML = 'S';
            reportBtn.title = 'Пожаловаться';
            reportBtn.onclick = () => reportMessage(i);
            
            actionsDiv.appendChild(copyBtn);
            actionsDiv.appendChild(regenBtn);
            actionsDiv.appendChild(reportBtn);
            wrapper.appendChild(actionsDiv);
        }
        
        chatWindow.appendChild(wrapper);
    }
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addMessage(chatId, role, content) {
    if(!chats[chatId]) return;
    chats[chatId].messages.push({ role, content });
    renderMessages(chatId);
    updateChatLayout();
    saveChatsToLocal();
    const anyMsg = Object.values(chats).some(c => c.messages.length > 0);
    if(anyMsg) setStarsDimmed(true);
}

function updateCurrentModelDisplay() {
    if (currentChatId && chats[currentChatId]) {
        const modelName = MODEL_NAMES[chats[currentChatId].model] || 'CubikAI 1.7-FLASH';
        currentModelName.textContent = modelName;
        
        document.querySelectorAll('.model-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.model === chats[currentChatId].model) {
                option.classList.add('active');
            }
        });
    }
}

async function sendToBot(userText) {
    if(!currentChatId) return;
    const modelKey = chats[currentChatId].model;
    lastUserMessage = userText;
    
    addMessage(currentChatId, 'user', userText);
    addMessage(currentChatId, 'bot', '...');
    
    try {
        const isCustom = (modelKey === 'custom');
        
        const response = await fetch(VPS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userText,
                model: modelKey,
                custom: isCustom,
                chat_id: currentChatId,
                api_key: API_KEY
            })
        });
        const data = await response.json();
        chats[currentChatId].messages.pop();
        const botReply = data.reply || "Ошибка: не получен ответ от VPS";
        addMessage(currentChatId, 'bot', botReply);
    } catch(err) {
        chats[currentChatId].messages.pop();
        addMessage(currentChatId, 'bot', `❌ Ошибка: ${err.message}`);
    }
}

function copyMessage(index) {
    if (!currentChatId || !chats[currentChatId]) return;
    const msg = chats[currentChatId].messages[index];
    if (msg && msg.content) {
        navigator.clipboard.writeText(msg.content).then(() => {
            showNotification("Сообщение скопировано!");
        }).catch(() => {
            showNotification("Не удалось скопировать");
        });
    }
}

async function regenerateMessage(index) {
    if (!currentChatId || !chats[currentChatId]) return;
    
    let userMsgIndex = index - 1;
    while (userMsgIndex >= 0 && chats[currentChatId].messages[userMsgIndex].role !== 'user') {
        userMsgIndex--;
    }
    
    if (userMsgIndex < 0) {
        showNotification("Не найдено сообщение для перегенерации");
        return;
    }
    
    const userText = chats[currentChatId].messages[userMsgIndex].content;
    
    chats[currentChatId].messages.splice(index, 1);
    renderMessages(currentChatId);
    
    await sendToBot(userText);
}

function reportMessage(index) {
    showNotification("Спасибо за вашу обратную связь");
}

function formatMessageContent(content) {
    if (!content) return '';
    
    if (!window.codeBlocksStorage) window.codeBlocksStorage = {};
    
    let result = content;
    
    result = result.replace(/<think>([\s\S]*?)<\/think>/gi, function(match, thinkContent) {
        return `<div class="thinking-block">${thinkContent.trim()}</div>`;
    });
    
    result = result.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, lang, code) {
        let cleanCode = code.replace(/^\n+/, '').replace(/\n+$/, '');
        const blockId = 'code-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        window.codeBlocksStorage[blockId] = cleanCode;
        
        let escapedCode = cleanCode
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        return `<div class="code-block-wrapper">
            <button class="copy-code-btn" onclick="copyCodeBlockById('${blockId}', this)">Копировать</button>
            <pre><code class="language-${lang || 'plaintext'}">${escapedCode}</code></pre>
        </div>`;
    });
    
    let parts = [];
    let lastIndex = 0;
    
    const specialBlocksRegex = /(<div class="(code-block-wrapper|thinking-block)">[\s\S]*?<\/div>)/g;
    let match;
    
    while ((match = specialBlocksRegex.exec(result)) !== null) {
        if (match.index > lastIndex) {
            let textBefore = result.substring(lastIndex, match.index);
            textBefore = textBefore
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            parts.push(textBefore);
        }
        
        parts.push(match[0]);
        lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < result.length) {
        let remainingText = result.substring(lastIndex);
        remainingText = remainingText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        parts.push(remainingText);
    }
    
    result = parts.join('');
    
    result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    result = result.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    const lines = result.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.startsWith('### ')) {
            lines[i] = `<h3>${line.substring(4)}</h3>`;
        } else if (line.startsWith('## ')) {
            lines[i] = `<h2>${line.substring(3)}</h2>`;
        } else if (line.startsWith('# ')) {
            lines[i] = `<h1>${line.substring(2)}</h1>`;
        }
    }
    result = lines.join('\n');
    
    result = result.replace(/\n/g, '<br>');
    
    result = result.replace(/<pre>[\s\S]*?<\/pre>/g, function(match) {
        return match.replace(/<br>/g, '\n');
    });
    result = result.replace(/<code>[\s\S]*?<\/code>/g, function(match) {
        return match.replace(/<br>/g, '');
    });
    result = result.replace(/<div class="thinking-block"[\s\S]*?<\/div>/g, function(match) {
        return match.replace(/<br>/g, '\n');
    });
    
    return result;
}

window.codeBlocksStorage = {};

window.copyCodeBlockById = function(blockId, btn) {
    const originalCode = window.codeBlocksStorage[blockId];
    
    if (!originalCode) {
        btn.textContent = '❌ Ошибка';
        setTimeout(() => {
            btn.textContent = 'Копировать';
        }, 2000);
        return;
    }
    
    navigator.clipboard.writeText(originalCode).then(() => {
        const originalText = btn.textContent;
        btn.textContent = '✓ Скопировано!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        btn.textContent = '❌ Ошибка';
        setTimeout(() => {
            btn.textContent = 'Копировать';
        }, 2000);
    });
};

function escapeHtml(text) {
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function showNotification(text) {
    notification.textContent = text;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function closeSidebar() {
    sidebar.classList.remove('open');
}

function showDotMenu(x, y, chatId) {
    dotMenu.style.left = x + 'px';
    dotMenu.style.top = y + 'px';
    dotMenu.classList.remove('hidden');
    activeDotChatId = chatId;
    if(dotMenuTimeout) clearTimeout(dotMenuTimeout);
    dotMenuTimeout = setTimeout(() => {
        dotMenu.classList.add('hidden');
    }, 3000);
}

document.addEventListener('click', (e) => {
    if(!e.target.closest('.chat-options') && !e.target.closest('.dot-menu')) {
        dotMenu.classList.add('hidden');
    }
    if(!e.target.closest('.model-dropdown-wrapper')) {
        modelDropdown.classList.add('hidden');
    }
});

modelDropdownBtn.addEventListener('click', (e) => {
    if (modelSelectionLocked) return;
    e.stopPropagation();
    modelDropdown.classList.toggle('hidden');
});

document.querySelectorAll('.model-option').forEach(option => {
    option.addEventListener('click', () => {
        if(modelSelectionLocked) return;
        
        if(currentChatId) {
            const model = option.dataset.model;
            chats[currentChatId].model = model;
            updateCurrentModelDisplay();
            updateDarknessMode();
            updatePlaceholder();
            saveChatsToLocal();
            modelDropdown.classList.add('hidden');
        }
    });
});

document.getElementById('convertJsonBtn').onclick = () => {
    if(activeDotChatId && chats[activeDotChatId]) {
        const data = {
            chat_id: activeDotChatId,
            name: chats[activeDotChatId].name,
            messages: chats[activeDotChatId].messages
        };
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat_${activeDotChatId}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification("Чат экспортирован в JSON");
    }
    dotMenu.classList.add('hidden');
};

document.getElementById('pinChatBtn').onclick = () => {
    if(activeDotChatId) togglePinChat(activeDotChatId);
    dotMenu.classList.add('hidden');
};

document.getElementById('deleteChatBtn').onclick = () => {
    if(activeDotChatId) deleteChat(activeDotChatId);
    dotMenu.classList.add('hidden');
};

function handleSend(inputElement) {
    let text = inputElement.value.trim();
    if(!text) return;
    if(text.length > 3000) text = text.slice(0,3000);
    inputElement.value = '';
    inputElement.style.height = 'auto';
    sendToBot(text);
}

sendBtn.addEventListener('click', () => handleSend(messageInput));
sendBtnWelcome.addEventListener('click', () => handleSend(messageInputWelcome));

function autoResize(textarea) {
    textarea.style.height = 'auto';
    let newHeight = Math.min(textarea.scrollHeight, 160);
    textarea.style.height = newHeight + 'px';
}

messageInput.addEventListener('input', function() { autoResize(this); });
messageInputWelcome.addEventListener('input', function() { autoResize(this); });

menuBtn.addEventListener('click', () => { sidebar.classList.toggle('open'); });
closeSidebarBtn.addEventListener('click', closeSidebar);

document.getElementById('newChatBtnSidebar').addEventListener('click', () => {
    createNewChat();
    closeSidebar();
});

document.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !e.shiftKey && (document.activeElement === messageInput || document.activeElement === messageInputWelcome)) {
        e.preventDefault();
        if (document.activeElement === messageInput) {
            sendBtn.click();
        } else {
            sendBtnWelcome.click();
        }
    }
    if(e.key === 'Escape') {
        closeSidebar();
        modelDropdown.classList.add('hidden');
        dotMenu.classList.add('hidden');
    }
});

window.onload = () => {
    initStars();
    loadChatsFromLocal();
};