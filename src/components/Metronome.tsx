import { useEffect, useRef, useState, useCallback } from 'react';

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
  const beatCountRef = useRef(-1);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem("lastTempo", tempo.toString());
  }, [tempo]);

  const playClick = useCallback(async (beatNumber: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    if (beatNumber === 0) {
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

    setCurrentBeat(beatNumber);
  }, []);

  const startTicking = useCallback(() => {
    const interval = (60 / tempo) * 1000;
    
    const tick = async () => {
      if (!isPlaying) return;
      
      beatCountRef.current = (beatCountRef.current + 1) % 4;
      
      await playClick(beatCountRef.current);
      
      tickTimeoutRef.current = window.setTimeout(tick, interval);
    };

    beatCountRef.current = -1;
    tick();
  }, [tempo, isPlaying, playClick]);

  useEffect(() => {
    if (isPlaying && !isDragging) {
      startTicking();
    } else {
      if (tickTimeoutRef.current) {
        clearTimeout(tickTimeoutRef.current);
        tickTimeoutRef.current = null;
      }
      if (!isPlaying) {
        setCurrentBeat(-1);
      }
    }

    return () => {
      if (tickTimeoutRef.current) {
        clearTimeout(tickTimeoutRef.current);
        tickTimeoutRef.current = null;
      }
    };
  }, [isPlaying, isDragging, startTicking]);

  const handleTempoChange = (newTempo: number) => {
    const clampedTempo = Math.min(Math.max(newTempo, 30), 240);
    setTempo(clampedTempo);
  };

  useEffect(() => {
    const pendulum = document.querySelector('.pendulum') as HTMLElement;
    if (pendulum) {
      pendulum.style.setProperty('--tempo', tempo.toString());
      if (isPlaying) {
        pendulum.classList.add('active');
      } else {
        pendulum.classList.remove('active');
      }
    }
  }, [isPlaying, tempo]);

  return (
    <div className="controls">
      <div className="pendulum-container">
        <div className="pendulum">
          <div className="pendulum-arm" />
          <div className="pendulum-bob" />
        </div>
      </div>

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
          onMouseDown={() => {
            setIsDragging(true);
            if (isPlaying) {
              if (tickTimeoutRef.current) {
                clearTimeout(tickTimeoutRef.current);
                tickTimeoutRef.current = null;
              }
            }
          }}
          onMouseUp={() => {
            setIsDragging(false);
          }}
          onTouchStart={() => {
            setIsDragging(true);
            if (isPlaying) {
              if (tickTimeoutRef.current) {
                clearTimeout(tickTimeoutRef.current);
                tickTimeoutRef.current = null;
              }
            }
          }}
          onTouchEnd={() => {
            setIsDragging(false);
          }}
          onChange={(e) => {
            const newTempo = parseInt(e.target.value);
            handleTempoChange(newTempo);
          }}
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