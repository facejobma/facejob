"use client";

import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { FaVideo, FaStop, FaRedo, FaCheckCircle } from "react-icons/fa";

interface VideoRecorderProps {
  onVideoReady: (file: File) => void;
}

export interface VideoRecorderHandle {
  stopCamera: () => void;
}

// Configuration des résolutions vidéo
const VIDEO_CONSTRAINTS = {
  // Résolution HD standard (recommandée)
  HD: { width: 1280, height: 720 },
  // Résolution Full HD (pour PC puissants)
  FULL_HD: { width: 1920, height: 1080 },
  // Résolution mobile optimisée
  MOBILE: { width: 854, height: 480 },
};

// Fonction pour détecter la meilleure résolution selon l'appareil
const getOptimalResolution = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const screenWidth = window.screen.width;
  
  if (isMobile || screenWidth < 1024) {
    return VIDEO_CONSTRAINTS.MOBILE;
  } else if (screenWidth >= 1920) {
    return VIDEO_CONSTRAINTS.FULL_HD;
  } else {
    return VIDEO_CONSTRAINTS.HD;
  }
};

// Résolution par défaut - détectée automatiquement
const DEFAULT_RESOLUTION = getOptimalResolution();

const MAX_DURATION = 90;

const VideoRecorder = forwardRef<VideoRecorderHandle, VideoRecorderProps>(
  ({ onVideoReady }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const rafRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const logoRef = useRef<HTMLImageElement | null>(null);
    const recordingRef = useRef(false);

    const [recording, setRecording] = useState(false);
    const [recorded, setRecorded] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [cameraReady, setCameraReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);

    useEffect(() => {
      const img = new Image();
      img.src = "/facejobLogo.png";
      img.onload = () => { logoRef.current = img; };
    }, []);

    const killStream = useCallback(() => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        // Arrêter la vidéo proprement pour éviter les AbortError
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load(); // Reset l'élément vidéo
        videoRef.current.srcObject = null;
      }
      recordingRef.current = false;
      setCameraReady(false);
      setRecording(false);
      setIsInitializing(false);
    }, []);

    useImperativeHandle(ref, () => ({ stopCamera: killStream }), [killStream]);

    const startCamera = useCallback(async () => {
      // Éviter les appels multiples simultanés
      if (isInitializing) {
        console.log('🔄 Initialisation déjà en cours, ignoré');
        return;
      }

      setIsInitializing(true);
      setError(null);
      
      try {
        // Nettoyer d'abord tout stream existant
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Contraintes vidéo avec résolution fixe
        const constraints = {
          video: {
            width: { ideal: DEFAULT_RESOLUTION.width },
            height: { ideal: DEFAULT_RESOLUTION.height },
            aspectRatio: DEFAULT_RESOLUTION.width / DEFAULT_RESOLUTION.height,
            frameRate: { ideal: 30, max: 30 },
            facingMode: "user" // Caméra frontale par défaut
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        };

        console.log(`🎥 Demande d'accès caméra avec résolution: ${DEFAULT_RESOLUTION.width}x${DEFAULT_RESOLUTION.height}`);
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Vérifier que le composant n'a pas été démonté pendant l'attente
        if (!videoRef.current) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          
          try {
            // Gérer la promesse play() proprement pour éviter AbortError
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              await playPromise;
            }
            
            // Log de la résolution réelle obtenue
            const videoTrack = stream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            console.log(`✅ Résolution obtenue: ${settings.width}x${settings.height}`);
            
            setCameraReady(true);
          } catch (playError) {
            // Ignorer les AbortError qui sont normales lors des changements rapides
            if (playError instanceof Error && playError.name !== 'AbortError') {
              console.error('Erreur play():', playError);
              throw playError;
            } else {
              console.log('🔄 Play() interrompu (normal lors des changements)');
              setCameraReady(true); // Continuer malgré l'AbortError
            }
          }
        }
      } catch (error) {
        console.error('Erreur caméra:', error);
        setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
        setCameraReady(false);
      } finally {
        setIsInitializing(false);
      }
    }, [isInitializing]);

    useEffect(() => {
      // Délai court pour éviter les appels multiples rapides
      const timer = setTimeout(() => {
        startCamera();
      }, 50);
      
      return () => { 
        clearTimeout(timer);
        killStream(); 
      };
    }, [startCamera, killStream]);

    const drawLoop = useCallback(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(drawLoop);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Forcer la résolution du canvas à la résolution fixe
      if (canvas.width !== DEFAULT_RESOLUTION.width || canvas.height !== DEFAULT_RESOLUTION.height) {
        canvas.width = DEFAULT_RESOLUTION.width;
        canvas.height = DEFAULT_RESOLUTION.height;
        console.log(`🎨 Canvas configuré à: ${canvas.width}x${canvas.height}`);
      }

      // Dessiner la vidéo en redimensionnant si nécessaire pour remplir le canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Ajouter le logo avec une taille proportionnelle à la résolution fixe
      if (logoRef.current && canvas.width > 0) {
        const logo = logoRef.current;
        const maxSize = Math.round(canvas.width * 0.15); // 15% de la largeur
        const ratio = Math.min(maxSize / logo.naturalWidth, maxSize / logo.naturalHeight);
        const w = Math.round(logo.naturalWidth * ratio);
        const h = Math.round(logo.naturalHeight * ratio);
        const margin = Math.round(canvas.width * 0.025); // 2.5% de marge
        const x = canvas.width - w - margin;
        const y = canvas.height - h - margin * 4;
        ctx.globalAlpha = 0.8;
        ctx.drawImage(logo, x, y, w, h);
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(drawLoop);
    }, []);

    const stopRecording = useCallback(() => {
      recordingRef.current = false;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setRecording(false);
    }, []);

    const startRecording = () => {
      if (!streamRef.current || !canvasRef.current) return;
      chunksRef.current = [];
      recordingRef.current = true;

      rafRef.current = requestAnimationFrame(drawLoop);

      const canvasStream = canvasRef.current.captureStream(30);
      streamRef.current.getAudioTracks().forEach((t) => canvasStream.addTrack(t));

      // Configuration d'encodage avec bitrate adapté à la résolution
      const videoBitsPerSecond = DEFAULT_RESOLUTION.width >= 1920 ? 4_000_000 : 2_500_000; // 4Mbps pour Full HD, 2.5Mbps pour HD

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      console.log(`🎬 Démarrage enregistrement: ${DEFAULT_RESOLUTION.width}x${DEFAULT_RESOLUTION.height} @ ${videoBitsPerSecond/1000000}Mbps`);

      const mr = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setRecorded(true);
        killStream();
        onVideoReady(new File([blob], `cv-video-${Date.now()}.webm`, { type: "video/webm" }));
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
      
      // Délai court pour éviter les conflits avec killStream
      setTimeout(() => {
        if (!isInitializing) {
          startCamera();
        }
      }, 100);
    };

    const formatTime = (s: number) =>
      `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              startCamera();
            }} 
            disabled={isInitializing}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInitializing ? "Initialisation..." : "Réessayer"}
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
          <button type="button" onClick={reset} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <FaRedo className="text-xs" /> Recommencer
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="relative bg-black rounded-xl overflow-hidden" style={{ 
          maxHeight: "400px", 
          aspectRatio: `${DEFAULT_RESOLUTION.width}/${DEFAULT_RESOLUTION.height}` 
        }}>
          {/* Video off-screen mais rendu pour que drawImage fonctionne */}
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
          />
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-cover"
            width={DEFAULT_RESOLUTION.width}
            height={DEFAULT_RESOLUTION.height}
          />
          {recording && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {formatTime(elapsed)} / {formatTime(MAX_DURATION)}
            </div>
          )}
          {!cameraReady && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="text-center text-white">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm">
                  {isInitializing ? "Initialisation de la caméra..." : "Chargement..."}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-3">
          {!recording ? (
            <button 
              type="button" 
              onClick={startRecording} 
              disabled={!cameraReady || isInitializing}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              <FaVideo /> 
              {isInitializing ? "Initialisation..." : "Démarrer"}
            </button>
          ) : (
            <button type="button" onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl transition-colors">
              <FaStop /> Arrêter
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center">
          Durée maximale: 1 min 30 sec • Résolution: {DEFAULT_RESOLUTION.width}x{DEFAULT_RESOLUTION.height}
        </p>
      </div>
    );
  }
);

VideoRecorder.displayName = "VideoRecorder";
export default VideoRecorder;
