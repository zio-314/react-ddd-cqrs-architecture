/**
 * 单元测试：Swap 聚合根
 * Unit Test: Swap Aggregate Root
 */

import { Swap, SwapStatus } from '../Swap';
import { Amount } from '../../value-objects/Amount';
import { Slippage } from '../../value-objects/Slippage';
import { IToken } from '../../entities/Token';
import { ValidationError, BusinessRuleError } from '../../errors/DomainError';

describe('Swap Aggregate Root', () => {
  // 测试数据
  const tokenIn: IToken = {
    address: '0x0000000000000000000000000000000000000001' as `0x${string}`,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
  };

  const tokenOut: IToken = {
    address: '0x0000000000000000000000000000000000000002' as `0x${string}`,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  };

  const amountIn = new Amount('1', 18);
  const slippage = Slippage.fromPercent(0.5);

  describe('构造函数和验证 (Constructor and Validation)', () => {
    it('应该成功创建有效的 Swap', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);

      expect(swap.id).toBeDefined();
      expect(swap.tokenIn).toBe(tokenIn);
      expect(swap.tokenOut).toBe(tokenOut);
      expect(swap.amountIn).toBe(amountIn);
      expect(swap.slippage).toBe(slippage);
      expect(swap.status).toBe(SwapStatus.PENDING);
    });

    it('应该拒绝交换相同的代币', () => {
      expect(() => {
        new Swap(tokenIn, tokenIn, amountIn, slippage);
      }).toThrow(ValidationError);
    });

    it('应该拒绝零金额', () => {
      const zeroAmount = Amount.zero(18);
      expect(() => {
        new Swap(tokenIn, tokenOut, zeroAmount, slippage);
      }).toThrow(ValidationError);
    });

    it('应该拒绝负数金额', () => {
      const negativeAmount = new Amount('-1', 18);
      expect(() => {
        new Swap(tokenIn, tokenOut, negativeAmount, slippage);
      }).toThrow(ValidationError);
    });

    it('应该拒绝过高的滑点', () => {
      // Slippage 构造函数会先抛出错误，所以我们测试 Slippage 的验证
      expect(() => new Slippage(0.6)).toThrow();
    });

    it('应该生成唯一的 ID', () => {
      const swap1 = new Swap(tokenIn, tokenOut, amountIn, slippage);
      const swap2 = new Swap(tokenIn, tokenOut, amountIn, slippage);

      expect(swap1.id).not.toBe(swap2.id);
    });
  });

  describe('最小输出计算 (Minimum Output Calculation)', () => {
    const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);

    it('calculateMinimumOutput() 应该正确计算最小输出', () => {
      const expectedOutput = new Amount('2000', 6); // 期望 2000 USDC
      const minOutput = swap.calculateMinimumOutput(expectedOutput);

      // 0.5% 滑点，最小输出 = 2000 * (1 - 0.005) = 1990
      expect(minOutput.toNumber()).toBe(1990);
    });

    it('calculateMinimumOutput() 应该处理零滑点', () => {
      const zeroSlippageSwap = new Swap(tokenIn, tokenOut, amountIn, new Slippage(0));
      const expectedOutput = new Amount('2000', 6);
      const minOutput = zeroSlippageSwap.calculateMinimumOutput(expectedOutput);

      expect(minOutput.toNumber()).toBe(2000);
    });
  });

  describe('价格影响检查 (Price Impact Check)', () => {
    const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);

    it('checkPriceImpact() 应该接受低价格影响', () => {
      expect(() => swap.checkPriceImpact(1)).not.toThrow();
      expect(() => swap.checkPriceImpact(3)).not.toThrow();
      expect(() => swap.checkPriceImpact(5)).not.toThrow();
    });

    it('checkPriceImpact() 应该拒绝高价格影响', () => {
      expect(() => swap.checkPriceImpact(6)).toThrow(BusinessRuleError);
      expect(() => swap.checkPriceImpact(10)).toThrow(BusinessRuleError);
    });
  });

  describe('状态转换 (State Transitions)', () => {
    it('markAsExecuting() 应该将状态从 PENDING 转为 EXECUTING', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);

      expect(swap.status).toBe(SwapStatus.PENDING);
      swap.markAsExecuting();
      expect(swap.status).toBe(SwapStatus.EXECUTING);
    });

    it('markAsExecuting() 应该拒绝非 PENDING 状态的转换', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);
      swap.markAsExecuting();

      expect(() => swap.markAsExecuting()).toThrow(BusinessRuleError);
    });

    it('markAsSuccess() 应该将状态从 EXECUTING 转为 SUCCESS', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);
      swap.markAsExecuting();

      const txHash = '0x1234567890abcdef';
      const amountOut = new Amount('1990', 6);

      swap.markAsSuccess(txHash, amountOut);

      expect(swap.status).toBe(SwapStatus.SUCCESS);
      expect(swap.txHash).toBe(txHash);
      expect(swap.amountOut).toBe(amountOut);
    });

    it('markAsSuccess() 应该拒绝非 EXECUTING 状态的转换', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);
      const txHash = '0x1234567890abcdef';
      const amountOut = new Amount('1990', 6);

      expect(() => swap.markAsSuccess(txHash, amountOut)).toThrow(BusinessRuleError);
    });

    it('markAsFailed() 应该将状态从 EXECUTING 转为 FAILED', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);
      swap.markAsExecuting();

      swap.markAsFailed();

      expect(swap.status).toBe(SwapStatus.FAILED);
    });

    it('markAsFailed() 应该拒绝成功状态的转换', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);
      swap.markAsExecuting();
      swap.markAsSuccess('0x123', new Amount('1990', 6));

      expect(() => swap.markAsFailed()).toThrow(BusinessRuleError);
    });
  });

  describe('状态查询 (State Queries)', () => {
    it('canExecute() 应该正确判断是否可以执行', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);
      expect(swap.canExecute()).toBe(true);

      swap.markAsExecuting();
      expect(swap.canExecute()).toBe(false);
    });

    it('isCompleted() 应该正确判断完成状态', () => {
      const successSwap = new Swap(tokenIn, tokenOut, amountIn, slippage);
      successSwap.markAsExecuting();
      successSwap.markAsSuccess('0x123', new Amount('1990', 6));
      expect(successSwap.isCompleted()).toBe(true);

      const failedSwap = new Swap(tokenIn, tokenOut, amountIn, slippage);
      failedSwap.markAsExecuting();
      failedSwap.markAsFailed();
      expect(failedSwap.isCompleted()).toBe(true);

      const pendingSwap = new Swap(tokenIn, tokenOut, amountIn, slippage);
      expect(pendingSwap.isCompleted()).toBe(false);
    });

    it('status getter 应该返回当前状态', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);
      expect(swap.status).toBe(SwapStatus.PENDING);

      swap.markAsExecuting();
      expect(swap.status).toBe(SwapStatus.EXECUTING);

      swap.markAsSuccess('0x123', new Amount('1990', 6));
      expect(swap.status).toBe(SwapStatus.SUCCESS);
    });
  });

  describe('业务场景 (Business Scenarios)', () => {
    it('应该正确处理完整的成功交换流程', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);

      // 1. 初始状态
      expect(swap.canExecute()).toBe(true);
      expect(swap.status).toBe(SwapStatus.PENDING);

      // 2. 开始执行
      swap.markAsExecuting();
      expect(swap.status).toBe(SwapStatus.EXECUTING);

      // 3. 执行成功
      const txHash = '0xabcdef1234567890';
      const amountOut = new Amount('1990', 6);
      swap.markAsSuccess(txHash, amountOut);

      expect(swap.status).toBe(SwapStatus.SUCCESS);
      expect(swap.isCompleted()).toBe(true);
      expect(swap.txHash).toBe(txHash);
      expect(swap.amountOut).toBe(amountOut);
    });

    it('应该正确处理完整的失败交换流程', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);

      // 1. 初始状态
      expect(swap.canExecute()).toBe(true);
      expect(swap.status).toBe(SwapStatus.PENDING);

      // 2. 开始执行
      swap.markAsExecuting();
      expect(swap.status).toBe(SwapStatus.EXECUTING);

      // 3. 执行失败
      swap.markAsFailed();

      expect(swap.status).toBe(SwapStatus.FAILED);
      expect(swap.isCompleted()).toBe(true);
    });

    it('应该正确处理高滑点警告场景', () => {
      const highSlippage = Slippage.fromPercent(5); // 5% 滑点
      const swap = new Swap(tokenIn, tokenOut, amountIn, highSlippage);

      const expectedOutput = new Amount('2000', 6);
      const minOutput = swap.calculateMinimumOutput(expectedOutput);

      // 5% 滑点，最小输出 = 2000 * (1 - 0.05) = 1900
      expect(minOutput.toNumber()).toBe(1900);
    });
  });

  describe('不可变性 (Immutability)', () => {
    it('核心属性应该是只读的', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);

      // TypeScript 会在编译时阻止这些赋值，但我们可以验证 getter 返回的是原始值
      expect(swap.tokenIn).toBe(tokenIn);
      expect(swap.tokenOut).toBe(tokenOut);
      expect(swap.amountIn).toBe(amountIn);
      expect(swap.slippage).toBe(slippage);
    });

    it('状态转换应该只通过特定方法进行', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);

      // 不能直接修改状态，只能通过 markAs* 方法
      expect(swap.status).toBe(SwapStatus.PENDING);

      // 状态转换必须遵循业务规则
      expect(() => swap.markAsSuccess('0x123', new Amount('1990', 6))).toThrow();
    });
  });
});
