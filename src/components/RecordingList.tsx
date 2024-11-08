import { Recording } from "../util/db";
import { RecordingItem } from "./RecordingItem";

interface RecordingListProps {
  recordings: Recording[];
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
  playingId: number | null;
  onPlayToggle: (recording: Recording) => void;
  playProgress: number;
}

export const RecordingList = ({
  recordings,
  isOpen,
  onClose,
  onDelete,
  playingId,
  onPlayToggle,
  playProgress,
}: RecordingListProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>录音列表</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="recordings-list">
          {recordings.length === 0 ? (
            <div className="no-recordings">暂无录音</div>
          ) : (
            recordings.map((recording) => (
              <RecordingItem
                key={recording.id}
                recording={recording}
                isPlaying={playingId === recording.id}
                playProgress={playingId === recording.id ? playProgress : 0}
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