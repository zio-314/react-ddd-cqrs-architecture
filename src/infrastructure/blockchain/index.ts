/**
 * Blockchain Infrastructure
 * 区块链基础设施
 *
 * 统一导出区块链相关配置和工具
 */

// Wagmi 配置
export { config, getConfig } from './wagmi.config';

// 合约地址
export { CONTRACT_ADDRESSES } from './contracts';
export type { ContractName, ContractAddress } from './contracts';

// ABI
export * from './abi';

