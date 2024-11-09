import { useEffect, useRef, useState, useCallback } from "react";
import { RecordingsDB } from "../util/db";
import type { Recording } from "../util/db";
import { RecordingList } from "./RecordingList";
import {
  RecordingControlsContainer,
  RecordingMainControls,
  RecordButton,
  RecordIcon,
  RecordTime,
  ShowRecordingsButton,
  RecordingsCount,
  RecordingLabel,
} from "../styles/components/RecordingStyles";
import { MdMic } from "react-icons/md";
import { message } from "./Message";
import { eventBus } from "../util/events";

interface RecordingManagerProps {
  onPlaybackStart: () => void;
}

export const RecordingManager = ({
  onPlaybackStart,
}: RecordingManagerProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingTime, setRecordingTime] = useState("00:00");
  const [showModal, setShowModal] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [recordingInterval, setRecordingInterval] =
    useState<NodeJS.Timeout | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const dbRef = useRef<RecordingsDB>(new RecordingsDB());
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const audioInstancesRef = useRef<Map<number, HTMLAudioElement>>(new Map());

  const playRecording = (recording: Recording) => {
    if (!recording.id) return;

    // 如果是同一个录音
    if (playingId === recording.id && currentAudio) {
      if (currentAudio.paused) {
        // 从暂停位置继续播放
        currentAudio.play();
        setIsPlaying(true);
        onPlaybackStart();
      } else {
        // 暂停播放，但保持 playingId 以显示进度条
        currentAudio.pause();
        setIsPlaying(false);
      }
      return;
    }

    // 如果是新的录音，先停止当前播放的音频
    if (currentAudio) {
      currentAudio.pause();
      URL.revokeObjectURL(currentAudio.src);
      setCurrentAudio(null);
      setPlayingId(null);
      setIsPlaying(false);
      setPlayProgress(0);
    }

    // 创建新的 Audio 实例
    const audio = new Audio();
    const audioUrl = URL.createObjectURL(recording.blob);
    audio.src = audioUrl;

    // 设置事件监听
    audio.addEventListener("timeupdate", () => {
      setPlayProgress((audio.currentTime / audio.duration) * 100);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setPlayingId(null);
      setPlayProgress(0);
      URL.revokeObjectURL(audioUrl);
      setCurrentAudio(null);
    });

    audio.addEventListener("error", (e) => {
      console.error("音频播放失败:", e);
      alert("音频播放失败，可能是格式不支持");
      setIsPlaying(false);
      setPlayingId(null);
      setPlayProgress(0);
      URL.revokeObjectURL(audioUrl);
      setCurrentAudio(null);
    });

    // 设置状态并播放
    setCurrentAudio(audio);
    setPlayingId(recording.id);
    setIsPlaying(true);
    onPlaybackStart();

    audio.play().catch((error) => {
      console.error("播放失败:", error);
      alert("播放失败，请检查音频格式是否支持");
      setIsPlaying(false);
      setPlayingId(null);
      setPlayProgress(0);
      URL.revokeObjectURL(audioUrl);
      setCurrentAudio(null);
    });
  };

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
        setPlayingId(null);
        setPlayProgress(0);
      }
    };
  }, []);

  const loadRecordings = useCallback(async () => {
    try {
      await dbRef.current.init();
      const records = await dbRef.current.getAllRecordings();
      setRecordings(records);
    } catch (error) {
      console.error("加载录音失败:", error);
      message.error("加载录音失败");
    }
  }, []);

  useEffect(() => {
    loadRecordings();

    // 监听录音更新事件
    const handleRecordingsUpdate = () => {
      loadRecordings();
    };

    eventBus.on("recordingsUpdated", handleRecordingsUpdate);

    return () => {
      eventBus.off("recordingsUpdated", handleRecordingsUpdate);
    };
  }, [loadRecordings]);

  // 获取支持的 MIME 类型
  const getSupportedMimeType = () => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4;codecs=aac",
      "audio/mpeg",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log("使用录音格式:", type);
        return type;
      }
    }
    console.warn("没有找到支持的录音格，使用默认格式");
    return "";
  };

  const startRecording = async () => {
    try {
      // 先检查是否支持 MediaDevices API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        message.error("您的浏览器不支持录音功能");
        return;
      }

      // 先尝试获取设备列表权限
      let devices;
      try {
        devices = await navigator.mediaDevices.enumerateDevices();
      } catch (err) {
        console.error("获取设备列表失败:", err);
        message.error("无法获取录音设备信息，请检查权限设置");
        return;
      }

      // 检查是否有录音设备
      const hasAudioInput = devices.some(
        (device) => device.kind === "audioinput"
      );
      if (!hasAudioInput) {
        console.error("未检测到录音设备");
        message.error("未检测到录音设备");
        return;
      }

      // 尝试获取录音权限
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (err) {
        console.error("获取录音权限失败:", err);

        if (err instanceof DOMException) {
          switch (err.name) {
            case "NotAllowedError":
              message.error(
                "需要麦克风权限才能录音，请在浏览器设置中允许访问麦克风"
              );
              break;
            case "NotFoundError":
              message.error("未检测到可用的录音设备");
              break;
            case "NotReadableError":
              message.error(
                "录音设备被占用，请检查是否有其他应用正在使用麦克风"
              );
              break;
            case "OverconstrainedError":
              message.error("录音设备不满足要求，请尝试使用其他设备");
              break;
            case "SecurityError":
              message.error("录音功能被系统安全策略限制");
              break;
            default:
              message.error(`录音失败: ${err.message || "未知错误"}`);
          }
        } else {
          message.error("录音初始化失败，请重试");
        }
        return;
      }

      // 创建 MediaRecorder
      try {
        const options: MediaRecorderOptions = {};
        const mimeType = getSupportedMimeType();
        if (mimeType) {
          options.mimeType = mimeType;
        }

        mediaRecorderRef.current = new MediaRecorder(stream, options);
      } catch (err) {
        console.error("创建录音器失败:", err);
        message.error("创建录音器失败，您的浏览器可能不支持此格式");
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      // 设置录音数据处理
      recordedChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      // 开始录音
      try {
        mediaRecorderRef.current.start(100);
        setIsRecording(true);
        startTimeRef.current = Date.now();

        // 设置音轨结束处理
        stream.getAudioTracks().forEach((track) => {
          track.onended = () => {
            console.log("音轨结束");
            stopRecording();
          };
        });

        // 设置录音计时器
        const startTime = Date.now();
        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const minutes = Math.floor(elapsed / 60000);
          const seconds = Math.floor((elapsed % 60000) / 1000);
          setRecordingTime(
            `${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`
          );
        }, 1000);

        setRecordingInterval(interval);
      } catch (err) {
        console.error("开始录音失败:", err);
        message.error("开始录音失败，请重试");
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      }
    } catch (err) {
      console.error("录音初始化过程出现未知错误:", err);
      message.error("录音初始化失败，请刷新页面重试");
    }
  };

  const stopRecording = async () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state === "inactive"
    )
      return;

    try {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // 停止所有音轨
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());

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
        throw new Error("没有录到音频数据");
      }

      const blob = new Blob(recordedChunksRef.current, {
        type: mediaRecorderRef.current.mimeType || "audio/webm",
      });

      const recording = {
        date: new Date().toISOString(),
        duration: startTimeRef.current ? Date.now() - startTimeRef.current : 0,
        blob: blob,
      };

      await dbRef.current.saveRecording(recording);
      await loadRecordings();
      setRecordingTime("00:00");

      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
    } catch (err) {
      console.error("停止录音失败:", err);
      message.error("录音保存失败，请重试");
    }
  };

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
        setPlayingId(null);
        setPlayProgress(0);
      }
      // 清理所有 Audio 实例
      audioInstancesRef.current.forEach((audio) => {
        URL.revokeObjectURL(audio.src);
      });
      audioInstancesRef.current.clear();
    };
  }, []);

  const handleDelete = async (id: number) => {
    try {
      // 如果正在播放，先停止播放
      if (playingId === id) {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          setCurrentAudio(null);
          setPlayingId(null);
          setPlayProgress(0);
        }
      }

      // 清理音频资源
      const audio = audioInstancesRef.current.get(id);
      if (audio) {
        URL.revokeObjectURL(audio.src);
        audioInstancesRef.current.delete(id);
      }

      // 删除录音
      await dbRef.current.deleteRecording(id);
      await loadRecordings();

      return true; // 返回成功标志
    } catch (err) {
      console.error("删除录音失败:", err);
      message.error("删除录音失败，请重试");
      return false; // 返回失败标志
    }
  };

  const handlePlayToggle = (recording: Recording) => {
    if (!recording.id) return;
    playRecording(recording);
  };

  const handleStartRecording = async () => {
    // 不再在这里设置 isExiting，而是在实际开始录音后设置
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
    // 不需要额外的 setTimeout，让状态更新更连贯
  };

  return (
    <RecordingControlsContainer>
      <RecordingMainControls>
        <RecordingLabel>
          <MdMic size={16} />
        </RecordingLabel>
        <RecordButton
          recording={isRecording}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
        >
          <RecordIcon recording={isRecording} />
          {isRecording ? "结束" : "开始"}
        </RecordButton>

        {isRecording ? (
          <RecordTime>{recordingTime}</RecordTime>
        ) : (
          <ShowRecordingsButton onClick={() => setShowModal(true)}>
            历史
            {recordings.length > 0 && (
              <RecordingsCount>{recordings.length}</RecordingsCount>
            )}
          </ShowRecordingsButton>
        )}
      </RecordingMainControls>

      <RecordingList
        recordings={recordings}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onDelete={handleDelete}
        playingId={playingId}
        isPlaying={isPlaying}
        onPlayToggle={handlePlayToggle}
        playProgress={playProgress}
      />
    </RecordingControlsContainer>
  );
};
