import { RecordingsDB, Recording } from "./db";

// 添加 webkitAudioContext 的类型声明
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface RecordingItem {
  id: number;
  date: string;
  duration: number;
  blob: Blob;
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

class RecordingManager {
  private mediaRecorder: MediaRecorder | null;
  private recordedChunks: Blob[];
  private isRecording: boolean;
  private startTime: number | null;
  private recordingTimer: number | null;
  private db: RecordingsDB;
  private recordBtn!: HTMLButtonElement;
  private recordTime!: HTMLElement;
  private showRecordingsBtn!: HTMLButtonElement;
  private modal!: HTMLElement;
  private closeModalBtn!: HTMLElement;
  private recordingsList!: HTMLElement;

  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.startTime = null;
    this.recordingTimer = null;
    this.db = new RecordingsDB();

    this.initElements();
    this.setupEventListeners();
    this.initDB();
  }

  private initElements(): void {
    this.recordBtn = document.getElementById("record-btn") as HTMLButtonElement;
    this.recordTime = document.getElementById("record-time")!;
    this.showRecordingsBtn = document.getElementById(
      "show-recordings"
    ) as HTMLButtonElement;
    this.modal = document.getElementById("recordings-modal")!;
    this.closeModalBtn = document.querySelector(".close-btn")!;
    this.recordingsList = document.querySelector(".recordings-list")!;
  }

  private async initDB(): Promise<void> {
    await this.db.init();
    await this.loadRecordings();
  }

  private setupEventListeners(): void {
    this.recordBtn.addEventListener("click", () => this.toggleRecording());
    this.showRecordingsBtn.addEventListener("click", () => this.showModal());
    this.closeModalBtn.addEventListener("click", () => this.hideModal());

    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.hideModal();
    });
  }

  private async toggleRecording(): Promise<void> {
    if (!this.isRecording) {
      await this.startRecording();
    } else {
      await this.stopRecording();
    }
  }

  private async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.startTime = Date.now();
      this.recordBtn.classList.add("recording");
      this.recordBtn.textContent = "停止录音";

      this.updateRecordingTime();
    } catch (err) {
      console.error("录音失败:", err);
      alert("无法访问麦克风，请确保已授予权限。");
    }
  }

  private async stopRecording(): Promise<void> {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.stop();
    this.isRecording = false;
    this.recordBtn.classList.remove("recording");
    this.recordBtn.textContent = "录音";

    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }

    await new Promise<void>((resolve) => {
      if (this.mediaRecorder) {
        this.mediaRecorder.onstop = () => resolve();
      }
    });

    const blob = new Blob(this.recordedChunks, { type: "audio/webm" });
    const recording = {
      date: new Date().toISOString(),
      duration: this.startTime ? Date.now() - this.startTime : 0,
      blob: blob,
    };

    await this.db.saveRecording(recording);
    await this.loadRecordings();
    this.recordTime.textContent = "00:00";
  }

  private updateRecordingTime(): void {
    this.recordingTimer = window.setInterval(() => {
      if (!this.startTime) return;

      const duration = Date.now() - this.startTime;
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      this.recordTime.textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }, 1000);
  }

  private async loadRecordings(): Promise<void> {
    const recordings = await this.db.getAllRecordings();
    this.recordingsList.innerHTML = "";

    recordings.reverse().forEach((recording) => {
      const item = this.createRecordingItem(recording);
      this.recordingsList.appendChild(item);
    });
  }

  private createRecordingItem(recording: Recording): HTMLDivElement {
    const item = document.createElement("div");
    item.className = "recording-item";

    const duration = Math.floor(recording.duration / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    item.innerHTML = `
      <div class="recording-info">
        <span class="recording-date">
          ${new Date(recording.date).toLocaleString()}
        </span>
        <span class="recording-duration">
          ${minutes}:${seconds.toString().padStart(2, "0")}
        </span>
      </div>
      <div class="recording-actions">
        <button class="play-btn">播放</button>
        <button class="delete-btn">删除</button>
      </div>
    `;

    const playBtn = item.querySelector(".play-btn");
    const deleteBtn = item.querySelector(".delete-btn");

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        const audio = new Audio(URL.createObjectURL(recording.blob));
        audio.play();
      });
    }

    if (deleteBtn && recording.id) {
      deleteBtn.addEventListener("click", async () => {
        await this.db.deleteRecording(recording.id!);
        await this.loadRecordings();
      });
    }

    return item;
  }

  private showModal(): void {
    this.modal.classList.add("show");
  }

  private hideModal(): void {
    this.modal.classList.remove("show");
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
