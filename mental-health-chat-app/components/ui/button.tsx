import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function Button({ children, className = "", disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`button ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

