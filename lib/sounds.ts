// Sound utility using Web Audio API
// Designed for high-traffic environments where distinct, loud feedback is needed.

const createOscillator = (type: OscillatorType, freq: number, duration: number, gainValue: number = 0.1) => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainValue, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
};

// --- SUCCESS SOUNDS ---

// 1. Standard (Current) - Soft Sine Beep
export const playSuccessStandard = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);

        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
    } catch (e) { console.error(e); }
};

// 2. Industrial (Loud) - Square wave (piercing)
export const playSuccessIndustrial = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        // Use 'square' wave for more harmonics (louder perception)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "square";
        osc.frequency.setValueAtTime(1200, ctx.currentTime); // High pitch
        osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.15);

        // Higher gain but safe
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);

        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
    } catch (e) { console.error(e); }
};

// 3. Arcade (Distinct) - Major Chord (C6)
export const playSuccessArcade = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.value = 0.1;

        // Play a quick major triad
        [1046.50, 1318.51, 1567.98].forEach((freq, i) => { // C6, E6, G6
            const osc = ctx.createOscillator();
            osc.type = "triangle";
            osc.frequency.value = freq;
            osc.connect(gain);
            osc.start(ctx.currentTime + (i * 0.05)); // Staggered
            osc.stop(ctx.currentTime + (i * 0.05) + 0.1);
        });

        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
    } catch (e) { console.error(e); }
};


// --- ERROR SOUNDS ---

// 1. Standard (Current) - Sawtooth Buzz
export const playErrorStandard = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);

        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } catch (e) { console.error(e); }
};

// 2. Alarm (Loud) - Siren like
export const playErrorAlarm = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "square"; // Harsh
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.4); // Drop pitch

        gain.gain.setValueAtTime(0.2, ctx.currentTime); // Louder
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);

        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
    } catch (e) { console.error(e); }
};

// 3. 8-bit Fail (Distinct) - Descending steps
export const playError8Bit = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.value = 0.15;

        [300, 200, 100].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = "sawtooth";
            osc.frequency.value = freq;
            osc.connect(gain);
            osc.start(ctx.currentTime + (i * 0.1));
            osc.stop(ctx.currentTime + (i * 0.1) + 0.1);
        });

        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50, 50, 50, 200]);
    } catch (e) { console.error(e); }
};

// Default exports (Aliased to the "Industrial" and "Alarm" ones for now as they are better for high traffic)
// You can switch these aliases to change the default sound across the app.
export const playSuccessSound = playSuccessIndustrial;
export const playErrorSound = playErrorAlarm;
