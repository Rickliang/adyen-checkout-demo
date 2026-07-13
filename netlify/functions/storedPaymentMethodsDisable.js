const { assertConfig, ADYEN_API_KEY, ADYEN_MERCHANT_ACCOUNT, ADYEN_API_VERSION, CHECKOUT_BASE, DEMO_SHOPPER_REFERENCE } = require('./shared');

exports.handler = async (event, context) => {
  const missing = assertConfig();
  if (missing.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing credentials', missing }),
    };
  }

  const { storedPaymentMethodId, recurringDetailReference } = JSON.parse(event.body);
  const id = storedPaymentMethodId || recurringDetailReference;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'storedPaymentMethodId or recurringDetailReference is required' }),
    };
  }

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

    return {
      statusCode: response.ok ? 200 : response.status,
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
