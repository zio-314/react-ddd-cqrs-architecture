/**
 * 智能合约地址常量
 * Smart Contract Addresses
 *
 * 使用 as const 确保类型安全
 */
export const CONTRACT_ADDRESSES = {
  BTC: '0x6267CadFaB5Acbe6059C0Fa9eaF4033552fbB699' as const,
  ETH: '0x0e53A1e35cAfe2d7Ae3C9640f6FA264CAFa94168' as const,
  Foo: '0x5FA42885F30e488F237b4edfF4AF16FaEB857abB' as const,
  TokenA: '0x77e3aE90446Ab3227499AF85aAc32A030f62a6fD' as const,
  TokenB: '0x5Ea395cC8b737adb7473C508d210782ED74e13e5' as const,
  USDC: '0x39178499db768d39AB2Bac060462B2B0D51C011C' as const,
  USDT: '0xaBCaba07136B2928c42023ec414D5cFA3938ABEc' as const,
  UniswapV2Factory: '0x12BC03f10EE64E3b9ba9ce4CA1C334eB3D33967c' as const,
  UniswapV2Router: '0xED22d3Faeef6096300D12148d1BD0a9c6E00B01A' as const,
} as const;

/**
 * 合约名称类型
 */
export type ContractName = keyof typeof CONTRACT_ADDRESSES;

/**
 * 合约地址类型
 */
export type ContractAddress = (typeof CONTRACT_ADDRESSES)[ContractName];

/**
 * 地址映射（向后兼容）
 * @deprecated 请使用 CONTRACT_ADDRESSES
 */
export const addressMap = CONTRACT_ADDRESSES;
