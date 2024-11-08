import { Metronome } from "./components/Metronome";
import { RecordingManager } from "./components/RecordingManager";

export const App = () => {
  return (
    <div className="container">
      <Metronome />
      <RecordingManager />
    </div>
  );
};
