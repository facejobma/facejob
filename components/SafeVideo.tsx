import React from 'react';

interface SafeVideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  src?: string | null | undefined;
  fallbackContent?: React.ReactNode;
}

const SafeVideo: React.FC<SafeVideoProps> = ({ 
  src, 
  fallbackContent,
  children,
  ...props 
}) => {
  // Don't render if no valid src is provided
  if (!src || src.trim() === '') {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
        {fallbackContent || <p className="text-gray-500">Aucune vidéo disponible</p>}
      </div>
    );
  }

  return (
    <video src={src} {...props}>
      {children}
    </video>
  );
};

export default SafeVideo;