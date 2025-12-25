// Функция для генерации случайного числа
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Создаём звёзды
function createStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 150; // Количество звёзд

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Случайные параметры
        const size = random(1, 3);
        const x = random(0, 100);
        const y = random(0, 100);
        const duration = random(20, 60);
        const delay = random(0, 10);
        const opacity = random(0.3, 0.8);

        // Применяем стили
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.backgroundColor = '#fff';
        star.style.position = 'absolute';
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.borderRadius = '50%';
        star.style.opacity = opacity;
        star.style.animation = `moveStar ${duration}s linear ${delay}s infinite`;

        starsContainer.appendChild(star);
    }
}

// Анимация движения звёзд
const style = document.createElement('style');
style.textContent = `
    @keyframes moveStar {
        0% {
            transform: translate(0, 0);
        }
        100% {
            transform: translate(${random(-30, 30)}vw, ${random(-30, 30)}vh);
        }
    }
`;
document.head.appendChild(style);

// Запускаем создание звёзд
createStars();
