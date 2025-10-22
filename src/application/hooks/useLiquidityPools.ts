'use client';

/**
 * 应用层 Hook：流动性池
 * Application Hook: Liquidity Pools
 *
 * 职责：
 * - 使用 React Query 管理远程数据状态
 * - 调用查询层获取数据
 * - 返回充血的 Pool 实体给 UI
 *
 * 不应该：
 * - 包含业务逻辑（应在 queries 或 domain 层）
 * - 直接处理数据转换（应在 queries 层）
 * - 直接调用区块链（应在 queries 层）
 *
 * 优势：
 * - 使用 React Query 自动管理缓存、重试、后台更新
 * - 业务逻辑在 queries 层，与 React 解耦
 * - 查询逻辑可以在非 React 环境中复用
 * - 自动处理 loading、error、data 状态
 * - 内置缓存机制，减少不必要的请求
 * - 自动重新获取（窗口聚焦、网络重连）
 * - 直接返回充血的 Pool 实体，封装所有业务逻辑
 *
 * @example
 * // 在组件中使用
 * const { pools } = useLiquidityPools();
 *
 * // pools 已经是 Pool 实体数组，可以直接使用业务方法
 * const price = pools[0].getPrice();
 * const reserve = pools[0].getReserveBySymbol('USDC');
 * const amountOut = pools[0].getAmountOut(amountIn, tokenIn);
 */

import { useQuery } from '@tanstack/react-query';
import { getLiquidityPools } from '@/application/queries/getLiquidityPools';

// 重新导出 Pool 实体，方便使用
export { Pool } from '@/domain/entities/Pool';

/**
 * Hook：获取流动性池列表
 *
 * 职责：
 * - 使用 React Query 管理远程数据状态
 * - 调用查询层获取数据
 * - 返回状态给 UI
 *
 * React Query 优势：
 * - 自动管理 loading、error、data 状态
 * - 内置缓存机制（30 秒内数据视为新鲜）
 * - 自动后台更新（每 60 秒）
 * - 窗口聚焦时自动重新获取
 * - 网络重连时自动重新获取
 * - 自动重试失败的请求
 */
export function useLiquidityPools() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['liquidityPools'],
    queryFn: getLiquidityPools,
    staleTime: 30_000, // 30 秒内数据视为新鲜，不会重新获取
    refetchInterval: 60_000, // 每 60 秒自动刷新一次
    refetchOnWindowFocus: true, // 窗口聚焦时重新获取
    refetchOnReconnect: true, // 网络重连时重新获取
    retry: 3, // 失败时重试 3 次
  });

  return {
    pools: data ?? [],
    isLoading,
    error: error?.message ?? null,
    pairCount: data?.length ?? 0,
    refetch, // 暴露 refetch 方法，允许手动刷新
  };
}
