'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/class-names';

type ProfileAvatarProps = {
  size?: 'md' | 'lg';
  editable?: boolean;
  onPhotoChange?: () => void;
  className?: string;
};

const sizes = {
  md: 'h-16 w-16 text-2xl',
  lg: 'h-24 w-24 text-3xl',
};

export function ProfileAvatar({ size = 'md', editable = false, onPhotoChange, className }: ProfileAvatarProps) {
  const { user } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const initial =
    user?.firstName?.[0] ??
    user?.primaryEmailAddress?.emailAddress?.[0] ??
    'A';

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setError('');
    try {
      await user.setProfileImage({ file });
      onPhotoChange?.();
    } catch {
      setError('Photo could not be updated. Try a JPG or PNG under 10 MB.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <div className="relative">
        {user?.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt=""
            width={size === 'lg' ? 96 : 64}
            height={size === 'lg' ? 96 : 64}
            className={cn('rounded-full object-cover ring-4 ring-surface shadow-card', sizes[size])}
          />
        ) : (
          <span
            className={cn(
              'grid place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-black uppercase text-white ring-4 ring-surface shadow-card',
              sizes[size],
            )}
          >
            {initial}
          </span>
        )}

        {editable ? (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-ink shadow-sm transition hover:bg-surface-muted disabled:opacity-60"
              aria-label="Change profile photo"
            >
              {isUploading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand-600" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => void handleFileChange(event)}
            />
          </>
        ) : null}
      </div>
      {error ? <p className="mt-2 max-w-[12rem] text-center text-xs font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
