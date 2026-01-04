import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="ui-input-wrap">
      {label && (
        <label className="ui-label">
          {label}
        </label>
      )}
      <input
        className={`ui-input ${className}`}
        {...props}
      />
      {error && (
        <p className="ui-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="ui-help">{helperText}</p>
      )}
    </div>
  );
};
