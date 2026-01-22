// БОЛЬШИЕ И КВАДРАТНЫЕ ЗВЁЗДЫ
function createSquareStars() {
    const starsContainer = document.getElementById('square-stars');
    if (!starsContainer) {
        // Если контейнера нет - создадим
        const newContainer = document.createElement('div');
        newContainer.id = 'square-stars';
        document.body.appendChild(newContainer);
        console.log('✅ Создан контейнер для звёзд');
        return createSquareStars(); // Запускаем снова
    }
    
    // Очищаем
    starsContainer.innerHTML = '';
    
    // МЕНЬШЕ звёзд, но они БОЛЬШИЕ
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'square-star';
        
        const size = Math.random() * 100 + 40;
        
        const x = Math.random() * 110 - 5;
        const y = Math.random() * 120 + 100;
        
        const duration = Math.random() * 30 + 20;
        const delay = Math.random() * 10;
        
        const colors = [
            'linear-gradient(135deg, #75C892 0%, #52B69A 50%, #34A0A3 100%)',
            'linear-gradient(135deg, #52B69A 0%, #34A0A3 50%, #158AAD 100%)',
            'linear-gradient(135deg, #34A0A3 0%, #158AAD 50%, #1A769F 100%)',
            'linear-gradient(135deg, #75C892 0%, #158AAD 50%, #1A769F 100%)'
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        Object.assign(star.style, {
            width: `${size}px`,
            height: `${size}px`,
            background: color,
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            opacity: '0',
            transform: `rotate(${Math.random() * 45}deg)`,
            animation: `floatBigSquare ${duration}s linear ${delay}s infinite`,
            filter: 'blur(0.5px)',
            zIndex: '-2',
            borderRadius: '6px',
            pointerEvents: 'none',
            willChange: 'transform, opacity',
            boxShadow: `
                0 0 25px rgba(117, 200, 146, 0.8),
                0 0 50px rgba(117, 200, 146, 0.4),
                inset 0 0 15px rgba(255, 255, 255, 0.3)
            `
        });
        
        starsContainer.appendChild(star);
    }
    
    console.log(`✅ Создано ${starCount} БОЛЬШИХ квадратных звёзд`);
}

// Эффект пикселей
function createPixelEffect() {
    const container = document.querySelector('.crystal-overlay');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Меньше пикселей, но они больше
    for (let i = 0; i < 30; i++) {
        const pixel = document.createElement('div');
        Object.assign(pixel.style, {
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: getRandomColor(),
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.4 + 0.1,
            animation: `pixelFloat ${Math.random() * 25 + 15}s linear infinite`,
            zIndex: '-1',
            borderRadius: '1px',
            pointerEvents: 'none',
            boxShadow: '0 0 10px currentColor'
        });
        
        container.appendChild(pixel);
    }
}

function getRandomColor() {
    const colors = ['#75C892', '#52B69A', '#34A0A3', '#158AAD'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Стили для анимаций
function addAnimationStyles() {
    if (document.querySelector('#magma-big-stars')) return;
    
    const style = document.createElement('style');
    style.id = 'magma-big-stars';
    style.textContent = `
        /* Анимация для больших квадратных звёзд */
        @keyframes floatBigSquare {
            0% {
                transform: translateY(120vh) rotate(0deg) scale(0.7);
                opacity: 0;
            }
            10% {
                opacity: 0.9;
                transform: translateY(90vh) rotate(90deg) scale(1);
            }
            30% {
                opacity: 1;
                transform: translateY(60vh) rotate(180deg) scale(1.1);
                filter: blur(0px) brightness(1.5);
            }
            60% {
                opacity: 0.9;
                transform: translateY(30vh) rotate(270deg) scale(1);
                filter: blur(0.5px) brightness(1.2);
            }
            90% {
                opacity: 0.8;
                transform: translateY(0vh) rotate(360deg) scale(0.9);
                filter: blur(1px) brightness(1);
            }
            100% {
                transform: translateY(-100px) rotate(450deg) scale(0.7);
                opacity: 0;
            }
        }
        
        /* Анимация пикселей */
        @keyframes pixelFloat {
            0% {
                transform: translate(0, 0) rotate(0deg);
                opacity: 0.2;
            }
            50% {
                transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(180deg);
                opacity: 0.4;
            }
            100% {
                transform: translate(0, 0) rotate(360deg);
                opacity: 0.2;
            }
        }
        
        /* Плавное появление */
        body {
            opacity: 0;
            animation: fadeInBody 1s ease-out forwards;
        }
        
        @keyframes fadeInBody {
            to {
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Эффекты при наведении
function addHoverEffects() {
    const cards = document.querySelectorAll('.feature-card, .req-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.03)';
            this.style.boxShadow = '0 0 40px rgba(117, 200, 146, 0.6)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
        });
    });
}

// Инициализация
function initMagmaEffects() {
    console.log('🚀 Инициализация БОЛЬШИХ квадратных звёзд...');
    
    addAnimationStyles();
    createSquareStars();
    createPixelEffect();
    
    // Обновляем звёзды каждые 40 секунд
    setInterval(createSquareStars, 40000);
    
    // Эффекты при наведении
    setTimeout(addHoverEffects, 1000);
    
    console.log('✅ Большие квадратные звёзды созданы!');
}

// Запускаем при загрузке
window.addEventListener('load', initMagmaEffects);

// Если страница уже загружена
if (document.readyState === 'complete') {
    initMagmaEffects();
}
