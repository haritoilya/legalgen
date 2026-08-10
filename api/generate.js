export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    // AnyModel.org uses OpenAI-compatible format:
    // - Base URL: https://anymodel.org/v1
    // - Auth header: Authorization: Bearer YOUR_KEY
    // - Messages format: OpenAI chat completions
    const response = await fetch('https://anymodel.org/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: body.max_tokens || 2500,
        messages: body.messages
      })
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      return res.status(response.status).json({
        error: { message: rawText || 'Unexpected response from AI service' }
      });
    }

    // AnyModel returns OpenAI format — convert to Anthropic format
    // so index.html doesn't need changes
    if (data.choices && data.choices[0]) {
      const converted = {
        content: [{ type: 'text', text: data.choices[0].message.content }],
        model: data.model,
        type: 'message',
        role: 'assistant'
      };
      return res.status(200).json(converted);
    }

    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
