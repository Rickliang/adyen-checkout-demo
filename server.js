import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const {
  ADYEN_API_KEY,
  ADYEN_MERCHANT_ACCOUNT,
  ADYEN_CLIENT_KEY,
  ADYEN_ENVIRONMENT = 'test',
  ADYEN_API_VERSION = 'v71',
  PORT = 8080,
} = process.env;

const CHECKOUT_BASE =
  ADYEN_ENVIRONMENT === 'live'
    ? 'https://checkout-live.adyen.com'
    : 'https://checkout-test.adyen.com';

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

const DEMO_SHOPPER_REFERENCE = 'adyen-checkout-demo-shopper';

function assertConfig() {
  const missing = [];
  if (!ADYEN_API_KEY || ADYEN_API_KEY === 'YOUR_TEST_API_KEY') missing.push('ADYEN_API_KEY');
  if (!ADYEN_MERCHANT_ACCOUNT || ADYEN_MERCHANT_ACCOUNT === 'YOUR_MERCHANT_ACCOUNT')
    missing.push('ADYEN_MERCHANT_ACCOUNT');
  if (!ADYEN_CLIENT_KEY || ADYEN_CLIENT_KEY === 'test_YOUR_CLIENT_KEY')
    missing.push('ADYEN_CLIENT_KEY');
  return missing;
}

// Thin wrapper around the Adyen Checkout API that also returns the raw
// request/response so the frontend can display exactly what was exchanged.
async function adyenCall(path, body) {
  const url = `${CHECKOUT_BASE}/${ADYEN_API_VERSION}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-API-key': ADYEN_API_KEY,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, url, request: body, response: json };
}

function reference() {
  return `demo-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
}

// Non-secret config for the browser SDK.
app.get('/api/config', (_req, res) => {
  const missing = assertConfig();
  res.json({
    clientKey: ADYEN_CLIENT_KEY,
    environment: ADYEN_ENVIRONMENT,
    merchantAccount: ADYEN_MERCHANT_ACCOUNT,
    configured: missing.length === 0,
    missing,
  });
});

