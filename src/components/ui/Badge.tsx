import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'orange' | 'dark';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'ui-badge';
  const variantClasses = {
    default: 'ui-badge--default',
    success: 'ui-badge--success',
    warning: 'ui-badge--warning',
    error: 'ui-badge--error',
    info: 'ui-badge--info',
    orange: 'ui-badge--orange',
    dark: 'ui-badge--dark'
  };
  const sizeClasses = {
    sm: 'ui-badge--sm',
    md: 'ui-badge--md'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};
