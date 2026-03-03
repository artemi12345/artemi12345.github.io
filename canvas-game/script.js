// Dynamic Dimensions
let CANVAS_WIDTH = window.innerWidth;
let CANVAS_HEIGHT = window.innerHeight;

const PLAYER_SIZE = 34;
const PLAYER_SPEED_PPS = 250;
const ENEMY_SIZE = 26;
const ENEMY_RADIUS = ENEMY_SIZE / 2;
const SCORE_POINTS_PER_SECOND = 100;
const HIGH_SCORE_KEY = "canvas_apocalypse_highscore";

// Power-Up Constants
const POWERUP_SIZE = 24;
const POWERUP_SPAWN_INTERVAL = 8.0; // Seconds between power-up spawns
const POWERUP_DURATION = 5.0; // How long the effect lasts
const PLAYER_BOOST_MULTIPLIER = 1.6;
const ENEMY_SLOW_MULTIPLIER = 0.4;

// Visual Polish Constants
const SHAKE_DURATION = 0.2;
const SHAKE_INTENSITY = 8;
const PARTICLE_COUNT = 30;
const PARTICLE_LIFE = 0.8;
const BG_DOT_COUNT = 120;

// Difficulty Configurations
const DIFFICULTIES = {
    1: { name: 'EASY', color: '#44ff44', baseSpeed: 120, spawnInterval: 4.0, speedScaling: 1.0, spawnScaling: 0.03, minSpawn: 1.0 },
    2: { name: 'MEDIUM', color: '#ffff44', baseSpeed: 160, spawnInterval: 2.5, speedScaling: 2.5, spawnScaling: 0.06, minSpawn: 0.5 },
    3: { name: 'HARD', color: '#ff4444', baseSpeed: 220, spawnInterval: 1.5, speedScaling: 5.0, spawnScaling: 0.12, minSpawn: 0.25 }
};

// Image Loading
const playerImg = new Image();
playerImg.src = 'Group 11.png';

const enemyImg = new Image();
enemyImg.src = 'Group 10.png';

// Game State
const state = {
    gameState: 'MENU', 
    difficulty: null,
    player: { x: 0, y: 0 },
    enemies: [],
    powerUps: [],
    particles: [],
    bgDots: [],
    spawnTimer: 0,
    powerUpSpawnTimer: 0,
    keysPressed: new Set(),
    lastTimestamp: 0,
    score: 0,
    survivalTime: 0,
    currentEnemySpeed: 0,
    currentSpawnInterval: 0,
    highScore: 0,
    shakeTime: 0,
    cameraOffset: { x: 0, y: 0 },
    menuAnimTime: 0,
    // Active Effects
    speedBoostTimer: 0,
    slowEnemiesTimer: 0
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function handleResize() {
    CANVAS_WIDTH = window.innerWidth;
    CANVAS_HEIGHT = window.innerHeight;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    if (state.gameState === 'MENU') {
        state.player.x = (CANVAS_WIDTH - PLAYER_SIZE) / 2;
        state.player.y = (CANVAS_HEIGHT - PLAYER_SIZE) / 2;
    }
}

window.addEventListener('resize', handleResize);
handleResize();

function initBackground() {
    state.bgDots = [];
    for (let i = 0; i < BG_DOT_COUNT; i++) {
        state.bgDots.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 15 + 5,
            opacity: Math.random() * 0.5 + 0.2,
            color: Math.random() > 0.8 ? '#4444ff' : '#ffffff'
        });
    }
}

function loadHighScore() {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    state.highScore = saved ? parseInt(saved, 10) : 0;
}

function updateHighScore() {
    const currentScore = Math.floor(state.score);
    if (currentScore > state.highScore) {
        state.highScore = currentScore;
        localStorage.setItem(HIGH_SCORE_KEY, state.highScore.toString());
    }
}

function startGame(level) {
    const config = DIFFICULTIES[level];
    state.difficulty = config;
    state.player.x = (CANVAS_WIDTH - PLAYER_SIZE) / 2;
    state.player.y = (CANVAS_HEIGHT - PLAYER_SIZE) / 2;
    state.enemies = [];
    state.powerUps = [];
    state.particles = [];
    state.spawnTimer = 0;
    state.powerUpSpawnTimer = 0;
    state.score = 0;
    state.survivalTime = 0;
    state.lastTimestamp = 0;
    state.shakeTime = 0;
    state.speedBoostTimer = 0;
    state.slowEnemiesTimer = 0;
    state.cameraOffset = { x: 0, y: 0 };
    state.currentEnemySpeed = config.baseSpeed;
    state.currentSpawnInterval = config.spawnInterval;
    state.gameState = 'PLAY';
    spawnEnemy();
}

