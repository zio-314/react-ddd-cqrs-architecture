/**
 * 错误处理器
 * Error Handler
 *
 * 统一的错误处理和转换逻辑
 */

import {
  DomainError,
  ValidationError,
  BusinessRuleError,
  EntityNotFoundError,
  InsufficientBalanceError,
  SlippageExceededError,
  TransactionFailedError,
  NetworkError,
  ContractError,
  UnauthorizedError,
  ConfigurationError,
} from '@/domain/errors/DomainError';

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  /**
   * 处理错误并转换为用户友好的消息
   */
  static handle(error: unknown): ErrorInfo {
    // 领域错误
    if (error instanceof DomainError) {
      return this.handleDomainError(error);
    }

    // 标准错误
    if (error instanceof Error) {
      return {
        type: 'Error',
        message: error.message,
        stack: error.stack ?? '',
      };
    }

    // 未知错误
    return {
      type: 'UnknownError',
      message: String(error),
    };
  }

  /**
   * 处理领域错误
   */
  private static handleDomainError(error: DomainError): ErrorInfo {
    if (error instanceof ValidationError) {
      return {
        type: 'ValidationError',
        message: error.message,
        details: {
          field: error.field,
          value: error.value,
        },
      };
    }

    if (error instanceof BusinessRuleError) {
      return {
        type: 'BusinessRuleError',
        message: error.message,
        details: {
          rule: error.rule,
        },
      };
    }

    if (error instanceof EntityNotFoundError) {
      return {
        type: 'EntityNotFoundError',
        message: error.message,
        details: {
          entityName: error.entityName,
          identifier: error.identifier,
        },
      };
    }

    if (error instanceof InsufficientBalanceError) {
      return {
        type: 'InsufficientBalanceError',
        message: error.message,
        details: {
          required: error.required,
          available: error.available,
          token: error.token,
        },
      };
    }

    if (error instanceof SlippageExceededError) {
      return {
        type: 'SlippageExceededError',
        message: error.message,
        details: {
          expected: error.expected,
          actual: error.actual,
          slippage: error.slippage,
        },
      };
    }

    if (error instanceof TransactionFailedError) {
      return {
        type: 'TransactionFailedError',
        message: error.message,
        details: {
          txHash: error.txHash,
          reason: error.reason,
        },
      };
    }

    if (error instanceof NetworkError) {
      return {
        type: 'NetworkError',
        message: error.message,
        details: {
          statusCode: error.statusCode,
          endpoint: error.endpoint,
        },
      };
    }

    if (error instanceof ContractError) {
      return {
        type: 'ContractError',
        message: error.message,
        details: {
          contractAddress: error.contractAddress,
          method: error.method,
          reason: error.reason,
        },
      };
    }

    if (error instanceof UnauthorizedError) {
      return {
        type: 'UnauthorizedError',
        message: error.message,
      };
    }

    if (error instanceof ConfigurationError) {
      return {
        type: 'ConfigurationError',
        message: error.message,
        details: {
          configKey: error.configKey,
        },
      };
    }

    // 其他领域错误
    return {
      type: error.constructor.name,
      message: error.message,
    };
  }

  /**
   * 获取用户友好的错误消息
   */
  static getUserMessage(error: unknown): string {
    const errorInfo = this.handle(error);

    // 根据错误类型返回用户友好的消息
    switch (errorInfo.type) {
      case 'ValidationError':
        return `Invalid input: ${errorInfo.message}`;

      case 'BusinessRuleError':
        return errorInfo.message;

      case 'EntityNotFoundError':
        return errorInfo.message;

      case 'InsufficientBalanceError':
        return errorInfo.message;

      case 'SlippageExceededError':
        return 'Price changed too much. Please try again with higher slippage tolerance.';

      case 'TransactionFailedError':
        return `Transaction failed: ${errorInfo.message}`;

      case 'NetworkError':
        return 'Network error. Please check your connection and try again.';

      case 'ContractError':
        return `Contract error: ${errorInfo.message}`;

      case 'UnauthorizedError':
        return 'Please connect your wallet to continue.';

      case 'ConfigurationError':
        return 'Configuration error. Please contact support.';

      default:
        return errorInfo.message || 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * 记录错误到控制台
   */
  static log(error: unknown, context?: string): void {
    const errorInfo = this.handle(error);

    console.error(`[${context || 'Error'}]`, errorInfo.type, errorInfo.message, errorInfo.details);

    if (errorInfo.stack) {
      console.error('Stack trace:', errorInfo.stack);
    }
  }

  /**
   * 判断是否为可重试的错误
   */
  static isRetryable(error: unknown): boolean {
    const errorInfo = this.handle(error);

    // 网络错误和某些合约错误可以重试
    return (
      errorInfo.type === 'NetworkError' ||
      (errorInfo.type === 'ContractError' &&
        errorInfo.details?.['reason'] !== 'user rejected transaction')
    );
  }

  /**
   * 判断是否需要用户操作
   */
  static requiresUserAction(error: unknown): boolean {
    const errorInfo = this.handle(error);

    // 这些错误需要用户采取行动
    return (
      errorInfo.type === 'ValidationError' ||
      errorInfo.type === 'InsufficientBalanceError' ||
      errorInfo.type === 'SlippageExceededError' ||
      errorInfo.type === 'UnauthorizedError'
    );
  }
}

/**
 * 错误处理 Hook 辅助函数
 */
export function handleError(error: unknown, context?: string): string {
  ErrorHandler.log(error, context);
  return ErrorHandler.getUserMessage(error);
}
