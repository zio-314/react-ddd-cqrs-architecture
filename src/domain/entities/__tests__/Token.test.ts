/**
 * 单元测试：Token 实体
 * Unit Test: Token Entity
 */

import { Token } from '../Token';
import { ITokenRaw } from '@/types';
import { ValidationError } from '../../errors/DomainError';

describe('Token Entity (充血模型)', () => {
  // 测试数据
  const validRaw: ITokenRaw = {
    address: '0x0000000000000000000000000000000000000001',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    icon: 'https://example.com/eth.png',
    price: '2000',
    change: '+5.2%',
    volume: '$1M',
    liquidity: '$5M',
    positive: true,
  };

  describe('⭐ fromRaw 工厂方法 (Factory Method)', () => {
    it('应该成功创建有效的 Token', () => {
      const token = Token.fromRaw(validRaw);

      expect(token.address).toBe(validRaw.address.toLowerCase());
      expect(token.symbol).toBe(validRaw.symbol);
      expect(token.name).toBe(validRaw.name);
      expect(token.decimals).toBe(validRaw.decimals);
      expect(token.logo).toBe(validRaw.icon);
      expect(token.price).toBe(validRaw.price);
      expect(token.change).toBe(validRaw.change);
      expect(token.volume).toBe(validRaw.volume);
      expect(token.liquidity).toBe(validRaw.liquidity);
      expect(token.positive).toBe(validRaw.positive);
    });

    it('应该规范化地址为小写', () => {
      const upperCaseRaw: ITokenRaw = {
        ...validRaw,
        address: '0xABCDEF0123456789ABCDEF0123456789ABCDEF01',
      };
      const token = Token.fromRaw(upperCaseRaw);

      expect(token.address).toBe(upperCaseRaw.address.toLowerCase());
    });
  });

  describe('业务规则验证 (Business Rules Validation)', () => {
    it('应该拒绝空地址', () => {
      expect(() => Token.fromRaw({ ...validRaw, address: '0x' })).toThrow(ValidationError);
    });

    it('应该拒绝空 symbol', () => {
      expect(() => Token.fromRaw({ ...validRaw, symbol: '' })).toThrow(ValidationError);
    });

    it('应该拒绝空白 symbol', () => {
      expect(() => Token.fromRaw({ ...validRaw, symbol: '   ' })).toThrow(ValidationError);
    });

    it('应该拒绝空 name', () => {
      expect(() => Token.fromRaw({ ...validRaw, name: '' })).toThrow(ValidationError);
    });

    it('应该拒绝空白 name', () => {
      expect(() => Token.fromRaw({ ...validRaw, name: '   ' })).toThrow(ValidationError);
    });

    it('应该拒绝负数 decimals', () => {
      expect(() => Token.fromRaw({ ...validRaw, decimals: -1 })).toThrow(ValidationError);
    });

    it('应该拒绝超过 18 的 decimals', () => {
      expect(() => Token.fromRaw({ ...validRaw, decimals: 19 })).toThrow(ValidationError);
    });

    it('应该接受边界值 decimals (0)', () => {
      expect(() => Token.fromRaw({ ...validRaw, decimals: 0 })).not.toThrow();
    });

    it('应该接受边界值 decimals (18)', () => {
      expect(() => Token.fromRaw({ ...validRaw, decimals: 18 })).not.toThrow();
    });
  });

  describe('⭐ 业务方法 (Business Methods)', () => {
    describe('shortAddress', () => {
      it('应该返回简短地址格式', () => {
        const token = Token.fromRaw({
          ...validRaw,
          address: '0x1234567890123456789012345678901234567890',
        });

        expect(token.shortAddress).toBe('0x1234...7890');
      });
    });

    describe('iconURL', () => {
      it('应该返回 logo URL', () => {
        const token = Token.fromRaw(validRaw);

        expect(token.iconURL).toBe(validRaw.icon);
      });

      it('应该返回空字符串当 logo 不存在时', () => {
        const token = Token.fromRaw({ ...validRaw, icon: '' });

        expect(token.iconURL).toBe('');
      });
    });

    describe('nameFormatted', () => {
      it('应该格式化 USDCe 为 USDC.e', () => {
        const token = Token.fromRaw({ ...validRaw, name: 'USDCe', symbol: 'USDCe', decimals: 6 });

        expect(token.nameFormatted).toBe('USDC.e');
      });

      it('应该保持其他名称不变', () => {
        const token = Token.fromRaw(validRaw);

        expect(token.nameFormatted).toBe(validRaw.name);
      });
    });

    describe('isETH', () => {
      it('应该识别 ETH', () => {
        const token = Token.fromRaw({ ...validRaw, symbol: 'ETH', name: 'Ethereum' });

        expect(token.isETH).toBe(true);
      });

      it('应该识别 WETH', () => {
        const token = Token.fromRaw({ ...validRaw, symbol: 'WETH', name: 'Wrapped Ether' });

        expect(token.isETH).toBe(true);
      });

      it('应该拒绝其他代币', () => {
        const token = Token.fromRaw({ ...validRaw, symbol: 'USDC', name: 'USD Coin', decimals: 6 });

        expect(token.isETH).toBe(false);
      });
    });

    describe('isNative', () => {
      it('应该识别原生代币', () => {
        const ethToken = Token.fromRaw({ ...validRaw, symbol: 'ETH' });
        const wethToken = Token.fromRaw({ ...validRaw, symbol: 'WETH' });

        expect(ethToken.isNative()).toBe(true);
        expect(wethToken.isNative()).toBe(true);
      });

      it('应该拒绝非原生代币', () => {
        const token = Token.fromRaw({ ...validRaw, symbol: 'USDC', decimals: 6 });

        expect(token.isNative()).toBe(false);
      });
    });
  });

  describe('⭐ 值对象方法 (Value Object Methods)', () => {
    describe('equals', () => {
      it('应该识别相同地址的代币', () => {
        const token1 = Token.fromRaw({ ...validRaw, symbol: 'ETH', name: 'Ethereum' });
        const token2 = Token.fromRaw({ ...validRaw, symbol: 'WETH', name: 'Wrapped Ether' });

        expect(token1.equals(token2)).toBe(true);
      });

      it('应该识别不同地址的代币', () => {
        const token1 = Token.fromRaw({
          ...validRaw,
          address: '0x0000000000000000000000000000000000000001',
        });
        const token2 = Token.fromRaw({
          ...validRaw,
          address: '0x0000000000000000000000000000000000000002',
        });

        expect(token1.equals(token2)).toBe(false);
      });

      it('应该忽略地址大小写', () => {
        const token1 = Token.fromRaw({
          ...validRaw,
          address: '0xABCDEF0123456789ABCDEF0123456789ABCDEF01',
        });
        const token2 = Token.fromRaw({
          ...validRaw,
          address: '0xabcdef0123456789abcdef0123456789abcdef01',
        });

        expect(token1.equals(token2)).toBe(true);
      });
    });
  });

  describe('序列化方法 (Serialization Methods)', () => {
    describe('toObject', () => {
      it('应该转换为普通对象', () => {
        const token = Token.fromRaw(validRaw);

        const obj = token.toObject();

        expect(obj).toEqual({
          address: validRaw.address.toLowerCase(),
          symbol: validRaw.symbol,
          name: validRaw.name,
          decimals: validRaw.decimals,
          logo: validRaw.icon,
          price: validRaw.price,
          change: validRaw.change,
          volume: validRaw.volume,
          liquidity: validRaw.liquidity,
          positive: validRaw.positive,
        });
      });
    });

    describe('fromObject', () => {
      it('应该从普通对象创建 Token 实例', () => {
        const obj = {
          address: validRaw.address as `0x${string}`,
          symbol: validRaw.symbol,
          name: validRaw.name,
          decimals: validRaw.decimals,
          logo: validRaw.icon,
        };

        const token = Token.fromObject(obj);

        expect(token).toBeInstanceOf(Token);
        expect(token.address).toBe(validRaw.address.toLowerCase());
        expect(token.symbol).toBe(validRaw.symbol);
        expect(token.logo).toBe(validRaw.icon);
      });
    });
  });

  describe('⭐ 不可变性 (Immutability)', () => {
    describe('withPrice', () => {
      it('应该返回新的 Token 实例', () => {
        const token1 = Token.fromRaw(validRaw);
        const token2 = token1.withPrice('3000');

        expect(token2).not.toBe(token1);
        expect(token1.price).toBe(validRaw.price);
        expect(token2.price).toBe('3000');
      });

      it('应该保留其他字段', () => {
        const token1 = Token.fromRaw(validRaw);
        const token2 = token1.withPrice('3000');

        expect(token2.symbol).toBe(validRaw.symbol);
        expect(token2.name).toBe(validRaw.name);
        expect(token2.logo).toBe(validRaw.icon);
        expect(token2.price).toBe('3000');
      });
    });
  });
});
