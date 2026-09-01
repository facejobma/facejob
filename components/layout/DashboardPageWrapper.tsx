import React from 'react';

interface DashboardPageWrapperProps {
  children: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}

export const DashboardPageWrapper: React.FC<DashboardPageWrapperProps> = ({ 
  children, 
  noPadding = false,
  className = ''
}) => {
  return (
    <div className={`mx-auto min-w-0 w-full max-w-[1600px] overflow-x-hidden ${noPadding ? '' : 'p-4 sm:p-6 lg:p-7'} ${className}`}>
      {children}
    </div>
  );
};

export default DashboardPageWrapper;