function spawnEnemy() {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    switch (edge) {
        case 0: x = Math.random() * CANVAS_WIDTH; y = -ENEMY_SIZE; break;
        case 1: x = CANVAS_WIDTH + ENEMY_SIZE; y = Math.random() * CANVAS_HEIGHT; break;
        case 2: x = Math.random() * CANVAS_WIDTH; y = CANVAS_HEIGHT + ENEMY_SIZE; break;
        case 3: x = -ENEMY_SIZE; y = Math.random() * CANVAS_HEIGHT; break;
    }
    state.enemies.push({ x, y });
}

function spawnPowerUp() {
    const margin = 100;
    const x = margin + Math.random() * (CANVAS_WIDTH - margin * 2);
    const y = margin + Math.random() * (CANVAS_HEIGHT - margin * 2);
    const type = Math.random() > 0.5 ? 'SPEED' : 'SLOW';
    state.powerUps.push({ x, y, type, life: 7.0 }); // Despawns after 7s if not picked up
}

function spawnExplosion(x, y, color, count = PARTICLE_COUNT) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 200 + 50;
        state.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: PARTICLE_LIFE,
            color: color || 'white',
            size: Math.random() * 4 + 2
        });
    }
}

// Input
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    state.keysPressed.add(key);
    if (state.gameState === 'MENU') {
        if (key === '1') startGame(1);
        if (key === '2') startGame(2);
        if (key === '3') startGame(3);
    } else if (state.gameState === 'GAME_OVER') {
        if (key === 'r') state.gameState = 'MENU';
    }
});
window.addEventListener('keyup', (e) => state.keysPressed.delete(e.key.toLowerCase()));

function checkCollision(obj1, size1, obj2, size2, isCircle = false) {
    if (isCircle) {
        const c2x = obj2.x + size2 / 2;
        const c2y = obj2.y + size2 / 2;
        const closestX = Math.max(obj1.x, Math.min(c2x, obj1.x + size1));
        const closestY = Math.max(obj1.y, Math.min(c2y, obj1.y + size1));
        const dx = c2x - closestX;
        const dy = c2y - closestY;
        return (dx * dx + dy * dy) < ((size2 / 2) * (size2 / 2));
    }
    return obj1.x < obj2.x + size2 &&
           obj1.x + size1 > obj2.x &&
           obj1.y < obj2.y + size2 &&
           obj1.y + size1 > obj2.y;
}

