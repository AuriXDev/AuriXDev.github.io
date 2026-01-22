document.addEventListener('DOMContentLoaded', function() {
    const starsContainer = document.getElementById('square-stars');
    
    // Если контейнера нет - создаём
    if (!starsContainer) {
        console.warn('Элемент #square-stars не найден, создаю новый');
        const newContainer = document.createElement('div');
        newContainer.id = 'square-stars';
        newContainer.style.position = 'fixed';
        newContainer.style.top = '0';
        newContainer.style.left = '0';
        newContainer.style.width = '100%';
        newContainer.style.height = '100%';
        newContainer.style.zIndex = '-1';
        newContainer.style.pointerEvents = 'none';
        newContainer.style.overflow = 'hidden';
        document.body.appendChild(newContainer);
    }
    
    const container = starsContainer || document.getElementById('square-stars');
    
    // Количество звёзд в зависимости от размера экрана
    const starCount = Math.min(Math.floor(window.innerWidth * window.innerHeight / 4000), 150);
    
    // Цвета звёзд - магма-тема
    const colors = [
        '#ff4500', // оранжево-красный
        '#ff6a00', // ярко-оранжевый
        '#ff8c00', // тёмно-оранжевый
        '#ffaa00', // золотой
        '#ff2200', // красный
        '#ff5500', // огненный
    ];
    
    // Создаём звёзды
    for (let i = 0; i < starCount; i++) {
        createStar(container);
    }
    
    // Создание одной звезды
    function createStar(parent) {
        const star = document.createElement('div');
        const size = Math.random() * 4 + 1; // 1-5px
        const xPos = Math.random() * 100;
        const yPos = Math.random() * 100;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 5 + 3; // 3-8 секунд
        const delay = Math.random() * 5;
        
        star.style.position = 'absolute';
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${xPos}%`;
        star.style.top = `${yPos}%`;
        star.style.backgroundColor = color;
        star.style.borderRadius = '50%';
        star.style.boxShadow = `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}80`;
        star.style.opacity = Math.random() * 0.7 + 0.3;
        star.style.transition = `all ${duration}s ease-in-out ${delay}s`;
        star.style.willChange = 'transform, opacity';
        
        // Добавляем мерцание
        star.classList.add('star');
        parent.appendChild(star);
        
        // Запускаем анимацию мерцания
        animateStar(star, duration, delay);
    }
    
    // Анимация мерцания звезды
    function animateStar(star, duration, delay) {
        function twinkle() {
            const scale = Math.random() * 0.5 + 0.8; // 0.8-1.3
            const opacity = Math.random() * 0.5 + 0.5; // 0.5-1.0
            const brightness = Math.random() * 50 + 100; // 100-150%
            
            star.style.transform = `scale(${scale})`;
            star.style.opacity = opacity;
            star.style.filter = `brightness(${brightness}%)`;
            
            // Случайная задержка до следующего мерцания
            const nextDelay = Math.random() * 2000 + 1000; // 1-3 секунды
            
            setTimeout(twinkle, nextDelay);
        }
        
        // Начинаем анимацию после начальной задержки
        setTimeout(twinkle, delay * 1000);
    }
    
    // Обновляем звёзды при изменении размера окна
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Удаляем старые звёзды
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            
            // Создаём новые звёзды
            const newStarCount = Math.min(Math.floor(window.innerWidth * window.innerHeight / 4000), 150);
            for (let i = 0; i < newStarCount; i++) {
                createStar(container);
            }
        }, 250);
    });
    
    // Добавим интерактивность: звёзды реагируют на курсор
    document.addEventListener('mousemove', function(e) {
        const stars = document.querySelectorAll('#square-stars > div');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        stars.forEach(star => {
            const starX = parseFloat(star.style.left) / 100;
            const starY = parseFloat(star.style.top) / 100;
            
            // Расстояние от курсора до звезды
            const distance = Math.sqrt(
                Math.pow(mouseX - starX, 2) + Math.pow(mouseY - starY, 2)
            );
            
            if (distance < 0.1) { // Если курсор рядом
                star.style.transform = 'scale(1.5)';
                star.style.filter = 'brightness(200%)';
                
                // Возвращаем к нормальному состоянию
                setTimeout(() => {
                    star.style.transform = '';
                    star.style.filter = '';
                }, 300);
            }
        });
    });
    
    // Консольное сообщение об успешной загрузке
    console.log(`Создано ${starCount} звёзд в магма-стиле`);
});
