import { useEffect, useRef, useState } from "react";
import { RecordingsDB, Recording } from "../util/db";

export const RecordingManager = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingTime, setRecordingTime] = useState("00:00");
  const [showModal, setShowModal] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const dbRef = useRef<RecordingsDB>(new RecordingsDB());

  useEffect(() => {
    dbRef.current.init().then(loadRecordings);
  }, []);

  const loadRecordings = async () => {
    const records = await dbRef.current.getAllRecordings();
    setRecordings(records.reverse());
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      updateRecordingTime();
    } catch (err) {
      console.error("录音失败:", err);
      alert("无法访问麦克风，请确保已授予权限。");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    await new Promise<void>((resolve) => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => resolve();
      }
    });

    const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
    const recording = {
      date: new Date().toISOString(),
      duration: startTimeRef.current ? Date.now() - startTimeRef.current : 0,
      blob: blob,
    };

    await dbRef.current.saveRecording(recording);
    await loadRecordings();
    setRecordingTime("00:00");
  };

  const updateRecordingTime = () => {
    timerRef.current = window.setInterval(() => {
      if (!startTimeRef.current) return;

      const duration = Date.now() - startTimeRef.current;
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      setRecordingTime(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    }, 1000);
  };

  return (
    <div>
      <div className="record-controls">
        <button
          className={`record-btn ${isRecording ? "recording" : ""}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? "停止录音" : "录音"}
        </button>
        <div className="record-time">{recordingTime}</div>
      </div>

      <button
        className="show-recordings-btn"
        onClick={() => setShowModal(true)}
      >
        录音列表
      </button>

      {showModal && (
        <div className="modal show" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>录音列表</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <div className="recordings-list">
              {recordings.map((recording) => (
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
                      className="play-btn"
                      onClick={() => {
                        const audio = new Audio(
                          URL.createObjectURL(recording.blob)
                        );
                        audio.play();
                      }}
                    >
                      播放
                    </button>
                    <button
                      className="delete-btn"
                      onClick={async () => {
                        if (recording.id) {
                          await dbRef.current.deleteRecording(recording.id);
                          await loadRecordings();
                        }
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
