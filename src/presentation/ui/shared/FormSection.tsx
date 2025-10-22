'use client';

/**
 * 共享组件：表单区块
 * Shared Component: Form Section
 *
 * 职责：
 * - 提供统一的表单区块样式
 * - 支持标题、描述、图标
 *
 * 可复用于：
 * - 所有表单组件
 */

import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface FormSectionProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  icon: Icon,
  children,
  className = '',
}: FormSectionProps) {
  return (
    <Card className={`p-4 ${className}`}>
      {(title || description) && (
        <div className='mb-4'>
          {title && (
            <div className='flex items-center gap-2 mb-1'>
              {Icon && <Icon className='w-4 h-4 text-gray-500' />}
              <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>{title}</h3>
            </div>
          )}
          {description && <p className='text-xs text-gray-500 dark:text-gray-400'>{description}</p>}
        </div>
      )}
      {children}
    </Card>
  );
}
