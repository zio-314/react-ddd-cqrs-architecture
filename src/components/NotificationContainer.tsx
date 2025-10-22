'use client';

/**
 * 通知容器组件
 * Notification Container Component
 *
 * 显示全局通知消息
 */

import React from 'react';
import { useNotifications, useUIStore, NotificationType } from '@/stores/useUIStore';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/infrastructure/shared';

/**
 * 通知图标映射
 */
const NOTIFICATION_ICONS = {
  [NotificationType.SUCCESS]: CheckCircle2,
  [NotificationType.ERROR]: XCircle,
  [NotificationType.WARNING]: AlertTriangle,
  [NotificationType.INFO]: Info,
};

/**
 * 通知样式映射
 */
const NOTIFICATION_STYLES = {
  [NotificationType.SUCCESS]: {
    container: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    title: 'text-green-900 dark:text-green-100',
    message: 'text-green-700 dark:text-green-300',
  },
  [NotificationType.ERROR]: {
    container: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-900 dark:text-red-100',
    message: 'text-red-700 dark:text-red-300',
  },
  [NotificationType.WARNING]: {
    container: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-600 dark:text-yellow-400',
    title: 'text-yellow-900 dark:text-yellow-100',
    message: 'text-yellow-700 dark:text-yellow-300',
  },
  [NotificationType.INFO]: {
    container: 'bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800',
    icon: 'text-sky-500 dark:text-sky-400',
    title: 'text-sky-900 dark:text-sky-100',
    message: 'text-sky-600 dark:text-sky-300',
  },
};

/**
 * 单个通知组件
 */
function NotificationItem({
  id,
  type,
  title,
  message,
}: {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}) {
  const removeNotification = useUIStore(state => state.removeNotification);
  const Icon = NOTIFICATION_ICONS[type];
  const styles = NOTIFICATION_STYLES[type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'animate-in slide-in-from-right-full duration-300',
        styles.container,
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', styles.icon)} />

      <div className='flex-1 min-w-0'>
        <p className={cn('font-medium text-sm', styles.title)}>{title}</p>
        <p className={cn('text-sm mt-1', styles.message)}>{message}</p>
      </div>

      <button
        onClick={() => removeNotification(id)}
        className={cn(
          'flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
          styles.icon,
        )}
        aria-label='Close notification'
      >
        <X className='h-4 w-4' />
      </button>
    </div>
  );
}

/**
 * 通知容器组件
 *
 * 显示所有活动的通知
 */
export function NotificationContainer() {
  const notifications = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className='fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none'
      aria-live='polite'
      aria-atomic='true'
    >
      <div className='flex flex-col gap-2 pointer-events-auto'>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            id={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
          />
        ))}
      </div>
    </div>
  );
}
