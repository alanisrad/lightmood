import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea className={`main-textarea ${className}`} {...props} />
  );
}
