/**
 * MYTHOLOGY MAKER - Main Logic
 */

const SYMBOLS = [
    { icon: "⚔️", name: "Sword", hint: "Conflict, severance, power" },
    { icon: "🪷", name: "Lotus", hint: "Purity, rebirth, enlightenment" },
    { icon: "⚡", name: "Thunder", hint: "Sudden destruction, divine wrath" },
    { icon: "🪞", name: "Mirror", hint: "Truth, illusion, self-reflection" },
    { icon: "🐍", name: "Serpent", hint: "Transformation, poison, ancient wisdom" },
    { icon: "🌙", name: "Moon", hint: "Cycles, mystery, the feminine divine" },
    { icon: "👁️", name: "Eye", hint: "Perception, omniscience, protection" },
    { icon: "🏔️", name: "Mountain", hint: "Eternity, obstacles, the meeting of earth and sky" },
    { icon: "🌊", name: "River", hint: "Time, passage, cleansing" },
    { icon: "🔥", name: "Flame", hint: "Creation, destruction, passion" },
    { icon: "🪶", name: "Feather", hint: "Lightness, truth, messages from above" },
    { icon: "👑", name: "Crown", hint: "Authority, burden, divine right" },
    { icon: "🌑", name: "Shadow", hint: "The unconscious, fear, the hidden self" },
    { icon: "⭐", name: "Star", hint: "Guidance, fate, distant hope" },
    { icon: "💨", name: "Wind", hint: "Change, breath of life, the unseen force" },
    { icon: "🩸", name: "Blood", hint: "Life force, sacrifice, lineage" },
    { icon: "🌲", name: "Forest", hint: "The unknown, primal nature, shelter" },
    { icon: "🗝️", name: "Key", hint: "Secrets, answers, forbidden knowledge" }
];

let state = {
    selectedElements: [],
    nature: "God",
    civilization: "Ancient Indian"
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('pick-mode')) initPickMode();
    if (document.body.classList.contains('story-mode')) initStoryMode();
});

// ==========================================
// PICK MODE LOGIC
// ==========================================
function initPickMode() {
    renderGrid();
    setupModifiers();
    
    document.getElementById('btn-forge').addEventListener('click', () => {
        if (state.selectedElements.length === 3) {
            sessionStorage.setItem('myth_config', JSON.stringify(state));
            window.location.href = 'story.html';
        }
    });
}

function renderGrid() {
    const grid = document.getElementById('elements-grid');
    grid.innerHTML = SYMBOLS.map((sym, idx) => `
        <div class="element-card" data-idx="${idx}">
            <span class="element-icon">${sym.icon}</span>
            <span class="element-name">${sym.name}</span>
        </div>
    `).join('');

    document.querySelectorAll('.element-card').forEach(card => {
        card.addEventListener('click', () => toggleSelection(card));
    });
}

function toggleSelection(card) {
    const idx = parseInt(card.dataset.idx);
    const sym = SYMBOLS[idx];
    const isSelected = state.selectedElements.some(e => e.name === sym.name);

    if (isSelected) {
        state.selectedElements = state.selectedElements.filter(e => e.name !== sym.name);
        card.classList.remove('selected');
    } else {
        if (state.selectedElements.length < 3) {
            state.selectedElements.push(sym);
            card.classList.add('selected');
        }
    }
    updateSlots();
}

function updateSlots() {
    const slots = document.querySelectorAll('.slot');
    slots.forEach((slot, i) => {
        if (state.selectedElements[i]) {
            slot.textContent = state.selectedElements[i].icon;
            slot.classList.add('filled');
        } else {
            slot.textContent = '';
            slot.classList.remove('filled');
        }
    });

    const btn = document.getElementById('btn-forge');
    btn.disabled = state.selectedElements.length !== 3;
}

function setupModifiers() {
    document.querySelectorAll('.toggle-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            document.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active'));
            e.target.classList.add('active');
            state.nature = e.target.dataset.val;
        });
    });

    document.querySelectorAll('.civ-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            document.querySelectorAll('.civ-pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            state.civilization = e.target.dataset.civ;
        });
    });
}

