import confetti from 'canvas-confetti';

const cityScape = document.getElementById('city-scape');
const controlsContainer = document.getElementById('controls');
const winMessage = document.getElementById('win-message');
const resetButton = document.getElementById('reset-button');

let audioContext;
const audioBuffers = {};
let elementsBuilt = 0;
const totalElementsToWin = 15;

// Initialize Web Audio API on first user interaction
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

async function loadSound(name, url) {
    if (!audioContext) return;
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBuffers[name] = audioBuffer;
    } catch(error) {
        console.error(`Error loading sound: ${name}`, error);
    }
}

function playSound(name) {
    if (audioContext && audioBuffers[name]) {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffers[name];
        source.connect(audioContext.destination);
        source.start(0);
    }
}

const categories = [
    { name: 'Build', icon: 'build_icon.png', sound: 'build_sound.mp3', items: ['building_art.png', 'future_building.png', 'bridge.png'] },
    { name: 'Tech', icon: 'tech_icon.png', sound: 'tech_sound.mp3', items: ['robot.png'] },
    { name: 'Nature', icon: 'nature_icon.png', sound: 'nature_sound.mp3', items: ['park.png'] },
    { name: 'Science', icon: 'science_icon.png', sound: 'science_sound.mp3', items: ['lab.png'] }
];

function createControls() {
    controlsContainer.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'control-button';
        button.dataset.category = category.name;
        
        button.innerHTML = `
            <img src="${category.icon}" alt="${category.name} Icon">
            <span class="tooltip">${category.name}</span>
        `;

        button.addEventListener('click', () => {
            initAudio();
            const randomItem = category.items[Math.floor(Math.random() * category.items.length)];
            addElementToCity(randomItem);
            playSound(category.name);
            checkWinCondition();
        });
        
        controlsContainer.appendChild(button);
        loadSound(category.name, category.sound);
    });
}

function addElementToCity(imageSrc) {
    const element = document.createElement('img');
    element.src = imageSrc;
    element.className = 'city-element';

    // Position the element randomly within the city bounds
    const cityWidth = cityScape.offsetWidth;
    const cityHeight = cityScape.offsetHeight;

    const imgWidth = Math.random() * 50 + 100; // random size between 100px and 150px
    element.style.width = `${imgWidth}px`;
    element.style.height = 'auto';
    
    // Position randomly, avoiding edges and control area
    const x = Math.random() * (cityWidth - imgWidth - 40) + 20; // 20px padding
    const y = Math.random() * (cityHeight * 0.6) + (cityHeight * 0.1); // place in middle 60% vertically
    
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    
    // Random z-index to create depth
    element.style.zIndex = Math.floor(y / 10);

    cityScape.appendChild(element);
    elementsBuilt++;
}

function checkWinCondition() {
    if (elementsBuilt >= totalElementsToWin) {
        winMessage.classList.remove('hidden');
        // Fun confetti celebration!
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
}

function resetGame() {
    cityScape.innerHTML = '';
    elementsBuilt = 0;
    winMessage.classList.add('hidden');
}

resetButton.addEventListener('click', resetGame);

// Initial setup
createControls();

