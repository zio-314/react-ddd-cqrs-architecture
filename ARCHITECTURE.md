# Uniswap Minimal Web - 架构文档

## 📋 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [架构设计](#架构设计)
- [目录结构](#目录结构)
- [核心概念](#核心概念)
- [数据流](#数据流)
- [测试策略](#测试策略)
- [开发指南](#开发指南)

---

## 项目概述

Uniswap Minimal Web 是一个基于 **DDD (Domain-Driven Design)** 和 **CQRS (Command Query Responsibility Segregation)** 架构模式的 Uniswap V2 去中心化交易所前端应用。

### 核心功能

- 🔄 **代币交换 (Swap)** - 支持任意 ERC20 代币之间的交换
- 💧 **流动性管理 (Liquidity)** - 添加和移除流动性
- 💰 **水龙头 (Faucet)** - 测试代币领取
- 📊 **代币列表 (Tokens)** - 查看代币价格、交易量等信息
- 💼 **钱包集成** - 支持多种钱包连接

### 设计原则

- ⭐ **充血领域模型 (Rich Domain Model)** - 业务逻辑封装在领域对象内部（核心原则）
- ✅ **领域驱动设计 (DDD)** - 业务逻辑与技术实现分离
- ✅ **CQRS 模式** - 读写操作分离
- ✅ **类型安全** - 完整的 TypeScript 类型系统
- ✅ **测试驱动** - 152+ 单元测试，95% 覆盖率
- ✅ **不可变性** - 值对象和聚合根的不可变设计
- ✅ **状态机模式** - 明确的状态转换规则

### 架构亮点

本项目的 **Domain 层采用充血模型（Rich Domain Model）**，这是区别于传统 MVC 贫血模型的关键设计：

| 特性             | 充血模型（本项目）    | 贫血模型（传统）                 |
| ---------------- | --------------------- | -------------------------------- |
| **业务逻辑位置** | ⭐ 在领域对象内部     | ❌ 在 Service 层                 |
| **对象职责**     | ⭐ 数据 + 行为        | ❌ 只有数据                      |
| **封装性**       | ⭐ 高内聚             | ❌ 低内聚                        |
| **可测试性**     | ⭐ 易于单元测试       | ❌ 需要集成测试                  |
| **示例**         | `Pool.getAmountOut()` | `PoolService.getAmountOut(pool)` |

---

## 技术栈

### 核心框架

| 技术             | 版本   | 用途                     |
| ---------------- | ------ | ------------------------ |
| **Next.js**      | 15.5.5 | React 框架（App Router） |
| **React**        | 19.1.0 | UI 库                    |
| **TypeScript**   | 5.9.3  | 类型系统                 |
| **Tailwind CSS** | 4.x    | 样式框架                 |

### Web3 技术栈

| 技术           | 版本   | 用途                     |
| -------------- | ------ | ------------------------ |
| **Wagmi**      | 2.18.1 | React Hooks for Ethereum |
| **Viem**       | 2.38.2 | TypeScript Ethereum 库   |
| **RainbowKit** | 2.2.9  | 钱包连接 UI              |

### 状态管理

| 技术                | 版本   | 用途           |
| ------------------- | ------ | -------------- |
| **Zustand**         | 5.0.8  | 全局状态管理   |
| **React Query**     | 5.90.3 | 服务端状态管理 |
| **React Hook Form** | 7.65.0 | 表单状态管理   |

### 测试工具

| 技术                | 版本   | 用途            |
| ------------------- | ------ | --------------- |
| **Jest**            | 30.2.0 | 测试框架        |
| **ts-jest**         | 29.4.5 | TypeScript 支持 |
| **Testing Library** | 6.9.1  | 测试工具        |

### UI 组件库

- **Radix UI** - 无障碍组件基础
- **Lucide React** - 图标库
- **shadcn/ui** - UI 组件（基于 Radix UI）

---

## 架构设计

### 分层架构

项目采用经典的 DDD 四层架构 + 独立的状态管理层：

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│              (UI Components, Hooks, Forms)               │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│         (Commands, Queries, Application Hooks)           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                         │
│    (Entities, Aggregates, Value Objects, Errors)         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                     │
│              (Repositories, External APIs)               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  State Management Layer                  │
│                  (Zustand Stores - 独立)                 │
└─────────────────────────────────────────────────────────┘
```

### 各层职责

#### 1️⃣ **Domain Layer (领域层)** - `src/domain/` ⭐ 核心层

**职责**：核心业务逻辑，不依赖任何外部框架

**架构模式**：⭐ **充血模型（Rich Domain Model）**

- 业务逻辑封装在领域对象内部
- 对象不仅包含数据，还包含行为
- 与贫血模型（Anemic Model）相反

**组成**：

- **Aggregates (聚合根)** - `Swap`, `Liquidity` ⭐ 充血模型
  - 封装业务规则和状态转换
  - 使用状态机模式管理生命周期
  - 保证业务不变性
  - **包含业务方法**：`calculateMinimumOutput()`, `checkPriceImpact()`, `markAsExecuting()`

- **Entities (实体)** - `Pool`, `Faucet` ⭐ 充血模型
  - 有唯一标识的领域对象
  - **包含业务逻辑**：`getAmountOut()`, `calculatePriceImpact()`, `calculateLPTokens()`
  - **包含验证规则**：构造函数中自动验证业务规则

- **Value Objects (值对象)** - `Amount`, `Slippage` ⭐ 充血模型
  - 不可变对象
  - 通过值相等性比较
  - **封装业务计算逻辑**：`add()`, `multiply()`, `applySlippage()`

- **Data Interfaces (数据接口)** - `IToken` ⚪ 贫血模型（用于数据传输）
  - 纯数据对象，无业务逻辑
  - 只包含属性定义
  - 配合 Token 类使用（Token 类是充血模型）

- **Domain Errors (领域错误)** - `ValidationError`, `BusinessRuleError`
  - 统一的错误类型系统

**特点**：

- ✅ 纯 TypeScript，无外部依赖
- ✅ 100% 单元测试覆盖
- ⭐ **充血模型（Rich Domain Model）** - 业务逻辑在领域对象内部

#### 2️⃣ **Application Layer (应用层)** - `src/application/`

**职责**：协调领域对象，实现用例

**组成**：

- **Commands (命令)** - 写操作
  - `swap.command.ts` - 执行代币交换
  - `addLiquidity.command.ts` - 添加流动性
  - `removeLiquidity.command.ts` - 移除流动性
  - `faucet.command.ts` - 领取测试代币

- **Queries (查询)** - 读操作
  - `getTokens.ts` - 获取代币列表
  - `getTokenBalance.ts` - 获取代币余额
  - `getLiquidityPools.ts` - 获取流动性池
  - `getLiquidityQuote.ts` - 获取流动性报价

- **Application Hooks** - React Query 封装
  - `useSwap.ts` - 交换业务逻辑
  - `useAddLiquidity.ts` - 添加流动性业务逻辑
  - `useTokens.ts` - 代币数据管理

- **Validators (验证器)** - 业务规则验证
  - `liquidity.ts` - 流动性验证
  - `faucet.ts` - 水龙头验证

**特点**：

- ✅ CQRS 模式（读写分离）
- ✅ 使用 React Query 管理异步状态
- ✅ 独立的函数式设计

#### 3️⃣ **Infrastructure Layer (基础设施层)** - `src/infrastructure/`

**职责**：与外部系统交互

**组成**：

- **Repositories (仓储)** - 数据访问
  - `BlockchainRepository.ts` - 区块链交互
  - `api.ts` - HTTP API 调用

- **Error Handlers (错误处理)**
  - `ErrorHandler.ts` - 统一错误处理

**特点**：

- ✅ 封装外部依赖（Wagmi, Viem）
- ✅ 提供统一的数据访问接口

#### 4️⃣ **Presentation Layer (表现层)** - `src/presentation/`

**职责**：UI 组件和表单逻辑

**组成**：

- **UI Components** - 业务 UI 组件
  - `SwapInterface.tsx` - 交换界面
  - `AddLiquidityForm.tsx` - 添加流动性表单
  - `RemoveLiquidityForm.tsx` - 移除流动性表单
  - `FaucetForm.tsx` - 水龙头表单

- **Presentation Hooks** - 表单状态管理
  - `useSwapForm.ts` - 交换表单逻辑
  - `useAddLiquidityForm.ts` - 添加流动性表单逻辑
  - `useRemoveLiquidityForm.ts` - 移除流动性表单逻辑

**特点**：

- ✅ 使用 React Hook Form 管理表单
- ✅ 组件化设计，职责单一

#### 5️⃣ **State Management Layer (状态管理层)** - `src/stores/`

**职责**：全局状态管理（跨层关注点）

**组成**：

- `useUIStore.ts` - UI 状态（通知、模态框、侧边栏）
- `useTokensStore.ts` - 代币数据缓存
- `useTokenSelectionStore.ts` - 代币选择状态（最近使用、收藏）
- `useUserPreferencesStore.ts` - 用户偏好（滑点、截止时间）
- `useTransactionHistoryStore.ts` - 交易历史记录

**特点**：

- ✅ 使用 Zustand 实现
- ✅ 部分使用 `persist` 中间件持久化
- ✅ 类型安全的 `combine` 中间件

---

## 目录结构

```
uniswap-minimal-web/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── ping/                 # 健康检查
│   │   │   └── tokens/               # 代币数据 API
│   │   ├── faucet/                   # 水龙头页面
│   │   ├── pool/                     # 流动性池页面
│   │   ├── tokens/                   # 代币列表页面
│   │   ├── layout.tsx                # 根布局
│   │   ├── page.tsx                  # 首页（Swap）
│   │   └── globals.css               # 全局样式
│   │
│   ├── domain/                       # 领域层 ⭐
│   │   ├── aggregates/               # 聚合根
│   │   │   ├── __tests__/
│   │   │   │   └── Swap.test.ts      # ✅ 24 个测试
│   │   │   ├── Swap.ts               # 交换聚合根
│   │   │   ├── Liquidity.ts          # 流动性聚合根
│   │   │   └── SwapStatus.ts         # 交换状态枚举
│   │   ├── entities/                 # 实体
│   │   │   ├── __tests__/
│   │   │   │   ├── Pool.test.ts      # ✅ 26 个测试
│   │   │   │   └── Token.test.ts     # ✅ 28 个测试
│   │   │   ├── Pool.ts               # 流动性池实体
│   │   │   ├── Token.ts              # 代币实体（充血模型 + IToken 接口）
│   │   │   └── Faucet.ts             # 水龙头实体
│   │   ├── value-objects/            # 值对象
│   │   │   ├── __tests__/
│   │   │   │   ├── Amount.test.ts    # ✅ 50 个测试
│   │   │   │   └── Slippage.test.ts  # ✅ 24 个测试
│   │   │   ├── Amount.ts             # 金额值对象
│   │   │   └── Slippage.ts           # 滑点值对象
│   │   └── errors/                   # 领域错误
│   │       └── DomainError.ts        # 错误类定义
│   │
│   ├── application/                  # 应用层 ⭐
│   │   ├── commands/                 # 命令（写操作）
│   │   │   ├── swap.command.ts
│   │   │   ├── addLiquidity.command.ts
│   │   │   ├── removeLiquidity.command.ts
│   │   │   └── faucet.command.ts
│   │   ├── queries/                  # 查询（读操作）
│   │   │   ├── getTokens.ts
│   │   │   ├── getTokenBalance.ts
│   │   │   ├── getNativeBalance.ts
│   │   │   ├── getLiquidityPools.ts
│   │   │   └── getLiquidityQuote.ts
│   │   ├── hooks/                    # 应用层 Hooks
│   │   │   ├── useSwap.ts
│   │   │   ├── useAddLiquidity.ts
│   │   │   ├── useRemoveLiquidity.ts
│   │   │   ├── useFaucet.ts
│   │   │   ├── useTokens.ts
│   │   │   ├── useTokenBalance.ts
│   │   │   ├── useLiquidityPools.ts
│   │   │   └── useWallet.ts
│   │   └── validators/               # 验证器
│   │       ├── liquidity.ts
│   │       └── faucet.ts
│   │
│   ├── infrastructure/               # 基础设施层 ⭐
│   │   ├── blockchain/
│   │   │   ├── abi/                  # 智能合约 ABI
│   │   │   │   ├── ierc20Abi.ts
│   │   │   │   ├── uniswapV2FactoryAbi.ts
│   │   │   │   ├── uniswapV2PairAbi.ts
│   │   │   │   ├── uniswapV2RouterAbi.ts
│   │   │   │   ├── faucetAbi.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants.ts          # 合约地址常量
│   │   │   ├── wagmi.config.ts       # Wagmi 配置
│   │   │   └── rainbowkit-theme.ts   # RainbowKit 主题
│   │   ├── repositories/
│   │   │   ├── BlockchainRepository.ts
│   │   │   ├── TokenRepository.ts
│   │   │   └── api.ts
│   │   ├── errors/
│   │   │   └── ErrorHandler.ts
│   │   └── shared/
│   │       └── utils.ts              # 工具函数
│   │
│   ├── presentation/                 # 表现层 ⭐
│   │   ├── ui/                       # UI 组件
│   │   │   ├── swap/
│   │   │   │   ├── SwapTokenInput.tsx
│   │   │   │   └── SwapStats.tsx
│   │   │   ├── add-liquidity/
│   │   │   │   ├── AddLiquidityPreview.tsx
│   │   │   │   └── TokenPairInput.tsx
│   │   │   ├── remove-liquidity/
│   │   │   │   ├── AmountSlider.tsx
│   │   │   │   ├── LPTokenInfo.tsx
│   │   │   │   ├── RemoveLiquidityPreview.tsx
│   │   │   │   └── TokenPairSelector.tsx
│   │   │   ├── shared/               # 共享组件
│   │   │   │   ├── TokenInput.tsx
│   │   │   │   ├── SlippageInput.tsx
│   │   │   │   ├── ActionButtons.tsx
│   │   │   │   ├── ErrorAlert.tsx
│   │   │   │   ├── SuccessAlert.tsx
│   │   │   │   ├── FormSection.tsx
│   │   │   │   ├── InfoRow.tsx
│   │   │   │   ├── PercentageButtons.tsx
│   │   │   │   └── index.ts
│   │   │   ├── SwapInterface.tsx
│   │   │   ├── SwapInterfaceWrapper.tsx
│   │   │   ├── AddLiquidityForm.tsx
│   │   │   ├── AddLiquidityInterface.tsx
│   │   │   ├── RemoveLiquidityForm.tsx
│   │   │   ├── RemoveLiquidityInterface.tsx
│   │   │   ├── AdvancedSwapPanel.tsx
│   │   │   ├── FaucetForm.tsx
│   │   │   ├── PoolContent.tsx
│   │   │   ├── TokenSelector.tsx
│   │   │   ├── PriceInfo.tsx
│   │   │   └── __tests__/
│   │   │       └── TokenSelector.test.ts
│   │   └── hooks/                    # 表现层 Hooks
│   │       ├── useSwapForm.ts
│   │       ├── useAddLiquidityForm.ts
│   │       └── useRemoveLiquidityForm.ts
│   │
│   ├── stores/                       # 状态管理层 ⭐
│   │   ├── useUIStore.ts
│   │   ├── useTokensStore.ts
│   │   ├── useTokenSelectionStore.ts
│   │   ├── useUserPreferencesStore.ts
│   │   └── useTransactionHistoryStore.ts
│   │
│   ├── components/                   # 通用组件
│   │   ├── ui/                       # shadcn/ui 组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Providers.tsx
│   │   ├── ConnectWalletButton.tsx
│   │   ├── WalletInfo.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── NotificationContainer.tsx
│   │
│   │
│   └── types/                        # 类型定义
│       ├── index.ts
│       ├── swap.ts
│       ├── liquidity.ts
│       └── pool.ts
│
├── public/                           # 静态资源
├── coverage/                         # 测试覆盖率报告
├── jest.config.js                    # Jest 配置
├── jest.setup.js                     # Jest 设置
├── next.config.ts                    # Next.js 配置
├── tsconfig.json                     # TypeScript 配置
├── tailwind.config.ts                # Tailwind 配置
├── package.json
├── ARCHITECTURE.md                   # 架构文档（本文档）
└── README.md
```

---

## 核心概念

### DDD 核心模式

#### 1. ⭐ **充血模型 vs 贫血模型** - 本项目的核心设计原则

本项目 **Domain 层采用充血模型（Rich Domain Model）**，这是 DDD 的核心原则之一。

---

##### **什么是充血模型？**

**充血模型（Rich Domain Model）**：

- ✅ 对象 = **数据 + 行为**
- ✅ 业务逻辑封装在领域对象内部
- ✅ 对象自己负责维护业务规则
- ✅ 高内聚、低耦合

**贫血模型（Anemic Domain Model）**：

- ❌ 对象 = **只有数据**
- ❌ 业务逻辑在 Service 层
- ❌ 对象只是数据容器（DTO）
- ❌ 违反面向对象原则

---

##### **充血模型示例** - `Pool` 实体：

<augment_code_snippet path="uniswap-minimal-web/src/domain/entities/Pool.ts" mode="EXCERPT">

```typescript
// ✅ 充血模型 - 包含数据 + 业务逻辑
export class Pool {
  private readonly _token0: IToken;
  private readonly _token1: IToken;
  private readonly _reserve0: Amount;
  private readonly _reserve1: Amount;

  constructor(token0: IToken, token1: IToken, reserve0: Amount, reserve1: Amount) {
    // 业务规则验证
    if (token0.address >= token1.address) {
      throw new ValidationError('token0 must be less than token1');
    }
    this._token0 = token0;
    this._token1 = token1;
    this._reserve0 = reserve0;
    this._reserve1 = reserve1;
  }

  // ⭐ 业务逻辑封装在对象内部
  getAmountOut(amountIn: Amount, tokenIn: IToken): Amount {
    // Uniswap V2 AMM 公式
    const amountInWithFee = amountIn.toBigInt() * 997n;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000n + amountInWithFee;
    return new Amount(numerator / denominator, tokenOut.decimals);
  }

  // ⭐ 更多业务方法
  calculatePriceImpact(amountIn: Amount, tokenIn: IToken): number { ... }
  calculateLPTokens(amount0: Amount, amount1: Amount): Amount { ... }
}
```

</augment_code_snippet>

**如果使用贫血模型会怎样？** ❌

```typescript
// ❌ 贫血模型 - 只有数据，无业务逻辑
class Pool {
  token0: IToken;
  token1: IToken;
  reserve0: Amount;
  reserve1: Amount;
}

// ❌ 业务逻辑在 Service 层
class PoolService {
  getAmountOut(pool: Pool, amountIn: Amount, tokenIn: IToken): Amount {
    // 业务逻辑在外部
    const amountInWithFee = amountIn.toBigInt() * 997n;
    // ...
  }
}
```

**问题**：

- ❌ Pool 对象无法保证自己的业务规则
- ❌ 业务逻辑分散在多个 Service 中
- ❌ 违反面向对象的封装原则
- ❌ 难以测试和维护

---

##### **Token 实体** - 充血模型 + 贫血接口的混合设计：

<augment_code_snippet path="uniswap-minimal-web/src/domain/entities/Token.ts" mode="EXCERPT">

```typescript
// ⚪ IToken 接口 - 贫血模型（用于数据传输）
export interface IToken {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  price?: string;
  change?: string;
  volume?: string;
  liquidity?: string;
  positive?: boolean;
}

// ⭐ Token 类 - 充血模型（封装业务逻辑）
export class Token {
  private readonly raw: ITokenRaw;

  // 私有构造函数 - 强制使用工厂方法
  private constructor(raw: ITokenRaw) {
    this.raw = raw;
  }

  // ⭐ 工厂方法：从原始数据创建
  static fromRaw(raw: ITokenRaw): Token {
    Token.validate(raw);
    return new Token({ ...raw, address: raw.address.toLowerCase() });
  }

  // ⭐ 业务方法
  get shortAddress(): string {
    return this.address.slice(0, 6) + '...' + this.address.slice(-4);
  }

  get isETH(): boolean {
    return this.symbol === 'ETH' || this.symbol === 'WETH';
  }

  isNative(): boolean {
    return this.isETH;
  }

  // ⭐ 值对象方法
  equals(other: Token): boolean {
    return this.address === other.address;
  }

  // ⭐ 序列化方法
  toObject(): IToken {
    return { ...this.raw };
  }
}
```

</augment_code_snippet>

**Token 的混合设计原则：**

- ✅ **Token 类（充血模型）** - 内部使用，封装业务逻辑
  - 使用 `fromRaw` 工厂方法创建
  - 包含业务方法：`shortAddress`, `isETH`, `isNative`, `equals`
  - 不可变设计（所有字段 readonly）
  - 值对象特征（通过值相等性比较）

- ✅ **IToken 接口（贫血模型）** - 对外传输，纯数据对象
  - 用于跨层数据传输
  - 用于 API 响应
  - 用于状态管理（Zustand stores）
  - 轻量级，易于序列化

**为什么采用混合设计？**

- ✅ **内部使用 Token 类** - 封装业务逻辑，保证类型安全
- ✅ **对外使用 IToken 接口** - 简化数据传输，避免序列化问题
- ✅ **最佳实践** - 充血模型用于业务逻辑，贫血模型用于数据传输

---

##### **设计原则总结**：

| 对象类型       | 模型        | 原因                 | 示例                                                  |
| -------------- | ----------- | -------------------- | ----------------------------------------------------- |
| **有业务规则** | ⭐ 充血模型 | 需要封装业务逻辑     | Pool, Swap, Liquidity, Faucet, Token, Amount, Slippage |
| **纯数据对象** | ⚪ 贫血模型 | 无业务逻辑，只是数据 | IToken（用于数据传输）                                |
| **混合设计**   | ⭐ + ⚪     | 内部充血，对外贫血   | Token 类 + IToken 接口                                |

**核心原则**：

- ✅ **有业务规则的对象** → 充血模型（使用 class）
- ✅ **纯数据对象** → 贫血模型（使用 interface）
- ✅ **混合设计** → 内部使用充血模型（class），对外使用贫血模型（interface）
- ✅ **不要为了 OOP 而 OOP** - 简单的数据对象用接口即可

---

#### 2. ⭐ **聚合根（Aggregate Root）** - 充血模型的最佳实践

聚合根是一组相关对象的入口，负责维护业务不变性。**聚合根是充血模型的典型代表**。

**Swap 聚合根示例**：

<augment_code_snippet path="uniswap-minimal-web/src/domain/aggregates/Swap.ts" mode="EXCERPT">

```typescript
// ⭐ 充血模型 - 聚合根包含完整的业务逻辑
export class Swap {
  private readonly _id: string;
  private readonly _tokenIn: IToken;
  private readonly _tokenOut: IToken;
  private readonly _amountIn: Amount;
  private readonly _slippage: Slippage;
  private _status: SwapStatus;

  constructor(tokenIn: IToken, tokenOut: IToken, amountIn: Amount, slippage: Slippage) {
    this._id = this.generateId();
    this._tokenIn = tokenIn;
    this._tokenOut = tokenOut;
    this._amountIn = amountIn;
    this._slippage = slippage;
    this._status = SwapStatus.PENDING;
    this.validate(); // ⭐ 构造时自动验证业务规则
  }

  // ⭐ 业务规则验证
  private validate(): void {
    if (this._tokenIn.address === this._tokenOut.address) {
      throw new ValidationError('Cannot swap the same token');
    }
    if (this._amountIn.isZero() || this._amountIn.isNegative()) {
      throw new ValidationError('Amount must be greater than 0');
    }
  }

  // ⭐ 业务方法 - 计算最小输出
  calculateMinimumOutput(expectedOutput: Amount): Amount {
    return expectedOutput.applySlippage(this._slippage);
  }

  // ⭐ 业务方法 - 检查价格影响
  checkPriceImpact(pool: Pool): void {
    const priceImpact = pool.calculatePriceImpact(this._amountIn, this._tokenIn);
    if (priceImpact > 0.05) {
      throw new BusinessRuleError('Price impact too high');
    }
  }

  // ⭐ 状态转换 - 状态机模式
  markAsExecuting(): void {
    if (this._status !== SwapStatus.PENDING) {
      throw new BusinessRuleError('Can only execute pending swaps');
    }
    this._status = SwapStatus.EXECUTING;
  }

  markAsSuccess(txHash: string, amountOut: Amount): void {
    if (this._status !== SwapStatus.EXECUTING) {
      throw new BusinessRuleError('Can only mark executing swaps as success');
    }
    this._txHash = txHash;
    this._amountOut = amountOut;
    this._status = SwapStatus.SUCCESS;
  }
}
```

</augment_code_snippet>

**充血模型的体现**：

- ⭐ **数据 + 行为** - 不仅存储数据，还包含业务方法
- ⭐ **自我验证** - 构造函数中自动验证业务规则
- ⭐ **封装状态转换** - 状态机逻辑在对象内部
- ⭐ **业务方法** - `calculateMinimumOutput()`, `checkPriceImpact()`
- ⭐ **保护不变性** - 私有字段 + 状态转换验证

**如果使用贫血模型会怎样？** ❌

```typescript
// ❌ 贫血模型
class Swap {
  id: string;
  tokenIn: IToken;
  tokenOut: IToken;
  amountIn: Amount;
  status: SwapStatus;
}

// ❌ 业务逻辑在 Service 层
class SwapService {
  validate(swap: Swap): void { ... }
  calculateMinimumOutput(swap: Swap, expectedOutput: Amount): Amount { ... }
  markAsExecuting(swap: Swap): void { swap.status = SwapStatus.EXECUTING; }
}
```

**问题**：

- ❌ Swap 对象无法保证自己的状态一致性
- ❌ 任何人都可以随意修改 status
- ❌ 业务规则分散在多个 Service 中
- ❌ 违反 "Tell, Don't Ask" 原则

---

**特点**：

- ✅ 封装状态转换逻辑
- ✅ 使用状态机模式
- ✅ 保证业务不变性
- ✅ 提供业务方法（calculateMinimumOutput, checkPriceImpact）
- ⭐ **充血模型的典型代表**

---

#### 3. ⭐ **值对象（Value Object）** - 充血模型 + 不可变性

值对象是不可变的，通过值相等性比较。**值对象也是充血模型**，封装了丰富的业务逻辑。

**Amount 值对象示例**：

<augment_code_snippet path="uniswap-minimal-web/src/domain/value-objects/Amount.ts" mode="EXCERPT">

```typescript
// ⭐ 充血模型 + 不可变性
export class Amount {
  private readonly value: string;
  private readonly decimals: number;

  constructor(value: string | bigint, decimals: number) {
    // ⭐ 自我验证
    if (decimals < 0 || decimals > 18) {
      throw new ValidationError('Invalid decimals');
    }
    this.value = value.toString();
    this.decimals = decimals;
  }

  // ⭐ 业务方法 - 算术运算
  add(other: Amount): Amount {
    this.ensureSameDecimals(other);
    return new Amount((this.toBigInt() + other.toBigInt()).toString(), this.decimals);
  }

  multiply(multiplier: number): Amount {
    return new Amount(
      ((this.toBigInt() * BigInt(Math.floor(multiplier * 1e18))) / BigInt(1e18)).toString(),
      this.decimals,
    );
  }

  // ⭐ 业务方法 - 滑点计算
  applySlippage(slippage: Slippage): Amount {
    return this.multiply(1 - slippage.toNumber());
  }

  // ⭐ 业务方法 - 判断
  isZero(): boolean {
    return this.toBigInt() === 0n;
  }

  isGreaterThan(other: Amount): boolean {
    this.ensureSameDecimals(other);
    return this.toBigInt() > other.toBigInt();
  }

  // ⭐ 业务方法 - 格式化
  format(maxDecimals: number = 6): string {
    const num = this.toNumber();
    return num.toLocaleString('en-US', {
      maximumFractionDigits: maxDecimals,
    });
  }
}
```

</augment_code_snippet>

**充血模型的体现**：

- ⭐ **丰富的业务方法** - 50+ 个测试覆盖各种业务场景
- ⭐ **自我验证** - 构造函数验证数据有效性
- ⭐ **封装计算逻辑** - `add()`, `multiply()`, `applySlippage()`
- ⭐ **封装判断逻辑** - `isZero()`, `isGreaterThan()`, `equals()`
- ⭐ **封装格式化逻辑** - `format()`, `toWei()`, `toNumber()`

**如果使用贫血模型会怎样？** ❌

```typescript
// ❌ 贫血模型
class Amount {
  value: string;
  decimals: number;
}

// ❌ 业务逻辑在工具函数中
function addAmounts(a: Amount, b: Amount): Amount {
  return {
    value: (BigInt(a.value) + BigInt(b.value)).toString(),
    decimals: a.decimals,
  };
}

function applySlippage(amount: Amount, slippage: number): Amount {
  // ...
}
```

**问题**：

- ❌ Amount 对象无法保证自己的有效性
- ❌ 业务逻辑分散在各种工具函数中
- ❌ 难以发现和复用业务逻辑
- ❌ 违反面向对象原则

---

**特点**：

- ✅ 不可变性（Immutability）- 所有操作返回新实例
- ✅ 值相等性（Value Equality）- 通过值比较而非引用
- ✅ 封装业务计算逻辑 - 算术运算、滑点计算
- ✅ 自包含验证规则 - 构造时验证
- ⭐ **充血模型** - 包含丰富的业务方法

---

### CQRS 模式

**CQRS (Command Query Responsibility Segregation)** - 读写分离

#### **Commands（命令）** - 写操作

命令负责修改状态，不返回数据（或只返回操作结果）。

<augment_code_snippet path="uniswap-minimal-web/src/application/commands/swap.command.ts" mode="EXCERPT">

```typescript
export async function executeSwapCommand(
  config: Config,
  publicClient: PublicClient,
  userAddress: `0x${string}`,
  params: SwapParams
): Promise<SwapResult> {
  // 1. 创建聚合根（验证业务规则）
  const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);

  // 2. 执行业务逻辑
  swap.markAsExecuting();

  // 3. 调用基础设施层
  const txHash = await writeContract(...);

  // 4. 更新聚合根状态
  swap.markAsSuccess(txHash, amountOut);

  return { success: true, txHash };
}
```

</augment_code_snippet>

**命令特点**：

- ✅ 修改状态
- ✅ 使用聚合根封装业务规则
- ✅ 返回操作结果（成功/失败）
- ✅ 处理副作用（区块链交易）

---

#### **Queries（查询）** - 读操作

查询负责读取数据，不修改状态。

<augment_code_snippet path="uniswap-minimal-web/src/application/queries/getTokenBalance.ts" mode="EXCERPT">

```typescript
export async function getTokenBalance(params: GetTokenBalanceParams): Promise<string> {
  // 纯读操作，不修改状态
  const balanceWei = await readContract(config, {
    address: tokenAddress,
    abi: ierc20Abi,
    functionName: 'balanceOf',
    args: [userAddress],
  });

  return formatUnits(balanceWei, decimals);
}
```

</augment_code_snippet>

**查询特点**：

- ✅ 只读操作
- ✅ 不修改状态
- ✅ 可以缓存
- ✅ 使用 React Query 管理

---

### 状态机模式

聚合根使用状态机模式管理生命周期。

**Swap 状态转换图**：

```
┌─────────┐
│ PENDING │ ──markAsExecuting()──> ┌───────────┐
└─────────┘                         │ EXECUTING │
                                    └───────────┘
                                         │
                        ┌────────────────┴────────────────┐
                        │                                 │
              markAsSuccess()                    markAsFailed()
                        │                                 │
                        ▼                                 ▼
                  ┌─────────┐                       ┌────────┐
                  │ SUCCESS │                       │ FAILED │
                  └─────────┘                       └────────┘
```

**状态转换规则**：

- ✅ `PENDING` → `EXECUTING` - 开始执行
- ✅ `EXECUTING` → `SUCCESS` - 执行成功
- ✅ `EXECUTING` → `FAILED` - 执行失败
- ❌ `SUCCESS` → `FAILED` - 不允许
- ❌ `PENDING` → `SUCCESS` - 不允许（必须先执行）

---

### 依赖倒置原则

**Domain 层不依赖任何外部框架**，其他层依赖 Domain 层。

```
┌──────────────────────────────────────────┐
│         Presentation Layer               │
│  (依赖 Application + Domain)              │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│         Application Layer                │
│  (依赖 Domain + Infrastructure)           │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│         Domain Layer                     │
│  (不依赖任何外部框架) ⭐                   │
└──────────────────────────────────────────┘
                  ↑
┌──────────────────────────────────────────┐
│         Infrastructure Layer             │
│  (依赖 Domain，实现接口)                  │
└──────────────────────────────────────────┘
```

**好处**：

- ✅ Domain 层可以独立测试
- ✅ 业务逻辑不受技术实现影响
- ✅ 易于替换基础设施（如更换 Web3 库）

---

## 数据流

### 完整的 Swap 数据流

以代币交换为例，展示完整的数据流：

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Input (Presentation Layer)                              │
│    - presentation/ui/SwapInterface.tsx                           │
│    - presentation/hooks/useSwapForm.ts (表单状态管理)            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Application Hook (Application Layer)                         │
│    - useSwap.ts                                                  │
│    - 使用 React Query 管理异步状态                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Command (Application Layer)                                  │
│    - executeSwapCommand()                                        │
│    - 创建 Swap 聚合根                                             │
│    - 验证业务规则                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Domain Logic (Domain Layer)                                  │
│    - Swap 聚合根                                                 │
│    - Amount, Slippage 值对象                                     │
│    - 业务规则验证                                                 │
│    - 状态转换                                                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Infrastructure (Infrastructure Layer)                        │
│    - BlockchainRepository                                        │
│    - Wagmi writeContract()                                       │
│    - 区块链交易                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. State Update (State Management Layer)                        │
│    - useTransactionHistoryStore                                  │
│    - useUIStore (显示通知)                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. UI Update (Presentation Layer)                               │
│    - React Query 自动刷新                                         │
│    - 显示成功/失败通知                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

### 代码示例：完整的 Swap 流程

#### **1. Presentation Layer - 用户输入**

```typescript
// src/presentation/ui/SwapInterface.tsx
export function SwapInterface() {
  const form = useSwapForm(); // 表单状态
  const { executeSwapAsync } = useSwap(); // 应用层 Hook

  const handleSwap = async () => {
    await executeSwapAsync({
      tokenIn: form.tokenIn,
      tokenOut: form.tokenOut,
      amountIn: form.amountIn,
      slippage: form.slippage,
    });
  };
}
```

#### **2. Application Layer - 业务编排**

```typescript
// src/application/hooks/useSwap.ts
export function useSwap() {
  const { mutateAsync: executeSwap } = useMutation({
    mutationFn: async (params: SwapParams) => {
      // 调用 Command
      return executeSwapCommand(config, publicClient, userAddress, params);
    },
    onSuccess: result => {
      // 更新状态
      useTransactionHistoryStore.getState().addTransaction(result);
      useUIStore.getState().showNotification('Swap successful!');
    },
  });

  return { executeSwap };
}
```

#### **3. Command - 执行业务逻辑**

```typescript
// src/application/commands/swap.command.ts
export async function executeSwapCommand(
  config: Config,
  publicClient: PublicClient,
  userAddress: `0x${string}`,
  params: SwapParams,
): Promise<SwapResult> {
  // 1. 创建聚合根（自动验证）
  const swap = new Swap(
    params.tokenIn,
    params.tokenOut,
    new Amount(params.amountIn, params.tokenIn.decimals),
    new Slippage(parseFloat(params.slippage) / 100),
  );

  // 2. 获取预期输出
  const pool = await getPool(params.tokenIn, params.tokenOut);
  const expectedAmountOut = pool.getAmountOut(swap.amountIn, swap.tokenIn);

  // 3. 计算最小输出（使用聚合根方法）
  const minAmountOut = swap.calculateMinimumOutput(expectedAmountOut);

  // 4. 检查价格影响
  swap.checkPriceImpact(pool);

  // 5. 标记为执行中
  swap.markAsExecuting();

  // 6. 执行区块链交易
  const txHash = await writeContract(config, {
    address: ROUTER_ADDRESS,
    abi: ROUTER_ABI,
    functionName: 'swapExactTokensForTokens',
    args: [
      swap.amountIn.toWei(),
      minAmountOut.toWei(),
      [swap.tokenIn.address, swap.tokenOut.address],
      userAddress,
      deadline,
    ],
  });

  // 7. 等待确认
  await waitForTransactionReceipt(config, { hash: txHash });

  // 8. 标记为成功
  swap.markAsSuccess(txHash, expectedAmountOut);

  return {
    success: true,
    txHash,
    swap,
  };
}
```

#### **4. Domain Layer - 业务规则**

```typescript
// src/domain/aggregates/Swap.ts
export class Swap {
  constructor(tokenIn: IToken, tokenOut: IToken, amountIn: Amount, slippage: Slippage) {
    // 自动验证业务规则
    this.validate();
  }

  private validate(): void {
    // 业务规则 1：不能交换相同的代币
    if (this._tokenIn.address === this._tokenOut.address) {
      throw new ValidationError('Cannot swap the same token');
    }

    // 业务规则 2：金额必须大于 0
    if (this._amountIn.isZero() || this._amountIn.isNegative()) {
      throw new ValidationError('Amount must be greater than 0');
    }
  }

  // 业务方法：计算最小输出
  calculateMinimumOutput(expectedOutput: Amount): Amount {
    return expectedOutput.applySlippage(this._slippage);
  }

  // 业务方法：检查价格影响
  checkPriceImpact(pool: Pool): void {
    const priceImpact = pool.calculatePriceImpact(this._amountIn, this._tokenIn);

    if (priceImpact > 0.05) {
      // 5%
      throw new BusinessRuleError('Price impact too high');
    }
  }
}
```

---

### 查询数据流（Query）

查询流程更简单，因为不涉及状态修改：

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Component (Presentation Layer)                               │
│    - 调用 Application Hook                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Application Hook (Application Layer)                         │
│    - useTokens(), useTokenBalance()                              │
│    - 使用 React Query 缓存                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Query Function (Application Layer)                           │
│    - getTokens(), getTokenBalance()                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Repository (Infrastructure Layer)                            │
│    - fetchTokens(), readContract()                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Cache & UI Update                                            │
│    - React Query 缓存                                            │
│    - 自动更新 UI                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**示例**：

```typescript
// 1. Component
function TokenList() {
  const { data: tokens } = useTokens(); // Application Hook
  return <div>{tokens.map(...)}</div>;
}

// 2. Application Hook
export function useTokens() {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: getTokens, // Query Function
  });
}

// 3. Query Function
export async function getTokens(): Promise<IToken[]> {
  const rawData = await fetchTokens(); // Repository
  return rawData.map(token => ({ ...token }));
}

// 4. Repository
export async function fetchTokens() {
  const response = await fetch('/api/tokens');
  return response.json();
}
```

---

## 测试策略

### 测试金字塔

本项目遵循测试金字塔原则，重点测试 Domain 层：

```
        ┌─────────────┐
        │   E2E Tests │  ⏳ 未实现
        │   (Cypress) │
        └─────────────┘
       ┌───────────────────┐
       │ Integration Tests │  ⏳ 未实现
       │   (React Testing  │
       │     Library)      │
       └───────────────────┘
    ┌─────────────────────────┐
    │    Unit Tests           │  ✅ 152 个测试
    │  (Jest + ts-jest)       │  ✅ 95% 覆盖率
    │  - Domain Layer         │
    │  - Application Layer    │
    └─────────────────────────┘
```

---

### Domain 层测试

**测试覆盖率**：~95%

#### **Value Objects（值对象）** - 100% 覆盖 ✅

| 文件          | 测试数 | 覆盖率 |
| ------------- | ------ | ------ |
| `Amount.ts`   | 50 个  | 100%   |
| `Slippage.ts` | 24 个  | 100%   |

**测试内容**：

- ✅ 构造函数验证
- ✅ 静态工厂方法
- ✅ 转换方法（toWei, toNumber, format）
- ✅ 判断方法（isZero, isPositive）
- ✅ 比较方法（equals, isGreaterThan）
- ✅ 算术运算（add, subtract, multiply, divide）
- ✅ 滑点计算
- ✅ 不可变性验证

**示例**：

```typescript
// src/domain/value-objects/__tests__/Amount.test.ts
describe('Amount Value Object', () => {
  describe('构造函数验证', () => {
    it('应该成功创建有效的 Amount', () => {
      const amount = new Amount('100', 18);
      expect(amount.toString()).toBe('100');
    });

    it('应该拒绝负数金额', () => {
      expect(() => new Amount('-100', 18)).toThrow(ValidationError);
    });
  });

  describe('算术运算', () => {
    it('add() 应该正确相加', () => {
      const a = new Amount('100', 18);
      const b = new Amount('50', 18);
      const result = a.add(b);

      expect(result.toString()).toBe('150');
      expect(a.toString()).toBe('100'); // 不可变性
    });
  });
});
```

---

#### **Entities（实体）** - 92.55% 覆盖 ✅

| 文件      | 测试数 | 覆盖率 |
| --------- | ------ | ------ |
| `Pool.ts` | 26 个  | 92.55% |

**测试内容**：

- ✅ 构造函数和验证
- ✅ 价格计算（getPrice, getInversePrice）
- ✅ AMM 计算（getAmountOut, getAmountIn）
- ✅ 价格影响计算
- ✅ 流动性计算（LP tokens）
- ✅ 业务规则验证

**示例**：

```typescript
// src/domain/entities/__tests__/Pool.test.ts
describe('Pool Entity', () => {
  describe('AMM 计算', () => {
    it('getAmountOut() 应该正确计算输出金额', () => {
      const pool = new Pool(token0, token1, reserve0, reserve1);
      const amountIn = new Amount('1', 18);

      const amountOut = pool.getAmountOut(amountIn, token0);

      // 验证 Uniswap V2 公式
      expect(amountOut.toNumber()).toBeCloseTo(1990, 0);
    });
  });
});
```

---

#### **Aggregates（聚合根）** - 93.33% 覆盖 ✅

| 文件      | 测试数 | 覆盖率 |
| --------- | ------ | ------ |
| `Swap.ts` | 24 个  | 93.33% |

**测试内容**：

- ✅ 构造函数和验证
- ✅ 业务规则验证
- ✅ 最小输出计算
- ✅ 价格影响检查
- ✅ 状态转换（状态机）
- ✅ 完整业务流程
- ✅ 不可变性验证

**示例**：

```typescript
// src/domain/aggregates/__tests__/Swap.test.ts
describe('Swap Aggregate Root', () => {
  describe('状态转换', () => {
    it('markAsExecuting() 应该将状态从 PENDING 转为 EXECUTING', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);

      swap.markAsExecuting();

      expect(swap.status).toBe(SwapStatus.EXECUTING);
    });

    it('markAsExecuting() 应该拒绝非 PENDING 状态的转换', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);
      swap.markAsExecuting();

      expect(() => swap.markAsExecuting()).toThrow(BusinessRuleError);
    });
  });

  describe('业务场景', () => {
    it('应该正确处理完整的成功交换流程', () => {
      const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);

      // 1. 初始状态
      expect(swap.canExecute()).toBe(true);

      // 2. 开始执行
      swap.markAsExecuting();
      expect(swap.status).toBe(SwapStatus.EXECUTING);

      // 3. 执行成功
      swap.markAsSuccess(txHash, amountOut);
      expect(swap.status).toBe(SwapStatus.SUCCESS);
      expect(swap.isCompleted()).toBe(true);
    });
  });
});
```

---

### 测试最佳实践

#### **1. AAA 模式（Arrange-Act-Assert）**

所有测试都遵循 AAA 模式：

```typescript
it('应该正确计算输出金额', () => {
  // Arrange - 准备测试数据
  const pool = new Pool(token0, token1, reserve0, reserve1);
  const amountIn = new Amount('1', 18);

  // Act - 执行操作
  const amountOut = pool.getAmountOut(amountIn, token0);

  // Assert - 验证结果
  expect(amountOut.toNumber()).toBeGreaterThan(0);
});
```

#### **2. 测试隔离**

每个测试都是独立的，不依赖其他测试：

```typescript
describe('状态转换', () => {
  it('测试 1', () => {
    const swap = new Swap(...); // 每个测试创建新实例
    // ...
  });

  it('测试 2', () => {
    const swap = new Swap(...); // 独立的实例
    // ...
  });
});
```

#### **3. 边界值测试**

测试边界情况和异常情况：

```typescript
it('应该拒绝无效的小数位数', () => {
  expect(() => new Amount('100', -1)).toThrow();
  expect(() => new Amount('100', 19)).toThrow();
  expect(() => new Amount('100', 0)).not.toThrow(); // 边界值
  expect(() => new Amount('100', 18)).not.toThrow(); // 边界值
});
```

#### **4. 业务场景测试**

测试完整的业务流程：

```typescript
it('应该正确处理完整的成功交换流程', () => {
  // 模拟真实的业务场景
  const swap = new Swap(tokenIn, tokenOut, amountIn, slippage);

  expect(swap.canExecute()).toBe(true);
  swap.markAsExecuting();
  swap.markAsSuccess(txHash, amountOut);
  expect(swap.isCompleted()).toBe(true);
});
```

---

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定文件的测试
pnpm test -- src/domain/aggregates/__tests__/Swap.test.ts

# 监听模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage

# 只测试 Domain 层
pnpm test -- src/domain
```

