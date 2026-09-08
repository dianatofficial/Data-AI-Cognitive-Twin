/**
 * Synthesizer audio engine using Web Audio API for spatial audio feedback.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialized lazily on first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.playChime();
    }
    return this.enabled;
  }

  public setEnabled(state: boolean) {
    this.enabled = state;
  }

  public playTone(freq = 440, type: OscillatorType = 'sine', duration = 0.12, gainVal = 0.04) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio failure
    }
  }

  public playStep(stepIndex: number) {
    this.playTone(360 + stepIndex * 36, 'sine', 0.12, 0.04);
  }

  public playAlert() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {
      // Ignore
    }
  }

  public playChime() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 'sine', 0.25, 0.035);
        }, i * 65);
      });
    } catch {
      // Ignore
    }
  }

  public playModalOpen() {
    this.playTone(620, 'triangle', 0.14, 0.04);
  }

  public playWireframe() {
    this.playTone(480, 'square', 0.07, 0.025);
  }
}

export const soundEngine = new SoundEngine();
