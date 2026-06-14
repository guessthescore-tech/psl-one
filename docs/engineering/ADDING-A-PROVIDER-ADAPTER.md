# PSL One — Adding a Provider Adapter

**Purpose:** How to wire a new external provider (wallet, data feed, notifications, CDN)  
**Audience:** Backend engineers  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Overview

All external provider integrations use the adapter pattern:

1. Define a TypeScript interface
2. Implement a sandbox adapter (no real API calls)
3. Implement a production adapter when the provider is contracted
4. Switch via environment variable or `IntegrationProviderConfig`

---

## Step 1: Define the Interface

Create the interface in the relevant module:

```typescript
// apps/api/src/wallet/wallet.adapter.ts
export interface WalletAdapter {
  linkWallet(userId: string, providerRef: string): Promise<WalletLinkResult>;
  getBalance(userId: string): Promise<number>;
  debit(userId: string, amount: number, reason: string): Promise<TransactionResult>;
}

export const WALLET_ADAPTER_TOKEN = Symbol('WALLET_ADAPTER');
```

---

## Step 2: Implement the Sandbox Adapter

```typescript
// apps/api/src/wallet/sandbox-wallet.adapter.ts
import { Injectable } from '@nestjs/common';
import { WalletAdapter } from './wallet.adapter';

@Injectable()
export class SandboxWalletAdapter implements WalletAdapter {
  async linkWallet(userId: string, providerRef: string) {
    // Returns mock response — no HTTP call
    return { userId, providerRef, linked: true };
  }

  async getBalance(userId: string) {
    return 1000; // Sandbox balance
  }

  async debit(userId: string, amount: number, reason: string) {
    return { success: true, transactionId: `sandbox-${Date.now()}` };
  }
}
```

No outbound HTTP calls in the sandbox adapter. No real credentials needed.

---

## Step 3: Register in Module

```typescript
// wallet.module.ts
@Module({
  providers: [
    WalletService,
    {
      provide: WALLET_ADAPTER_TOKEN,
      useClass:
        process.env.WALLET_PROVIDER === 'production'
          ? ProductionWalletAdapter  // import conditionally
          : SandboxWalletAdapter,
    },
  ],
  exports: [WalletService],
})
export class WalletModule {}
```

---

## Step 4: Inject in Service

```typescript
// wallet.service.ts
@Injectable()
export class WalletService {
  constructor(
    @Inject(WALLET_ADAPTER_TOKEN) private readonly adapter: WalletAdapter,
    private readonly prisma: PrismaService,
  ) {}

  async linkFanWallet(userId: string, providerRef: string) {
    const result = await this.adapter.linkWallet(userId, providerRef);
    await this.prisma.walletLink.create({ data: { userId, providerRef } });
    return result;
  }
}
```

---

## Step 5: Implement the Production Adapter (When Provider is Contracted)

```typescript
// apps/api/src/wallet/production-wallet.adapter.ts
@Injectable()
export class ProductionWalletAdapter implements WalletAdapter {
  private readonly client: ProviderSdkClient;

  constructor() {
    this.client = new ProviderSdkClient({
      apiKey: process.env.WALLET_PROVIDER_API_KEY,
      baseUrl: process.env.WALLET_PROVIDER_BASE_URL,
    });
  }

  async linkWallet(userId: string, providerRef: string) {
    return this.client.linkAccount({ userId, ref: providerRef });
  }
  // ...
}
```

---

## Step 6: Update IntegrationProviderConfig

Update the `IntegrationProviderConfig` record for this provider:

```
PATCH /admin/operations/providers/wallet_primary
{ "status": "CONFIGURED", "provider": "ProductionWalletProvider" }
```

---

## Current Adapters

| Domain | Token | Sandbox Adapter | Production Adapter |
|--------|-------|----------------|-------------------|
| Wallet | `WALLET_ADAPTER_TOKEN` | `SiliconEnterpriseSandboxWalletAdapter` | Not implemented |
| Live data | `LIVE_DATA_PROVIDER_TOKEN` | Admin manual entry | Not implemented |
| Notifications | N/A | DB-only writes | Not implemented |
| Media CDN | N/A | URL placeholder | Not implemented |

---

## Rules for New Adapters

1. **Interface first** — define the interface before writing any adapter
2. **Sandbox must be complete** — sandbox adapter must handle all interface methods
3. **Zero outbound calls in sandbox** — sandbox never calls external APIs
4. **Environment-based switching** — use `process.env.PROVIDER_NAME` to select adapter
5. **No credentials in code** — production credentials come from environment variables or Secrets Manager
6. **Test against interface** — service tests mock the adapter token, not the concrete class
7. **Update `IntegrationProviderConfig`** — admin table must reflect the current state

---

## Testing Adapters

Service tests mock the adapter token:

```typescript
const mockAdapter = {
  linkWallet: vi.fn(),
  getBalance: vi.fn(),
};

await Test.createTestingModule({
  providers: [
    WalletService,
    { provide: WALLET_ADAPTER_TOKEN, useValue: mockAdapter },
    { provide: PrismaService, useValue: mockPrisma },
  ],
}).compile();
```

Adapter-level integration tests (testing the sandbox adapter directly) are separate and optional for development.
