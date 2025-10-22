'use client';

/**
 * 共享组件：滑点输入
 * Shared Component: Slippage Input
 *
 * 职责：
 * - 输入滑点容忍度
 * - 显示说明文字
 */

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';

interface SlippageInputProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
}

export function SlippageInput<T extends FieldValues>({ form, name }: SlippageInputProps<T>) {
  return (
    <Card className='p-6 border-slate-200 dark:border-slate-800'>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slippage Tolerance (%)</FormLabel>
            <FormControl>
              <Input {...field} type='number' step='0.1' min='0' max='50' placeholder='0.5' />
            </FormControl>
            <FormDescription>
              Your transaction will revert if the price changes unfavorably by more than this
              percentage.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  );
}
