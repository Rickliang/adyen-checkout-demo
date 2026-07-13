# Adyen Checkout Demo

[中文版本](./README.zh.md)

![screenshot](docs/screenshot.png)

A lightweight Adyen test-environment checkout demo. Switch between Sessions / Advanced flows, Drop-in / single components, and inspect requests, responses, and events in the developer panel.

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your Adyen credentials
npm start
```

Open: http://localhost:8080

## Environment Setup

See [CONFIGURATION.md](./CONFIGURATION.md) for detailed setup instructions.

**Required environment variables:**

| Variable | Source |
|----------|--------|
| `ADYEN_API_KEY` | Adyen Customer Area > API credentials |
| `ADYEN_MERCHANT_ACCOUNT` | Adyen Customer Area |
| `ADYEN_CLIENT_KEY` | Adyen Customer Area > API credentials |

**Defaults** (hardcoded):

- Environment: `test`
- API version: `v71`
- Port: `8080`

## Repository

[https://github.com/Rickliang/adyen-checkout-demo](https://github.com/Rickliang/adyen-checkout-demo)
