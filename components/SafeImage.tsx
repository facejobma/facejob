import React from 'react';
import Image, { ImageProps } from 'next/image';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null | undefined;
  fallbackSrc?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  fallbackSrc = '/images/placeholder.png', 
  alt,
  ...props 
}) => {
  // Don't render if no valid src is provided
  if (!src || src.trim() === '') {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      {...props}
    />
  );
};

export default SafeImage;