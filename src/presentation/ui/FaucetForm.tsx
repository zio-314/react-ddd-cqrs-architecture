'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  faucetFormSchema,
  FaucetFormValues,
  FAUCET_TOKENS,
  FaucetTokenSymbol,
  FaucetTransactionStatus,
} from '@/application/validators/faucet';
import { useFaucet } from '@/application/hooks/useFaucet';
import { AlertCircle, CheckCircle2, Loader2, Copy, AlertTriangle, Network } from 'lucide-react';

export function FaucetForm() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 在 SSR 期间返回 null，避免 wagmi hooks 错误
  if (!mounted) {
    return null;
  }

  // 只在客户端执行 wagmi hooks
  return <FaucetFormContent />;
}

function FaucetFormContent() {
  const { address: userAddress } = useAccount();
  const { mint, isLoading, result, isConnected, isCorrectChain, switchToArbitrumSepolia } =
    useFaucet();

  const form = useForm<FaucetFormValues>({
    resolver: zodResolver(faucetFormSchema),
    defaultValues: {
      token: 'ETH',
      amount: FAUCET_TOKENS.ETH.defaultAmount,
      recipientAddress: userAddress || '',
    },
  });

  // 当用户地址改变时更新表单
  if (userAddress && form.getValues('recipientAddress') !== userAddress) {
    form.setValue('recipientAddress', userAddress);
  }

  const onSubmit = async (values: FaucetFormValues) => {
    // 新的 API：mint 接受一个对象参数
    const tokenConfig = FAUCET_TOKENS[values.token as keyof typeof FAUCET_TOKENS];
    mint({
      token: {
        symbol: tokenConfig.symbol,
        address: tokenConfig.address,
        decimals: tokenConfig.decimals,
        mintAmount: values.amount,
        name: tokenConfig.name,
      },
      amount: values.amount,
    });
  };

  const selectedToken = form.watch('token');
  const selectedTokenConfig = FAUCET_TOKENS[selectedToken as keyof typeof FAUCET_TOKENS];

  const handleCopyAddress = () => {
    if (userAddress) {
      navigator.clipboard.writeText(userAddress);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto space-y-6'>
      {/* Network Warning */}
      {isConnected && !isCorrectChain && (
        <Alert className='border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'>
          <AlertTriangle className='h-4 w-4 text-yellow-600 dark:text-yellow-400' />
          <AlertDescription className='text-yellow-800 dark:text-yellow-200'>
            <div className='space-y-2'>
              <p className='font-semibold'>Wrong Network!</p>
              <p className='text-sm'>Please switch to Arbitrum Sepolia to use the faucet.</p>
              <Button
                type='button'
                onClick={switchToArbitrumSepolia}
                disabled={isLoading}
                className='mt-2 w-full bg-yellow-600 hover:bg-yellow-700 text-white'
              >
                <Network className='mr-2 h-4 w-4' />
                Switch to Arbitrum Sepolia
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className='border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'>
        <CardHeader>
          <CardTitle className='text-2xl'>Faucet</CardTitle>
          <CardDescription>
            Get test tokens for development and testing on Arbitrum Sepolia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Token Selection */}
              <FormField
                control={form.control}
                name='token'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Token</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'>
                          <SelectValue placeholder='Select a token' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(FAUCET_TOKENS).map(([key, token]) => (
                          <SelectItem key={key} value={key}>
                            <div className='flex items-center gap-2'>
                              <span className='font-semibold'>{token.symbol}</span>
                              <span className='text-sm text-slate-500'>{token.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose which test token you want to mint</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount Input */}
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          type='number'
                          placeholder='Enter amount'
                          step='0.01'
                          min='0'
                          className='bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 pr-16'
                        />
                        <div className='absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500'>
                          {selectedTokenConfig.symbol}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Default: {selectedTokenConfig.defaultAmount} {selectedTokenConfig.symbol}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Recipient Address */}
              <FormField
                control={form.control}
                name='recipientAddress'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Address</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          placeholder='0x...'
                          className='bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono text-sm'
                        />
                        {userAddress && (
                          <button
                            type='button'
                            onClick={handleCopyAddress}
                            className='absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded'
                          >
                            <Copy className='w-4 h-4 text-slate-500' />
                          </button>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      {userAddress
                        ? 'Your connected wallet address'
                        : 'Connect wallet to auto-fill'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Messages */}
              {result.status === FaucetTransactionStatus.ERROR && (
                <Alert className='border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'>
                  <AlertCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
                  <AlertDescription className='text-red-800 dark:text-red-200'>
                    {result.error}
                  </AlertDescription>
                </Alert>
              )}

              {result.status === FaucetTransactionStatus.SUCCESS && (
                <Alert className='border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'>
                  <CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-400' />
                  <AlertDescription className='text-green-800 dark:text-green-200'>
                    <div className='space-y-1'>
                      <p>Successfully minted tokens!</p>
                      {result.txHash && (
                        <p className='text-xs font-mono break-all'>TX: {result.txHash}</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {result.status === FaucetTransactionStatus.PENDING && (
                <Alert className='border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950'>
                  <Loader2 className='h-4 w-4 text-sky-500 dark:text-sky-400 animate-spin' />
                  <AlertDescription className='text-sky-800 dark:text-sky-200'>
                    Transaction pending... Please wait
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type='submit'
                disabled={isLoading || !isConnected || !isCorrectChain}
                className='w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {!isConnected
                  ? 'Connect Wallet'
                  : !isCorrectChain
                    ? 'Wrong Network'
                    : isLoading
                      ? 'Minting...'
                      : 'Mint Tokens'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Token Info Cards */}
      <div className='grid grid-cols-2 gap-3'>
        {Object.entries(FAUCET_TOKENS).map(([key, token]) => (
          <Card
            key={key}
            className={`border-slate-200 dark:border-slate-800 cursor-pointer transition-all ${
              selectedToken === key
                ? 'bg-sky-50 dark:bg-sky-950 border-sky-300 dark:border-sky-600'
                : 'bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
            onClick={() => form.setValue('token', key as FaucetTokenSymbol)}
          >
            <CardContent className='pt-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='font-bold text-lg'>{token.symbol}</span>
                  {selectedToken === key && <Badge className='bg-sky-500'>Selected</Badge>}
                </div>
                <p className='text-xs text-slate-600 dark:text-slate-400'>{token.name}</p>
                <p className='text-xs text-slate-500 dark:text-slate-500'>
                  Decimals: {token.decimals}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
