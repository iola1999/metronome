import type { Recording } from "../util/db";
import { RecordingItem } from "./RecordingItem";
import { Modal } from "./Modal";
import {
  RecordingsList,
  NoRecordings,
} from "../styles/components/RecordingStyles";

interface RecordingListProps {
  recordings: Recording[];
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => Promise<boolean>;
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
    if (playingId !== null && isPlaying) {
      const playingRecording = recordings.find((r) => r.id === playingId);
      if (playingRecording) {
        onPlayToggle(playingRecording);
      }
    }
    onClose();
  };

  const sortedRecordings = [...recordings].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="录音历史">
      <RecordingsList>
        {recordings.length === 0 ? (
          <NoRecordings>暂无录音</NoRecordings>
        ) : (
          sortedRecordings.map((recording) => (
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
      </RecordingsList>
    </Modal>
  );
};
