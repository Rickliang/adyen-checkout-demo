const { adyenCall, assertConfig, ADYEN_MERCHANT_ACCOUNT, DEMO_SHOPPER_REFERENCE, reference } = require('./shared');

exports.handler = async (event, context) => {
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
    returnUrl: returnUrl || 'http://localhost:8080',
    origin: origin || 'http://localhost:8080',
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
