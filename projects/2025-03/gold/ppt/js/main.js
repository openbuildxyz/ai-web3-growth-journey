document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    // 侧边栏切换
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        toggleBtn.classList.toggle('rotate-180');
    });

    // 全屏切换
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            fullscreenBtn.classList.add('active');
        } else {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            fullscreenBtn.classList.remove('active');
        }
    });

    // 键盘导航
    document.addEventListener('keydown', (e) => {
        const iframe = document.querySelector('iframe');
        if (e.key === 'ArrowRight') {
            navigateSlides('next');
        } else if (e.key === 'ArrowLeft') {
            navigateSlides('prev');
        } else if (e.key === 'Escape' && document.fullscreenElement) {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            fullscreenBtn.classList.remove('active');
        }
    });

    // 更新导航点状态
    function updateNavDots() {
        const iframe = document.querySelector('iframe');
        const currentSrc = iframe.src;
        const links = Array.from(document.querySelectorAll('#sidebar a'));
        const currentIndex = links.findIndex(link => link.href === currentSrc);
        
        // 更新导航点
        document.querySelectorAll('.nav-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });

        // 更新侧边栏高亮
        links.forEach((link, index) => {
            const menuItem = link.closest('li');
            if (index === currentIndex) {
                menuItem.classList.add('active');
                link.classList.add('opacity-100');
                link.classList.remove('opacity-80');
            } else {
                menuItem.classList.remove('active');
                link.classList.add('opacity-80');
                link.classList.remove('opacity-100');
            }
        });
    }

    // 监听iframe加载完成
    const iframe = document.querySelector('iframe');
    iframe.addEventListener('load', () => {
        updateNavDots();
        // 添加平滑过渡效果
        iframe.style.opacity = '0';
        setTimeout(() => {
            iframe.style.opacity = '1';
        }, 100);
    });

    // 创建星星背景
    function createStars() {
        const starsContainer = document.querySelector('.fixed');
        const numberOfStars = 50;
        
        for (let i = 0; i < numberOfStars; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.top = `${Math.random() * 100}%`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            starsContainer.appendChild(star);
        }
    }

    createStars();
});

function navigateSlides(direction) {
    const links = Array.from(document.querySelectorAll('#sidebar a'));
    const iframe = document.querySelector('iframe');
    const currentSrc = iframe.src;
    const currentIndex = links.findIndex(link => link.href === currentSrc);
    
    let nextIndex;
    if (direction === 'next') {
        nextIndex = (currentIndex + 1) % links.length;
    } else {
        nextIndex = (currentIndex - 1 + links.length) % links.length;
    }
    
    // 添加过渡动画
    iframe.style.opacity = '0';
    setTimeout(() => {
        links[nextIndex].click();
        setTimeout(() => {
            iframe.style.opacity = '1';
        }, 100);
    }, 300);
} 