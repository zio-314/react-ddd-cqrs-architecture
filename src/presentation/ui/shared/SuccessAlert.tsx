'use client';

/**
 * 共享组件：成功提示
 * Shared Component: Success Alert
 *
 * 职责：
 * - 显示成功消息
 * - 支持交易哈希链接
 * - 统一的成功样式
 *
 * 可复用于：
 * - 所有表单组件
 */

import { CheckCircle, ExternalLink } from 'lucide-react';

interface SuccessAlertProps {
  message: string;
  txHash?: string;
  explorerUrl?: string;
  className?: string;
}

export function SuccessAlert({
  message,
  txHash,
  explorerUrl = 'https://etherscan.io/tx',
  className = '',
}: SuccessAlertProps) {
  return (
    <div
      className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 ${className}`}
    >
      <div className='flex items-start gap-2'>
        <CheckCircle className='w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5' />
        <div className='flex-1'>
          <p className='text-sm text-green-700 dark:text-green-300'>{message}</p>
          {txHash && (
            <a
              href={`${explorerUrl}/${txHash}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1 mt-1'
            >
              View on Explorer
              <ExternalLink className='w-3 h-3' />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
