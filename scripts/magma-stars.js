// Создание квадратных звёзд
function createSquareStars() {
    const starsContainer = document.getElementById('square-stars');
    if (!starsContainer) return;
    
    const starCount = 67; // ЫЫЫ СЫКССЕВЕН
    
    // Очищаем контейнер на всякий случай
    starsContainer.innerHTML = '';
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('square-star');
        
        // Случайные параметры
        const size = random(15, 35); // Крупные квадраты
        const x = random(-10, 110); // За пределами экрана для плавного входа
        const y = random(100, 120); // Начинают снизу экрана
        const duration = random(20, 40);
        const delay = random(0, 15);
        const opacity = random(0.3, 0.8);
        const rotation = random(0, 45); // Меньше вращение
        
        // Цвет из градиента
        const gradientColors = [
            '#75C892',
            '#52B69A', 
            '#34A0A3',
            '#158AAD',
            '#1A769F'
        ];
        const color = gradientColors[Math.floor(random(0, gradientColors.length))];
        
        // Применяем стили
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.backgroundColor = color;
        star.style.position = 'absolute';
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.opacity = opacity;
        star.style.transform = `rotate(${rotation}deg)`;
        star.style.animation = `floatSquare ${duration}s linear ${delay}s infinite`;
        star.style.filter = 'blur(1px)';
        star.style.zIndex = '-2';
        
        starsContainer.appendChild(star);
    }
}

// Функция для генерации случайного числа
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Эффект пикселей для crystal-overlay
function createPixelEffect() {
    const container = document.querySelector('.crystal-overlay');
    if (!container) return;
    
    // Очищаем старые пиксели
    container.innerHTML = '';
    
    // Создаём пиксельные частицы
    for (let i = 0; i < 80; i++) {
        const pixel = document.createElement('div');
        pixel.style.position = 'absolute';
        pixel.style.width = '3px';
        pixel.style.height = '3px';
        pixel.style.backgroundColor = randomColor();
        pixel.style.left = `${random(0, 100)}%`;
        pixel.style.top = `${random(0, 100)}%`;
        pixel.style.opacity = random(0.1, 0.4);
        pixel.style.animation = `pixelFloat ${random(15, 25)}s linear infinite`;
        pixel.style.zIndex = '-1';
        pixel.style.borderRadius = '1px';
        
        container.appendChild(pixel);
    }
}

function randomColor() {
    const colors = ['#75C892', '#52B69A', '#34A0A3', '#158AAD', '#1A769F'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Анимация появления контента
function animateContent() {
    // Анимация появления элементов
    const elements = document.querySelectorAll('.feature-card, .capability-item, .req-card');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 300 + index * 100);
    });
    
    // Анимация для секций
    const sections = document.querySelectorAll('.section, .download-section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(40px)';
        
        setTimeout(() => {
            section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 100 + index * 150);
    });
}

// Добавляем эффект наведения на карточки
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
    
    // Для capability-item
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

// Добавляем CSS для пиксельной анимации
function addPixelAnimationStyles() {
    if (document.querySelector('#pixel-animation-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'pixel-animation-styles';
    style.textContent = `
        @keyframes pixelFloat {
            0% {
                transform: translate(0, 0) rotate(0deg);
                opacity: 0.1;
            }
            25% {
                transform: translate(${random(-30, 30)}px, ${random(-30, 30)}px) rotate(90deg);
                opacity: 0.3;
            }
            50% {
                transform: translate(${random(-50, 50)}px, ${random(-50, 50)}px) rotate(180deg);
                opacity: 0.2;
            }
            75% {
                transform: translate(${random(-30, 30)}px, ${random(-30, 30)}px) rotate(270deg);
                opacity: 0.3;
            }
            100% {
                transform: translate(0, 0) rotate(360deg);
                opacity: 0.1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Запускаем всё при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Сначала добавляем стили для анимации
    addPixelAnimationStyles();
    
    // Создаём звёзды и эффекты
    createSquareStars();
    createPixelEffect();
    
    // Анимируем контент
    setTimeout(() => {
        animateContent();
        addHoverEffects();
    }, 500);
    
    // Добавляем класс для плавного появления body
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.5s ease';
    }, 100);
});

// Инициализируем opacity body
document.body.style.opacity = '0';
