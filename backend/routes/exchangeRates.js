const express = require('express');

const router = express.Router();
const cache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

router.get('/', async (req, res) => {
  const base = String(req.query.base || 'USD').toUpperCase();
  if (!/^[A-Z]{3}$/.test(base)) return res.status(400).json({ error: 'Invalid base currency' });

  const cached = cache.get(base);
  if (cached && cached.expiresAt > Date.now()) return res.json(cached.data);

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    if (!response.ok) throw new Error(`Exchange provider returned ${response.status}`);
    const providerData = await response.json();
    if (providerData.result !== 'success' || !providerData.rates) throw new Error('Exchange provider returned no rates');

    const data = { base: providerData.base_code || base, rates: providerData.rates, updatedAt: providerData.time_last_update_utc || new Date().toISOString() };
    cache.set(base, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    res.json(data);
  } catch (error) {
    if (cached) return res.json({ ...cached.data, stale: true });
    res.status(502).json({ error: 'Live exchange rates are temporarily unavailable' });
  }
});

module.exports = router;
