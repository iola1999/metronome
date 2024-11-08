class Metronome {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.tempo = parseInt(localStorage.getItem('lastTempo')) || 120;
        this.tempoUpdateTimeout = null;
        this.currentBeat = 0;
        this.tickTimeout = null;
        
        this.initializeElements();
        this.setupEventListeners();
        
        // 初始化时设置保存的速度
        this.tempoSlider.value = this.tempo;
        this.tempoDisplay = document.getElementById('tempo-value');
        this.tempoDisplay.textContent = this.tempo;
        this.beats = document.querySelectorAll('.beat');
        
        // 设置当前速度对应的预设按钮激活状态
        this.updatePresetButtonState();
    }

    initializeElements() {
        this.tempoSlider = document.getElementById('tempo-slider');
        this.startStopButton = document.getElementById('start-stop');
        this.presetButtons = document.querySelectorAll('.preset-btn');
    }

    setupEventListeners() {
        this.tempoSlider.addEventListener('input', (e) => {
            const newTempo = e.target.value;
            this.tempoDisplay.textContent = newTempo;
            
            clearTimeout(this.tempoUpdateTimeout);
            this.tempoUpdateTimeout = setTimeout(() => {
                this.updateTempo(newTempo);
            }, 200);
        });
        
        this.startStopButton.addEventListener('click', () => this.toggleMetronome());
        
        // 设置预设按钮事件
        this.presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const newTempo = parseInt(btn.dataset.tempo);
                this.updateTempo(newTempo);
            });
        });
    }

    updatePresetButtonState() {
        this.presetButtons.forEach(btn => {
            const btnTempo = parseInt(btn.dataset.tempo);
            if (btnTempo === this.tempo) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    updateTempo(newTempo) {
        this.tempo = Math.min(Math.max(newTempo, 30), 240);
        this.tempoSlider.value = this.tempo;
        this.tempoDisplay.textContent = this.tempo;
        
        localStorage.setItem('lastTempo', this.tempo);
        this.updatePresetButtonState();
        
        if (this.isPlaying) {
            if (this.tickTimeout) {
                clearTimeout(this.tickTimeout);
                this.tickTimeout = null;
            }
            this.stop();
            this.start();
        }
    }

    async start() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        this.isPlaying = true;
        this.startStopButton.textContent = '停止';
        
        const interval = (60 / this.tempo) * 1000;
        
        // 立即播放第一个音
        await this.playClick();
        
        // 设置定时器进行后续播放
        const tick = async () => {
            if (!this.isPlaying) return;
            
            if (this.tickTimeout) {
                clearTimeout(this.tickTimeout);
            }
            
            this.tickTimeout = setTimeout(async () => {
                if (this.isPlaying) {
                    await this.playClick();
                    tick();
                }
            }, interval);
        };
        
        tick();
    }

    stop() {
        this.isPlaying = false;
        this.startStopButton.textContent = '开始';
        
        if (this.tickTimeout) {
            clearTimeout(this.tickTimeout);
            this.tickTimeout = null;
        }
        
        this.currentBeat = -1;
        this.beats.forEach(beat => beat.classList.remove('active'));
    }

    toggleMetronome() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }

    async playClick() {
        if (!this.audioContext) return;
        
        this.currentBeat = (this.currentBeat + 1) % 4;
        
        // 更新视觉指示器
        this.beats.forEach((beat, index) => {
            beat.classList.remove('active');
            if (index === this.currentBeat) {
                beat.classList.add('active');
            }
        });
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 第一拍使用不同的频率和音量
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
document.addEventListener('DOMContentLoaded', () => {
    const metronome = new Metronome();
});

// 注册 Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('ServiceWorker 注册成功'))
            .catch(error => console.log('ServiceWorker 注册失败:', error));
    });
} 