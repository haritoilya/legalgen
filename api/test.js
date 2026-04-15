export default async function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say hi' }]
      })
    });

    const data = await response.json();
    res.status(200).json({
      status: response.status,
      ok: response.ok,
      response: data
    });

  } catch (err) {
    res.status(200).json({ fetch_error: err.message });
  }
}
