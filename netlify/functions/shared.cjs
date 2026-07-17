// Default: test environment (v71 API version)
const CHECKOUT_BASE = 'https://checkout-test.adyen.com';
const ADYEN_API_VERSION = 'v71';

const ADYEN_API_KEY = process.env.ADYEN_API_KEY;
const ADYEN_MERCHANT_ACCOUNT = process.env.ADYEN_MERCHANT_ACCOUNT;
const DEMO_SHOPPER_REFERENCE = 'adyen-checkout-demo-shopper';

function reference() {
  return `demo-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
}

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

function assertConfig() {
  const missing = [];
  if (!ADYEN_API_KEY || ADYEN_API_KEY === 'YOUR_TEST_API_KEY') missing.push('ADYEN_API_KEY');
  if (!ADYEN_MERCHANT_ACCOUNT || ADYEN_MERCHANT_ACCOUNT === 'YOUR_MERCHANT_ACCOUNT')
    missing.push('ADYEN_MERCHANT_ACCOUNT');
  if (!process.env.ADYEN_CLIENT_KEY || process.env.ADYEN_CLIENT_KEY === 'test_YOUR_CLIENT_KEY')
    missing.push('ADYEN_CLIENT_KEY');
  return missing;
}

module.exports = {
  CHECKOUT_BASE,
  ADYEN_API_KEY,
  ADYEN_MERCHANT_ACCOUNT,
  ADYEN_API_VERSION,
  DEMO_SHOPPER_REFERENCE,
  reference,
  adyenCall,
  assertConfig,
};
