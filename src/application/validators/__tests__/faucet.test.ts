/**
 * 单元测试：水龙头验证器
 * Unit Test: Faucet Validators
 *
 * 测试水龙头表单验证 Schema
 */

import {
  faucetFormSchema,
  FAUCET_TOKENS,
  FaucetTransactionStatus,
  type FaucetFormValues,
} from '../faucet';

describe('Faucet Validators', () => {
  describe('faucetFormSchema', () => {
    describe('有效数据 (Valid Data)', () => {
      it('应该验证有效的 Faucet 表单数据', () => {
        const validData: FaucetFormValues = {
          token: 'USDC',
          amount: '100',
          recipientAddress: '0x1234567890123456789012345678901234567890',
        };

        const result = faucetFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      it('应该接受所有有效的代币', () => {
        const tokens: Array<'BTC' | 'ETH' | 'USDC' | 'USDT'> = ['BTC', 'ETH', 'USDC', 'USDT'];

        for (const token of tokens) {
          const validData: FaucetFormValues = {
            token,
            amount: '100',
            recipientAddress: '0x1234567890123456789012345678901234567890',
          };

          const result = faucetFormSchema.safeParse(validData);

          expect(result.success).toBe(true);
        }
      });

      it('应该接受小数金额', () => {
        const validData: FaucetFormValues = {
          token: 'USDC',
          amount: '0.5',
          recipientAddress: '0x1234567890123456789012345678901234567890',
        };

        const result = faucetFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      it('应该接受最大金额 10000', () => {
        const validData: FaucetFormValues = {
          token: 'USDC',
          amount: '10000',
          recipientAddress: '0x1234567890123456789012345678901234567890',
        };

        const result = faucetFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      it('应该接受有效的以太坊地址（小写）', () => {
        const validData: FaucetFormValues = {
          token: 'USDC',
          amount: '100',
          recipientAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        };

        const result = faucetFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      it('应该接受有效的以太坊地址（大写）', () => {
        const validData: FaucetFormValues = {
          token: 'USDC',
          amount: '100',
          recipientAddress: '0xABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD',
        };

        const result = faucetFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });

      it('应该接受有效的以太坊地址（混合大小写）', () => {
        const validData: FaucetFormValues = {
          token: 'USDC',
          amount: '100',
          recipientAddress: '0xAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCd',
        };

        const result = faucetFormSchema.safeParse(validData);

        expect(result.success).toBe(true);
      });
    });

    describe('无效数据 (Invalid Data)', () => {
      it('应该拒绝无效的代币', () => {
        const invalidData = {
          token: 'INVALID',
          amount: '100',
          recipientAddress: '0x1234567890123456789012345678901234567890',
        };

        const result = faucetFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝空金额', () => {
        const invalidData: FaucetFormValues = {
          token: 'USDC',
          amount: '',
          recipientAddress: '0x1234567890123456789012345678901234567890',
        };

        const result = faucetFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝零金额', () => {
        const invalidData: FaucetFormValues = {
          token: 'USDC',
          amount: '0',
          recipientAddress: '0x1234567890123456789012345678901234567890',
        };

        const result = faucetFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝负数金额', () => {
        const invalidData: FaucetFormValues = {
          token: 'USDC',
          amount: '-100',
          recipientAddress: '0x1234567890123456789012345678901234567890',
        };

        const result = faucetFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝超过 10000 的金额', () => {
        const invalidData: FaucetFormValues = {
          token: 'USDC',
          amount: '10001',
          recipientAddress: '0x1234567890123456789012345678901234567890',
        };

        const result = faucetFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝非数字金额', () => {
        const invalidData: FaucetFormValues = {
          token: 'USDC',
          amount: 'abc',
          recipientAddress: '0x1234567890123456789012345678901234567890',
        };

        const result = faucetFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝无效的以太坊地址', () => {
        const invalidData: FaucetFormValues = {
          token: 'USDC',
          amount: '100',
          recipientAddress: 'invalid-address',
        };

        const result = faucetFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝不带 0x 前缀的地址', () => {
        const invalidData: FaucetFormValues = {
          token: 'USDC',
          amount: '100',
          recipientAddress: '1234567890123456789012345678901234567890',
        };

        const result = faucetFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝地址长度不正确', () => {
        const invalidData: FaucetFormValues = {
          token: 'USDC',
          amount: '100',
          recipientAddress: '0x123456789012345678901234567890123456789',
        };

        const result = faucetFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝包含非十六进制字符的地址', () => {
        const invalidData: FaucetFormValues = {
          token: 'USDC',
          amount: '100',
          recipientAddress: '0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
        };

        const result = faucetFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });

      it('应该拒绝空的收件人地址', () => {
        const invalidData: FaucetFormValues = {
          token: 'USDC',
          amount: '100',
          recipientAddress: '',
        };

        const result = faucetFormSchema.safeParse(invalidData);

        expect(result.success).toBe(false);
      });
    });
  });

  describe('FAUCET_TOKENS 配置', () => {
    it('应该包含所有必需的代币', () => {
      expect(FAUCET_TOKENS).toHaveProperty('BTC');
      expect(FAUCET_TOKENS).toHaveProperty('ETH');
      expect(FAUCET_TOKENS).toHaveProperty('USDC');
      expect(FAUCET_TOKENS).toHaveProperty('USDT');
    });

    it('每个代币应该有正确的属性', () => {
      for (const [symbol, token] of Object.entries(FAUCET_TOKENS)) {
        expect(token).toHaveProperty('address');
        expect(token).toHaveProperty('symbol');
        expect(token).toHaveProperty('name');
        expect(token).toHaveProperty('decimals');
        expect(token).toHaveProperty('defaultAmount');

        expect(token.symbol).toBe(symbol);
        expect(typeof token.address).toBe('string');
        expect(typeof token.name).toBe('string');
        expect(typeof token.decimals).toBe('number');
        expect(typeof token.defaultAmount).toBe('string');
      }
    });

    it('BTC 应该有正确的配置', () => {
      expect(FAUCET_TOKENS.BTC.symbol).toBe('BTC');
      expect(FAUCET_TOKENS.BTC.decimals).toBe(8);
      expect(FAUCET_TOKENS.BTC.defaultAmount).toBe('0.1');
    });

    it('ETH 应该有正确的配置', () => {
      expect(FAUCET_TOKENS.ETH.symbol).toBe('ETH');
      expect(FAUCET_TOKENS.ETH.decimals).toBe(18);
      expect(FAUCET_TOKENS.ETH.defaultAmount).toBe('1');
    });

    it('USDC 应该有正确的配置', () => {
      expect(FAUCET_TOKENS.USDC.symbol).toBe('USDC');
      expect(FAUCET_TOKENS.USDC.decimals).toBe(6);
      expect(FAUCET_TOKENS.USDC.defaultAmount).toBe('100');
    });

    it('USDT 应该有正确的配置', () => {
      expect(FAUCET_TOKENS.USDT.symbol).toBe('USDT');
      expect(FAUCET_TOKENS.USDT.decimals).toBe(6);
      expect(FAUCET_TOKENS.USDT.defaultAmount).toBe('100');
    });
  });

  describe('FaucetTransactionStatus 枚举', () => {
    it('应该包含所有必需的状态', () => {
      expect(FaucetTransactionStatus.IDLE).toBe('idle');
      expect(FaucetTransactionStatus.PENDING).toBe('pending');
      expect(FaucetTransactionStatus.SUCCESS).toBe('success');
      expect(FaucetTransactionStatus.ERROR).toBe('error');
    });
  });
});

