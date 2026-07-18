# @neo-cheems/mienvio-sdk

[![npm version](https://img.shields.io/npm/v/@neo-cheems/mienvio-sdk)](https://www.npmjs.com/package/@neo-cheems/mienvio-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**TypeScript SDK for the Mienvío API v2** — create, manage, and track shipments across Mexico's top parcel carriers.

- 🚀 **Zero dependencies** — uses native `fetch` (Node 18+ / Bun / Deno)
- 🧪 **Fully typed** with strict TypeScript declarations
- 🌐 **Sandbox & production** environments
- 📦 **ESM only** — tree-shakeable, modern module format

---

## Installation

```bash
# npm
npm install @neo-cheems/mienvio-sdk

# bun
bun add @neo-cheems/mienvio-sdk

# yarn
yarn add @neo-cheems/mienvio-sdk

# pnpm
pnpm add @neo-cheems/mienvio-sdk
```

## Quick Start

```ts
import { MienvioClient } from "@neo-cheems/mienvio-sdk";

// Initialize the client (sandbox mode for testing)
const mienvio = new MienvioClient({
  token: "tu-api-token",
  sandbox: true, // remove for production
});

// 1. Get shipping rates
const rates = await mienvio.rates.getRates({
  packing_mode: "none",
  from_address: { zipcode: "06600", country: "MX" },
  to_address: { zipcode: "11520", country: "MX" },
  package: { weight: 5, length: 40, width: 40, height: 20 },
});

console.log(rates.data[0].rates);

// 2. Create a draft shipment (unpaid)
const draft = await mienvio.shipments.createDraft({
  shipments: [
    {
      packing_mode: "none",
      from_address: {
        name: "Juan Pérez",
        phone: "5512345678",
        email: "juan@example.com",
        zipcode: "06600",
        country: "MX", street: "Av. Reforma 200",
      },
      to_address: {
        name: "María García",
        phone: "5598765432",
        email: "maria@example.com",
        zipcode: "11520",
        country: "MX",
        street: "Av. Ejército Nacional 500",
      },
      package: {
        weight: 5, length: 40, width: 40, height: 20,
        description: "Caja de documentos",
        fiscal_code: "55101530",
        package_type: "box",
      },
      service: {}, // optional rate_id and insurance
    },
  ],
});
```

## API Reference

### Client configuration

| Option     | Type      | Default                              | Description                      |
|------------|-----------|--------------------------------------|----------------------------------|
| `token`    | `string`  | **required**                         | Bearer JWT token from Mienvío    |
| `sandbox`  | `boolean` | `false`                              | Use `dev-sandbox.mienvio.mx`     |
| `baseUrl`  | `string`  | Auto (sandbox or production)         | Override the base URL            |
| `timeout`  | `number`  | `30_000` (30s)                       | Request timeout in milliseconds  |

```ts
// Production
const client = new MienvioClient({ token: "prod-token" });

// Sandbox (explicit)
const client = new MienvioClient({ token: "test-token", sandbox: true });

// Custom URL
const client = new MienvioClient({ token: "token", baseUrl: "https://custom/api" });
```

### Rates

```ts
const res = await client.rates.getRates({
  packing_mode: "existing" | "none",
  from_address: { zipcode: string, country: string, ... },
  to_address: { zipcode: string, country: string, ... },
  // When packing_mode = "none":
  package: { weight, length, width, height, declared_value? },
  // When packing_mode = "existing":
  items: [{ weight, length, width, height, qty?, declared_value? }],
});
```

### Shipments

| Method                    | HTTP            | Description                             |
|---------------------------|-----------------|-----------------------------------------|
| `createDraft(params)`     | `POST /v2/shipments/draft`   | Create unpaid draft shipment |
| `updateDraft(params)`     | `PUT /v2/shipments`          | Update an existing draft     |
| `create(params)`          | `POST /v2/shipments`         | Create and pay immediately   |
| `get(id)`                 | `GET /v2/shipments/:id`      | Get shipment details         |
| `cancel(id, reason)`      | `POST /v2/shipments/:id/cancel` | Cancel a single shipment |
| `bulkCancel(params)`      | `POST /v2/shipments/cancel`  | Cancel multiple shipments    |
| `getTracking(id)`         | `GET /v2/shipments/:id/tracking` | Get tracking events     |
| `bulkTracking(ids)`       | `POST /v2/shipments/tracking` | Get tracking for multiple    |

### Purchases

| Method     | HTTP                         | Description         |
|------------|------------------------------|---------------------|
| `get(id)`  | `GET /v2/purchases/:id`      | Get purchase details |

### Webhook utilities

```ts
import { parseWebhookPayload, isWebhookPayload } from "@neo-cheems/mienvio-sdk";

// Express / Next.js webhook handler
app.post("/webhooks/mienvio", (req, res) => {
  const payload = parseWebhookPayload(JSON.stringify(req.body));

  if (payload.event === "tracking.status") {
    console.log(`Shipment ${payload.data.shipment_id} is now ${payload.data.status}`);
  }

  res.sendStatus(200);
});
```

### Error handling

All API errors throw a typed `MienvioError`:

```ts
import { MienvioClient, MienvioError } from "@neo-cheems/mienvio-sdk";

try {
  await client.shipments.get(99999);
} catch (err) {
  if (err instanceof MienvioError) {
    console.error(`Status: ${err.status}`);
    console.error(`Message: ${err.message}`);
    if (err.data?.errors) {
      console.error("Field errors:", err.data.errors);
    }
  }
}
```

Error types:

| `status` | Meaning           |
|----------|-------------------|
| `0`      | Network / DNS error |
| `408`    | Request timeout     |
| `401`    | Unauthorized (bad token) |
| `422`    | Validation error (check `data.errors`) |
| `4xx`    | Other client error  |
| `5xx`    | Server error        |

## Environment URLs

| Environment | Base URL                             |
|-------------|--------------------------------------|
| Production  | `https://production.mienvio.mx/api`  |
| Sandbox     | `https://dev-sandbox.mienvio.mx/api` |

## Typical flow

```
1. Get rates  ──────────────────────────►  client.rates.getRates({...})
                                              │
                                              ▼  Choose a rate_id
2. Create draft ─────────────────────────►  client.shipments.createDraft({...})
                                              │
                                              ▼  Review in dashboard or pay directly
3. Create & pay  ────────────────────────►  client.shipments.create({
                                               payment_method: "wallet",
                                               shipment_ids: [123],
                                             })
                                              │
                                              ▼
4. Track  ───────────────────────────────►  client.shipments.getTracking(123)
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build

# Lint & format
bun run lint
bun run format
```

### Project structure

```
src/
├── index.ts              # Public API — exports client, error, types
├── client.ts             # MienvioClient — fetch wrapper + resource composition
├── error.ts              # MienvioError class
├── types/
│   ├── index.ts          # Barrel export
│   ├── common.ts         # Shared enums (PackingMode, TrackingStatusCode, etc.)
│   ├── address.ts        # AddressSimple, AddressFull, ItemInput, PackageInput
│   ├── shipment.ts       # All request/response types
│   ├── webhook.ts        # Webhook payload types + parse/validate utilities
│   └── client.ts         # MienvioConfig, ApiResponse<T>, URL constants
└── resources/
    ├── rates.ts          # RatesResource
    ├── shipments.ts      # ShipmentsResource
    └── purchases.ts      # PurchasesResource
```

## License

MIT — see [LICENSE](LICENSE) for details.
