import { RecordingsDB, Recording } from "./db";

export class RecordingManager {
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