---

### 测试覆盖率报告

```bash
# 生成覆盖率报告
pnpm test:coverage -- src/domain

# 查看 HTML 报告
open coverage/lcov-report/index.html
```

**当前覆盖率**：

```
Domain Layer Coverage:
- Value Objects: 100%
- Entities: 92.55%
- Aggregates: 93.33%
- Overall: ~95%
```

---

## 开发指南

### 添加新功能的步骤

遵循 **由内而外（Inside-Out）** 的开发方式：

```
1. Domain Layer (领域层)
   ↓
2. Application Layer (应用层)
   ↓
3. Infrastructure Layer (基础设施层)
   ↓
4. Presentation Layer (表现层)
```

---

### 示例：添加 "移除流动性" 功能

#### **Step 1: Domain Layer - 定义领域模型**

```typescript
// src/domain/aggregates/Liquidity.ts
export enum LiquidityOperationType {
  ADD = 'add',
  REMOVE = 'remove', // 新增
}

export class Liquidity {
  constructor(
    operationType: LiquidityOperationType,
    token0: IToken,
    token1: IToken,
    amount0: Amount,
    amount1: Amount,
    slippage: Slippage,
  ) {
    this.validate();
  }

  private validate(): void {
    // 业务规则验证
    if (this._operationType === LiquidityOperationType.REMOVE) {
      // 移除流动性的特殊验证
      if (this._amount0.isZero() && this._amount1.isZero()) {
        throw new ValidationError('Must remove at least one token');
      }
    }
  }
}
```

