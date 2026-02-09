import type { ReactNode } from 'react';

type ButtonSize = 'small' | 'medium' | 'large';
type ButtonVariant = 'primary' | 'ghost';

export default function Button({
  children,
  onClick,
  className,
  size = 'medium',
  variant = 'primary',
  type = 'button',
  disabled = false,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const sizeClasses =
    size === 'small'
      ? 'px-3 py-2 text-xs'
      : size === 'large'
        ? 'px-6 py-4 text-sm'
        : 'px-5 py-3 text-xs';

  const variantClasses =
    variant === 'ghost'
      ? 'bg-transparent text-[#ffd966] border-[#ffd966]'
      : 'bg-[#ffd966] text-[#1b140f] border-[#2a1b12]';

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 border-2 uppercase tracking-[0.12em]',
        'transition-transform duration-150 ease-out',
        'active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses,
        variantClasses,
        className || '',
      ].join(' ')}
      style={{
        fontFamily: '"Press Start 2P", "VT323", monospace',
        boxShadow:
          variant === 'ghost'
            ? '0 0 0 2px rgba(255, 217, 102, 0.3)'
            : '0 0 0 2px #2a1b12, 0 6px 0 #6b4b2a',
      }}
    >
      {children}
    </button>
  );
}
