'use client';

/**
 * 共享组件：操作按钮组
 * Shared Component: Action Buttons
 *
 * 职责：
 * - 提供统一的操作按钮样式
 * - 支持主要操作和次要操作
 * - 支持加载状态
 *
 * 可复用于：
 * - 所有表单组件
 */

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ActionButtonsProps {
  primaryLabel: string;
  primaryAction: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  secondaryLabel?: string;
  secondaryAction?: () => void;
  secondaryDisabled?: boolean;
  className?: string;
}

export function ActionButtons({
  primaryLabel,
  primaryAction,
  primaryDisabled = false,
  primaryLoading = false,
  secondaryLabel,
  secondaryAction,
  secondaryDisabled = false,
  className = '',
}: ActionButtonsProps) {
  return (
    <div className={`flex gap-3 ${className}`}>
      {secondaryLabel && secondaryAction && (
        <Button
          type='button'
          variant='outline'
          onClick={secondaryAction}
          disabled={secondaryDisabled}
          className='flex-1'
        >
          {secondaryLabel}
        </Button>
      )}

      <Button
        type='button'
        onClick={primaryAction}
        disabled={primaryDisabled || primaryLoading}
        className={`${secondaryLabel ? 'flex-1' : 'w-full'} bg-sky-500 hover:bg-sky-600 text-white font-bold`}
      >
        {primaryLoading ? (
          <div className='flex items-center gap-2'>
            <Loader2 className='w-4 h-4 animate-spin' />
            Processing...
          </div>
        ) : (
          primaryLabel
        )}
      </Button>
    </div>
  );
}
