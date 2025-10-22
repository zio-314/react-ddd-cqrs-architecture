# Uniswap Minimal - DDD + CQRS Architecture Demo

A production-ready Uniswap V2 clone built with **Domain-Driven Design (DDD)** and **CQRS** patterns, showcasing best practices for React/Next.js frontend architecture.

## 🎯 Project Overview

This project demonstrates how to build a complex DeFi application with clean architecture principles:

- **Domain-Driven Design (DDD)** - Rich domain models with clear boundaries
- **CQRS Pattern** - Separation of Commands (writes) and Queries (reads)
- **Layered Architecture** - Domain, Application, Infrastructure, and Presentation layers
- **Type Safety** - Full TypeScript with strict mode
- **Comprehensive Testing** - 200+ unit tests with high coverage

## 🏗️ Architecture

```
src/
├── domain/              # Business logic & rules
│   ├── aggregates/      # Swap, Liquidity
│   ├── entities/        # Pool, Token, Faucet
│   ├── value-objects/   # Amount, Slippage
│   ├── services/        # AMMCalculationService
│   └── errors/          # Domain errors
│
├── application/         # Use cases & orchestration
│   ├── commands/        # Write operations (executeSwap, addLiquidity)
│   ├── queries/         # Read operations (getSwapQuote, compareSwapRoutes)
│   ├── hooks/           # React hooks wrapping use cases
│   └── validators/      # Input validation
│
├── infrastructure/      # External concerns
│   ├── blockchain/      # Wagmi config, contracts, ABIs
│   ├── repositories/    # Data access (PoolRepository, TokenRepository)
│   └── shared/          # Utilities (cn, themes)
│
└── presentation/        # UI components
    ├── ui/              # Feature components (Swap, Pool, Faucet)
    └── hooks/           # UI-specific hooks
```

## ✨ Features

### Core DeFi Functionality
- **Token Swaps** - Exchange tokens with real-time price quotes
- **Liquidity Provision** - Add/remove liquidity and earn LP tokens
- **Pool Management** - View pool stats, reserves, and prices
- **Token Faucet** - Get test tokens for development

### DDD Patterns Demonstrated
- **Aggregates** - `Swap` and `Liquidity` with clear boundaries
- **Entities** - `Pool` with rich domain logic (AMM calculations)
- **Value Objects** - `Amount` and `Slippage` with immutability
- **Domain Services** - `AMMCalculationService` for cross-entity calculations
- **Domain Events** - Transaction lifecycle tracking
- **Repository Pattern** - Abstract data access

### Technical Highlights
- **React 19** with Server Components
- **Next.js 15** with App Router
- **Wagmi v2** for Ethereum interactions
- **RainbowKit** for wallet connections
- **Zustand** for state management
- **React Query** for server state
- **Tailwind CSS v4** for styling
- **Jest** with 200+ tests

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 10+
- MetaMask or compatible wallet

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3004
```

### Available Scripts

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm test             # Run tests
pnpm test:coverage    # Run tests with coverage
pnpm lint             # Lint code
pnpm format           # Format code
pnpm type-check       # TypeScript check
pnpm quality          # Run all checks (CI)
```

## 🧪 Testing

The project has comprehensive test coverage:

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

**Test Statistics:**
- 200+ unit tests
- Domain layer: 100% coverage
- Application layer: 95%+ coverage
- All critical paths tested

## 📚 Key Concepts

### 1. Domain Layer

**Aggregates** manage consistency boundaries:
```typescript
// Swap aggregate
const swap = Swap.create(pool, tokenIn, amountIn, slippage);
swap.execute(); // Validates business rules
```

**Entities** contain business logic:
```typescript
// Pool entity with AMM calculations
const amountOut = pool.getAmountOut(amountIn, tokenIn);
const priceImpact = pool.calculatePriceImpact(amountIn, tokenIn);
```

**Value Objects** ensure immutability:
```typescript
const amount = new Amount('1.5', 18);
const doubled = amount.multiply(2); // Returns new instance
```

### 2. Application Layer

**Commands** for writes:
```typescript
const result = await executeSwap({
  pool,
  tokenIn,
  tokenOut,
  amountIn,
  slippage,
});
```

**Queries** for reads:
```typescript
const quote = await getSwapQuote({
  pool,
  tokenIn,
  amountIn,
});
```

### 3. Domain Services

Used for cross-entity calculations:
```typescript
const ammService = new AMMCalculationService();
const routes = compareSwapRoutes(pools, amountIn, tokenIn, tokenOut);
const bestRoute = routes[0]; // Highest score
```

## 🎨 UI Components

Built with **shadcn/ui** and **Tailwind CSS**:

- Swap interface with real-time quotes
- Liquidity management with LP token calculations
- Pool explorer with detailed stats
- Token faucet for testing
- Responsive design with dark mode

## 🔧 Configuration

### Blockchain Setup

Configure networks in `src/infrastructure/blockchain/wagmi.config.ts`:

```typescript
export const config = createConfig({
  chains: [hardhat],
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
});
```

### Contract Addresses

Update in `src/infrastructure/blockchain/contracts.ts`:

```typescript
export const CONTRACTS = {
  FACTORY: '0x...',
  ROUTER: '0x...',
  // ...
} as const;
```

## 📖 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture guide
- [Domain Layer](./src/domain/README.md) - Domain models explained
- [Application Layer](./src/application/README.md) - Use cases guide

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15, React 19 |
| Language | TypeScript 5.9 |
| Blockchain | Wagmi 2.x, Viem 2.x |
| Wallet | RainbowKit 2.x |
| State | Zustand, React Query |
| Styling | Tailwind CSS 4 |
| Testing | Jest, Testing Library |
| Linting | ESLint, Prettier |
| Package Manager | pnpm |

## 🎓 Learning Resources

This project is ideal for learning:

- **DDD in Frontend** - How to apply DDD patterns in React
- **CQRS Pattern** - Separating reads and writes
- **Clean Architecture** - Layered design with clear dependencies
- **DeFi Development** - Uniswap V2 AMM mechanics
- **Web3 Integration** - Wagmi + RainbowKit best practices
- **Testing Strategies** - Unit testing domain logic

## 📝 License

MIT

## 🤝 Contributing

This is a demonstration project. Feel free to fork and adapt for your needs.

## 🙏 Acknowledgments

- **Uniswap V2** - AMM protocol design
- **Eric Evans** - Domain-Driven Design principles
- **shadcn/ui** - Beautiful UI components
- **Wagmi Team** - Excellent Web3 React hooks
