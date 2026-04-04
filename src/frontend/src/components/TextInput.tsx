
import React from 'react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder, className, type = 'text' }) => {
  return (
    <div className={`text-input-group ${className}`}>
      {label && <label>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="text-input"
      />
    </div>
  );
};

export default TextInput;