**编写测试**：

```typescript
// src/domain/aggregates/__tests__/Liquidity.test.ts
describe('Liquidity Aggregate Root', () => {
  describe('移除流动性', () => {
    it('应该成功创建移除流动性操作', () => {
      const liquidity = new Liquidity(
        LiquidityOperationType.REMOVE,
        token0,
        token1,
        amount0,
        amount1,
        slippage,
      );

      expect(liquidity.operationType).toBe(LiquidityOperationType.REMOVE);
    });
  });
});
```

---

#### **Step 2: Application Layer - 实现用例**

**创建 Command**：

```typescript
// src/application/commands/removeLiquidity.command.ts
export async function executeRemoveLiquidityCommand(
  config: Config,
  userAddress: `0x${string}`,
  liquidity: Liquidity
): Promise<RemoveLiquidityResult> {
  // 1. 验证业务规则（在聚合根中）
  liquidity.markAsExecuting();

  // 2. 调用智能合约
  const txHash = await writeContract(config, {
    address: ROUTER_ADDRESS,
    abi: ROUTER_ABI,
    functionName: 'removeLiquidity',
    args: [...],
  });

  // 3. 等待确认
  await waitForTransactionReceipt(config, { hash: txHash });

  // 4. 更新状态
  liquidity.markAsSuccess(txHash);

  return { success: true, txHash };
}
```

