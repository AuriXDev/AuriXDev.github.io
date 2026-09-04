let currentChatId = null;
let chats = {};
let chatCounter = 1;
let modelSelectionLocked = false;
let lastUserMessage = '';
let attachedFiles = [];
let thinkingInterval = null;

const VPS_URL = "http://80.66.72.139:8080/api/cubik";
const API_KEY = "CUBIK54J2VV3884RI7YOF1KQME71RC98ZLO";

const MODEL_NAMES = {
    'fast': 'CubikAI 1.7',
    'think': 'CubikAI 2.0-Think',
    'master': 'CubikAI 2.6-Ultra',
    'coder': 'CubikAI 1.4-Coder',
    'mini': 'CubikAI 1.1.3'
};

function saveChatsToLocal() {
    const toSave = {};
    Object.entries(chats).forEach(([id, c]) => {
        if (!c.incognito) toSave[id] = c;
    });
    localStorage.setItem('cubik_chats', JSON.stringify(toSave));
    localStorage.setItem('cubik_currentChat', currentChatId);
    localStorage.setItem('cubik_counter', chatCounter);
}

function loadChatsFromLocal() {
    const saved = localStorage.getItem('cubik_chats');
    if (saved) {
        chats = JSON.parse(saved);
        currentChatId = localStorage.getItem('cubik_currentChat');
        chatCounter = parseInt(localStorage.getItem('cubik_counter')) || 1;
        if (!chats || Object.keys(chats).length === 0) createNewChat();
    } else {
        createNewChat();
    }
    renderChatList();
    if (currentChatId && chats[currentChatId]) {
        renderMessages(currentChatId);
        updateChatLayout();
        updateCurrentModelDisplay();
    } else if (Object.keys(chats).length) {
        switchChat(Object.keys(chats)[0]);
    }
    const anyMessages = Object.values(chats).some(c => c.messages.length > 0);
    if (anyMessages) setStarsDimmed(true);
}

function createNewChat(modelOverride) {
    const defaultModel = localStorage.getItem('cubik_default_model') || 'fast';
    let model = modelOverride || defaultModel;
    if (!isGold && ['coder', 'think', 'master'].includes(model)) {
        model = 'fast';
        showNotification('Модель требует GOLD, выбрана CubikAI 1.7');
    }
    const chatId = Date.now() + '_' + Math.random();
    chats[chatId] = {
        messages: [],
        model: model,
        name: `Чат ${chatCounter++}`,
        pinned: false,
        incognito: false
    };
    saveChatsToLocal();
    renderChatList();
    switchChat(chatId);
    updateChatLayout();
    updateLogo();
    return chatId;
}

function switchChat(chatId) {
    if (!chats[chatId]) return;
    // Инкогнито: удаляем при уходе
    if (currentChatId && chats[currentChatId] && chats[currentChatId].incognito && currentChatId !== chatId) {
        delete chats[currentChatId];
    }
    currentChatId = chatId;
    renderMessages(chatId);
    renderChatList();
    updateCurrentModelDisplay();
    updateChatLayout();
    updateLogo();
    saveChatsToLocal();
}

function deleteChat(chatId) {
    if (Object.keys(chats).length === 1) {
        showNotification("Нельзя удалить последний чат.");
        return;
    }
    delete chats[chatId];
    if (currentChatId === chatId) {
        const firstChat = Object.keys(chats)[0];
        if (firstChat) switchChat(firstChat);
        else createNewChat();
    }
    saveChatsToLocal();
    renderChatList();
    updateChatLayout();
}

function togglePinChat(chatId) {
    if (chats[chatId]) {
        chats[chatId].pinned = !chats[chatId].pinned;
        saveChatsToLocal();
        renderChatList();
        showNotification(chats[chatId].pinned ? "Чат закреплён" : "Чат откреплён");
    }
}

function renameChat(chatId) {
    if (!chats[chatId]) return;
    const currentName = chats[chatId].name;
    showPromptModal('Переименовать чат', currentName, (newName) => {
        if (newName) {
            chats[chatId].name = newName.trim().substring(0, 30);
            saveChatsToLocal();
            renderChatList();
            showNotification('Чат переименован');
        }
    });
}

