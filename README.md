# Adyen Checkout Demo

[中文版本](./README.zh.md)

![screenshot](docs/screenshot.png)

A lightweight Adyen test-environment checkout demo. Switch between Sessions / Advanced flows, Drop-in / single components, and inspect requests, responses, and events in the developer panel.

## Quick Start

```bash
npm install
cp .env.example .env
npm start
```

Open your browser at:

```text
http://localhost:8080
```

## Configuration

For detailed setup instructions, see [CONFIGURATION.md](./CONFIGURATION.md).

### Environment

- **Default environment**: `test` (Adyen test-environment)
- **API version**: `v71`

### Quick Start: Local Development

**Option 1: Using `.env` file (recommended)**

```bash
cp .env.example .env
```

Then fill `.env` with your Adyen test credentials:

```text
ADYEN_API_KEY=YOUR_TEST_API_KEY
ADYEN_MERCHANT_ACCOUNT=YOUR_MERCHANT_ACCOUNT
ADYEN_CLIENT_KEY=test_YOUR_CLIENT_KEY
```

**Option 2: Using environment variables**

Set environment variables in your shell:

```bash
export ADYEN_API_KEY=YOUR_TEST_API_KEY
export ADYEN_MERCHANT_ACCOUNT=YOUR_MERCHANT_ACCOUNT
export ADYEN_CLIENT_KEY=test_YOUR_CLIENT_KEY
npm start
```

The app will automatically read credentials from environment variables as a fallback.

**Important**: Make sure the Client Key's "Allowed origins" includes `http://localhost:8080`.

### Netlify Deployment

Set these environment variables in Netlify Site settings > Build & deploy > Environment:

| Variable | Description |
|----------|-------------|
| `ADYEN_API_KEY` | Get from Adyen Customer Area |
| `ADYEN_MERCHANT_ACCOUNT` | Merchant account name |
| `ADYEN_CLIENT_KEY` | Client Key (add Netlify URL to allowed origins) |

After deployment, add your Netlify site URL (e.g., `https://yourapp.netlify.app`) to the Client Key's "Allowed origins" in Adyen.

## Features

- **Dual Integration Flows**: Sessions (recommended) vs Advanced
- **Component Types**: Drop-in (all-in-one) vs single components (card, wallet, etc.)
- **Stored Payment Methods**: Save and reuse cards with delete functionality
- **Payment Line Items**: Full support for Klarna, Afterpay, Ratepay
- **Developer Tools**: Network/Events tabs, merged request/response logs, colored indicators
- **Multi-Language**: Chinese/English UI toggle
- **Test Card Presets**: Quick copy-to-clipboard for testing
- **3DS Configuration**: Challenge window size selector
- **Country Selector**: Fixed widget for testing different regions

## Project Structure

```
.
├── public/                      # Frontend (static assets)
│   ├── index.html              # HTML layout
│   ├── app.js                  # Frontend logic & SDK integration
│   └── styles.css              # Styling
├── netlify/functions/          # Netlify Functions (serverless backend)
│   ├── api.js                  # Unified API router
│   ├── shared.js               # Adyen API utilities
│   └── config.js, sessions.js, etc.  # Individual endpoint functions
├── server.js                   # Express server (local development)
├── .env.example                # Environment template
├── netlify.toml                # Netlify build config
└── README.md, README.zh.md     # Documentation
```

## Local Development vs Netlify

**Local**: `npm start` runs `server.js` (Express backend on port 8080)

**Netlify**: Frontend served from `public/`, backend via Netlify Functions at `/.netlify/functions/api`

## Repository

[https://github.com/Rickliang/adyen-checkout-demo](https://github.com/Rickliang/adyen-checkout-demo)