**创建 Application Hook**：

```typescript
// src/application/hooks/useRemoveLiquidity.ts
export function useRemoveLiquidity() {
  const { mutateAsync: removeLiquidity } = useMutation({
    mutationFn: async (params: RemoveLiquidityParams) => {
      const liquidity = new Liquidity(
        LiquidityOperationType.REMOVE,
        params.token0,
        params.token1,
        new Amount(params.amount0, params.token0.decimals),
        new Amount(params.amount1, params.token1.decimals),
        new Slippage(parseFloat(params.slippage) / 100),
      );

      return executeRemoveLiquidityCommand(config, userAddress, liquidity);
    },
  });

  return { removeLiquidity };
}
```

---

#### **Step 3: Infrastructure Layer - 实现数据访问**

如果需要新的数据访问逻辑：

```typescript
// src/infrastructure/repositories/BlockchainRepository.ts
export async function getLPTokenBalance(
  config: Config,
  pairAddress: `0x${string}`,
  userAddress: `0x${string}`,
): Promise<bigint> {
  return await readContract(config, {
    address: pairAddress,
    abi: PAIR_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
  });
}
```

---

#### **Step 4: Presentation Layer - 实现 UI**

**创建表单 Hook**：

```typescript
// src/presentation/hooks/useRemoveLiquidityForm.ts
export function useRemoveLiquidityForm() {
  const form = useForm<RemoveLiquidityFormData>({
    defaultValues: {
      token0: null,
      token1: null,
      percentage: 50,
      slippage: '0.5',
    },
  });

  return form;
}
```