function update(deltaTime) {
    updateBackground(deltaTime);
    updateParticles(deltaTime);
    state.menuAnimTime += deltaTime;

    if (state.shakeTime > 0) {
        state.shakeTime -= deltaTime;
        state.cameraOffset.x = (Math.random() - 0.5) * SHAKE_INTENSITY;
        state.cameraOffset.y = (Math.random() - 0.5) * SHAKE_INTENSITY;
    } else {
        state.cameraOffset.x = 0;
        state.cameraOffset.y = 0;
    }

    if (state.gameState !== 'PLAY') return;

    // Update Effect Timers
    if (state.speedBoostTimer > 0) state.speedBoostTimer -= deltaTime;
    if (state.slowEnemiesTimer > 0) state.slowEnemiesTimer -= deltaTime;

    state.survivalTime += deltaTime;
    state.score += deltaTime * SCORE_POINTS_PER_SECOND;
    
    const config = state.difficulty;
    state.currentEnemySpeed = config.baseSpeed + (state.survivalTime * config.speedScaling);
    state.currentSpawnInterval = Math.max(config.minSpawn, config.spawnInterval - (state.survivalTime * config.spawnScaling));

    // Spawning Enemies
    state.spawnTimer += deltaTime;
    if (state.spawnTimer >= state.currentSpawnInterval) {
        spawnEnemy();
        state.spawnTimer = 0;
    }

    // Spawning Power-ups
    state.powerUpSpawnTimer += deltaTime;
    if (state.powerUpSpawnTimer >= POWERUP_SPAWN_INTERVAL) {
        spawnPowerUp();
        state.powerUpSpawnTimer = 0;
    }

    // Player Movement
    let currentSpeed = PLAYER_SPEED_PPS;
    if (state.speedBoostTimer > 0) currentSpeed *= PLAYER_BOOST_MULTIPLIER;

    const moveAmount = currentSpeed * deltaTime;
    if (state.keysPressed.has('w') || state.keysPressed.has('arrowup')) state.player.y -= moveAmount;
    if (state.keysPressed.has('s') || state.keysPressed.has('arrowdown')) state.player.y += moveAmount;
    if (state.keysPressed.has('a') || state.keysPressed.has('arrowleft')) state.player.x -= moveAmount;
    if (state.keysPressed.has('d') || state.keysPressed.has('arrowright')) state.player.x += moveAmount;

    state.player.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_SIZE, state.player.x));
    state.player.y = Math.max(0, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, state.player.y));

    // Power-up Collision & Lifetime
    for (let i = state.powerUps.length - 1; i >= 0; i--) {
        const pu = state.powerUps[i];
        pu.life -= deltaTime;
        if (checkCollision(state.player, PLAYER_SIZE, pu, POWERUP_SIZE)) {
            if (pu.type === 'SPEED') {
                state.speedBoostTimer = POWERUP_DURATION;
                spawnExplosion(pu.x + POWERUP_SIZE/2, pu.y + POWERUP_SIZE/2, '#00ffff', 15);
            } else {
                state.slowEnemiesTimer = POWERUP_DURATION;
                spawnExplosion(pu.x + POWERUP_SIZE/2, pu.y + POWERUP_SIZE/2, '#aa00ff', 15);
            }
            state.powerUps.splice(i, 1);
        } else if (pu.life <= 0) {
            state.powerUps.splice(i, 1);
        }
    }

    // Enemy Movement & Collision
    const pCX = state.player.x + PLAYER_SIZE / 2;
    const pCY = state.player.y + PLAYER_SIZE / 2;

    let enemySpeed = state.currentEnemySpeed;
    if (state.slowEnemiesTimer > 0) enemySpeed *= ENEMY_SLOW_MULTIPLIER;

    for (const enemy of state.enemies) {
        const eCX = enemy.x + ENEMY_SIZE / 2;
        const eCY = enemy.y + ENEMY_SIZE / 2;
        const dx = pCX - eCX;
        const dy = pCY - eCY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            enemy.x += (dx / dist) * enemySpeed * deltaTime;
            enemy.y += (dy / dist) * enemySpeed * deltaTime;
        }
        if (checkCollision(state.player, PLAYER_SIZE, enemy, ENEMY_SIZE, true)) {
            state.gameState = 'GAME_OVER';
            state.shakeTime = SHAKE_DURATION;
            spawnExplosion(pCX, pCY, '#00ff00');
            spawnExplosion(eCX, eCY, '#ff0000');
            updateHighScore();
            break; 
        }
    }
}

function updateBackground(deltaTime) {
    for (const dot of state.bgDots) {
        dot.y += dot.speed * deltaTime;
        if (dot.y > CANVAS_HEIGHT) {
            dot.y = -dot.size;
            dot.x = Math.random() * CANVAS_WIDTH;
        }
    }
}

function updateParticles(deltaTime) {
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.life -= deltaTime;
        if (p.life <= 0) state.particles.splice(i, 1);
    }
}

