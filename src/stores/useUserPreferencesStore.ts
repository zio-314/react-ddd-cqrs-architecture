/**
 * 全局状态管理：用户偏好设置
 * Global State Management: User Preferences
 *
 * 使用 Zustand + combine 中间件管理用户的偏好设置
 */

import { create } from 'zustand';
import { persist, createJSONStorage, combine } from 'zustand/middleware';

/**
 * 用户偏好设置接口
 */
export interface UserPreferences {
  // 交易设置
  defaultSlippage: string; // 默认滑点（百分比）
  transactionDeadline: number; // 交易截止时间（分钟）

  // UI 设置
  showPriceImpactWarning: boolean; // 是否显示价格影响警告
  autoRefresh: boolean; // 是否自动刷新数据
  refreshInterval: number; // 刷新间隔（秒）

  // 通知设置
  enableNotifications: boolean; // 是否启用通知
  notifyOnSuccess: boolean; // 成功时通知
  notifyOnError: boolean; // 错误时通知

  // 高级设置
  expertMode: boolean; // 专家模式
  multihops: boolean; // 是否启用多跳交换

  // 显示设置
  showBalance: boolean; // 是否显示余额
  hideSmallBalances: boolean; // 是否隐藏小额余额
  smallBalanceThreshold: string; // 小额余额阈值
}

/**
 * 用户偏好设置 Store
 *
 * 使用 combine 中间件自动推导类型，无需手动定义接口
 */
export const useUserPreferencesStore = create(
  persist(
    combine(
      // 初始状态
      {
        // 交易设置
        defaultSlippage: '0.5',
        transactionDeadline: 20,

        // UI 设置
        showPriceImpactWarning: true,
        autoRefresh: true,
        refreshInterval: 30,

        // 通知设置
        enableNotifications: true,
        notifyOnSuccess: true,
        notifyOnError: true,

        // 高级设置
        expertMode: false,
        multihops: true,

        // 显示设置
        showBalance: true,
        hideSmallBalances: false,
        smallBalanceThreshold: '0.01',
      },
      // Actions
      (set, get) => ({
        // 设置滑点
        setSlippage: (slippage: string) => set({ defaultSlippage: slippage }),

        // 设置交易截止时间
        setTransactionDeadline: (deadline: number) => set({ transactionDeadline: deadline }),

        // 设置是否显示价格影响警告
        setShowPriceImpactWarning: (show: boolean) => set({ showPriceImpactWarning: show }),

        // 设置自动刷新
        setAutoRefresh: (enabled: boolean) => set({ autoRefresh: enabled }),

        // 设置刷新间隔
        setRefreshInterval: (interval: number) => set({ refreshInterval: interval }),

        // 设置启用通知
        setEnableNotifications: (enabled: boolean) => set({ enableNotifications: enabled }),

        // 设置成功时通知
        setNotifyOnSuccess: (enabled: boolean) => set({ notifyOnSuccess: enabled }),

        // 设置错误时通知
        setNotifyOnError: (enabled: boolean) => set({ notifyOnError: enabled }),

        // 设置专家模式
        setExpertMode: (enabled: boolean) => set({ expertMode: enabled }),

        // 设置多跳交换
        setMultihops: (enabled: boolean) => set({ multihops: enabled }),

        // 设置显示余额
        setShowBalance: (show: boolean) => set({ showBalance: show }),

        // 设置隐藏小额余额
        setHideSmallBalances: (hide: boolean) => set({ hideSmallBalances: hide }),

        // 设置小额余额阈值
        setSmallBalanceThreshold: (threshold: string) => set({ smallBalanceThreshold: threshold }),

        // 批量更新偏好设置
        updatePreferences: (preferences: Partial<UserPreferences>) => set(preferences),

        // 重置为默认设置
        resetPreferences: () =>
          set({
            defaultSlippage: '0.5',
            transactionDeadline: 20,
            showPriceImpactWarning: true,
            autoRefresh: true,
            refreshInterval: 30,
            enableNotifications: true,
            notifyOnSuccess: true,
            notifyOnError: true,
            expertMode: false,
            multihops: true,
            showBalance: true,
            hideSmallBalances: false,
            smallBalanceThreshold: '0.01',
          }),
      }),
    ),
    {
      name: 'user-preferences-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/**
 * 选择器：获取默认滑点
 */
export const useDefaultSlippage = () => useUserPreferencesStore(state => state.defaultSlippage);

/**
 * 选择器：获取交易截止时间
 */
export const useTransactionDeadline = () =>
  useUserPreferencesStore(state => state.transactionDeadline);

/**
 * 选择器：获取是否启用专家模式
 */
export const useExpertMode = () => useUserPreferencesStore(state => state.expertMode);

/**
 * 选择器：获取是否自动刷新
 */
export const useAutoRefresh = () => useUserPreferencesStore(state => state.autoRefresh);

/**
 * 选择器：获取刷新间隔
 */
export const useRefreshInterval = () => useUserPreferencesStore(state => state.refreshInterval);
