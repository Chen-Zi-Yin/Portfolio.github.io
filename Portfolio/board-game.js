document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.querySelector('.game-container');
    const flowersContainer = document.querySelector('.flowers-container');
    const particleContainer = document.querySelector('.particle-container');
    const flowerCountDisplay = document.getElementById('flowerCount');
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const resetGame = document.getElementById('resetGame');
    
    let flowerCount = 0;
    const maxFlowers = 20;
    let clickCombo = 0;
    let lastClickTime = 0;
    
    const popSound = new Audio('./audio/pop.mp3');
    const specialSound = new Audio('./audio/special.mp3');
    
    // 自動播放音樂
    window.addEventListener('click', () => {
        bgMusic.play().catch(error => {
            console.log("自動播放被阻擋:", error);
        });
        musicToggle.classList.add('playing');
    }, { once: true });

    // 音樂控制
    musicToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止觸發遊戲點擊
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.classList.add('playing');
        } else {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
        }
    });

    // 重置遊戲
    resetGame.addEventListener('click', () => {
        flowersContainer.innerHTML = '';
        flowerCount = 0;
        flowerCountDisplay.textContent = flowerCount;
        createResetAnimation();
    });

    // 花朵位置計算
    function calculateRandomPosition() {
        const minDistance = 40; // 最小間距（像素）
        let position;
        let attempts = 0;
        const maxAttempts = 50;

        // 嘗試找到一個不會重疊的位置
        do {
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 120; // 距離樹幹 30-150px
            
            const x = 50 + (Math.cos(angle) * distance * 0.4);
            const y = 50 + (Math.sin(angle) * distance * 0.3);
            
            position = { left: `${x}%`, top: `${y}%` };
            attempts++;

            // 檢查是否與現有花朵重疊
            const overlap = Array.from(flowersContainer.children).some(flower => {
                const flowerRect = flower.getBoundingClientRect();
                const newX = (x / 100) * gameContainer.clientWidth;
                const newY = (y / 100) * gameContainer.clientHeight;
                
                const dx = flowerRect.left - newX;
                const dy = flowerRect.top - newY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                return distance < minDistance;
            });

            if (!overlap || attempts >= maxAttempts) {
                break;
            }
        } while (true);

        return position;
    }

    // 創建花朵
    function createFlower() {
        const flower = document.createElement('div');
        flower.className = 'flower';
        
        // 隨機位置
        const position = calculateRandomPosition();
        flower.style.left = position.left;
        flower.style.top = position.top;
        
        // 隨機大小 (0.5 到 1.5 倍原始大小)
        const scale = 0.5 + Math.random();
        
        // 隨機旋轉
        const rotation = Math.random() * 360;
        
        // 隨機顏色 (使用 HSL 以獲得更好的顏色控制)
        const hue = Math.random() * 360; // 完整的色相範圍
        const saturation = 70 + Math.random() * 30; // 70-100% 飽和度
        const lightness = 60 + Math.random() * 20; // 60-80% 亮度
        
        flower.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
        flower.style.filter = `hue-rotate(${hue}deg)`;
        flower.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        flowersContainer.appendChild(flower);
        createSparkles(position);
        
        // 播放音效
        popSound.currentTime = 0; // 重置音效
        popSound.play();
    }

    // 創建特效粒子
    function createSparkles(position) {
        for (let i = 0; i < 5; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = position.left;
            sparkle.style.top = position.top;
            
            const angle = (Math.random() * Math.PI * 2);
            const distance = Math.random() * 50;
            const duration = 0.5 + Math.random() * 0.5;
            
            sparkle.style.setProperty('--angle', angle + 'rad');
            sparkle.style.setProperty('--distance', distance + 'px');
            sparkle.style.setProperty('--duration', duration + 's');
            
            particleContainer.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), duration * 1000);
        }
    }

    // 重置動畫
    function createResetAnimation() {
        const leaves = document.createElement('div');
        leaves.className = 'falling-leaves';
        gameContainer.appendChild(leaves);
        
        for (let i = 0; i < 20; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            leaf.style.left = Math.random() * 100 + '%';
            leaf.style.animationDelay = Math.random() * 2 + 's';
            leaves.appendChild(leaf);
        }
        
        setTimeout(() => leaves.remove(), 3000);
    }

    // 點擊事件處理
    gameContainer.addEventListener('click', (e) => {
        if (flowerCount >= maxFlowers) {
            flowersContainer.innerHTML = '';
            flowerCount = 0;
            createResetAnimation();
        } else {
            const currentTime = Date.now();
            if (currentTime - lastClickTime < 300) {
                clickCombo++;
                if (clickCombo >= 3) {
                    createSpecialEffect();
                    // 連擊時一次生成多朵花
                    for (let i = 0; i < 3; i++) {
                        if (flowerCount < maxFlowers) {
                            createFlower();
                            flowerCount++;
                            flowerCountDisplay.textContent = flowerCount;
                        }
                    }
                    clickCombo = 0;
                }
            } else {
                clickCombo = 1;
                if (flowerCount < maxFlowers) {
                    createFlower();
                    flowerCount++;
                    flowerCountDisplay.textContent = flowerCount;
                }
            }
            lastClickTime = currentTime;
        }
    });

    // 連擊特效
    function createSpecialEffect() {
        const effect = document.createElement('div');
        effect.className = 'special-effect';
        gameContainer.appendChild(effect);
        setTimeout(() => effect.remove(), 1000);
        
        // 播放特殊音效
        specialSound.currentTime = 0;
        specialSound.play();
    }

    // 添加花朵樣式
    const flowerStyles = `
    .flower {
        position: absolute;
        width: 20px;
        height: 20px;
        background: #ffb7c5;
        border-radius: 50%;
        transform-origin: center;
    }

    .flower::before,
    .flower::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: inherit;
        border-radius: inherit;
        transform-origin: center;
    }

    .flower::before {
        transform: rotate(45deg);
    }

    .flower::after {
        transform: rotate(-45deg);
    }
    `;

    // 將花朵樣式添加到文檔中
    const styleSheet = document.createElement("style");
    styleSheet.textContent = flowerStyles;
    document.head.appendChild(styleSheet);
}); 