import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export const Metronome = () => {
  const [tempo, setTempo] = useState(() => 
    parseInt(localStorage.getItem("lastTempo") || "120")
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const audioContextRef = useRef<AudioContext | null>(null);
  const tickTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem("lastTempo", tempo.toString());
  }, [tempo]);

  const playClick = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const nextBeat = (currentBeat + 1) % 4;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    if (nextBeat === 0) {
      oscillator.frequency.value = 1500;
      gainNode.gain.value = 0.6;
    } else {
      oscillator.frequency.value = 1000;
      gainNode.gain.value = 0.4;
    }

    const now = audioContextRef.current.currentTime;
    oscillator.start(now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    oscillator.stop(now + 0.1);

    setCurrentBeat(nextBeat);
  };

  const startTicking = () => {
    const interval = (60 / tempo) * 1000;
    
    const tick = async () => {
      if (!isPlaying) return;
      
      await playClick();
      
      tickTimeoutRef.current = window.setTimeout(tick, interval);
    };

    tick();
  };

  useEffect(() => {
    if (isPlaying) {
      startTicking();
    } else {
      if (tickTimeoutRef.current) {
        clearTimeout(tickTimeoutRef.current);
        tickTimeoutRef.current = null;
      }
      setCurrentBeat(-1);
    }

    return () => {
      if (tickTimeoutRef.current) {
        clearTimeout(tickTimeoutRef.current);
        tickTimeoutRef.current = null;
      }
    };
  }, [isPlaying, tempo]);

  const handleTempoChange = (newTempo: number) => {
    const clampedTempo = Math.min(Math.max(newTempo, 30), 240);
    setTempo(clampedTempo);
  };

  return (
    <div className="controls">
      <div className="tempo-display">
        <span>{tempo}</span>
        <span className="bpm-text">BPM</span>
      </div>
      
      <div className="beat-indicator">
        {[0, 1, 2, 3].map((beat) => (
          <div
            key={beat}
            className={`beat ${currentBeat === beat ? 'active' : ''} ${beat === 0 ? 'first-beat' : ''}`}
          />
        ))}
      </div>

      <div className="tempo-control">
        <input
          type="range"
          min="30"
          max="240"
          value={tempo}
          onChange={(e) => handleTempoChange(parseInt(e.target.value))}
        />
        <div className="tempo-presets">
          {[60, 90, 120, 160].map((presetTempo) => (
            <button
              key={presetTempo}
              className={`preset-btn ${tempo === presetTempo ? 'active' : ''}`}
              onClick={() => handleTempoChange(presetTempo)}
            >
              {presetTempo}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? '停止' : '开始'}
      </button>
    </div>
  );
}; 