**创建 UI 组件**：

```typescript
// src/presentation/ui/remove-liquidity/RemoveLiquidityForm.tsx
export function RemoveLiquidityForm() {
  const form = useRemoveLiquidityForm();
  const { removeLiquidity } = useRemoveLiquidity();

  const handleSubmit = async (data: RemoveLiquidityFormData) => {
    await removeLiquidity({
      token0: data.token0,
      token1: data.token1,
      amount0: calculateAmount0(data.percentage),
      amount1: calculateAmount1(data.percentage),
      slippage: data.slippage,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* UI 组件 */}
    </form>
  );
}
```

---

### 代码规范

#### **1. 命名规范**

| 类型         | 规范                | 示例                                    |
| ------------ | ------------------- | --------------------------------------- |
| **文件名**   | camelCase           | `swap.command.ts`, `useSwap.ts`         |
| **类名**     | PascalCase          | `Swap`, `Amount`, `Pool`                |
| **接口名**   | PascalCase + I 前缀 | `IToken`, `IPool`                       |
| **函数名**   | camelCase           | `executeSwapCommand`, `getTokenBalance` |
| **常量**     | UPPER_SNAKE_CASE    | `CONTRACT_ADDRESSES`, `MAX_SLIPPAGE`    |
| **私有字段** | 下划线前缀          | `_id`, `_status`, `_amountIn`           |

