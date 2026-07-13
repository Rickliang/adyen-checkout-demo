const { assertConfig } = require('./shared');

exports.handler = async (event, context) => {
  const missing = assertConfig();
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientKey: process.env.ADYEN_CLIENT_KEY,
      environment: process.env.ADYEN_ENVIRONMENT || 'test',
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
      configured: missing.length === 0,
      missing,
    }),
  };
};
