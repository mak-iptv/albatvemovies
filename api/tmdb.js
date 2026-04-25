export default async function handler(req, res) {
  const { endpoint } = req.query;
  const response = await fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${process.env.TMDB_API_KEY}`);
  const data = await response.json();
  res.json(data);
}
