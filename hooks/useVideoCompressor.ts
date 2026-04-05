"use client";
import { useState } from "react";

const MAX_SIZE_MB = 20;

export function useVideoCompressor() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);

  const compressIfNeeded = async (file: File): Promise<File> => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB <= MAX_SIZE_MB) return file;

    setIsCompressing(true);
    setProgress(0);

    try {
      const compressed = await compressVideo(file, (p) => setProgress(p));
      console.log(`[Compress] ${sizeMB.toFixed(1)}MB → ${(compressed.size / 1024 / 1024).toFixed(1)}MB`);
      return compressed;
    } finally {
      setIsCompressing(false);
      setProgress(0);
    }
  };

  return { compressIfNeeded, isCompressing, progress };
}

function compressVideo(file: File, onProgress: (p: number) => void): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const objectUrl = URL.createObjectURL(file);

    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      // Scale down resolution to reduce size
      const scale = 0.7;
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const stream = canvas.captureStream(24); // 24fps

      // Add audio track if available
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(video);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioCtx.destination);
      stream.addTrack(dest.stream.getAudioTracks()[0]);

      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8,opus",
        videoBitsPerSecond: 1_500_000, // 1.5 Mbps
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = () => {
        URL.revokeObjectURL(objectUrl);
        audioCtx.close();
        const blob = new Blob(chunks, { type: "video/webm" });
        resolve(new File([blob], "video_compressed.webm", { type: "video/webm" }));
      };

      recorder.onerror = (e) => reject(e);

      video.ontimeupdate = () => {
        if (video.duration > 0) {
          onProgress(Math.min(Math.round((video.currentTime / video.duration) * 100), 95));
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      };

      video.onended = () => {
        recorder.stop();
        onProgress(100);
      };

      recorder.start(100);
      video.play();
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Erreur lors du chargement de la vidéo"));
    };
  });
}
