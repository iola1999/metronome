import { Recording } from "../util/db";
import { RecordingItem } from "./RecordingItem";
import { Modal, ModalContent, ModalHeader, ModalCloseButton } from "../styles/components";
import {
  RecordingsList,
  NoRecordings,
} from "../styles/components/RecordingStyles";

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
      const playingRecording = recordings.find((r) => r.id === playingId);
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
    <Modal isOpen={isOpen} onClick={handleModalClick}>
      <ModalContent>
        <ModalHeader>
          <h2>录音历史</h2>
          <ModalCloseButton onClick={handleClose}>×</ModalCloseButton>
        </ModalHeader>
        <RecordingsList>
          {recordings.length === 0 ? (
            <NoRecordings>暂无录音</NoRecordings>
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
        </RecordingsList>
      </ModalContent>
    </Modal>
  );
};
