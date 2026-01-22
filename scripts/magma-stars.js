// Создание квадратных звёзд - УЛУЧШЕННАЯ ВЕРСИЯ
function createSquareStars() {
    const starsContainer = document.getElementById('square-stars');
    if (!starsContainer) {
        console.error('Контейнер для звёзд не найден!');
        return;
    }
    
    // Очищаем контейнер
    starsContainer.innerHTML = '';
    
    const starCount = 30; // Оптимальное количество для видимости
    const viewportHeight = window.innerHeight;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('square-star');
        
        // Случайные параметры для лучшей видимости
        const size = Math.random() * 20 + 15; // 15-35px
        const x = Math.random() * 110 - 5; // -5% до 105%
        const y = Math.random() * 120 + 100; // 100% до 220% (старт снизу)
        const duration = Math.random() * 25 + 15; // 15-40 секунд
        const delay = Math.random() * 20; // задержка 0-20 секунд
        const opacity = Math.random() * 0.5 + 0.3; // 0.3-0.8
        
        // Цвет из градиента
        const gradientColors = [
            '#75C892',
            '#52B69A', 
            '#34A0A3',
            '#158AAD',
            '#1A769F'
        ];
        const color = gradientColors[Math.floor(Math.random() * gradientColors.length)];
        
        // Применяем стили напрямую
        Object.assign(star.style, {
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            opacity: opacity,
            transform: `rotate(${Math.random() * 45}deg)`,
            animation: `floatSquare ${duration}s linear ${delay}s infinite`,
            filter: 'blur(1px)',
            zIndex: '-2',
            borderRadius: '3px',
            pointerEvents: 'none',
            willChange: 'transform, opacity'
        });
        
        starsContainer.appendChild(star);
    }
}

// Эффект пикселей для crystal-overlay
function createPixelEffect() {
    const container = document.querySelector('.crystal-overlay');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        const pixel = document.createElement('div');
        pixel.style.position = 'absolute';
        pixel.style.width = '2px';
        pixel.style.height = '2px';
        pixel.style.backgroundColor = getRandomColor();
        pixel.style.left = `${Math.random() * 100}%`;
        pixel.style.top = `${Math.random() * 100}%`;
        pixel.style.opacity = Math.random() * 0.3 + 0.1;
        pixel.style.animation = `pixelFloat ${Math.random() * 20 + 10}s linear infinite`;
        pixel.style.zIndex = '-1';
        pixel.style.borderRadius = '50%';
        pixel.style.pointerEvents = 'none';
        
        container.appendChild(pixel);
    }
}

function getRandomColor() {
    const colors = ['#75C892', '#52B69A', '#34A0A3', '#158AAD', '#1A769F'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Добавляем стили для анимаций
function addAnimationStyles() {
    if (document.querySelector('#magma-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'magma-animations';
    style.textContent = `
        @keyframes floatSquare {
            0% {
                transform: translateY(100vh) rotate(0deg) scale(0.8);
                opacity: 0;
            }
            10% {
                opacity: 0.7;
            }
            90% {
                opacity: 0.7;
            }
            100% {
                transform: translateY(-100px) rotate(360deg) scale(1.2);
                opacity: 0;
            }
        }
        
        @keyframes pixelFloat {
            0% {
                transform: translate(0, 0) rotate(0deg);
                opacity: 0.1;
            }
            25% {
                transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) rotate(90deg);
                opacity: 0.3;
            }
            50% {
                transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(180deg);
                opacity: 0.2;
            }
            75% {
                transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) rotate(270deg);
                opacity: 0.3;
            }
            100% {
                transform: translate(0, 0) rotate(360deg);
                opacity: 0.1;
            }
        }
        
        /* Плавное появление контента */
        .feature-card, .capability-item, .req-card {
            opacity: 0;
            animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Анимация появления контента с задержкой
function animateContent() {
    const cards = document.querySelectorAll('.feature-card, .capability-item, .req-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Плавное появление body
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.8s ease';
        document.body.style.opacity = '1';
    }, 100);
}

// Эффекты при наведении
function addHoverEffects() {
    const cards = document.querySelectorAll('.feature-card, .req-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    const capabilityItems = document.querySelectorAll('.capability-item');
    capabilityItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(8px)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
        });
    });
}

// Пересоздание звёзд при изменении размера окна
function handleResize() {
    createSquareStars();
    createPixelEffect();
}

// Основная функция инициализации
function initMagmaEffects() {
    console.log('Инициализация эффектов Magma...');
    
    // Добавляем стили анимаций
    addAnimationStyles();
    
    // Создаём эффекты
    createSquareStars();
    createPixelEffect();
    
    // Анимируем контент
    setTimeout(() => {
        animateContent();
        addHoverEffects();
    }, 500);
    
    // Слушаем изменение размера окна
    window.addEventListener('resize', handleResize);
    
    // Периодическое обновление звёзд (каждые 30 секунд)
    setInterval(createSquareStars, 30000);
    
    console.log('Эффекты Magma инициализированы!');
}

// Запуск при полной загрузке страницы
window.addEventListener('load', initMagmaEffects);

// Альтернативный запуск если DOM уже загружен
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMagmaEffects);
} else {
    initMagmaEffects();
}
