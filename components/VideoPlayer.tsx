"use client";

import { useRef, useEffect, useState } from 'react';

interface VideoPlayerProps {
  src: string;
  videoId: number;
  onPlay?: (videoId: number) => void;
  className?: string;
  width?: number | string;
  height?: number | string;
  poster?: string;
  subtitlesVtt?: string;
}

export default function VideoPlayer({ 
  src, 
  videoId, 
  onPlay, 
  className = '',
  width,
  height,
  poster,
  subtitlesVtt
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [subtitlesUrl, setSubtitlesUrl] = useState<string | null>(null);

  useEffect(() => {
    if (subtitlesVtt) {
      const blob = new Blob([subtitlesVtt], { type: 'text/vtt' });
      const url = URL.createObjectURL(blob);
      setSubtitlesUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setSubtitlesUrl(null);
      };
    }
  }, [subtitlesVtt]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      console.log(`✅ Video ${videoId} metadata loaded, duration: ${video.duration}s`);
      setDuration(video.duration);
      setIsLoaded(true);
    };

    const handleError = (e: Event) => {
      console.error(`❌ Error loading video ${videoId}:`, e);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);

    // Force load metadata
    video.load();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, [src, videoId]);

  const handlePlay = () => {
    if (onPlay) {
      onPlay(videoId);
    }
  };

  return (
    <video
      ref={videoRef}
      width={width}
      height={height}
      controls
      preload="metadata"
      data-video-id={videoId}
      onPlay={handlePlay}
      className={className}
      poster={poster}
      crossOrigin="anonymous"
    >
      <source src={`${src}#t=0.1`} type="video/webm" />
      <source src={`${src}#t=0.1`} type="video/mp4" />
      {subtitlesUrl && (
        <track 
          src={subtitlesUrl} 
          kind="subtitles" 
          srcLang="fr" 
          label="Sous-titres IA" 
          default 
        />
      )}
      Votre navigateur ne supporte pas la lecture de vidéos.
    </video>
  );
}
