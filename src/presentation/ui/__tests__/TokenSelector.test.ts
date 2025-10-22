/**
 * 单元测试：TokenSelector 组件
 * Unit Test: TokenSelector Component
 *
 * 测试 token 选择器的弹窗打开/关闭逻辑
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TokenSelector } from '../TokenSelector';
import { IToken } from '@/domain/entities/Token';

// Mock useTokens hook
jest.mock('@/application/hooks/useTokens', () => ({
  useTokens: jest.fn(() => ({
    tokens: [
      {
        address: '0x1111111111111111111111111111111111111111',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logo: undefined,
      },
      {
        address: '0x2222222222222222222222222222222222222222',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        logo: undefined,
      },
    ],
    isLoading: false,
  })),
}));

describe('TokenSelector Component', () => {
  const mockToken: IToken = {
    address: '0x1111111111111111111111111111111111111111',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  };

  const mockOnSelectToken = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该在选择 token 后关闭弹窗', async () => {
    const { getByText, queryByText } = render(
      React.createElement(TokenSelector, {
        selectedToken: undefined,
        onSelectToken: mockOnSelectToken,
        label: '选择代币',
      })
    );

    // 打开弹窗
    const triggerButton = getByText('选择代币');
    fireEvent.click(triggerButton);

    // 等待弹窗打开
    await waitFor(() => {
      expect(getByText('Select a token')).toBeInTheDocument();
    });

    // 点击 token
    const tokenButton = getByText('USDC');
    fireEvent.click(tokenButton);

    // 验证回调被调用
    expect(mockOnSelectToken).toHaveBeenCalled();

    // 等待弹窗关闭
    await waitFor(() => {
      expect(queryByText('Select a token')).not.toBeInTheDocument();
    });
  });

  it('应该在选择 token 后清空搜索框', async () => {
    const { getByText, getByPlaceholderText, queryByPlaceholderText } = render(
      React.createElement(TokenSelector, {
        selectedToken: undefined,
        onSelectToken: mockOnSelectToken,
        label: '选择代币',
      })
    );

    // 打开弹窗
    const triggerButton = getByText('选择代币');
    fireEvent.click(triggerButton);

    // 等待弹窗打开
    await waitFor(() => {
      expect(getByPlaceholderText('Search tokens')).toBeInTheDocument();
    });

    // 输入搜索文本
    const searchInput = getByPlaceholderText('Search tokens') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'USD' } });

    expect(searchInput.value).toBe('USD');

    // 点击 token
    const tokenButton = getByText('USDC');
    fireEvent.click(tokenButton);

    // 等待弹窗关闭
    await waitFor(() => {
      expect(queryByPlaceholderText('Search tokens')).not.toBeInTheDocument();
    });
  });

  it('应该在点击触发按钮时打开弹窗', async () => {
    const { getByText, queryByText } = render(
      React.createElement(TokenSelector, {
        selectedToken: undefined,
        onSelectToken: mockOnSelectToken,
        label: '选择代币',
      })
    );

    // 初始状态下弹窗应该关闭
    expect(queryByText('Select a token')).not.toBeInTheDocument();

    // 点击触发按钮
    const triggerButton = getByText('选择代币');
    fireEvent.click(triggerButton);

    // 等待弹窗打开
    await waitFor(() => {
      expect(getByText('Select a token')).toBeInTheDocument();
    });
  });

  it('应该显示已选择的 token', () => {
    const { getByText } = render(
      React.createElement(TokenSelector, {
        selectedToken: mockToken,
        onSelectToken: mockOnSelectToken,
        label: '选择代币',
      })
    );

    // 应该显示已选择的 token 符号
    expect(getByText('USDC')).toBeInTheDocument();
  });
});

