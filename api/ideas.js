const { kv } = require('@vercel/kv');

const KEY = 'torre-control-ideas';
const MAX_IDEAS = 200;

async function readIdeas() {
  const raw = await kv.lrange(KEY, -MAX_IDEAS, -1);
  return raw
    .map((item) => {
      try {
        return typeof item === 'string' ? JSON.parse(item) : item;
      } catch (err) {
        return null;
      }
    })
    .filter(Boolean);
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const ideas = await readIdeas();
    res.status(200).json(ideas);
    return;
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (err) {
        body = {};
      }
    }
    const text = ((body && body.text) || '').toString().trim().slice(0, 140);
    if (!text) {
      res.status(400).json({ error: 'texto vacío' });
      return;
    }
    await kv.rpush(KEY, JSON.stringify({ text, ts: Date.now() }));
    const ideas = await readIdeas();
    res.status(200).json(ideas);
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
