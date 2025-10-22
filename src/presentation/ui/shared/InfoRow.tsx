'use client';

/**
 * 共享组件：信息行
 * Shared Component: Info Row
 *
 * 职责：
 * - 显示键值对信息
 * - 支持工具提示
 * - 支持高亮
 *
 * 可复用于：
 * - 预览卡片
 * - 详情展示
 */

import { Info } from 'lucide-react';
import { ReactNode } from 'react';

interface InfoRowProps {
  label: string;
  value: ReactNode;
  tooltip?: string;
  highlight?: boolean;
  className?: string;
}

export function InfoRow({
  label,
  value,
  tooltip,
  highlight = false,
  className = '',
}: InfoRowProps) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div className='flex items-center gap-1'>
        <span
          className={`text-sm ${highlight ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}
        >
          {label}
        </span>
        {tooltip && (
          <div className='group relative'>
            <Info className='w-3 h-3 text-gray-400 cursor-help' />
            <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10'>
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <span
        className={`text-sm ${highlight ? 'font-bold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-700 dark:text-gray-300'}`}
      >
        {value}
      </span>
    </div>
  );
}