function renderChatList() {
    const chatListDiv = document.getElementById('chatList');
    const sortedChats = Object.entries(chats).sort((a, b) => {
        if (a[1].pinned && !b[1].pinned) return -1;
        if (!a[1].pinned && b[1].pinned) return 1;
        return 0;
    });
    chatListDiv.innerHTML = '';
    for (let [id, chat] of sortedChats) {
        const div = document.createElement('div');
        div.className = 'chat-item' + (currentChatId === id ? ' active' : '') + (chat.pinned ? ' pinned' : '');
        div.innerHTML = `<span class="chat-name">${escapeHtml(chat.name)}${chat.pinned ? ' 📌' : ''}</span>
                         <button class="chat-options" data-chatid="${id}">⁝</button>`;
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
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.innerHTML = '';
    const msgs = chats[chatId].messages;
    
    for (let i = 0; i < msgs.length; i++) {
        const msg = msgs[i];
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${msg.role === 'user' ? 'user-message' : 'bot-message'}`;
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        
        if (msg.role === 'bot') {
            if (msg.isHtml) {
                msgDiv.innerHTML = msg.content;
            } else {
                msgDiv.innerHTML = formatMessageContent(msg.content);
            }
            
            if (window.renderMathInElement && !msg.isHtml) {
                renderMathInElement(msgDiv, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '\\[', right: '\\]', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false}
                    ],
                    throwOnError: false
                });
            }
        } else {
            msgDiv.innerText = msg.content;
        }
        
        wrapper.appendChild(msgDiv);
        
        if (msg.role === 'bot' && !msg.isThinking && !msg.isHtml) {
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
            
            if (msg.responseTime) {
                const timeSpan = document.createElement('span');
                timeSpan.className = 'response-time';
                timeSpan.textContent = `${msg.responseTime} ms`;
                actionsDiv.appendChild(timeSpan);
            }
            
            wrapper.appendChild(actionsDiv);
        }
        
        chatWindow.appendChild(wrapper);
    }
    
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addMessage(chatId, role, content, responseTime = null) {
    if (!chats[chatId]) return;
    const msg = { role, content };
    if (responseTime !== null) msg.responseTime = responseTime;
    chats[chatId].messages.push(msg);
    renderMessages(chatId);
    updateChatLayout();
    saveChatsToLocal();
    const anyMsg = Object.values(chats).some(c => c.messages.length > 0);
    if (anyMsg) setStarsDimmed(true);
}

function updateCurrentModelDisplay() {
    if (currentChatId && chats[currentChatId]) {
        const modelName = MODEL_NAMES[chats[currentChatId].model] || 'CubikAI 1.7';
        document.getElementById('currentModelName').textContent = modelName;
        document.querySelectorAll('.model-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.model === chats[currentChatId].model) {
                option.classList.add('active');
            }
        });
    }
}

function updateLogo() {
    const logoText = document.querySelector('.logo-text');
    if (!logoText) return;
    if (currentChatId && chats[currentChatId] && chats[currentChatId].incognito) {
        logoText.textContent = 'INCOGNITO';
    } else {
        logoText.textContent = 'CubikAI';
    }
}

function updateChatLayout() {
    if (!currentChatId) return;
    const hasMessages = chats[currentChatId] && chats[currentChatId].messages.length > 0;
    const dynamicContainer = document.getElementById('dynamicContainer');
    const chatInputWrapper = document.getElementById('chatInputWrapper');
    const modelDropdownBtn = document.getElementById('modelDropdownBtn');
    
    if (hasMessages) {
        dynamicContainer.classList.remove('center-mode');
        dynamicContainer.classList.add('chat-mode');
        chatInputWrapper.classList.remove('hidden');
        modelSelectionLocked = true;
        modelDropdownBtn.disabled = true;
        modelDropdownBtn.style.opacity = '0.5';
        modelDropdownBtn.style.cursor = 'not-allowed';
    } else {
        dynamicContainer.classList.add('center-mode');
        dynamicContainer.classList.remove('chat-mode');
        chatInputWrapper.classList.add('hidden');
        modelSelectionLocked = false;
        modelDropdownBtn.disabled = false;
        modelDropdownBtn.style.opacity = '1';
        modelDropdownBtn.style.cursor = 'pointer';
    }
    updateLogo();
}

function startThinkingAnimation(chatId) {
    if (!chats[chatId]) return;
    
    const tempMsg = { 
        role: 'bot', 
        content: getLoadingSVG(), 
        isThinking: true,
        isHtml: true
    };
    
    chats[chatId].messages.push(tempMsg);
    const msgIndex = chats[chatId].messages.length - 1;
    renderMessages(chatId);
    
    thinkingInterval = setInterval(() => {}, 400);
    return msgIndex;
}

function stopThinkingAnimation(chatId, thinkingIndex, finalContent, responseTime) {
    if (thinkingInterval) {
        clearInterval(thinkingInterval);
        thinkingInterval = null;
    }
    if (chats[chatId] && chats[chatId].messages[thinkingIndex] && chats[chatId].messages[thinkingIndex].isThinking) {
        chats[chatId].messages[thinkingIndex] = { 
            role: 'bot', 
            content: finalContent, 
            responseTime: responseTime 
        };
        renderMessages(chatId);
    }
}

function updateFileAttachmentsUI() {
    const render = (container) => {
        if (!container) return;
        container.innerHTML = '';
        attachedFiles.forEach((file, idx) => {
            const chip = document.createElement('div');
            chip.className = 'file-chip';
            chip.innerHTML = `<span class="file-name">📄 ${escapeHtml(file.name)}</span>
                              <button class="remove-file" data-index="${idx}">✕</button>`;
            chip.querySelector('.remove-file').onclick = (e) => {
                e.stopPropagation();
                attachedFiles.splice(idx, 1);
                updateFileAttachmentsUI();
            };
            container.appendChild(chip);
        });
    };
    render(document.getElementById('fileAttachmentsWelcome'));
    render(document.getElementById('fileAttachmentsChat'));
}

async function sendToBot(userText) {
    if (!currentChatId) return;
    
    if (!hasEnoughTokens(1)) {
        showNotification('Закончились токены!');
        return;
    }
    
    const modelKey = chats[currentChatId].model;
    let fullPrompt = userText;
    if (attachedFiles.length > 0) {
        let filesPrefix = '';
        attachedFiles.forEach((file, idx) => {
            filesPrefix += `<file${idx+1}>${file.name}\n${file.content}</file${idx+1}>\n`;
        });
        fullPrompt = filesPrefix + userText;
        attachedFiles = [];
        updateFileAttachmentsUI();
    }
    lastUserMessage = fullPrompt;
    addMessage(currentChatId, 'user', userText);
    const thinkingIndex = startThinkingAnimation(currentChatId);
    const startTime = performance.now();
    try {
        const response = await fetch(VPS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: fullPrompt,
                model: modelKey,
                custom: false,
                chat_id: currentChatId,
                api_key: API_KEY
            })
        });
        const data = await response.json();
        const endTime = performance.now();
        const elapsedMs = Math.round(endTime - startTime);
        const botReply = data.reply || "Ошибка: не получен ответ от VPS";
        stopThinkingAnimation(currentChatId, thinkingIndex, botReply, elapsedMs);
        
        const tokensUsed = Math.ceil((botReply || '').length / 10);
        addUsedTokens(tokensUsed);
        
    } catch (err) {
        const endTime = performance.now();
        const elapsedMs = Math.round(endTime - startTime);
        stopThinkingAnimation(currentChatId, thinkingIndex, `Ошибка: ${err.message}`, elapsedMs);
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

function attachFilesHandler() {
    document.getElementById('fileInput').click();
}

document.getElementById('fileInput').onchange = async (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = getMaxFiles();
    if (attachedFiles.length + files.length > maxFiles) {
        showNotification(`Не более ${maxFiles} файлов за раз (${isGold ? 'GOLD' : 'FREE'} план)`);
        return;
    }
    for (const file of files) {
        if (file.size > 1024 * 1024) {
            showNotification(`Файл ${file.name} слишком большой (>1MB)`);
            continue;
        }
        const text = await file.text();
        attachedFiles.push({ name: file.name, content: text });
    }
    updateFileAttachmentsUI();
    document.getElementById('fileInput').value = '';
};

function deleteAllUnpinnedChats() {
    const pinnedIds = Object.keys(chats).filter(id => chats[id].pinned === true);
    if (Object.keys(chats).length === pinnedIds.length) {
        showNotification("Нет незакрепленных чатов для удаления");
        return;
    }
    if (confirm("Удалить все незакрепленные чаты? Это действие нельзя отменить.")) {
        const newChats = {};
        pinnedIds.forEach(id => {
            newChats[id] = chats[id];
        });
        chats = newChats;
        if (Object.keys(chats).length === 0) {
            createNewChat();
        } else if (!chats[currentChatId]) {
            switchChat(Object.keys(chats)[0]);
        } else {
            renderChatList();
            renderMessages(currentChatId);
        }
        saveChatsToLocal();
        showNotification("Все незакрепленные чаты удалены");
    }
}