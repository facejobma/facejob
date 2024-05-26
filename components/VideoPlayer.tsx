import React from "react";

interface VideoProps {
  link: string;
}

const VideoPlayer: React.FC<VideoProps> = ({ link }) => {
  return (
    <div className="flex justify-center items-center w-full h-48 mb-4 bg-black">
      <video src={link} className="w-full h-48 mb-4" controls>
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;