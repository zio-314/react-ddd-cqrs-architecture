/**
 * 单元测试：流动性验证器
 * Unit Test: Liquidity Validators
 *
 * 测试流动性表单验证 Schema
 */

import {
  addLiquidityFormSchema,
  removeLiquidityFormSchema,
  type AddLiquidityFormValues,
  type RemoveLiquidityFormValues,
} from '../liquidity';

describe('Liquidity Validators', () => {
  describe('addLiquidityFormSchema', () => {
    const validTokenA = {
      address: '0x1111111111111111111111111111111111111111' as `0x${string}`,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    };

    const validTokenB = {
      address: '0x2222222222222222222222222222222222222222' as `0x${string}`,
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
    };

    describe('有效数据 (Valid Data)', () => {
      it('应该验证有效的 AddLiquidity 表单数据', () => {
        const validData: AddLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          amountA: '100',
          amountB: '50',
          slippage: '0.5',
        };

        const result = addLiquidityFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      it('应该接受零滑点', () => {
        const validData: AddLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          amountA: '100',
          amountB: '50',
          slippage: '0',
        };

        const result = addLiquidityFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      it('应该接受最大滑点 50%', () => {
        const validData: AddLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          amountA: '100',
          amountB: '50',
          slippage: '50',
        };

        const result = addLiquidityFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      it('应该接受小数金额', () => {
        const validData: AddLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          amountA: '0.5',
          amountB: '0.25',
          slippage: '0.5',
        };

        const result = addLiquidityFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      it('应该接受可选的 priceImpactWarning', () => {
        const validData: AddLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          amountA: '100',
          amountB: '50',
          slippage: '0.5',
          priceImpactWarning: true,
        };

        const result = addLiquidityFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });
    });

    describe('无效数据 (Invalid Data)', () => {
      it('应该拒绝无效的代币地址', () => {
        const invalidData = {
          tokenA: {
            address: 'invalid-address',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
          },
          tokenB: validTokenB,
          amountA: '100',
          amountB: '50',
          slippage: '0.5',
        };

        const result = addLiquidityFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝零金额', () => {
        const invalidData: AddLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          amountA: '0',
          amountB: '50',
          slippage: '0.5',
        };

        const result = addLiquidityFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝负数金额', () => {
        const invalidData: AddLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          amountA: '-100',
          amountB: '50',
          slippage: '0.5',
        };

        const result = addLiquidityFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝超过 50% 的滑点', () => {
        const invalidData: AddLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          amountA: '100',
          amountB: '50',
          slippage: '51',
        };

        const result = addLiquidityFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝负数滑点', () => {
        const invalidData: AddLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          amountA: '100',
          amountB: '50',
          slippage: '-0.5',
        };

        const result = addLiquidityFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝无效的小数位数', () => {
        const invalidData = {
          tokenA: {
            address: '0x1111111111111111111111111111111111111111',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 19, // 超过最大值 18
          },
          tokenB: validTokenB,
          amountA: '100',
          amountB: '50',
          slippage: '0.5',
        };

        const result = addLiquidityFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });
    });
  });

  describe('removeLiquidityFormSchema', () => {
    const validTokenA = {
      address: '0x1111111111111111111111111111111111111111' as `0x${string}`,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    };

    const validTokenB = {
      address: '0x2222222222222222222222222222222222222222' as `0x${string}`,
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
    };

    describe('有效数据 (Valid Data)', () => {
      it('应该验证有效的 RemoveLiquidity 表单数据', () => {
        const validData: RemoveLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          liquidity: '100',
          percentage: 50,
          slippage: '0.5',
        };

        const result = removeLiquidityFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      it('应该接受 0% 百分比', () => {
        const validData: RemoveLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          liquidity: '100',
          percentage: 0,
          slippage: '0.5',
        };

        const result = removeLiquidityFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      it('应该接受 100% 百分比', () => {
        const validData: RemoveLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          liquidity: '100',
          percentage: 100,
          slippage: '0.5',
        };

        const result = removeLiquidityFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });
    });

    describe('无效数据 (Invalid Data)', () => {
      it('应该拒绝超过 100% 的百分比', () => {
        const invalidData: RemoveLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          liquidity: '100',
          percentage: 101,
          slippage: '0.5',
        };

        const result = removeLiquidityFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝负数百分比', () => {
        const invalidData: RemoveLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          liquidity: '100',
          percentage: -1,
          slippage: '0.5',
        };

        const result = removeLiquidityFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝零流动性', () => {
        const invalidData: RemoveLiquidityFormValues = {
          tokenA: validTokenA,
          tokenB: validTokenB,
          liquidity: '0',
          percentage: 50,
          slippage: '0.5',
        };

        const result = removeLiquidityFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });
    });
  });
});

