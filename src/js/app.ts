import { RecordingManager } from "./recording";

// 添加 webkitAudioContext 的类型声明
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

class Metronome {
  private audioContext: AudioContext | null;
  private isPlaying: boolean;
  private tempo: number;
  private tempoUpdateTimeout: number | null;
  private currentBeat: number;
  private tickTimeout: number | null;
  private tempoSlider!: HTMLInputElement;
  private startStopButton!: HTMLButtonElement;
  private presetButtons!: NodeListOf<HTMLButtonElement>;
  private tempoDisplay!: HTMLElement;
  private beats!: NodeListOf<Element>;

  constructor() {
    this.audioContext = null;
    this.isPlaying = false;
    this.tempo = parseInt(localStorage.getItem("lastTempo") || "120");
    this.tempoUpdateTimeout = null;
    this.currentBeat = 0;
    this.tickTimeout = null;

    this.initializeElements();
    this.setupEventListeners();

    // 初始化时设置保存的速度
    this.tempoSlider.value = this.tempo.toString();
    this.tempoDisplay.textContent = this.tempo.toString();

    // 设置当前速度对应的预设按钮激活状态
    this.updatePresetButtonState();
  }

  private initializeElements(): void {
    this.tempoSlider = document.getElementById(
      "tempo-slider"
    ) as HTMLInputElement;
    this.startStopButton = document.getElementById(
      "start-stop"
    ) as HTMLButtonElement;
    this.presetButtons = document.querySelectorAll(".preset-btn");
    this.tempoDisplay = document.getElementById("tempo-value")!;
    this.beats = document.querySelectorAll(".beat");
  }

  private setupEventListeners(): void {
    this.tempoSlider.addEventListener("input", (e: Event) => {
      const newTempo = (e.target as HTMLInputElement).value;
      this.tempoDisplay.textContent = newTempo;

      if (this.tempoUpdateTimeout) {
        clearTimeout(this.tempoUpdateTimeout);
      }
      this.tempoUpdateTimeout = window.setTimeout(() => {
        this.updateTempo(parseInt(newTempo));
      }, 200);
    });

    this.startStopButton.addEventListener("click", () =>
      this.toggleMetronome()
    );

    this.presetButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const newTempo = parseInt(btn.dataset.tempo || "120");
        this.updateTempo(newTempo);
      });
    });
  }

  private updatePresetButtonState(): void {
    this.presetButtons.forEach((btn) => {
      const btnTempo = parseInt(btn.dataset.tempo || "120");
      if (btnTempo === this.tempo) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  private updateTempo(newTempo: number): void {
    this.tempo = Math.min(Math.max(newTempo, 30), 240);
    this.tempoSlider.value = this.tempo.toString();
    this.tempoDisplay.textContent = this.tempo.toString();

    localStorage.setItem("lastTempo", this.tempo.toString());
    this.updatePresetButtonState();

    if (this.isPlaying) {
      this.stop();
      this.start();
    }
  }

  private async start(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    this.isPlaying = true;
    this.startStopButton.textContent = "停止";

    const interval = (60 / this.tempo) * 1000;
    await this.playClick();

    const tick = async () => {
      if (!this.isPlaying) return;

      if (this.tickTimeout) {
        clearTimeout(this.tickTimeout);
      }

      this.tickTimeout = window.setTimeout(async () => {
        if (this.isPlaying) {
          await this.playClick();
          tick();
        }
      }, interval);
    };

    tick();
  }

  private stop(): void {
    this.isPlaying = false;
    this.startStopButton.textContent = "开始";

    if (this.tickTimeout) {
      clearTimeout(this.tickTimeout);
      this.tickTimeout = null;
    }

    this.currentBeat = -1;
    this.beats.forEach((beat) => beat.classList.remove("active"));
  }

  private toggleMetronome(): void {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  private async playClick(): Promise<void> {
    if (!this.audioContext) return;

    this.currentBeat = (this.currentBeat + 1) % 4;

    this.beats.forEach((beat, index) => {
      beat.classList.remove("active");
      if (index === this.currentBeat) {
        beat.classList.add("active");
      }
    });

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    if (this.currentBeat === 0) {
      oscillator.frequency.value = 1500;
      gainNode.gain.value = 0.6;
    } else {
      oscillator.frequency.value = 1000;
      gainNode.gain.value = 0.4;
    }

    const now = this.audioContext.currentTime;
    oscillator.start(now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    oscillator.stop(now + 0.1);
  }
}

// 初始化应用
document.addEventListener("DOMContentLoaded", () => {
  const metronome = new Metronome();
  const recordingManager = new RecordingManager();
});

// 注册 Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then((registration) => console.log("ServiceWorker 注册成功"))
      .catch((error) => console.log("ServiceWorker 注册失败:", error));
  });
}
