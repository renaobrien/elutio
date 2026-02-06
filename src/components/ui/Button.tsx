import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = 'px-[18px] py-[8px] rounded-[7px] text-[12px] font-semibold cursor-pointer transition-all duration-150';

  const variantStyles = {
    primary: 'bg-[var(--accent)] text-[var(--accent-text-on)] border-none hover:opacity-90',
    secondary: 'bg-transparent border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-active)]',
    danger: 'bg-[var(--danger-dim)] border border-[var(--danger-border)] text-[var(--danger)] hover:border-[var(--danger)]',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
