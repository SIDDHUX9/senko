/**
 * Intraday Cockpit Web Audio API Sound Engine (V3 - Authentic Emergency Siren & Beeps)
 * Hardware-synthesized loud, clear, zero-latency audio alerts.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastTriggerTimes: Record<string, number> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.initCtx();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio);
      window.addEventListener('touchstart', unlockAudio);
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private canPlay(soundId: string, cooldownMs: number = 2500): boolean {
    if (this.isMuted) return false;
    const now = Date.now();
    const last = this.lastTriggerTimes[soundId] || 0;
    if (now - last < cooldownMs) return false;
    this.lastTriggerTimes[soundId] = now;
    return true;
  }

  /**
   * 🚨 STOP-LOSS BREACHED: Authentic Emergency "WEE-WOO" Dual-Tone Siren Alert
   * Alternates rapidly between 880Hz (High) and 587Hz (Low) with sharp square/sawtooth harmonics.
   */
  public playStopLoss(ignoreCooldown: boolean = false) {
    if (!ignoreCooldown && !this.canPlay('stoploss', 3500)) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // 4 Siren Pips (High - Low - High - Low)
    const pips = [
      { freq: 950, start: 0.00, duration: 0.11 },
      { freq: 620, start: 0.11, duration: 0.11 },
      { freq: 950, start: 0.22, duration: 0.11 },
      { freq: 620, start: 0.33, duration: 0.14 },
    ];

    pips.forEach((pip) => {
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(pip.freq, now + pip.start);

      // Rapid linear pitch slide inside each pip for police siren feel
      const endFreq = pip.freq === 950 ? 820 : 540;
      osc.frequency.linearRampToValueAtTime(endFreq, now + pip.start + pip.duration);

      gain.gain.setValueAtTime(0.45, now + pip.start);
      gain.gain.exponentialRampToValueAtTime(0.01, now + pip.start + pip.duration - 0.01);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + pip.start);
      osc.stop(now + pip.start + pip.duration);
    });
  }

  /**
   * 🎯 TARGET HIT: Loud High Double-Beep Victory Tone (880Hz -> 1320Hz)
   */
  public playTargetHit(ignoreCooldown: boolean = false) {
    if (!ignoreCooldown && !this.canPlay('target', 4000)) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Beep 1
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.1);

    // Beep 2 (High Victory Tone)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1320, now + 0.1);
    gain2.gain.setValueAtTime(0.35, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.32);
  }

  /**
   * 📉 PRICE GOES BELOW BUY PRICE: Dual Warning Beep (650Hz -> 420Hz)
   */
  public playCrossDown(ignoreCooldown: boolean = false) {
    if (!ignoreCooldown && !this.canPlay('crossDown', 2500)) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(650, now);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.09);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(420, now + 0.09);
    gain2.gain.setValueAtTime(0.35, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.22);
  }

  /**
   * 🚀 PRICE CROSSES ABOVE BUY PRICE: High Double Green Beep (587Hz -> 880Hz)
   */
  public playCrossUp(ignoreCooldown: boolean = false) {
    if (!ignoreCooldown && !this.canPlay('crossUp', 2500)) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(587, now);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.09);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.09);
    gain2.gain.setValueAtTime(0.4, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.24);
  }

  /**
   * ⚡ MOMENTUM SPIKE: Sharp Chirp Beep (1000Hz -> 1600Hz)
   */
  public playSpike(ignoreCooldown: boolean = false) {
    if (!ignoreCooldown && !this.canPlay('spike', 1500)) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }
}

export const audioEngine = new AudioEngine();