---

#### **2. TypeScript 规范**

**使用 Getter 属性而非方法**：

```typescript
// ✅ 推荐
class Swap {
  get id(): string {
    return this._id;
  }
}

// ❌ 不推荐
class Swap {
  getId(): string {
    return this._id;
  }
}
```

**使用 `as const` 提高类型安全**：

```typescript
// ✅ 推荐
export const CONTRACT_ADDRESSES = {
  BTC: '0x...' as const,
  ETH: '0x...' as const,
} as const;

// ❌ 不推荐
export const CONTRACT_ADDRESSES = {
  BTC: '0x...',
  ETH: '0x...',
};
```

**接口优先于类（对于纯数据）**：

```typescript
// ✅ 推荐 - 纯数据使用接口
export interface IToken {
  address: Address;
  symbol: string;
  decimals: number;
}

// ❌ 不推荐 - 无业务逻辑的类
export class Token {
  constructor(
    public address: Address,
    public symbol: string,
    public decimals: number,
  ) {}
}
```

---

#### **3. 错误处理规范**

**使用领域错误类**：

```typescript
// ✅ 推荐
import { ValidationError, BusinessRuleError } from '@/domain/errors/DomainError';

if (amount.isZero()) {
  throw new ValidationError('Amount must be greater than 0');
}

if (priceImpact > 0.05) {
  throw new BusinessRuleError('Price impact too high');
}

// ❌ 不推荐
throw new Error('Amount must be greater than 0');
```

