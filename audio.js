/**
 * MYTHOLOGY MAKER - Audio Engine
 */

let audioCtx = null;
let masterGain = null;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(audioCtx.destination);

    startDrone();
    startRandomPercussion();
}

function startDrone() {
    // Fundamental 50Hz
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 50;
    
    // First overtone 100Hz
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 100;
    
    // Second overtone 150Hz
    const osc3 = audioCtx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = 150;

    const gain1 = audioCtx.createGain(); gain1.gain.value = 0.5;
    const gain2 = audioCtx.createGain(); gain2.gain.value = 0.25;
    const gain3 = audioCtx.createGain(); gain3.gain.value = 0.1;

    osc1.connect(gain1).connect(masterGain);
    osc2.connect(gain2).connect(masterGain);
    osc3.connect(gain3).connect(masterGain);

    osc1.start();
    osc2.start();
    osc3.start();
}

function startRandomPercussion() {
    setInterval(() => {
        if (Math.random() > 0.5) {
            playThud();
        }
    }, 8000); // Check every 8 seconds
}

function playThud() {
    if (!audioCtx) return;
    
    const bufferSize = audioCtx.sampleRate * 1.0; // 1 second
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    // Bandpass to make it a low thud
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 80;
    filter.Q.value = 1.0;

    const env = audioCtx.createGain();
    const now = audioCtx.currentTime;
    
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.8, now + 0.05);
    env.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    noiseSource.connect(filter).connect(env).connect(masterGain);
    noiseSource.start(now);
}

// Called by IntersectionObserver in app.js
window.triggerChapterSound = function(chapterNum) {
    if (!audioCtx) return;

    const baseFreq = 220; // A3
    const freq = baseFreq * Math.pow(1.059463, chapterNum * 2); // Ascending scale

    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const env = audioCtx.createGain();
    const now = audioCtx.currentTime;

    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.1, now + 0.1);
    env.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    // Subtle echo/delay effect could go here, for now just simple chime
    osc.connect(env).connect(masterGain);
    osc.start(now);
    osc.stop(now + 2.0);
};
