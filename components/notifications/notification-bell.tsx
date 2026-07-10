'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/notifications/toast-provider';
import { apiRequest, patchJson, postJson } from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/dates';
import { getNotificationIcon, getNotificationTone, notificationCategoryLabels } from '@/lib/notification-ui';
import { cn } from '@/lib/class-names';
import { toneStyles } from '@/lib/semantic-tokens';
import type { NotificationListView, NotificationView } from '@/types/notifications';

export function NotificationBell() {
  const { isSignedIn } = useUser();
  const { push: pushToast } = useToast();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationListView | null>(null);
  const lastSeenId = useRef<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const next = await apiRequest<NotificationListView>('/api/notifications');
      const latest = next.notifications[0];
      if (latest && lastSeenId.current && latest.id !== lastSeenId.current && !latest.readAt) {
        pushToast({
          title: latest.title,
          body: latest.body,
          tone: getNotificationTone(latest.category),
          actionUrl: latest.actionUrl ?? undefined,
        });
      }
      if (latest) lastSeenId.current = latest.id;
      setData(next);
    } catch {
      // Non-critical — bell stays hidden on failure
    }
  }, [isSignedIn, pushToast]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 30000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  async function markRead(notification: NotificationView) {
    const updated = await patchJson<NotificationListView>(`/api/notifications/${notification.id}`, { read: true });
    setData(updated);
  }

  if (!isSignedIn) return null;

  const unread = data?.unreadCount ?? 0;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface text-ink-muted transition hover:border-line-strong hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
        aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-line bg-surface shadow-elevated">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            <Link href="/notifications" className="text-xs font-bold text-brand-700 hover:text-brand-800" onClick={() => setOpen(false)}>
              View all
            </Link>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {!data?.notifications.length ? (
              <li className="px-4 py-8 text-center text-sm text-ink-muted">No notifications yet.</li>
            ) : data.notifications.slice(0, 8).map((item) => (
              <NotificationRow key={item.id} item={item} compact onRead={() => void markRead(item)} onNavigate={() => setOpen(false)} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function NotificationRow({
  item,
  compact = false,
  onRead,
  onNavigate,
}: {
  item: NotificationView;
  compact?: boolean;
  onRead?: () => void;
  onNavigate?: () => void;
}) {
  const tone = getNotificationTone(item.category);
  const styles = toneStyles[tone];
  const unread = !item.readAt;

  const content = (
    <div className={cn('flex gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/60', unread && 'bg-brand-50/30')}>
      <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg', styles.icon)}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d={getNotificationIcon(item.category)} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-semibold', unread ? 'text-ink' : 'text-ink-muted')}>{item.title}</p>
          {unread ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-hidden /> : null}
        </div>
        {!compact ? <p className="mt-0.5 text-sm leading-6 text-ink-muted">{item.body}</p> : null}
        <p className="mt-1 text-xs text-ink-muted" title={new Date(item.createdAt).toLocaleString()}>
          {formatRelativeTime(item.createdAt)}
          {!compact ? ` · ${notificationCategoryLabels[item.category]}` : ''}
        </p>
      </div>
    </div>
  );

  if (item.actionUrl) {
    return (
      <li>
        <Link href={item.actionUrl} onClick={() => { onRead?.(); onNavigate?.(); }} className="block">
          {content}
        </Link>
      </li>
    );
  }

  return <li onClick={onRead}>{content}</li>;
}
