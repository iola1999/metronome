import { useEffect, useRef, useState } from "react";
import { RecordingsDB, Recording } from "../util/db";
import { RecordingList } from "./RecordingList";

export const RecordingManager = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingTime, setRecordingTime] = useState("00:00");
  const [showModal, setShowModal] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [playProgress, setPlayProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const dbRef = useRef<RecordingsDB>(new RecordingsDB());
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setPlayingId(null);
      setPlayProgress(0);
    }
  };

  const playRecording = (recording: Recording) => {
    if (!recording.id) return;
    
    stopCurrentAudio();
    
    const audio = new Audio();
    audio.src = URL.createObjectURL(recording.blob);
    
    audio.onerror = (e) => {
      console.error('音频播放失败:', e);
      alert('音频播放失败，可能是格式不支持');
      setPlayingId(null);
    };

    audio.onloadeddata = () => {
      console.log('音频加载成功');
    };

    audio.onended = () => {
      URL.revokeObjectURL(audio.src);
      setCurrentAudio(null);
      setPlayingId(null);
      setPlayProgress(0);
    };

    // 更新播放进度
    audio.ontimeupdate = () => {
      setPlayProgress((audio.currentTime / audio.duration) * 100);
    };

    setCurrentAudio(audio);
    setPlayingId(recording.id);
    audio.play().catch(error => {
      console.error('播放失败:', error);
      alert('播放失败，请检查音频格式是否支持');
      setPlayingId(null);
    });
  };

  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, []);

  useEffect(() => {
    dbRef.current.init().then(loadRecordings);
  }, []);

  const loadRecordings = async () => {
    const records = await dbRef.current.getAllRecordings();
    setRecordings(records.reverse());
  };

  // 获取支持的 MIME 类型
  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4;codecs=aac',
      'audio/mpeg',
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('使用录音格式:', type);
        return type;
      }
    }
    console.warn('没有找到支持的录音格式，使用默认格式');
    return '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 创建 MediaRecorder 时使用支持的 MIME 类型
      const options: MediaRecorderOptions = {};
      const mimeType = getSupportedMimeType();
      if (mimeType) {
        options.mimeType = mimeType;
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      // 更频繁地收集数据
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // 停止所有之前的音轨
      stream.getAudioTracks().forEach(track => {
        track.onended = () => {
          console.log('音轨结束');
          stopRecording();
        };
      });

      updateRecordingTime();
    } catch (err) {
      console.error("录音失败:", err);
      alert("无法访问麦克风，请确保已授予权限。");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

    try {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // 停止所有音轨
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      await new Promise<void>((resolve) => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = () => resolve();
        }
      });

      // 确保有录音数据
      if (recordedChunksRef.current.length === 0) {
        throw new Error('没有录到音频数据');
      }

      const blob = new Blob(recordedChunksRef.current, { 
        type: mediaRecorderRef.current.mimeType || 'audio/webm'
      });

      const recording = {
        date: new Date().toISOString(),
        duration: startTimeRef.current ? Date.now() - startTimeRef.current : 0,
        blob: blob,
      };

      await dbRef.current.saveRecording(recording);
      await loadRecordings();
      setRecordingTime("00:00");
    } catch (err) {
      console.error('停止录音失败:', err);
      alert('录音保存失败，请重试');
    }
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

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (playingId === id) {
      stopCurrentAudio();
    }
    await dbRef.current.deleteRecording(id);
    await loadRecordings();
  };

  const handlePlayToggle = (recording: Recording) => {
    if (!recording.id) return;
    
    if (playingId === recording.id) {
      stopCurrentAudio();
    } else {
      playRecording(recording);
    }
  };

  return (
    <div className="recording-controls-container">
      <div className="recording-main-controls">
        <button
          className={`record-btn ${isRecording ? "recording" : ""}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          <span className="record-icon"></span>
          {isRecording ? "停止录音" : "录音"}
        </button>
        {(isRecording || recordingTime !== "00:00") && (
          <div className="record-time">{recordingTime}</div>
        )}
        <button
          className="show-recordings-btn"
          onClick={() => setShowModal(true)}
        >
          <span className="list-icon"></span>
          录音列表
          {recordings.length > 0 && (
            <span className="recordings-count">{recordings.length}</span>
          )}
        </button>
      </div>

      <RecordingList
        recordings={recordings}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onDelete={handleDelete}
        playingId={playingId}
        onPlayToggle={handlePlayToggle}
        playProgress={playProgress}
      />
    </div>
  );
};
