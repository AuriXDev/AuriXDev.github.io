// Обновлённая функция для создания эффектов
function createSquareStars() {
    const starsContainer = document.getElementById('square-stars');
    const starCount = 67; // ЫЫЫ СИКССЕВЕН
    
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
        
        starsContainer.appendChild(star);
    }
}

// Остальной код остаётся прежним...

// Анимация для карточек при скролле
function initScrollAnimations() {
    const cards = document.querySelectorAll('.feature-card, .req-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Обновляем simulateLoading
function simulateLoading() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (!loadingScreen) return;
    
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        
        // Запускаем создание эффектов
        createSquareStars();
        
        // Инициализируем анимации скролла
        setTimeout(initScrollAnimations, 500);
        
        // Анимация появления секций
        const sections = document.querySelectorAll('.section, .download-section');
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 200 + index * 150);
        });
        
    }, 1200);
}
