/**
 * 交换状态枚举
 */

export enum SwapStatus {
  /**
   * 待处理 - 交换已创建但未提交到区块链
   */
  PENDING = 'PENDING',

  /**
   * 已提交 - 交换已提交到区块链，等待确认
   */
  SUBMITTED = 'SUBMITTED',

  /**
   * 已确认 - 交换已在区块链上确认
   */
  CONFIRMED = 'CONFIRMED',

  /**
   * 已完成 - 交换已完成
   */
  COMPLETED = 'COMPLETED',

  /**
   * 已失败 - 交换失败
   */
  FAILED = 'FAILED',

  /**
   * 已取消 - 交换已被用户取消
   */
  CANCELLED = 'CANCELLED',
}

/**
 * 判断状态是否为最终状态
 */
export function isFinalStatus(status: SwapStatus): boolean {
  return [SwapStatus.COMPLETED, SwapStatus.FAILED, SwapStatus.CANCELLED].includes(status);
}

/**
 * 判断状态是否为进行中
 */
export function isInProgressStatus(status: SwapStatus): boolean {
  return [SwapStatus.PENDING, SwapStatus.SUBMITTED].includes(status);
}

/**
 * 判断状态是否为成功
 */
export function isSuccessStatus(status: SwapStatus): boolean {
  return [SwapStatus.CONFIRMED, SwapStatus.COMPLETED].includes(status);
}
