"use client";

import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { FaVideo, FaStop, FaRedo, FaCheckCircle } from "react-icons/fa";

interface VideoRecorderProps {
  onVideoReady: (file: File) => void;
}

export interface VideoRecorderHandle {
  stopCamera: () => void;
}

const MAX_DURATION = 90;

const VideoRecorder = forwardRef<VideoRecorderHandle, VideoRecorderProps>(
  ({ onVideoReady }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [recording, setRecording] = useState(false);
    const [recorded, setRecorded] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [cameraReady, setCameraReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const killStream = useCallback(() => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      setCameraReady(false);
      setRecording(false);
    }, []);

    useImperativeHandle(ref, () => ({ stopCamera: killStream }), [killStream]);

    const startCamera = useCallback(async () => {
      setError(null);
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = s;
        setCameraReady(true);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      } catch {
        setError("Impossible d'acceder a la camera. Verifiez les permissions.");
      }
    }, []);

    useEffect(() => {
      startCamera();
      return () => { killStream(); };
    }, []);

    const stopRecording = useCallback(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setRecording(false);
    }, []);

    const startRecording = () => {
      if (!streamRef.current) return;
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const mr = new MediaRecorder(streamRef.current, { mimeType });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setRecorded(true);
        killStream();
        const file = new File([blob], `cv-video-${Date.now()}.webm`, { type: "video/webm" });
        onVideoReady(file);
      };
      mr.start(1000);
      mediaRecorderRef.current = mr;
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= MAX_DURATION) stopRecording();
          return next;
        });
      }, 1000);
    };

    const reset = () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setRecorded(false);
      setElapsed(0);
      startCamera();
    };

    const formatTime = (s: number) =>
      `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={startCamera} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">
            Reessayer
          </button>
        </div>
      );
    }

    if (recorded && previewUrl) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
            <FaCheckCircle />
            <span>Video enregistree — duree: {formatTime(elapsed)}</span>
          </div>
          <video src={previewUrl} controls className="w-full rounded-xl border-2 border-gray-200 shadow" />
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <FaRedo className="text-xs" /> Recommencer
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="relative bg-black rounded-xl overflow-hidden" style={{ maxHeight: "320px", aspectRatio: "16/9" }}>
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          {recording && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {formatTime(elapsed)} / {formatTime(MAX_DURATION)}
            </div>
          )}
          {!cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="flex justify-center gap-3">
          {!recording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={!cameraReady}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
            >
              <FaVideo /> Demarrer
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl transition-colors"
            >
              <FaStop /> Arreter
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center">
          Duree maximale: 1 min 30 sec
        </p>
      </div>
    );
  }
);

VideoRecorder.displayName = "VideoRecorder";
export default VideoRecorder;
