'use client';

/**
 * 共享组件：错误提示
 * Shared Component: Error Alert
 *
 * 职责：
 * - 显示错误消息
 * - 支持关闭按钮
 * - 统一的错误样式
 *
 * 可复用于：
 * - 所有表单组件
 */

import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
  className?: string;
}

export function ErrorAlert({ message, onClose, className = '' }: ErrorAlertProps) {
  return (
    <div
      className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 ${className}`}
    >
      <div className='flex items-start gap-2'>
        <AlertCircle className='w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5' />
        <p className='text-sm text-red-700 dark:text-red-300 flex-1'>{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className='text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 flex-shrink-0'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>
    </div>
  );
}
