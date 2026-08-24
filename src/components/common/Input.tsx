import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefixText?: React.ReactNode;
  suffixText?: React.ReactNode;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  prefixText,
  suffixText,
  required,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div className={prefixText ? 'input-with-prefix' : suffixText ? 'input-with-suffix' : ''}>
        {prefixText && <span className="input-prefix">{prefixText}</span>}
        <input
          id={inputId}
          className={`form-input ${error ? 'border-danger' : ''} ${className}`.trim()}
          {...props}
        />
        {suffixText && <span className="input-suffix">{suffixText}</span>}
      </div>
      {error && <p className="form-error">{error}</p>}
      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  );
};
