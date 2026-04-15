export default async function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY || '';
  res.status(200).json({
    key_exists: !!key,
    key_length: key.length,
    key_starts_with: key.substring(0, 10),
    key_has_spaces: key !== key.trim(),
    env_keys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC'))
  });
}
