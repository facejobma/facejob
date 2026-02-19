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
    <div className={`${noPadding ? '' : 'p-4 sm:p-6'} ${className}`}>
      {children}
    </div>
  );
};

export default DashboardPageWrapper;
