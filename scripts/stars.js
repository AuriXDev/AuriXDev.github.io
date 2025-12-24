// Функция для генерации случайного числа в диапазоне
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Создаём звёзды
function createStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 100; // Количество звёзд

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Случайные параметры для каждой звезды
        const size = random(1, 3); // Размер звезды (1-3 пикселя)
        const x = random(0, 100); // Начальная позиция по X (%)
        const y = random(0, 100); // Начальная позиция по Y (%)
        const duration = random(10, 30); // Длительность анимации (секунды)
        const delay = random(0, 10); // Задержка перед началом движения

        // Применяем стили
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.backgroundColor = '#fff';
        star.style.position = 'absolute';
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.borderRadius = '50%';
        star.style.animation = `moveStar ${duration}s linear ${delay}s infinite`;

        // Добавляем звезду на страницу
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
            transform: translate(${random(-50, 50)}vw, ${random(-50, 50)}vh);
        }
    }
`;
document.head.appendChild(style);

// Запускаем создание звёзд
createStars();
