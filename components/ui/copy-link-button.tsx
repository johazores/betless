'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/class-names';

type CopyLinkButtonProps = {
  url: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export function CopyLinkButton({
  url,
  label = 'Copy link',
  copiedLabel = 'Copied!',
  className,
  variant = 'secondary',
  size = 'sm',
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={() => void handleCopy()}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}
