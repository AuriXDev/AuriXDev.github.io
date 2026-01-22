// Создание квадратных звёзд
function createSquareStars() {
    const starsContainer = document.getElementById('square-stars');
    const starCount = 50; // Меньше звёзд, но они больше
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('square-star');
        
        // Случайные параметры
        const size = random(10, 30); // Крупные квадраты
        const x = random(0, 100);
        const y = random(-20, 120); // Начинают за пределами экрана
        const duration = random(30, 60);
        const delay = random(0, 20);
        const opacity = random(0.2, 0.6);
        const rotation = random(0, 360);
        
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
        
        starsContainer.appendChild(star);
    }
}

// Функция для генерации случайного числа
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Эффект разрыва пикселей
function createPixelEffect() {
    const container = document.querySelector('.crystal-overlay');
    if (!container) return;
    
    // Создаём пиксельные частицы
    for (let i = 0; i < 100; i++) {
        const pixel = document.createElement('div');
        pixel.style.position = 'absolute';
        pixel.style.width = '2px';
        pixel.style.height = '2px';
        pixel.style.backgroundColor = randomColor();
        pixel.style.left = `${random(0, 100)}%`;
        pixel.style.top = `${random(0, 100)}%`;
        pixel.style.opacity = random(0.1, 0.3);
        pixel.style.animation = `pixelFloat ${random(10, 30)}s linear infinite`;
        
        container.appendChild(pixel);
    }
}

function randomColor() {
    const colors = ['#75C892', '#52B69A', '#34A0A3', '#158AAD', '#1A769F'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Анимация загрузки
function simulateLoading() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (!loadingScreen) return;
    
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        
        // Запускаем создание эффектов после загрузки
        createSquareStars();
        createPixelEffect();
        
        // Добавляем класс к body для дополнительных эффектов
        document.body.classList.add('loaded');
        
        // Анимация появления элементов
        const elements = document.querySelectorAll('.feature-card, .capability-item');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100 + index * 50);
        });
        
    }, 1500);
}

// Запускаем всё при загрузке
document.addEventListener('DOMContentLoaded', () => {
    simulateLoading();
    
    // Добавляем эффект наведения на карточки
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Добавляем CSS для пиксельной анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes pixelFloat {
        0% {
            transform: translate(0, 0) rotate(0deg);
        }
        25% {
            transform: translate(${random(-20, 20)}px, ${random(-20, 20)}px) rotate(90deg);
        }
        50% {
            transform: translate(${random(-40, 40)}px, ${random(-40, 40)}px) rotate(180deg);
        }
        75% {
            transform: translate(${random(-20, 20)}px, ${random(-20, 20)}px) rotate(270deg);
        }
        100% {
            transform: translate(0, 0) rotate(360deg);
        }
    }
    
    .loaded .section {
        animation: sectionReveal 0.8s ease-out;
    }
    
    @keyframes sectionReveal {
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
