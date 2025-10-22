/**
 * 领域错误基类
 * Domain Error Base Class
 *
 * 所有领域错误都应该继承此类
 */

/**
 * 领域错误基类
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    // 保持正确的原型链
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * 验证错误
 * 当输入数据不符合业务规则时抛出
 */
export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
  ) {
    super(message);
  }
}

/**
 * 业务规则错误
 * 当违反业务规则时抛出
 */
export class BusinessRuleError extends DomainError {
  constructor(
    message: string,
    public readonly rule?: string,
  ) {
    super(message);
  }
}

/**
 * 实体未找到错误
 * 当查询的实体不存在时抛出
 */
export class EntityNotFoundError extends DomainError {
  constructor(
    public readonly entityName: string,
    public readonly identifier: string | number,
  ) {
    super(`${entityName} with identifier ${identifier} not found`);
  }
}

/**
 * 不足余额错误
 * 当用户余额不足时抛出
 */
export class InsufficientBalanceError extends DomainError {
  constructor(
    public readonly required: string,
    public readonly available: string,
    public readonly token: string,
  ) {
    super(`Insufficient ${token} balance. Required: ${required}, Available: ${available}`);
  }
}

/**
 * 滑点超限错误
 * 当价格滑点超过用户设置时抛出
 */
export class SlippageExceededError extends DomainError {
  constructor(
    public readonly expected: string,
    public readonly actual: string,
    public readonly slippage: string,
  ) {
    super(
      `Slippage exceeded. Expected: ${expected}, Actual: ${actual}, Max slippage: ${slippage}%`,
    );
  }
}

/**
 * 交易失败错误
 * 当区块链交易失败时抛出
 */
export class TransactionFailedError extends DomainError {
  constructor(
    message: string,
    public readonly txHash?: string,
    public readonly reason?: string,
  ) {
    super(message);
  }
}

/**
 * 网络错误
 * 当网络请求失败时抛出
 */
export class NetworkError extends DomainError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly endpoint?: string,
  ) {
    super(message);
  }
}

/**
 * 合约错误
 * 当智能合约调用失败时抛出
 */
export class ContractError extends DomainError {
  constructor(
    message: string,
    public readonly contractAddress?: string,
    public readonly method?: string,
    public readonly reason?: string,
  ) {
    super(message);
  }
}

/**
 * 未授权错误
 * 当用户未授权操作时抛出
 */
export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized operation') {
    super(message);
  }
}

/**
 * 配置错误
 * 当配置不正确时抛出
 */
export class ConfigurationError extends DomainError {
  constructor(
    message: string,
    public readonly configKey?: string,
  ) {
    super(message);
  }
}
