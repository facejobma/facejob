import React from "react";
import { Bell } from "lucide-react"; 

const Notification: React.FC = () => {
  return (
    <div className="notification-icon">
      <Bell size={20} /> 
    </div>
  );
};

export default Notification;
