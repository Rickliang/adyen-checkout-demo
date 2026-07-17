const { adyenCall, assertConfig } = require('./shared.cjs');

exports.handler = async (event, context) => {
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