---

#### **4. 不可变性规范**

**值对象必须不可变**：

```typescript
// ✅ 推荐
export class Amount {
  private readonly value: string;
  private readonly decimals: number;

  add(other: Amount): Amount {
    return new Amount((this.toBigInt() + other.toBigInt()).toString(), this.decimals);
  }
}

// ❌ 不推荐
export class Amount {
  private value: string;

  add(other: Amount): void {
    this.value = (this.toBigInt() + other.toBigInt()).toString();
  }
}
```

---

### 常见问题

#### **Q1: Token 为什么既有类又有接口？**

**A**: Token 采用混合设计：

- **Token 类（充血模型）** - 内部使用，封装业务逻辑
  - 使用 `fromRaw` 工厂方法创建
  - 包含业务方法：`shortAddress`, `isETH`, `isNative`, `equals`
  - 不可变设计，值对象特征

- **IToken 接口（贫血模型）** - 对外传输，纯数据对象
  - 用于跨层数据传输
  - 用于 API 响应
  - 用于状态管理（Zustand stores）

这种设计兼顾了业务逻辑封装和数据传输的便利性。

---

#### **Q2: 为什么 stores 目录在顶层而不是 presentation 层？**

**A**: Stores 包含的不仅是 UI 状态，还有业务数据（代币缓存）、用户偏好（滑点设置）等，是跨层的关注点，所以独立出来。

