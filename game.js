// --- ПРОВЕРКА АВТОРИЗАЦИИ ---
const currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
    window.location.href = 'login.html';
}

// --- Состояние игры ---
let sun = 50;
let wave = 1;
let zombies = []; // Массив для зомби
let gameLoop;

// --- Растения (Магазин) ---
const plants = [
    { id: 'sunflower', name: '🌻 Подсолнух', cost: 50, income: 5, owned: 0, type: 'sun' },
    { id: 'peashooter', name: '🌱 Горохострел', cost: 100, damage: 10, owned: 0, type: 'attack' },
    { id: 'wallnut', name: '🌰 Орех', cost: 150, hp: 100, owned: 0, type: 'defense' }
];

// --- Элементы на странице ---
const sunDisplay = document.getElementById('sunDisplay');
const waveDisplay = document.getElementById('waveDisplay');
const sunClicker = document.getElementById('sunClicker');
const shopItemsContainer = document.getElementById('shopItems');
const battlefield = document.getElementById('battlefield');

// --- Обновление интерфейса ---
function updateUI() {
    sunDisplay.textContent = Math.floor(sun);
    waveDisplay.textContent = wave;
    renderShop();
    renderBattlefield();
}

// --- Отрисовка магазина ---
function renderShop() {
    shopItemsContainer.innerHTML = '';
    
    plants.forEach(item => {
        const canAfford = sun >= item.cost;
        
        const itemHTML = `
            <div class="shop-item">
                <div class="shop-item-info">
                    <h3>${item.name}</h3>
                    <p>Стоимость: ${item.cost} ☀️</p>
                </div>
                <button class="buy-btn" 
                        onclick="buyPlant('${item.id}')" 
                        ${!canAfford ? 'disabled' : ''}>
                    Купить
                </button>
            </div>
        `;
        shopItemsContainer.innerHTML += itemHTML;
    });
}

// --- Покупка растения ---
window.buyPlant = function(id) {
    const item = plants.find(p => p.id === id);
    if (item && sun >= item.cost) {
        sun -= item.cost;
        item.owned += 1;
        updateUI();
    }
};

// --- Отрисовка поля боя (Зомби и Растения) ---
function renderBattlefield() {
    // Очищаем поле, оставляем только землю
    battlefield.innerHTML = '';
    
    // Рисуем купленные растения
    plants.forEach((plant, index) => {
        if (plant.owned > 0) {
            const plantDiv = document.createElement('div');
            plantDiv.className = 'plant-unit';
            plantDiv.style.left = `${index * 80 + 20}px`;
            plantDiv.style.bottom = '20px';
            plantDiv.innerHTML = `${plant.name.split(' ')[0]} <br> x${plant.owned}`;
            battlefield.appendChild(plantDiv);
        }
    });

    // Рисуем зомби
    zombies.forEach((zombie, index) => {
        const zombieDiv = document.createElement('div');
        zombieDiv.className = 'zombie-unit';
        // Чем ближе к 0, тем ближе к дому (левее)
        zombieDiv.style.left = `${zombie.x}px`; 
        zombieDiv.style.bottom = `${Math.random() * 50 + 10}px`; // Немного рандома
        zombieDiv.innerHTML = `🧟 <br> ${zombie.hp} HP`;
        battlefield.appendChild(zombieDiv);
    });
}

// --- Спавн зомби ---
function spawnZombie() {
    zombies.push({
        id: Date.now(),
        hp: 50 + (wave * 20), // Здоровье растет с волной
        x: 350, // Начинают справа
        speed: 0.5 + (wave * 0.1) // Скорость растет
    });
}

// --- Основной игровой цикл (вызывается каждые 100 мс) ---
function gameTick() {
    // 1. Подсолнухи генерируют солнце
    const sunflowers = plants.find(p => p.id === 'sunflower');
    if (sunflowers && sunflowers.owned > 0) {
        sun += sunflowers.income * sunflowers.owned * 0.1; // 0.1 сек
    }

    // 2. Горохострелы стреляют (наносят урон первому зомби)
    const peashooters = plants.find(p => p.id === 'peashooter');
    if (peashooters && peashooters.owned > 0 && zombies.length > 0) {
        let totalDamage = peashooters.damage * peashooters.owned * 0.1;
        zombies[0].hp -= totalDamage;
        
        // Если зомби умер, убираем его
        if (zombies[0].hp <= 0) {
            zombies.shift(); // Удаляем первого
        }
    }

    // 3. Зомби двигаются к дому
    zombies.forEach(zombie => {
        zombie.x -= zombie.speed;
    });

    // 4. Проверка проигрыша (если зомби дошел до x < 0)
    if (zombies.some(z => z.x < 0)) {
        clearInterval(gameLoop);
        alert('🧟 Зомби съели твой мозг! Игра окончена.');
        window.location.href = 'index.html';
    }

    // 5. Спавн новых зомби (каждые 3 секунды)
    if (Math.random() < 0.02) { // 2% шанс на каждый тик
        spawnZombie();
    }

    // 6. Увеличение волны (каждые 20 секунд)
    if (Math.random() < 0.001) {
        wave++;
        alert(`🧟 Волна ${wave}! Зомби стали сильнее!`);
    }

    updateUI();
}

// --- Сбор солнца по клику ---
sunClicker.addEventListener('click', () => {
    sun += 10;
    updateUI();
});

// --- Выход ---
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// --- Запуск игры ---
updateUI();
gameLoop = setInterval(gameTick, 100);
