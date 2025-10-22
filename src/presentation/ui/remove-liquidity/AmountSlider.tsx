'use client';

/**
 * 子组件：数量滑块
 * Sub-component: Amount Slider
 *
 * 职责：
 * - 显示百分比滑块
 * - 显示百分比快捷按钮
 * - 显示当前百分比
 */

import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { FormLabel } from '@/components/ui/form';
import { PercentageButtons } from '../shared/PercentageButtons';

interface AmountSliderProps {
  percentage: number;
  onPercentageChange: (percentage: number) => void;
}

export function AmountSlider({ percentage, onPercentageChange }: AmountSliderProps) {
  return (
    <Card className='p-6 border-slate-200 dark:border-slate-800'>
      <FormLabel>Amount to Remove</FormLabel>
      <div className='mt-4 space-y-4'>
        {/* Percentage Display */}
        <div className='text-center'>
          <span className='text-4xl font-bold'>{percentage}%</span>
        </div>

        {/* Slider */}
        <Slider
          value={[percentage]}
          onValueChange={value => onPercentageChange(value[0])}
          min={0}
          max={100}
          step={1}
          className='w-full'
        />

        {/* Percentage Buttons */}
        <PercentageButtons value={percentage} onChange={onPercentageChange} />
      </div>
    </Card>
  );
}
