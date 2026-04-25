export default async function handler(req, res) {
  // Lejo vetëm metodën GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, ...params } = req.query;
  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint' });
  }

  // Çelësi API merret nga variablat e ambientit (NUK është në klient)
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // Ndërto URL-në e TMDB
  const url = new URL(`https://api.themoviedb.org/3/${endpoint}`);
  url.searchParams.append('api_key', apiKey);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
