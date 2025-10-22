/**
 * 全局状态管理：UI 状态
 * Global State Management: UI State
 *
 * 使用 Zustand + combine 中间件管理全局 UI 状态（通知、模态框等）
 *
 * 注意：不使用 persist 中间件，因为：
 * 1. UI 状态是临时的，刷新页面应该重置
 * 2. 通知应该清空
 * 3. 模态框应该关闭
 * 4. 加载状态应该重置
 *
 * 技巧：使用 `as` 类型断言来指定复杂状态类型（如 Map），
 * 这样 combine 中间件可以正确推导类型
 */

import { create } from 'zustand';
import { combine } from 'zustand/middleware';

/**
 * 通知类型
 */
export enum NotificationType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

/**
 * 通知接口
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // 持续时间（毫秒），undefined 表示不自动关闭
  timestamp: number;
}

/**
 * 模态框类型
 */
export enum ModalType {
  SETTINGS = 'SETTINGS',
  TOKEN_SELECTOR = 'TOKEN_SELECTOR',
  TRANSACTION_DETAILS = 'TRANSACTION_DETAILS',
  WALLET_CONNECT = 'WALLET_CONNECT',
  CONFIRM_TRANSACTION = 'CONFIRM_TRANSACTION',
}

/**
 * 模态框状态
 */
export interface ModalState {
  type: ModalType;
  isOpen: boolean;
  data?: unknown; // 模态框数据
}

/**
 * UI Store
 *
 * 使用 Zustand + combine 中间件管理全局 UI 状态
 *
 * 技巧：使用 `as` 类型断言来指定 Map 类型，让 combine 正确推导类型
 */
export const useUIStore = create(
  combine(
    // 初始状态（使用 as 指定复杂类型）
    {
      notifications: [] as Notification[],
      modals: new Map() as Map<ModalType, ModalState>,
      isGlobalLoading: false,
      loadingMessage: undefined as string | undefined,
      isSidebarOpen: false,
    },
    // Actions
    (set, get) => ({
      // 添加通知
      addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const id = `notification_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const newNotification: Notification = {
          id,
          timestamp: Date.now(),
          duration: 5000, // 默认 5 秒
          ...notification,
        };

        set(state => ({
          notifications: [...state.notifications, newNotification],
        }));

        // 自动移除通知
        if (newNotification.duration) {
          setTimeout(() => {
            // 使用 set 来移除通知，而不是 get().removeNotification
            set(state => ({
              notifications: state.notifications.filter(n => n.id !== id),
            }));
          }, newNotification.duration);
        }
      },

      // 移除通知
      removeNotification: (id: string) =>
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        })),

      // 清空所有通知
      clearNotifications: () => set({ notifications: [] }),

      // 打开模态框
      openModal: (type: ModalType, data?: unknown) =>
        set(state => {
          const newModals = new Map(state.modals);
          newModals.set(type, { type, isOpen: true, data });
          return { modals: newModals };
        }),

      // 关闭模态框
      closeModal: (type: ModalType) =>
        set(state => {
          const newModals = new Map(state.modals);
          newModals.set(type, { type, isOpen: false, data: undefined });
          return { modals: newModals };
        }),

      // 检查模态框是否打开
      isModalOpen: (type: ModalType) => {
        const modal = get().modals.get(type);
        return modal?.isOpen ?? false;
      },

      // 获取模态框数据
      getModalData: <T = unknown>(type: ModalType): T | undefined => {
        const modal = get().modals.get(type);
        return modal?.data as T | undefined;
      },

      // 设置全局加载状态
      setGlobalLoading: (loading: boolean, message?: string) =>
        set({ isGlobalLoading: loading, loadingMessage: message }),

      // 切换侧边栏
      toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),

      // 设置侧边栏状态
      setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),
    }),
  ),
);

/**
 * 选择器：获取通知列表
 */
export const useNotifications = () => useUIStore(state => state.notifications);

/**
 * 选择器：获取全局加载状态
 */
export const useGlobalLoading = () =>
  useUIStore(state => ({
    isLoading: state.isGlobalLoading,
    message: state.loadingMessage,
  }));

/**
 * 选择器：获取侧边栏状态
 */
export const useIsSidebarOpen = () => useUIStore(state => state.isSidebarOpen);

/**
 * Hook：使用模态框
 */
export function useModal(type: ModalType) {
  const { openModal, closeModal, isModalOpen, getModalData } = useUIStore();

  return {
    isOpen: isModalOpen(type),
    open: (data?: unknown) => openModal(type, data),
    close: () => closeModal(type),
    data: getModalData(type),
  };
}

/**
 * Hook：使用通知
 */
export function useNotification() {
  const { addNotification } = useUIStore();

  return {
    success: (title: string, message: string, duration?: number) =>
      addNotification({ type: NotificationType.SUCCESS, title, message, duration }),

    error: (title: string, message: string, duration?: number) =>
      addNotification({ type: NotificationType.ERROR, title, message, duration }),

    warning: (title: string, message: string, duration?: number) =>
      addNotification({ type: NotificationType.WARNING, title, message, duration }),

    info: (title: string, message: string, duration?: number) =>
      addNotification({ type: NotificationType.INFO, title, message, duration }),
  };
}
