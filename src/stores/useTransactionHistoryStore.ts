/**
 * 全局状态管理：交易历史
 * Global State Management: Transaction History
 *
 * 使用 Zustand + combine 中间件管理用户的交易历史记录
 *
 * 注意：不使用 persist 中间件，因为：
 * 1. 交易历史可以从链上查询
 * 2. 避免 localStorage 存储过多数据
 * 3. 避免过期数据问题
 * 4. 使用 React Query 缓存即可
 */

import { create } from 'zustand';
import { combine } from 'zustand/middleware';

/**
 * 交易类型
 */
export enum TransactionType {
  SWAP = 'SWAP',
  ADD_LIQUIDITY = 'ADD_LIQUIDITY',
  REMOVE_LIQUIDITY = 'REMOVE_LIQUIDITY',
  MINT = 'MINT',
  APPROVE = 'APPROVE',
}

/**
 * 交易状态
 */
export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

/**
 * 交易记录接口
 */
export interface Transaction {
  // 基本信息
  id: string; // 唯一标识符
  hash: string; // 交易哈希
  type: TransactionType; // 交易类型
  status: TransactionStatus; // 交易状态

  // 时间信息
  timestamp: number; // 时间戳
  confirmedAt?: number; // 确认时间

  // 交易详情
  from: string; // 发送地址
  to?: string; // 接收地址
  value?: string; // 交易金额

  // 代币信息
  tokenIn?: {
    address: string;
    symbol: string;
    amount: string;
  };
  tokenOut?: {
    address: string;
    symbol: string;
    amount: string;
  };

  // 其他信息
  description: string; // 交易描述
  error?: string; // 错误信息
  blockNumber?: number; // 区块号
  gasUsed?: string; // 消耗的 Gas
}

/**
 * 交易历史 Store
 *
 * 使用 Zustand + combine 中间件
 * 不使用 persist，交易历史应该从链上查询或使用 React Query 缓存
 */
export const useTransactionHistoryStore = create(
  combine(
    // 初始状态
    {
      transactions: [] as Transaction[],
    },
    // Actions
    (set, get) => ({
      // 添加交易
      addTransaction: (transaction: Transaction) =>
        set(state => ({
          transactions: [transaction, ...state.transactions],
        })),

      // 更新交易
      updateTransaction: (id: string, updates: Partial<Transaction>) =>
        set(state => ({
          transactions: state.transactions.map(tx => (tx.id === id ? { ...tx, ...updates } : tx)),
        })),

      // 删除交易
      removeTransaction: (id: string) =>
        set(state => ({
          transactions: state.transactions.filter(tx => tx.id !== id),
        })),

      // 清空所有交易
      clearTransactions: () => set({ transactions: [] }),

      // 根据 ID 获取交易
      getTransaction: (id: string) => {
        return get().transactions.find(tx => tx.id === id);
      },

      // 根据哈希获取交易
      getTransactionByHash: (hash: string) => {
        return get().transactions.find(tx => tx.hash === hash);
      },

      // 获取待确认的交易
      getPendingTransactions: () => {
        return get().transactions.filter(tx => tx.status === TransactionStatus.PENDING);
      },

      // 获取已确认的交易
      getConfirmedTransactions: () => {
        return get().transactions.filter(tx => tx.status === TransactionStatus.CONFIRMED);
      },

      // 获取失败的交易
      getFailedTransactions: () => {
        return get().transactions.filter(tx => tx.status === TransactionStatus.FAILED);
      },

      // 根据类型获取交易
      getTransactionsByType: (type: TransactionType) => {
        return get().transactions.filter(tx => tx.type === type);
      },

      // 获取最近的交易
      getRecentTransactions: (limit: number = 10) => {
        return get()
          .transactions.slice(0, limit)
          .sort((a, b) => b.timestamp - a.timestamp);
      },
    }),
  ),
);

/**
 * 选择器：获取待确认交易数量
 */
export const usePendingTransactionsCount = () =>
  useTransactionHistoryStore(
    state => state.transactions.filter(tx => tx.status === TransactionStatus.PENDING).length,
  );

/**
 * 选择器：获取最近的交易
 */
export const useRecentTransactions = (limit: number = 5) =>
  useTransactionHistoryStore(state =>
    state.transactions.slice(0, limit).sort((a, b) => b.timestamp - a.timestamp),
  );

/**
 * 工具函数：创建交易 ID
 */
export function createTransactionId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 工具函数：创建交易记录
 */
export function createTransaction(
  params: Omit<Transaction, 'id' | 'timestamp' | 'status'>,
): Transaction {
  return {
    id: createTransactionId(),
    timestamp: Date.now(),
    status: TransactionStatus.PENDING,
    ...params,
  };
}
