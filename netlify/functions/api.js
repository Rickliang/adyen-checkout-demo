const { adyenCall, assertConfig, ADYEN_MERCHANT_ACCOUNT, ADYEN_API_KEY, ADYEN_API_VERSION, CHECKOUT_BASE, DEMO_SHOPPER_REFERENCE, reference } = require('./shared');

async function handleConfig(event) {
  const missing = assertConfig();
  return {
    statusCode: 200,
    body: JSON.stringify({
      clientKey: process.env.ADYEN_CLIENT_KEY,
      environment: process.env.ADYEN_ENVIRONMENT || 'test',
      merchantAccount: ADYEN_MERCHANT_ACCOUNT,
      configured: missing.length === 0,
      missing,
    }),
  };
}

async function handleSessions(event) {
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
    returnUrl,
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
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
}

async function handlePaymentMethods(event) {
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
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
}

async function handlePayments(event) {
  const missing = assertConfig();
  if (missing.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing credentials', missing }),
    };
  }
  const { stateData, amount, currency, countryCode, returnUrl, origin, challengeWindowSize, lineItems } = JSON.parse(event.body);
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
    returnUrl,
    origin,
    additionalData: { allow3DS2: true },
    authenticationData: { threeDSRequestData },
  };
  if (lineItems && lineItems.length > 0) {
    body.lineItems = lineItems;
  }
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
    return {
      statusCode: result.ok ? 200 : result.status,
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
}

async function handlePaymentsDetails(event) {
  const missing = assertConfig();
  if (missing.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing credentials', missing }),
    };
  }
  const { stateData } = JSON.parse(event.body);
  try {
    const result = await adyenCall('/payments/details', stateData);
    return {
      statusCode: result.ok ? 200 : result.status,
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
}

async function handleStoredPaymentMethodsDisable(event) {
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
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
}

exports.handler = async (event, context) => {
  const path = event.path;
  const headers = { 'Content-Type': 'application/json' };

  try {
    if (path === '/.netlify/functions/api' || path === '/api') {
      return { statusCode: 404, body: 'Not found', headers };
    }
    if (path === '/.netlify/functions/api/config' || path === '/api/config') {
      const result = await handleConfig(event);
      return { ...result, headers };
    }
    if (path === '/.netlify/functions/api/sessions' || path === '/api/sessions') {
      const result = await handleSessions(event);
      return { ...result, headers };
    }
    if (path === '/.netlify/functions/api/paymentMethods' || path === '/api/paymentMethods') {
      const result = await handlePaymentMethods(event);
      return { ...result, headers };
    }
    if (path === '/.netlify/functions/api/payments' || path === '/api/payments') {
      const result = await handlePayments(event);
      return { ...result, headers };
    }
    if (path === '/.netlify/functions/api/payments/details' || path === '/api/payments/details') {
      const result = await handlePaymentsDetails(event);
      return { ...result, headers };
    }
    if (path === '/.netlify/functions/api/storedPaymentMethods/disable' || path === '/api/storedPaymentMethods/disable') {
      const result = await handleStoredPaymentMethodsDisable(event);
      return { ...result, headers };
    }
    return { statusCode: 404, body: 'Not found', headers };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
      headers,
    };
  }
};