// ==========================================
// STORY MODE LOGIC
// ==========================================
async function initStoryMode() {
    const configStr = sessionStorage.getItem('myth_config');
    if (!configStr) {
        window.location.href = 'pick.html';
        return;
    }
    const config = JSON.parse(configStr);
    
    // Setup initial visuals
    initParallax();
    drawGenerativePortrait(config);
    
    // Fetch Myth
    await fetchMyth(config);
    
    // Setup Scroll Animations
    setupScrollObserver();
}

async function fetchMyth(config) {
    const symbolsStr = config.selectedElements.map(e => e.name).join(', ');
    const prompt = `You are a master mythologist. Create an original myth using these 3 symbolic elements: ${symbolsStr}. 
    The protagonist is a ${config.nature} from ${config.civilization} mythology. 
    Reply ONLY in JSON: {
        "title": "myth title", 
        "godName": "character name", 
        "godEpithet": "e.g. The Devourer of Stars", 
        "origin": "paragraph 1 — the creation or birth (100 words)", 
        "conflict": "paragraph 2 — the challenge or war (120 words)", 
        "climax": "paragraph 3 — the turning point using all 3 symbols (120 words)", 
        "resolution": "paragraph 4 — the outcome and legacy (80 words)", 
        "moral": "the myth moral (one sentence)", 
        "symbolMeanings": {
            "sym1": "meaning of first symbol", 
            "sym2": "meaning of second symbol", 
            "sym3": "meaning of third symbol"
        }
    }`;

    try {
        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
        const text = await response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let data;
        try {
            data = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        } catch (e) {
            console.warn("JSON parse failed, trying manual match");
            data = {
                title: (text.match(/["']?title["']?\s*:\s*["']([^"']+)["']/i) || [null, "The Ancient Scroll"])[1],
                godName: (text.match(/["']?godName["']?\s*:\s*["']([^"']+)["']/i) || [null, "The Nameless One"])[1],
                godEpithet: (text.match(/["']?godEpithet["']?\s*:\s*["']([^"']+)["']/i) || [null, "The Awakened"])[1],
                origin: (text.match(/["']?origin["']?\s*:\s*["']([^"']+)["']/i) || [null, "In the beginning, there was only silence until the first symbols appeared..."])[1],
                conflict: (text.match(/["']?conflict["']?\s*:\s*["']([^"']+)["']/i) || [null, "A great darkness threatened the delicate balance of the new realm..."])[1],
                climax: (text.match(/["']?climax["']?\s*:\s*["']([^"']+)["']/i) || [null, "In the final moment, the chosen artifacts were united, glowing with true power..."])[1],
                resolution: (text.match(/["']?resolution["']?\s*:\s*["']([^"']+)["']/i) || [null, "The world was remade, forever scarred but ultimately saved."])[1],
                moral: (text.match(/["']?moral["']?\s*:\s*["']([^"']+)["']/i) || [null, "Every choice weaves a thread in the tapestry of fate."])[1],
                symbolMeanings: { sym1: "", sym2: "", sym3: "" }
            };
        }
        
        // Normalize keys and provide fallback strings
        const normalizedData = {
            title: data.title || "The Ancient Scroll",
            godName: data.godName || data.god_name || "The Nameless One",
            godEpithet: data.godEpithet || data.god_epithet || "The Awakened",
            origin: data.origin || "In the beginning, there was only silence...",
            conflict: data.conflict || "A great darkness threatened the balance...",
            climax: data.climax || "The chosen artifacts were united in light...",
            resolution: data.resolution || "The world was remade and saved.",
            moral: data.moral || "Every choice weaves a thread of fate.",
            symbolMeanings: data.symbolMeanings || data.symbol_meanings || { sym1: "", sym2: "", sym3: "" }
        };
        
        renderStory(normalizedData, config);
        
        // Hide loader, show story
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('story-container').classList.remove('hidden');
        
        // Start Audio
        if (window.initAudio) window.initAudio();

    } catch (err) {
        console.error("API Error", err);
        alert("The Fates were interrupted. Please try again.");
    }
}

function renderStory(data, config) {
    document.getElementById('myth-title').textContent = data.title || "The Forgotten Tale";
    document.getElementById('myth-epithet').textContent = `${data.godName}, ${data.godEpithet}`;
    
    document.getElementById('myth-origin').innerHTML = highlightSymbols(data.origin, config);
    document.getElementById('myth-conflict').innerHTML = highlightSymbols(data.conflict, config);
    document.getElementById('myth-climax').innerHTML = highlightSymbols(data.climax, config);
    document.getElementById('myth-resolution').innerHTML = highlightSymbols(data.resolution, config);
    document.getElementById('myth-moral').textContent = `"${data.moral}"`;

    // Visual symbols
    document.getElementById('symbol-1-display').textContent = config.selectedElements[0].icon;
    document.getElementById('symbol-2-display').textContent = config.selectedElements[1].icon;
    document.getElementById('symbol-3-display').textContent = config.selectedElements[2].icon;

    // Meanings
    const meanings = Object.values(data.symbolMeanings || {a:"", b:"", c:""});
    config.selectedElements.forEach((sym, i) => {
        document.getElementById(`meaning-icon-${i+1}`).textContent = sym.icon;
        document.getElementById(`meaning-text-${i+1}`).textContent = meanings[i] || `Represents ${sym.name}`;
    });
}

function highlightSymbols(text, config) {
    if (!text) return "";
    let res = text;
    config.selectedElements.forEach(sym => {
        const regex = new RegExp(sym.name, "gi");
        res = res.replace(regex, `<span class="inline-glow">${sym.name} ${sym.icon}</span>`);
    });
    return res;
}

function generateFallbackMyth(config) {
    return {
        title: "The Silent Era",
        godName: "Aethelgard",
        godEpithet: "The Unseen",
        origin: "Born from the void.",
        conflict: "Fought the darkness.",
        climax: "Used the symbols to create light.",
        resolution: "And so the world was made.",
        moral: "Light always returns.",
        symbolMeanings: {sym1: "Power", sym2: "Grace", sym3: "Truth"}
    };
}

// --- VISUALS & ANIMATIONS ---
function drawGenerativePortrait(config) {
    const canvas = document.getElementById('portrait-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Background based on nature
    const isDemon = config.nature === "Demon";
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 400);
    bgGrad.addColorStop(0, isDemon ? '#450a0a' : '#b45309');
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 300, 400);

    // Draw a procedural "mask" or face
    ctx.translate(150, 200);
    
    // Aura
    ctx.beginPath();
    ctx.arc(0, -30, 80, 0, Math.PI * 2);
    ctx.fillStyle = isDemon ? 'rgba(220, 38, 38, 0.2)' : 'rgba(251, 191, 36, 0.2)';
    ctx.fill();

    // Geometric Face
    ctx.fillStyle = isDemon ? '#1f2937' : '#fdf6e3';
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(60, -50);
    ctx.lineTo(-60, -50);
    ctx.closePath();
    ctx.fill();

    // Glowing Eyes
    ctx.fillStyle = isDemon ? '#ef4444' : '#fbbf24';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(-25, -30, 5, 0, Math.PI * 2);
    ctx.arc(25, -30, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Draw the 3 symbols around the head
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icons = config.selectedElements.map(e => e.icon);
    if(icons[0]) ctx.fillText(icons[0], 0, -130);
    if(icons[1]) ctx.fillText(icons[1], -90, -30);
    if(icons[2]) ctx.fillText(icons[2], 90, -30);
}

function initParallax() {
    const flameContainer = document.getElementById('parallax-flames');
    const starContainer = document.getElementById('parallax-stars');
    
    // Populate
    for(let i=0; i<15; i++) {
        const el = document.createElement('div');
        el.textContent = "🔥";
        el.style.position = 'absolute';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = Math.random() * 200 + 'vh';
        flameContainer.appendChild(el);
    }
    for(let i=0; i<30; i++) {
        const el = document.createElement('div');
        el.textContent = "✨";
        el.style.position = 'absolute';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = Math.random() * 300 + 'vh';
        starContainer.appendChild(el);
    }

    // Scroll listener
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        flameContainer.style.transform = `translateY(${y * -0.5}px)`;
        starContainer.style.transform = `translateY(${y * -0.2}px)`;
    });
}

function setupScrollObserver() {
    const chapters = document.querySelectorAll('.chapter');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Trigger sound
                if (window.triggerChapterSound) {
                    const ch = parseInt(entry.target.dataset.chapter);
                    if (ch > 0) window.triggerChapterSound(ch);
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    chapters.forEach(ch => observer.observe(ch));
}
