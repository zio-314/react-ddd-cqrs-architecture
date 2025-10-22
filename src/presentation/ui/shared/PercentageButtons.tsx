'use client';

/**
 * 共享组件：百分比按钮
 * Shared Component: Percentage Buttons
 *
 * 职责：
 * - 显示百分比快捷按钮 (25%, 50%, 75%, 100%)
 * - 高亮当前选中的百分比
 *
 * 可复用于：
 * - RemoveLiquidityForm
 * - 任何需要百分比选择的场景
 */

import { Button } from '@/components/ui/button';

interface PercentageButtonsProps {
  value: number;
  onChange: (percentage: number) => void;
  disabled?: boolean;
  percentages?: number[];
}

const DEFAULT_PERCENTAGES = [25, 50, 75, 100];

export function PercentageButtons({
  value,
  onChange,
  disabled = false,
  percentages = DEFAULT_PERCENTAGES,
}: PercentageButtonsProps) {
  return (
    <div className='flex gap-2'>
      {percentages.map(percentage => (
        <Button
          key={percentage}
          type='button'
          variant={value === percentage ? 'default' : 'outline'}
          size='sm'
          onClick={() => onChange(percentage)}
          disabled={disabled}
          className={`flex-1 ${
            value === percentage
              ? 'bg-sky-500 hover:bg-sky-600 text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {percentage}%
        </Button>
      ))}
    </div>
  );
}
