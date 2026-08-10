"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaPlay, FaPause, FaUndo, FaTextHeight, FaRunning } from "react-icons/fa";

interface TeleprompterOverlayProps {
  script: string;
  isRecording: boolean;
  onClose?: () => void;
}

export default function TeleprompterOverlay({ script, isRecording, onClose }: TeleprompterOverlayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(15); // Scroll speed (pixels per frame / interval)
  const [fontSize, setFontSize] = useState(20); // in pixels
  const [bgOpacity, setBgOpacity] = useState(0.6); // Background overlay opacity
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const scrollPosRef = useRef<number>(0);

  // Auto-start teleprompter when recording starts
  useEffect(() => {
    if (isRecording) {
      setIsPlaying(true);
      handleReset();
    } else {
      setIsPlaying(false);
    }
  }, [isRecording]);

  // Handle animation loop for scrolling
  const animateScroll = (time: number) => {
    if (lastTimeRef.current !== null) {
      const delta = time - lastTimeRef.current;
      
      if (isPlaying && scrollContainerRef.current) {
        // Adjust speed based on user preference
        // Speed value 1-30 translates to scroll velocity
        const velocity = (speed / 100) * (delta / 16); 
        scrollPosRef.current += velocity;
        
        const container = scrollContainerRef.current;
        container.scrollTop = scrollPosRef.current;
        
        // If reached bottom, stop playing
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
          setIsPlaying(false);
        }
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animateScroll);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateScroll);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, speed]);

  const handleReset = () => {
    scrollPosRef.current = 0;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    lastTimeRef.current = null;
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none z-20">
      {/* Top Header Bar */}
      <div className="p-3 bg-black/80 flex items-center justify-between pointer-events-auto border-b border-gray-800">
        <span className="text-xs font-bold text-green-400 tracking-wider uppercase animate-pulse">
          Téléprompteur Actif
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-white bg-gray-900 border border-gray-700 px-2 py-1 rounded transition-colors"
        >
          Masquer
        </button>
      </div>

      {/* Script Scrolling Content Area */}
      <div 
        className="flex-1 overflow-hidden relative"
        style={{ backgroundColor: `rgba(0, 0, 0, ${bgOpacity})` }}
      >
        {/* Visual Reading Target Line */}
        <div className="absolute left-0 right-0 top-1/3 h-10 border-y border-green-500/30 bg-green-500/10 pointer-events-none flex items-center pl-4">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping" />
          <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Zone de lecture</span>
        </div>

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="h-full overflow-y-hidden px-8 py-20 pointer-events-auto"
          style={{ scrollBehavior: "auto" }}
        >
          <div 
            className="text-center font-semibold leading-relaxed tracking-wide text-white transition-all whitespace-pre-line"
            style={{ fontSize: `${fontSize}px` }}
          >
            {script || "Veuillez générer ou saisir votre script."}
          </div>
        </div>
      </div>

      {/* Teleprompter Control Toolbar */}
      <div className="p-4 bg-black/90 flex flex-col md:flex-row gap-4 items-center justify-between pointer-events-auto border-t border-gray-800">
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-3 rounded-full text-white transition-all transform hover:scale-105 ${
              isPlaying ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"
            }`}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <FaPause className="text-sm" /> : <FaPlay className="text-sm pl-0.5" />}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-all"
            title="Reset"
          >
            <FaUndo className="text-xs" />
          </button>
        </div>

        {/* Sliders for Speed and Size */}
        <div className="flex flex-wrap items-center gap-4 text-white text-xs flex-1 max-w-md justify-end">
          {/* Speed Control */}
          <div className="flex items-center gap-2 flex-1 min-w-[120px]">
            <FaRunning className="text-gray-400 text-sm" />
            <span className="w-10">Vitesse:</span>
            <input
              type="range"
              min="5"
              max="40"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-green-500 bg-gray-700 h-1 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Size Control */}
          <div className="flex items-center gap-2 flex-1 min-w-[120px]">
            <FaTextHeight className="text-gray-400 text-sm" />
            <span className="w-10">Taille:</span>
            <input
              type="range"
              min="14"
              max="32"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-green-500 bg-gray-700 h-1 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Background Opacity Control */}
          <div className="flex items-center gap-2 flex-1 min-w-[120px]">
            <span className="text-gray-400 text-sm font-bold">Opa:</span>
            <input
              type="range"
              min="20"
              max="100"
              value={bgOpacity * 100}
              onChange={(e) => setBgOpacity(Number(e.target.value) / 100)}
              className="w-full accent-green-500 bg-gray-700 h-1 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
