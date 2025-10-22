'use client';

/**
 * React Error Boundary
 *
 * 捕获 React 组件树中的错误并显示友好的错误界面
 */

import React, { Component, ReactNode } from 'react';
import { ErrorHandler } from '@/infrastructure/errors/ErrorHandler';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary 组件
 *
 * 捕获子组件树中的 JavaScript 错误，记录错误，并显示备用 UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误到控制台
    ErrorHandler.log(error, 'ErrorBoundary');

    // 更新 state
    this.setState({
      error,
      errorInfo,
    });

    // 调用自定义错误处理函数
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 否则显示默认错误 UI
      const errorMessage = this.state.error
        ? ErrorHandler.getUserMessage(this.state.error)
        : 'An unexpected error occurred';

      return (
        <div className='min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950'>
          <Card className='max-w-lg w-full'>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <AlertCircle className='h-6 w-6 text-red-500' />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>We encountered an error while rendering this page.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg'>
                  <p className='text-sm text-red-800 dark:text-red-200'>{errorMessage}</p>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className='text-xs'>
                    <summary className='cursor-pointer font-medium mb-2'>
                      Error Details (Development Only)
                    </summary>
                    <pre className='p-4 bg-slate-100 dark:bg-slate-900 rounded overflow-auto'>
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
            <CardFooter className='flex gap-2'>
              <Button onClick={this.handleReset} variant='outline'>
                Try Again
              </Button>
              <Button onClick={this.handleReload}>Reload Page</Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 函数式 Error Boundary Hook
 *
 * 用于在函数组件中捕获错误
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
