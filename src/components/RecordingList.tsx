import { Recording } from "../util/db";
import { RecordingItem } from "./RecordingItem";

interface RecordingListProps {
  recordings: Recording[];
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
  playingId: number | null;
  isPlaying: boolean;
  onPlayToggle: (recording: Recording) => void;
  playProgress: number;
}

export const RecordingList = ({
  recordings,
  isOpen,
  onClose,
  onDelete,
  playingId,
  isPlaying,
  onPlayToggle,
  playProgress,
}: RecordingListProps) => {
  const handleClose = () => {
    if (playingId !== null) {
      const playingRecording = recordings.find(r => r.id === playingId);
      if (playingRecording) {
        onPlayToggle(playingRecording);
      }
    }
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className={`modal ${isOpen ? "show" : ""}`} onClick={handleModalClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>录音历史</h2>
          <button className="modal-close-btn" onClick={handleClose}>×</button>
        </div>
        <div className="recordings-list">
          {recordings.length === 0 ? (
            <div className="no-recordings">暂无录音</div>
          ) : (
            recordings.map((recording) => (
              <RecordingItem
                key={recording.id}
                recording={recording}
                isPlaying={playingId === recording.id && isPlaying}
                playProgress={playingId === recording.id ? playProgress : 0}
                playingId={playingId}
                onPlayToggle={onPlayToggle}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}; 