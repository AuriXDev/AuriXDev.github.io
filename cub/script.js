document.addEventListener('DOMContentLoaded', function() {
    initStars();
    loadChatsFromLocal();
    loadAccountState();
    updateTokenCounter();
    const user = getUser();
    if (user && user.email) {
        checkGoldStatus(user.email);
    }
    
    const welcomeWrap = document.getElementById('welcomeInputWrapper');
    if (welcomeWrap) setupCharCounter(document.getElementById('messageInputWelcome'), welcomeWrap);
    
    const chatInputOuter = document.getElementById('chatInputWrapper');
    const chatWrap = chatInputOuter ? chatInputOuter.querySelector('.input-wrapper') : null;
    if (chatWrap) setupCharCounter(document.getElementById('messageInput'), chatWrap);
    
    
    document.getElementById('menuBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    
    document.getElementById('sidebarMenuBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebarMenu();
    });
    
    document.getElementById('sidebarNewChatBtn').addEventListener('click', () => {
        createNewChat();
        closeSidebar();
    });
    
    document.getElementById('menuNewChat').addEventListener('click', () => {
        createNewChat();
        closeSidebar();
        closeSidebarMenu();
    });
    
    document.getElementById('menuPolicy').addEventListener('click', () => {
        loadMarkdownAndShow('Политика конфиденциальности', 'politics.md');
        closeSidebarMenu();
    });
    
    document.getElementById('menuModelList').addEventListener('click', () => {
        loadMarkdownAndShow('Список моделей CubikAI', 'list.md');
        closeSidebarMenu();
    });
    
    document.getElementById('menuDeleteAll').addEventListener('click', () => {
        deleteAllUnpinnedChats();
        closeSidebarMenu();
    });
    
    document.getElementById('modelDropdownBtn').addEventListener('click', (e) => {
        if (modelSelectionLocked) return;
        e.stopPropagation();
        document.getElementById('modelDropdown').classList.toggle('hidden');
    });
    
    document.querySelectorAll('.model-option').forEach(option => {
        option.addEventListener('click', () => {
            if (modelSelectionLocked) return;
            if (option.classList.contains('disabled')) {
                showNotification('Эта модель доступна только на GOLD плане');
                return;
            }
            if (currentChatId) {
                const model = option.dataset.model;
                chats[currentChatId].model = model;
                updateCurrentModelDisplay();
                updateChatLayout();
                saveChatsToLocal();
                document.getElementById('modelDropdown').classList.add('hidden');
            }
        });
    });
    
    function handleSend(inputElement) {
        let text = inputElement.value.trim();
        if (!text && attachedFiles.length === 0) return;
        if (text.length > CHAR_LIMIT) {
            showNotification(`Сообщение слишком длинное (макс. ${CHAR_LIMIT} символов)`);
            return;
        }
        inputElement.value = '';
        inputElement.style.height = 'auto';
        sendToBot(text);
    }
    
    document.getElementById('sendBtn').addEventListener('click', () => handleSend(document.getElementById('messageInput')));
    document.getElementById('sendBtnWelcome').addEventListener('click', () => handleSend(document.getElementById('messageInputWelcome')));
    
    document.getElementById('attachBtnWelcome').addEventListener('click', attachFilesHandler);
    document.getElementById('attachBtnChat').addEventListener('click', attachFilesHandler);
    
    function autoResize(textarea) {
        textarea.style.height = 'auto';
        let newHeight = Math.min(textarea.scrollHeight, 160);
        textarea.style.height = newHeight + 'px';
    }
    document.getElementById('messageInput').addEventListener('input', function() { autoResize(this); });
    document.getElementById('messageInputWelcome').addEventListener('input', function() { autoResize(this); });
    
    document.addEventListener('keydown', (e) => {
        const isMobile = window.innerWidth <= 768;
        if (e.key === 'Enter' && !e.shiftKey && 
            (document.activeElement === document.getElementById('messageInput') || 
             document.activeElement === document.getElementById('messageInputWelcome'))) {
            if (isMobile) return;
            e.preventDefault();
            if (document.activeElement === document.getElementById('messageInput')) {
                document.getElementById('sendBtn').click();
            } else {
                document.getElementById('sendBtnWelcome').click();
            }
        }
        if (e.key === 'Escape') {
            closeSidebar();
            document.getElementById('modelDropdown').classList.add('hidden');
            document.getElementById('dotMenu').classList.add('hidden');
            closeModal();
            closeSidebarMenu();
        }
    });
    
    document.getElementById('convertJsonBtn').onclick = () => {
        if (window.activeDotChatId && chats[window.activeDotChatId]) {
            const data = {
                chat_id: window.activeDotChatId,
                name: chats[window.activeDotChatId].name,
                messages: chats[window.activeDotChatId].messages
            };
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat_${window.activeDotChatId}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showNotification("Чат экспортирован в JSON");
        }
        document.getElementById('dotMenu').classList.add('hidden');
    };
    
    document.getElementById('pinChatBtn').onclick = () => {
        if (window.activeDotChatId) togglePinChat(window.activeDotChatId);
        document.getElementById('dotMenu').classList.add('hidden');
    };
    
    document.getElementById('deleteChatBtn').onclick = () => {
        if (window.activeDotChatId) deleteChat(window.activeDotChatId);
        document.getElementById('dotMenu').classList.add('hidden');
    };
    
    document.getElementById('rename').onclick = () => {
        if (window.activeDotChatId) renameChat(window.activeDotChatId);
        document.getElementById('dotMenu').classList.add('hidden');
    };
    
    document.getElementById('accountBtn').addEventListener('click', openAccountOverlay);
    document.getElementById('accountCloseBtn').addEventListener('click', () => {
        document.getElementById('accountOverlay').classList.add('hidden');
    });
    document.getElementById('accountOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('accountOverlay')) {
            document.getElementById('accountOverlay').classList.add('hidden');
        }
    });
    
    document.getElementById('authSubmitBtn').addEventListener('click', () => {
        const email = document.getElementById('authEmail').value.trim();
        const nick = document.getElementById('authNickname').value.trim();
        const pass = document.getElementById('authPassword').value;
        if (!email || !nick || !pass) { showNotification('Заполните все поля'); return; }
        if (nick.length < 2) { showNotification('Никнейм слишком короткий'); return; }
        const user = { email, nickname: nick, avatar: null };
        saveUser(user);
        loadAccountState();
        showAccountSettings(user);
        showNotification('Добро пожаловать, ' + nick + '!');
        checkGoldStatus(email);
    });
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Выйти из аккаунта?')) {
            localStorage.removeItem('cubik_user');
            loadAccountState();
            document.getElementById('authForm').classList.remove('hidden');
            document.getElementById('accountSettings').classList.add('hidden');
            showNotification('Вы вышли из аккаунта');
            setGold(false);
        }
    });
    
    document.getElementById('setPhotoBtn').addEventListener('click', () => {
        document.getElementById('avatarFileInput').click();
    });
    
    document.getElementById('avatarFileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const user = getUser();
            if (!user) return;
            user.avatar = ev.target.result;
            saveUser(user);
            loadAccountState();
            showAccountSettings(user);
            showNotification('Фото обновлено!');
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    });
    
    document.getElementById('setNameBtn').addEventListener('click', () => {
        const user = getUser();
        if (!user) return;
        showPromptModal('Новый никнейм', user.nickname, (newName) => {
            if (newName && newName.trim().length >= 2) {
                user.nickname = newName.trim().substring(0, 24);
                saveUser(user);
                loadAccountState();
                showAccountSettings(user);
                showNotification('Имя изменено!');
            }
        });
    });
    
    document.getElementById('upgradeBtn').addEventListener('click', () => {
        document.getElementById('accountOverlay').classList.add('hidden');
        document.getElementById('subOverlay').classList.remove('hidden');
    });
    
    document.getElementById('subCloseBtn').addEventListener('click', () => {
        document.getElementById('subOverlay').classList.add('hidden');
    });
    document.getElementById('subOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('subOverlay')) {
            document.getElementById('subOverlay').classList.add('hidden');
        }
    });
    document.getElementById('subBuyBtn').addEventListener('click', () => {
        window.open('https://', '_blank');
    });
    
    document.getElementById('defaultModelSelect').addEventListener('change', (e) => {
        localStorage.setItem('cubik_default_model', e.target.value);
        showNotification('Модель по умолчанию сохранена');
    });
    
    document.getElementById('incognitoBtn').addEventListener('click', () => {
        document.getElementById('accountOverlay').classList.add('hidden');
        const chatId = Date.now() + '_' + Math.random();
        const defaultModel = localStorage.getItem('cubik_default_model') || 'fast';
        let model = defaultModel;
        if (!isGold && ['coder', 'think', 'master'].includes(model)) {
            model = 'fast';
        }
        chats[chatId] = {
            messages: [],
            model: model,
            name: '🕵️ Инкогнито',
            pinned: false,
            incognito: true
        };
        chatCounter++;
        renderChatList();
        switchChat(chatId);
        updateChatLayout();
        updateLogo();
        closeSidebar();
        showNotification('Инкогнито чат создан — не сохраняется');
    });
    
    document.getElementById('deleteAllChatsBtn').addEventListener('click', () => {
        document.getElementById('accountOverlay').classList.add('hidden');
        deleteAllUnpinnedChats();
    });
    
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) closeModal();
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.chat-options') && !e.target.closest('.dot-menu')) {
            document.getElementById('dotMenu').classList.add('hidden');
        }
        if (!e.target.closest('.model-dropdown-wrapper')) {
            document.getElementById('modelDropdown').classList.add('hidden');
        }
        if (!e.target.closest('#sidebarMenuBtn') && !e.target.closest('#sidebarMenu')) {
            closeSidebarMenu();
        }
    });
    
    (function() {
        let touchStartX = 0;
        let touchStartY = 0;
        let isSwiping = false;
        const SWIPE_THRESHOLD = 60;
        const EDGE_ZONE = 30;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isSwiping = false;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isSwiping) {
                const dx = e.touches[0].clientX - touchStartX;
                const dy = Math.abs(e.touches[0].clientY - touchStartY);
                if (Math.abs(dx) > 10 && dy < 40) isSwiping = true;
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            const sidebarOpen = document.getElementById('sidebar').classList.contains('open');

            if (dx > SWIPE_THRESHOLD && touchStartX < EDGE_ZONE && !sidebarOpen) {
                document.getElementById('sidebar').classList.add('open');
            }
            if (dx < -SWIPE_THRESHOLD && sidebarOpen) {
                closeSidebar();
            }
            isSwiping = false;
        }, { passive: true });
    })();
    console.log('TOKENS(1000) - добавить токены');
});