/**
 * 全局状态管理：代币选择
 * Global State Management: Token Selection
 *
 * 使用 Zustand + combine 中间件管理用户选择的代币和常用代币
 */

import { create } from 'zustand';
import { persist, createJSONStorage, combine } from 'zustand/middleware';
import { Token, IToken } from '@/domain/entities/Token';

/**
 * 代币选择 Store
 *
 * 使用 combine 中间件自动推导类型，无需手动定义接口
 *
 * ⭐ 注意：因为需要持久化，这里存储 IToken 接口（普通对象）
 * 使用时通过 Token.fromObject() 转换为 Token 类实例
 */
export const useTokenSelectionStore = create(
  persist(
    combine(
      // 初始状态
      {
        recentTokens: [] as IToken[], // 最近使用的代币
        favoriteTokens: [] as IToken[], // 收藏的代币
        customTokens: [] as IToken[], // 自定义添加的代币
      },
      // Actions
      (set, get) => ({
        // 添加最近使用的代币
        addRecentToken: (token: IToken) =>
          set(state => {
            // 防御性检查：确保 token 和 address 存在
            if (!token || !token.address) {
              console.warn('Invalid token: missing address', token);
              return state;
            }

            // 移除重复的代币
            const filtered = state.recentTokens.filter(
              t => t.address?.toLowerCase() !== token.address.toLowerCase(),
            );

            // 添加到开头，最多保留 10 个
            return {
              recentTokens: [token, ...filtered].slice(0, 10),
            };
          }),

        // 清空最近使用的代币
        clearRecentTokens: () => set({ recentTokens: [] }),

        // 添加收藏代币
        addFavoriteToken: (token: IToken) =>
          set(state => {
            // 防御性检查：确保 token 和 address 存在
            if (!token || !token.address) {
              console.warn('Invalid token: missing address', token);
              return state;
            }

            // 检查是否已存在
            const exists = state.favoriteTokens.some(
              t => t.address?.toLowerCase() === token.address.toLowerCase(),
            );

            if (exists) return state;

            return {
              favoriteTokens: [...state.favoriteTokens, token],
            };
          }),

        // 移除收藏代币
        removeFavoriteToken: (address: string) =>
          set(state => ({
            favoriteTokens: state.favoriteTokens.filter(
              t => t.address?.toLowerCase() !== address.toLowerCase(),
            ),
          })),

        // 检查是否为收藏代币
        isFavoriteToken: (address: string) => {
          return get().favoriteTokens.some(t => t.address?.toLowerCase() === address.toLowerCase());
        },

        // 切换收藏状态
        toggleFavoriteToken: (token: IToken) =>
          set(state => {
            // 防御性检查：确保 token 和 address 存在
            if (!token || !token.address) {
              console.warn('Invalid token: missing address', token);
              return state;
            }

            const exists = state.favoriteTokens.some(
              t => t.address?.toLowerCase() === token.address.toLowerCase(),
            );

            if (exists) {
              // 移除
              return {
                favoriteTokens: state.favoriteTokens.filter(
                  t => t.address?.toLowerCase() !== token.address.toLowerCase(),
                ),
              };
            } else {
              // 添加
              return {
                favoriteTokens: [...state.favoriteTokens, token],
              };
            }
          }),

        // 添加自定义代币
        addCustomToken: (token: IToken) =>
          set(state => {
            // 防御性检查：确保 token 和 address 存在
            if (!token || !token.address) {
              console.warn('Invalid token: missing address', token);
              return state;
            }

            // 检查是否已存在
            const exists = state.customTokens.some(
              t => t.address?.toLowerCase() === token.address.toLowerCase(),
            );

            if (exists) return state;

            return {
              customTokens: [...state.customTokens, token],
            };
          }),

        // 移除自定义代币
        removeCustomToken: (address: string) =>
          set(state => ({
            customTokens: state.customTokens.filter(
              t => t.address?.toLowerCase() !== address.toLowerCase(),
            ),
          })),

        // 检查是否为自定义代币
        isCustomToken: (address: string) => {
          return get().customTokens.some(t => t.address?.toLowerCase() === address.toLowerCase());
        },

        // 获取所有代币（收藏 + 自定义）
        getAllTokens: () => {
          const { favoriteTokens, customTokens } = get();

          // 合并并去重
          const allTokens = [...favoriteTokens, ...customTokens];
          const uniqueTokens = allTokens.filter(
            (token, index, self) =>
              token.address &&
              index ===
                self.findIndex(t => t.address?.toLowerCase() === token.address.toLowerCase()),
          );

          return uniqueTokens;
        },

        // 根据地址获取代币
        getTokenByAddress: (address: string) => {
          const { recentTokens, favoriteTokens, customTokens } = get();

          const allTokens = [...recentTokens, ...favoriteTokens, ...customTokens];

          return allTokens.find(t => t.address?.toLowerCase() === address.toLowerCase());
        },
      }),
    ),
    {
      name: 'token-selection-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/**
 * 选择器：获取最近使用的代币
 */
export const useRecentTokens = () => useTokenSelectionStore(state => state.recentTokens);

/**
 * 选择器：获取收藏的代币
 */
export const useFavoriteTokens = () => useTokenSelectionStore(state => state.favoriteTokens);

/**
 * 选择器：获取自定义代币
 */
export const useCustomTokens = () => useTokenSelectionStore(state => state.customTokens);

/**
 * 选择器：检查是否为收藏代币
 */
export const useIsFavoriteToken = (address: string) =>
  useTokenSelectionStore(state =>
    state.favoriteTokens.some(t => t.address?.toLowerCase() === address.toLowerCase()),
  );
