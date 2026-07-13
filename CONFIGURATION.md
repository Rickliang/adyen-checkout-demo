# Configuration Guide

## Environment Variables

The app reads Adyen credentials with automatic fallback mechanism:

### Required Variables

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `ADYEN_API_KEY` | Server-side API authentication | Adyen Customer Area > Developers > API credentials |
| `ADYEN_MERCHANT_ACCOUNT` | Merchant account identifier | Adyen Customer Area |
| `ADYEN_CLIENT_KEY` | Browser SDK authentication | Adyen Customer Area > Developers > API credentials |

### Fixed Values (Hardcoded - No Need to Set)

| Variable | Value | Reason |
|----------|-------|--------|
| `ADYEN_ENVIRONMENT` | `test` | Always use test environment |
| `ADYEN_API_VERSION` | `v71` | Fixed API version for consistency |
| `PORT` | `8080` | Default port for local development |

## Configuration Precedence

### Local Development

1. Variables in `.env` file (highest priority)
2. System environment variables
3. Missing → Error (validation in `assertConfig()`)

### Netlify Deployment

1. Netlify environment variables (highest priority)
2. Missing → Error (validation in `assertConfig()`)

Note: `.env` file is **not** read in Netlify (it's in `.gitignore` and not deployed).

## Setup Instructions

### Step 1: Get Adyen Credentials

1. Log in to [Adyen Customer Area](https://ca-test.adyen.com)
2. Navigate to **Developers** > **API credentials**
3. Select or create a **Web Service User**
4. Copy these values:
   - **API Key** → `ADYEN_API_KEY`
   - **Merchant Account** → `ADYEN_MERCHANT_ACCOUNT`
   - **Client Key** → `ADYEN_CLIENT_KEY`

### Step 2: Local Development

**Method A: Using `.env` file**

```bash
cp .env.example .env
# Edit .env and paste your credentials
nano .env
npm start
```

**Method B: Using environment variables**

```bash
export ADYEN_API_KEY="your_api_key"
export ADYEN_MERCHANT_ACCOUNT="your_merchant_account"
export ADYEN_CLIENT_KEY="your_client_key"
npm start
```

### Step 3: Netlify Deployment

1. Log in to Netlify
2. Go to your site: **Site settings** > **Build & deploy** > **Environment**
3. Click **Edit variables**
4. Add these three variables:
   - `ADYEN_API_KEY`
   - `ADYEN_MERCHANT_ACCOUNT`
   - `ADYEN_CLIENT_KEY`

### Step 4: Allow Netlify URL in Adyen

1. In Adyen Customer Area, go to **Developers** > **API credentials**
2. Click on your **Client Key**
3. Add your Netlify URL (e.g., `https://yourapp.netlify.app`) to **Allowed origins**
4. Also add `http://localhost:8080` for local testing

## Troubleshooting

**"Missing credentials" error on page load:**
- Verify all three variables are set
- Check `.env` file exists in local development
- Restart the dev server after updating `.env`
- Verify Netlify environment variables are set (wait a few minutes after saving)

**"Origin not allowed" error in Network tab:**
- Add your current URL (localhost or Netlify) to Adyen Client Key's "Allowed origins"
- Wait a few minutes for Adyen to apply the changes

**"API Key invalid" error:**
- Verify the API Key starts with `AK_` or similar prefix
- Ensure the API Key is for the same environment (test) as your Client Key