---

#### **Q3: Command 和 Query 有什么区别？**

**A**:

- **Command（命令）** - 修改状态，返回操作结果
- **Query（查询）** - 只读操作，不修改状态，可以缓存

---

#### **Q4: 什么时候使用充血模型，什么时候使用贫血模型？**

**A**:

- **充血模型** - 有业务规则的对象（Pool, Swap, Liquidity, Faucet, Token, Amount, Slippage）
- **贫血模型** - 纯数据对象（IToken - 用于数据传输）
- **混合设计** - Token 类（充血模型）+ IToken 接口（贫血模型）

---

#### **Q5: 为什么 Domain 层不能依赖外部框架？**

**A**:

- ✅ 业务逻辑独立于技术实现
- ✅ 易于测试（不需要 mock 外部依赖）
- ✅ 易于迁移（如更换 Web3 库）

---

### 项目启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 运行测试
pnpm test

# 生成测试覆盖率
pnpm test:coverage

# 代码检查
pnpm lint
```

---

### 相关资源

#### **DDD 学习资源**

- 📘 [Domain-Driven Design (Eric Evans)](https://www.domainlanguage.com/ddd/)
- 📘 [Implementing Domain-Driven Design (Vaughn Vernon)](https://vaughnvernon.com/)
- 🎥 [DDD Europe](https://dddeurope.com/)

#### **CQRS 学习资源**

- 📘 [CQRS Pattern (Martin Fowler)](https://martinfowler.com/bliki/CQRS.html)
- 📘 [CQRS Journey (Microsoft)](<https://docs.microsoft.com/en-us/previous-versions/msp-n-p/jj554200(v=pandp.10)>)

#### **TypeScript 最佳实践**

- 📘 [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- 📘 [Effective TypeScript](https://effectivetypescript.com/)

#### **测试最佳实践**

- 📘 [Testing Library](https://testing-library.com/)
- 📘 [Jest Documentation](https://jestjs.io/)

---

## 总结

本项目采用 **DDD + CQRS** 架构，具有以下特点：

✅ **清晰的分层架构** - Domain, Application, Infrastructure, Presentation 四层分离

⭐ **充血领域模型（Rich Domain Model）** - 这是本项目的核心设计原则

- 业务逻辑封装在领域对象内部
- 对象 = 数据 + 行为
- 聚合根、实体、值对象都包含丰富的业务方法
- 与贫血模型（Anemic Model）相反

✅ **CQRS 模式** - 读写操作分离，职责明确

✅ **状态机模式** - 聚合根使用状态机管理生命周期

✅ **不可变性** - 值对象和聚合根的不可变设计

✅ **高测试覆盖率** - 152+ 单元测试，95% 覆盖率

✅ **类型安全** - 完整的 TypeScript 类型系统

✅ **依赖倒置** - Domain 层不依赖任何外部框架

---

### 充血模型的优势

本项目通过充血模型获得了以下优势：

| 优势       | 说明                     | 示例                                                        |
| ---------- | ------------------------ | ----------------------------------------------------------- |
| **高内聚** | 业务逻辑和数据在一起     | `Pool.getAmountOut()` 而非 `PoolService.getAmountOut(pool)` |
| **低耦合** | 对象自己负责业务规则     | `Swap.validate()` 在构造时自动调用                          |
| **易测试** | 对象可以独立测试         | 152 个单元测试，无需 mock                                   |
| **易理解** | 业务逻辑集中在领域对象   | 看 `Swap` 类就知道所有交换逻辑                              |
| **易维护** | 修改业务规则只需改一处   | 修改滑点计算只需改 `Amount.applySlippage()`                 |
| **易扩展** | 新业务方法直接加到对象上 | 新增 `Pool.calculateFee()` 方法                             |

---

### 架构优势总结

这种架构使得代码：

- 📖 **易于理解** - 清晰的分层和职责划分，业务逻辑集中在 Domain 层
- 🧪 **易于测试** - Domain 层可以独立测试，无需 mock 外部依赖
- 🔧 **易于维护** - 业务逻辑与技术实现分离，修改影响范围小
- 🚀 **易于扩展** - 新功能遵循相同的模式，充血模型易于添加新方法
- ⭐ **符合 DDD 最佳实践** - 充血模型是 DDD 的核心原则

---

### 关键设计决策

1. ⭐ **Domain 层采用充血模型** - 业务逻辑在领域对象内部
2. ✅ **Token 混合设计** - Token 类（充血模型）+ IToken 接口（贫血模型）
3. ✅ **工厂方法模式** - Token 使用 `fromRaw` 静态工厂方法创建
4. ✅ **CQRS 分离读写** - Commands 修改状态，Queries 只读
5. ✅ **状态管理独立** - Stores 在顶层，跨层使用
6. ✅ **依赖倒置** - Domain 层不依赖外部框架

---

**Happy Coding! 🎉**

**记住：充血模型是本项目的核心设计原则！** ⭐
