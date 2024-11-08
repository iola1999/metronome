import { useState, useEffect } from "react";
import { Recording } from "../util/db";

interface RecordingItemProps {
  recording: Recording;
  isPlaying: boolean;
  playProgress: number;
  playingId: number | null;
  onPlayToggle: (recording: Recording) => void;
  onDelete: (id: number) => Promise<void>;
}

export const RecordingItem = ({
  recording,
  isPlaying,
  playProgress,
  playingId,
  onPlayToggle,
  onDelete,
}: RecordingItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 当显示删除确认时，5秒后自动重置
  useEffect(() => {
    let timer: number;
    if (showDeleteConfirm) {
      timer = window.setTimeout(() => {
        setShowDeleteConfirm(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showDeleteConfirm]);

  const handleDeleteClick = async () => {
    if (!recording.id) return;
    
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    setShowDeleteConfirm(false);
    await onDelete(recording.id);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const recordingDate = new Date(date);
    const recordingDay = new Date(
      recordingDate.getFullYear(),
      recordingDate.getMonth(),
      recordingDate.getDate()
    );

    if (recordingDay.getTime() === today.getTime()) {
      return `今天 ${recordingDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${recordingDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } else if (recordingDay.getTime() === yesterday.getTime()) {
      return `昨天 ${recordingDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${recordingDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${
        recordingDate.getMonth() + 1
      }月${recordingDate.getDate()}日 ${recordingDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${recordingDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}'${remainingSeconds.toString().padStart(2, "0")}"`;
  };

  const handleShare = async () => {
    try {
      const file = new File(
        [recording.blob],
        `录音_${formatDate(new Date(recording.date))}.wav`,
        {
          type: recording.blob.type,
        }
      );

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "分享录音",
          text: `录音于 ${formatDate(new Date(recording.date))}`,
        });
      } else {
        // 降级方案：创建下载链接
        const url = URL.createObjectURL(recording.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `录音_${formatDate(
          new Date(recording.date)
        )}.${getFileExtension(recording.blob.type)}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("分享失败:", error);
    }
  };

  // 根据 MIME 类型获取文件扩展名
  const getFileExtension = (mimeType: string): string => {
    const extensions: { [key: string]: string } = {
      "audio/webm": "webm",
      "audio/ogg": "ogg",
      "audio/mp4": "m4a",
      "audio/mpeg": "mp3",
      "audio/wav": "wav",
    };
    return extensions[mimeType] || "webm";
  };

  return (
    <div
      className={`recording-item ${isPlaying ? "playing" : ""} ${
        isDeleting ? "deleting" : ""
      }`}
    >
      <div className="recording-item-content">
        <div className="recording-info">
          <div className="recording-time">
            <div className="recording-date">
              {formatDate(new Date(recording.date))}
            </div>
            <div className="recording-duration">
              <span className="duration-icon">⏱</span>
              {formatDuration(recording.duration)}
            </div>
          </div>

          <div className="recording-controls">
            <button
              className={`control-button play-button ${
                isPlaying && playingId === recording.id ? "playing" : ""
              }`}
              onClick={() => onPlayToggle(recording)}
              title={isPlaying && playingId === recording.id ? "暂停" : "播放"}
            >
              {isPlaying && playingId === recording.id ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              )}
            </button>
            <button
              className="control-button share-button"
              onClick={handleShare}
              title="分享"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
            <button
              className={`control-button delete-button ${showDeleteConfirm ? "confirming" : ""}`}
              onClick={handleDeleteClick}
              title={showDeleteConfirm ? "再次点击确认删除" : "删除"}
            >
              {showDeleteConfirm ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {(playingId === recording.id || playProgress > 0) && (
          <div className="playback-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${playProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};