import { useEffect, useState } from "react";
import { Recording } from "../util/db";

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
              <div key={recording.id} className="recording-item">
                <div className="recording-info">
                  <span className="recording-date">
                    {new Date(recording.date).toLocaleString()}
                  </span>
                  <span className="recording-duration">
                    {Math.floor(recording.duration / 60000)}:
                    {Math.floor((recording.duration % 60000) / 1000)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                </div>
                <div className="recording-actions">
                  <button
                    className={`play-btn ${playingId === recording.id ? 'playing' : ''}`}
                    onClick={() => onPlayToggle(recording)}
                  >
                    {playingId === recording.id ? '停止' : '播放'}
                  </button>
                  <button
                    className="delete-btn"
                    onClick={async () => {
                      if (recording.id) {
                        await onDelete(recording.id);
                      }
                    }}
                  >
                    删除
                  </button>
                </div>
                {playingId === recording.id && (
                  <div className="play-progress-bar">
                    <div 
                      className="play-progress" 
                      style={{ width: `${playProgress}%` }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}; 