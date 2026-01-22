// Магма загрузчик - управление анимацией загрузки
document.addEventListener('DOMContentLoaded', function() {
    console.log('Magma Loader запущен');
    
    const loadingScreen = document.querySelector('.loading-screen');
    const squareStarsContainer = document.getElementById('square-stars');
    
    if (!loadingScreen) {
        console.error('Элемент .loading-screen не найден');
        return;
    }
    
    // Создаём квадратные звёзды
    function createSquareStars() {
        if (!squareStarsContainer) {
            console.error('Контейнер для звёзд не найден');
            return;
        }
        
        const starCount = 30;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.classList.add('square-star');
            
            // Случайные параметры
            const size = Math.random() > 0.7 ? random(15, 30) : random(8, 15);
            const x = random(0, 100);
            const y = random(-10, 110);
            const duration = random(25, 50);
            const delay = random(0, 15);
            const opacity = random(0.15, 0.4);
            const rotation = random(0, 45);
            
            // Цвет из градиента
            const gradientColors = [
                '#75C892',
                '#52B69A', 
                '#34A0A3',
                '#158AAD',
                '#1A769F'
            ];
            const colorIndex = Math.floor(random(0, gradientColors.length));
            const color = gradientColors[colorIndex];
            
            // Форма (квадрат или прямоугольник)
            const isSquare = Math.random() > 0.3;
            const width = isSquare ? size : size * random(1.5, 3);
            const height = isSquare ? size : size / random(1.5, 3);
            
            // Применяем стили
            star.style.width = `${width}px`;
            star.style.height = `${height}px`;
            star.style.backgroundColor = color;
            star.style.position = 'absolute';
            star.style.left = `${x}%`;
            star.style.top = `${y}%`;
            star.style.opacity = opacity;
            star.style.transform = `rotate(${rotation}deg)`;
            star.style.animation = `floatSquare ${duration}s linear ${delay}s infinite`;
            star.style.filter = 'blur(0.5px)';
            star.style.borderRadius = Math.random() > 0.8 ? '4px' : '2px';
            star.style.zIndex = '-1';
            
            // Добавляем внутреннее свечение
            star.style.boxShadow = `inset 0 0 ${size/2}px ${color}`;
            
            squareStarsContainer.appendChild(star);
        }
        
        console.log(`Создано ${starCount} квадратных звёзд`);
    }
    
    // Функция для генерации случайного числа
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Имитация загрузки контента
    function simulateLoading() {
        console.log('Начало загрузки...');
        
        // Минимальное время показа загрузки (1.5 секунды)
        const minLoadingTime = 1500;
        const startTime = Date.now();
        
        // Проверяем, загружена ли страница
        const checkPageLoaded = function() {
            const elapsedTime = Date.now() - startTime;
            const pageFullyLoaded = document.readyState === 'complete';
            
            console.log(`Прошло времени: ${elapsedTime}ms, Готовность: ${document.readyState}`);
            
            if (pageFullyLoaded && elapsedTime >= minLoadingTime) {
                // Страница загружена и прошло достаточно времени
                hideLoadingScreen();
            } else if (elapsedTime >= minLoadingTime * 2) {
                // Прошло слишком много времени - скрываем в любом случае
                console.warn('Таймаут загрузки, скрываем экран');
                hideLoadingScreen();
            } else {
                // Проверяем снова через 100ms
                setTimeout(checkPageLoaded, 100);
            }
        };
        
        // Начинаем проверку
        setTimeout(checkPageLoaded, 100);
    }
    
    // Скрытие экрана загрузки
    function hideLoadingScreen() {
        console.log('Скрытие экрана загрузки');
        
        // Добавляем класс для анимации исчезновения
        loadingScreen.classList.add('hidden');
        
        // Создаём звёзды после загрузки
        createSquareStars();
        
        // Удаляем элемент после анимации
        setTimeout(() => {
            if (loadingScreen.parentNode) {
                loadingScreen.style.display = 'none';
                console.log('Экран загрузки скрыт');
            }
        }, 500); // Время должно совпадать с transition в CSS
        
        // Активируем анимации для контента
        activateContentAnimations();
    }
    
    // Активация анимаций контента
    function activateContentAnimations() {
        console.log('Активация анимаций контента');
        
        // Анимация для карточек
        const cards = document.querySelectorAll('.feature-card, .capability-item, .req-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + index * 50);
        });
        
        // Анимация для секций
        const sections = document.querySelectorAll('.section');
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            
            setTimeout(() => {
                section.style.transition = 'opacity 0.8s ease';
                section.style.opacity = '1';
            }, 200 + index * 100);
        });
    }
    
    // Обработчик события полной загрузки страницы
    window.addEventListener('load', function() {
        console.log('Событие window.load сработало');
        // Запускаем симуляцию загрузки
        simulateLoading();
    });
    
    // Fallback: если событие load не сработало, запускаем через 3 секунды
    setTimeout(function() {
        if (!loadingScreen.classList.contains('hidden')) {
            console.warn('Fallback: принудительное скрытие через 3 секунды');
            hideLoadingScreen();
        }
    }, 3000);
    
    // Добавляем анимации при наведении на карточки
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    console.log('Magma Loader инициализирован');
});
