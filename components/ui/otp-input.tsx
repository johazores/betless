'use client';

import { useRef } from 'react';
import { cn } from '@/lib/class-names';

type OtpInputProps = {
  length: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
};

/** Segmented one-time-code input with auto-advance, backspace, and paste support. */
export function OtpInput({ length, value, onChange, disabled, hasError, autoFocus }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  function setDigit(index: number, digit: string) {
    const next = value.split('');
    while (next.length < length) next.push('');
    next[index] = digit;
    onChange(next.join('').slice(0, length));
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      setDigit(index, '');
      return;
    }
    if (digits.length > 1) {
      // Paste or autofill: spread the digits from this position.
      const merged = (value.slice(0, index) + digits).slice(0, length);
      onChange(merged);
      inputsRef.current[Math.min(merged.length, length - 1)]?.focus();
      return;
    }
    setDigit(index, digits);
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < length - 1) inputsRef.current[index + 1]?.focus();
  }

  return (
    <div className="flex gap-2 sm:gap-3" role="group" aria-label="One-time verification code">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={value[index] ?? ''}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.target.select()}
          className={cn(
            'h-14 w-11 rounded-xl border border-line-strong bg-surface text-center text-2xl font-black text-ink outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:bg-surface-sunken disabled:text-ink-muted sm:w-12',
            hasError && 'border-danger/60 focus:border-danger focus:ring-danger/15',
          )}
        />
      ))}
    </div>
  );
}
