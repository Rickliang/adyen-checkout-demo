const { adyenCall, assertConfig, ADYEN_MERCHANT_ACCOUNT, DEMO_SHOPPER_REFERENCE, reference } = require('./shared');

exports.handler = async (event, context) => {
  const missing = assertConfig();
  if (missing.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing credentials', missing }),
    };
  }

  const { amount, currency, countryCode, shopperLocale, returnUrl, enableStoreDetails } = JSON.parse(event.body);
  const body = {
    merchantAccount: ADYEN_MERCHANT_ACCOUNT,
    amount: { value: amount, currency },
    countryCode,
    shopperLocale,
    reference: reference(),
    returnUrl: returnUrl || 'http://localhost:8080',
    channel: 'Web',
  };
  if (enableStoreDetails) {
    body.shopperReference = DEMO_SHOPPER_REFERENCE;
    body.recurringProcessingModel = 'CardOnFile';
    body.shopperInteraction = 'Ecommerce';
  }
  try {
    const result = await adyenCall('/sessions', body);
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