function drawImageCorrected(img, x, y, targetWidth, targetHeight) {
    if (!img.complete || img.naturalWidth === 0) return;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    let drawW = targetWidth;
    let drawH = targetWidth / imgRatio;
    const offsetY = (targetHeight - drawH) / 2;
    ctx.drawImage(img, x, y + offsetY, drawW, drawH);
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    ctx.translate(state.cameraOffset.x, state.cameraOffset.y);

    drawBackground();

    if (state.gameState === 'MENU') {
        drawMenu();
    } else {
        // HUD
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Consolas, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`TIME: ${state.survivalTime.toFixed(1)}s`, 20, 20);
        ctx.fillText(`SCORE: ${Math.floor(state.score)}`, 20, 45);
        ctx.fillText(`BEST: ${state.highScore}`, 20, 70);

        // Power-up Status Effects
        if (state.speedBoostTimer > 0) {
            ctx.fillStyle = '#00ffff';
            ctx.fillText(`SPEED BOOST: ${state.speedBoostTimer.toFixed(1)}s`, 20, 105);
        }
        if (state.slowEnemiesTimer > 0) {
            ctx.fillStyle = '#aa00ff';
            ctx.fillText(`ENEMIES SLOWED: ${state.slowEnemiesTimer.toFixed(1)}s`, 20, 130);
        }

        // Draw Power-ups
        for (const pu of state.powerUps) {
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = pu.type === 'SPEED' ? '#00ffff' : '#aa00ff';
            ctx.fillStyle = pu.type === 'SPEED' ? '#00ffff' : '#aa00ff';
            
            // Draw a diamond shape for power-up
            const glow = Math.sin(state.menuAnimTime * 10) * 5;
            ctx.beginPath();
            ctx.moveTo(pu.x + POWERUP_SIZE/2, pu.y - glow);
            ctx.lineTo(pu.x + POWERUP_SIZE + glow, pu.y + POWERUP_SIZE/2);
            ctx.lineTo(pu.x + POWERUP_SIZE/2, pu.y + POWERUP_SIZE + glow);
            ctx.lineTo(pu.x - glow, pu.y + POWERUP_SIZE/2);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }

        if (state.gameState !== 'GAME_OVER') {
            drawImageCorrected(playerImg, state.player.x, state.player.y, PLAYER_SIZE, PLAYER_SIZE);
        }
        
        for (const enemy of state.enemies) {
            drawImageCorrected(enemyImg, enemy.x, enemy.y, ENEMY_SIZE, ENEMY_SIZE);
        }

        for (const p of state.particles) {
            ctx.globalAlpha = p.life / PARTICLE_LIFE;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        ctx.globalAlpha = 1.0;

        if (state.gameState === 'GAME_OVER') drawGameOver();
    }
    
    ctx.restore();
}

function drawBackground() {
    for (const dot of state.bgDots) {
        ctx.globalAlpha = dot.opacity;
        ctx.fillStyle = dot.color;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;
}

function drawMenu() {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const gradient = ctx.createLinearGradient(centerX - 200, 0, centerX + 200, 0);
    gradient.addColorStop(0, '#00ff00');
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, '#00ff00');
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ff00';
    ctx.fillStyle = gradient;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 64px "Segoe UI", Arial, sans-serif';
    ctx.fillText('CANVAS APOCALYPSE', centerX, centerY - 150);
    ctx.shadowBlur = 0;
    const bounce = Math.sin(state.menuAnimTime * 3) * 5;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.fillRect(centerX - 150, centerY - 95 + bounce, 300, 40);
    ctx.strokeStyle = 'gold';
    ctx.strokeRect(centerX - 150, centerY - 95 + bounce, 300, 40);
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'gold';
    ctx.fillText(`BEST SURVIVAL SCORE: ${state.highScore}`, centerX, centerY - 75 + bounce);
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('CHOOSE YOUR DESTINY', centerX, centerY + 20);
    const buttonWidth = 180;
    const buttonHeight = 50;
    const spacing = 200;
    [1, 2, 3].forEach((level, i) => {
        const x = centerX + (i - 1) * spacing;
        const y = centerY + 100;
        const config = DIFFICULTIES[level];
        const pulse = Math.sin(state.menuAnimTime * 4 + i) * 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(x - buttonWidth/2, y - buttonHeight/2 + pulse, buttonWidth, buttonHeight);
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - buttonWidth/2, y - buttonHeight/2 + pulse, buttonWidth, buttonHeight);
        ctx.fillStyle = config.color;
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`[${level}] ${config.name}`, x, y + pulse);
    });
    const alpha = (Math.sin(state.menuAnimTime * 2) + 1) / 2;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + alpha * 0.4})`;
    ctx.font = 'italic 16px Arial';
    ctx.fillText('Press 1, 2, or 3 to Begin', centerX, centerY + 180);
    ctx.fillText('Move with WASD or Arrow Keys', centerX, centerY + 210);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(-50, -50, CANVAS_WIDTH + 100, CANVAS_HEIGHT + 100);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'red';
    ctx.font = 'bold 80px Arial';
    ctx.fillText('THE END', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
    ctx.shadowBlur = 0;
    ctx.font = '28px Arial';
    ctx.fillText(`Final Score: ${Math.floor(state.score)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'gold';
    ctx.fillText(`PERSONAL BEST: ${state.highScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    ctx.font = 'italic 20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Press [R] to Try Again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 120);
}

function gameLoop(timestamp) {
    if (!state.lastTimestamp) state.lastTimestamp = timestamp;
    const deltaTime = Math.min((timestamp - state.lastTimestamp) / 1000, 0.1);
    state.lastTimestamp = timestamp;
    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

initBackground();
loadHighScore();
requestAnimationFrame(gameLoop);