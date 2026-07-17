const { adyenCall, assertConfig, ADYEN_MERCHANT_ACCOUNT, DEMO_SHOPPER_REFERENCE } = require('./shared.cjs');

exports.handler = async (event, context) => {
  const missing = assertConfig();
  if (missing.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing credentials', missing }),
    };
  }

  const { amount, currency, countryCode, shopperLocale, allowedPaymentMethods, enableStoreDetails } = JSON.parse(event.body);
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
    return {
      statusCode: result.ok ? 200 : result.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
