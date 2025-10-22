'use client';

/**
 * 子组件：LP Token 信息
 * Sub-component: LP Token Info
 *
 * 职责：
 * - 显示 LP Token 余额
 * - 显示池中的代币数量
 */

import { Card } from '@/components/ui/card';
import { InfoRow } from '../shared/InfoRow';
import { LPTokenInfo as ILPTokenInfo } from '@/types';

interface LPTokenInfoProps {
  lpTokenInfo: ILPTokenInfo;
  tokenASymbol?: string;
  tokenBSymbol?: string;
}

export function LPTokenInfo({
  lpTokenInfo,
  tokenASymbol = 'Token A',
  tokenBSymbol = 'Token B',
}: LPTokenInfoProps) {
  return (
    <Card className='p-6 border-slate-200 dark:border-slate-800 bg-sky-50 dark:bg-sky-950/20'>
      <div className='space-y-2'>
        <InfoRow label='Your LP Tokens:' value={parseFloat(lpTokenInfo.balance).toFixed(6)} />
        <InfoRow
          label={`Pooled ${tokenASymbol}:`}
          value={parseFloat(lpTokenInfo.reserve0).toFixed(6)}
        />
        <InfoRow
          label={`Pooled ${tokenBSymbol}:`}
          value={parseFloat(lpTokenInfo.reserve1).toFixed(6)}
        />
      </div>
    </Card>
  );
}
