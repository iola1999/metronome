import { useState } from 'react';
import { Metronome } from './components/Metronome';
import { RecordingManager } from './components/RecordingManager';

export const App = () => {
  const [metronomeIsPlaying, setMetronomeIsPlaying] = useState(false);

  return (
    <div className="container">
      <Metronome 
        isPlaying={metronomeIsPlaying} 
        onPlayingChange={setMetronomeIsPlaying} 
      />
      <RecordingManager 
        onPlaybackStart={() => setMetronomeIsPlaying(false)} 
      />
    </div>
  );
};
