export default async function handler(req, res) {
  const apiKey = process.env.AI_API_KEY;

  try {
    const response = await fetch('https://anymodel.org/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const rawText = await response.text();
    let data;
    try { data = JSON.parse(rawText); } catch(e) { return res.status(200).json({ raw: rawText }); }

    // Extract all model IDs
    const models = data.data || data.models || data || [];
    const ids = Array.isArray(models) ? models.map(m => m.id || m.name || m) : data;

    // Filter Claude ones
    const claude = Array.isArray(ids) ? ids.filter(id =>
      String(id).toLowerCase().includes('claude') ||
      String(id).toLowerCase().includes('sonnet') ||
      String(id).toLowerCase().includes('haiku') ||
      String(id).toLowerCase().includes('opus')
    ) : [];

    res.status(200).json({
      http_status: response.status,
      claude_models: claude,
      all_model_ids: ids
    });

  } catch (err) {
    res.status(200).json({ error: err.message });
  }
}