// --- Sessions flow -------------------------------------------------------
app.post('/api/sessions', async (req, res) => {
  const missing = assertConfig();
  if (missing.length) return res.status(400).json({ error: 'Missing credentials', missing });

  const { amount, currency, countryCode, shopperLocale, returnUrl, enableStoreDetails } = req.body;
  const body = {
    merchantAccount: ADYEN_MERCHANT_ACCOUNT,
    amount: { value: amount, currency },
    countryCode,
    shopperLocale,
    reference: reference(),
    returnUrl: returnUrl || 'http://localhost:' + PORT,
    channel: 'Web',
  };
  if (enableStoreDetails) {
    body.shopperReference = DEMO_SHOPPER_REFERENCE;
    body.recurringProcessingModel = 'CardOnFile';
    body.shopperInteraction = 'Ecommerce';
  }
  try {
    const result = await adyenCall('/sessions', body);
    res.status(result.ok ? 200 : result.status).json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// --- Advanced flow -------------------------------------------------------
app.post('/api/paymentMethods', async (req, res) => {
  const missing = assertConfig();
  if (missing.length) return res.status(400).json({ error: 'Missing credentials', missing });

  const { amount, currency, countryCode, shopperLocale, allowedPaymentMethods, enableStoreDetails } = req.body;
  const body = {
    merchantAccount: ADYEN_MERCHANT_ACCOUNT,
    amount: { value: amount, currency },
    countryCode,
    shopperLocale,
    channel: 'Web',
  };
  if (Array.isArray(allowedPaymentMethods) && allowedPaymentMethods.length) {
    body.allowedPaymentMethods = allowedPaymentMethods;
  }
  if (enableStoreDetails) {
    body.shopperReference = DEMO_SHOPPER_REFERENCE;
  }
  try {
    const result = await adyenCall('/paymentMethods', body);
    res.status(result.ok ? 200 : result.status).json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/payments', async (req, res) => {
  const missing = assertConfig();
  if (missing.length) return res.status(400).json({ error: 'Missing credentials', missing });

  const { stateData, amount, currency, countryCode, returnUrl, origin, challengeWindowSize } = req.body;
  const threeDSRequestData = { nativeThreeDS: 'preferred' };
  if (challengeWindowSize) {
    threeDSRequestData.challengeWindowSize = challengeWindowSize;
  }
  const body = {
    ...stateData,
    merchantAccount: ADYEN_MERCHANT_ACCOUNT,
    amount: { value: amount, currency },
    countryCode,
    reference: reference(),
    channel: 'Web',
    returnUrl: returnUrl || 'http://localhost:' + PORT,
    origin: origin || 'http://localhost:' + PORT,
    additionalData: { allow3DS2: true },
    authenticationData: { threeDSRequestData },
  };
  const isStoringNewMethod = Boolean(stateData?.storePaymentMethod || stateData?.paymentMethod?.storePaymentMethod);
  const isUsingStoredMethod = Boolean(
    stateData?.paymentMethod?.storedPaymentMethodId || stateData?.paymentMethod?.recurringDetailReference
  );
  if (isStoringNewMethod || isUsingStoredMethod) {
    body.shopperReference = DEMO_SHOPPER_REFERENCE;
    body.recurringProcessingModel = 'CardOnFile';
    body.shopperInteraction = isUsingStoredMethod ? 'ContAuth' : 'Ecommerce';
  }
  try {
    const result = await adyenCall('/payments', body);
    res.status(result.ok ? 200 : result.status).json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/payments/details', async (req, res) => {
  const missing = assertConfig();
  if (missing.length) return res.status(400).json({ error: 'Missing credentials', missing });

  const { stateData } = req.body;
  try {
    const result = await adyenCall('/payments/details', stateData);
    res.status(result.ok ? 200 : result.status).json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// --- Stored payment methods management ---
app.post('/api/storedPaymentMethods/disable', async (req, res) => {
  const missing = assertConfig();
  if (missing.length) return res.status(400).json({ error: 'Missing credentials', missing });

  const { storedPaymentMethodId, recurringDetailReference } = req.body;
  const id = storedPaymentMethodId || recurringDetailReference;
  
  if (!id) {
    return res.status(400).json({ 
      error: 'storedPaymentMethodId or recurringDetailReference is required' 
    });
  }

  // Adyen v71+ uses DELETE on /storedPaymentMethods/{id}
  // Both shopperReference and merchantAccount must be query parameters
  const urlObj = new URL(`${CHECKOUT_BASE}/${ADYEN_API_VERSION}/storedPaymentMethods/${id}`);
  urlObj.searchParams.append('shopperReference', DEMO_SHOPPER_REFERENCE);
  urlObj.searchParams.append('merchantAccount', ADYEN_MERCHANT_ACCOUNT);
  
  try {
    const response = await fetch(urlObj.toString(), {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
        'x-API-key': ADYEN_API_KEY,
      },
    });

    const text = await response.text();
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }

    const result = {
      ok: response.ok,
      status: response.status,
      url: urlObj.toString(),
      request: { storedPaymentMethodId: id },
      response: json,
    };

    res.status(response.ok ? 200 : response.status).json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('*', (_req, res) => res.sendFile(join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  const missing = assertConfig();
  console.log(`\nAdyen checkout demo running: http://localhost:${PORT}`);
  console.log(`Environment: ${ADYEN_ENVIRONMENT}  |  API: ${ADYEN_API_VERSION}`);
  if (missing.length) {
    console.log(`\n[!] Missing credentials in .env: ${missing.join(', ')}`);
    console.log('    The UI will load but payments will fail until they are set.\n');
  } else {
    console.log(`Merchant: ${ADYEN_MERCHANT_ACCOUNT}\n`);
  }
});
