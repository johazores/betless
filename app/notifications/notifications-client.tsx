'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/public-layout';
import { NotificationRow } from '@/components/notifications/notification-bell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { apiRequest, patchJson, postJson } from '@/lib/api-client';
import { formatDateTime } from '@/lib/dates';
import { notificationCategoryLabels } from '@/lib/notification-ui';
import { cn } from '@/lib/class-names';
import type { NotificationCategory, NotificationListView } from '@/types/notifications';

const filters: Array<{ id: 'all' | NotificationCategory; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'VAULT', label: 'Vaults' },
  { id: 'POINTS', label: 'Points' },
  { id: 'ON_CHAIN', label: 'On-chain' },
  { id: 'REWARDS', label: 'Rewards' },
  { id: 'ACCOUNT', label: 'Account' },
];

export function NotificationsClient() {
  const [filter, setFilter] = useState<'all' | NotificationCategory>('all');
  const [data, setData] = useState<NotificationListView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = filter === 'all' ? '/api/notifications' : `/api/notifications?category=${filter}`;
      setData(await apiRequest<NotificationListView>(url));
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function markAllRead() {
    const updated = await postJson<NotificationListView>('/api/notifications', { action: 'read_all' });
    setData(updated);
  }

  async function setRead(id: string, read: boolean) {
    const updated = await patchJson<NotificationListView>(`/api/notifications/${id}`, { read });
    setData(updated);
  }

  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge>Activity</Badge>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-ink">Notifications</h1>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                Account activity, vault updates, points, and on-chain events.
              </p>
            </div>
            {data && data.unreadCount > 0 ? (
              <Button variant="secondary" size="sm" onClick={() => void markAllRead()}>
                Mark all read
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
                  filter === item.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-surface text-ink-muted hover:bg-surface-sunken hover:text-ink',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <LoadingState label="Loading notifications…" />
          ) : (
            <Card padding="none" className="overflow-hidden">
              {!data?.notifications.length ? (
                <p className="px-6 py-12 text-center text-sm text-ink-muted">No notifications in this category.</p>
              ) : (
                <ul className="divide-y divide-line/80">
                  {data.notifications.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="block w-full text-left"
                        onClick={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                      >
                        <NotificationRow item={item} />
                      </button>
                      {expandedId === item.id ? (
                        <div className="border-t border-line/60 bg-surface-muted/40 px-4 py-3 pl-[4.25rem] text-sm leading-6 text-ink-muted">
                          <p>{item.body}</p>
                          <p className="mt-2 text-xs font-medium text-ink-muted">
                            {formatDateTime(item.createdAt)} · {notificationCategoryLabels[item.category]}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            {item.actionUrl ? (
                              <Link href={item.actionUrl} className="text-xs font-bold text-brand-700">
                                Open related page →
                              </Link>
                            ) : null}
                            <button
                              type="button"
                              className="text-xs font-bold text-ink-muted hover:text-ink"
                              onClick={(event) => {
                                event.stopPropagation();
                                void setRead(item.id, !item.readAt);
                              }}
                            >
                              {item.readAt ? 'Mark as unread' : 'Mark as read'}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
