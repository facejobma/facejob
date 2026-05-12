"use client";
import { useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const MAX_SIZE_MB = 32; // Compression déclenchée à 32 MB
const ABSOLUTE_MAX_SIZE_MB = 50; // Limite absolue

export function useVideoCompressor() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);

  const compressIfNeeded = async (file: File): Promise<File> => {
    const sizeMB = file.size / (1024 * 1024);
    
    // Vérifier la limite absolue
    if (sizeMB > ABSOLUTE_MAX_SIZE_MB) {
      throw new Error(`La vidéo est trop volumineuse (${sizeMB.toFixed(1)} MB). La taille maximale est de ${ABSOLUTE_MAX_SIZE_MB} MB.`);
    }
    
    // Pas besoin de compression si < 45 MB
    if (sizeMB <= MAX_SIZE_MB) return file;

    setIsCompressing(true);
    setProgress(0);

    try {
      const compressed = await compressVideoWithFFmpeg(file, (p) => setProgress(p));
      const compressedSizeMB = compressed.size / (1024 * 1024);
      console.log(`[Compress] ${sizeMB.toFixed(1)}MB → ${compressedSizeMB.toFixed(1)}MB`);
      
      // Vérifier que la compression a bien réduit la taille
      if (compressedSizeMB > ABSOLUTE_MAX_SIZE_MB) {
        throw new Error(`Même après compression, la vidéo est trop volumineuse (${compressedSizeMB.toFixed(1)} MB). Maximum : ${ABSOLUTE_MAX_SIZE_MB} MB.`);
      }
      
      return compressed;
    } catch (error) {
      console.error("[Compress] Error:", error);
      
      // Si c'est une erreur de taille, la propager
      if (error instanceof Error && error.message.includes('trop volumineuse')) {
        throw error;
      }
      
      // Pour les autres erreurs, essayer de retourner l'original si < 50 MB
      if (sizeMB <= ABSOLUTE_MAX_SIZE_MB) {
        console.log("[Compress] Fallback: returning original file");
        return file;
      } else {
        throw new Error(`La compression a échoué et la vidéo originale (${sizeMB.toFixed(1)} MB) dépasse la limite de ${ABSOLUTE_MAX_SIZE_MB} MB.`);
      }
    } finally {
      setIsCompressing(false);
      setProgress(0);
    }
  };

  return { compressIfNeeded, isCompressing, progress };
}

let ffmpegInstance: FFmpeg | null = null;

async function loadFFmpeg(onProgress: (p: number) => void): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;

  const ffmpeg = new FFmpeg();
  
  ffmpeg.on("log", ({ message }) => {
    console.log("[FFmpeg]", message);
  });

  ffmpeg.on("progress", ({ progress: p }) => {
    // FFmpeg progress is 0-1, convert to percentage
    onProgress(Math.round(p * 100));
  });

  onProgress(5);
  
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  onProgress(10);
  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

async function compressVideoWithFFmpeg(
  file: File,
  onProgress: (p: number) => void
): Promise<File> {
  const ffmpeg = await loadFFmpeg(onProgress);

  // Déterminer l'extension du fichier d'entrée
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'mp4';
  const inputName = `input.${fileExtension}`;
  const outputName = "output.webm";

  // Write input file to FFmpeg virtual filesystem
  await ffmpeg.writeFile(inputName, await fetchFile(file));
  onProgress(15);

  // Compression settings:
  // - CRF 30: Good quality/size balance (lower = better quality, 18-28 is good range)
  // - Preset: medium (balance between speed and compression)
  // - Audio: Opus codec for good quality
  // - Video codec: VP9 for better compression than VP8
  await ffmpeg.exec([
    "-i", inputName,
    "-c:v", "libvpx-vp9",      // VP9 video codec
    "-crf", "30",               // Quality level (23-32 is good for web)
    "-b:v", "0",                // Variable bitrate
    "-c:a", "libopus",          // Opus audio codec
    "-b:a", "96k",              // Audio bitrate (good quality)
    "-ac", "2",                 // Stereo audio
    "-ar", "48000",             // Audio sample rate
    "-cpu-used", "4",           // Encoding speed (0-5, higher = faster but less efficient)
    "-row-mt", "1",             // Enable row-based multithreading
    "-threads", "4",            // Use 4 threads
    "-deadline", "realtime",    // Realtime encoding for faster processing
    "-y",                       // Overwrite output
    outputName
  ]);

  onProgress(95);

  // Read compressed file
  const data = await ffmpeg.readFile(outputName);
  // Convertir en Uint8Array standard pour Blob
  const buffer = new Uint8Array(data as Uint8Array);
  const blob = new Blob([buffer.buffer], { type: "video/webm" });
  const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, "_compressed.webm"), {
    type: "video/webm",
    lastModified: Date.now(),
  });

  // Cleanup
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  onProgress(100);

  return compressedFile;
}
