// api/clean-embed.js
export default async function handler(req, res) {
  // Lejo vetëm GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).send('Missing URL parameter.');
  }

  try {
    // 1. Marrim përmbajtjen nga burimi origjinal
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    let html = await response.text();

    // 2. Heqim etiketat dhe skriptet e zakonshme të reklamave
    //    Këto janë rregulla bazë; mund të shtosh më shumë sipas nevojës.
    html = html.replace(/<script[^>]*(?:ads?|popup|advertisement|adserver|doubleclick|googlead)[^>]*>[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<iframe[^>]*(?:ads?|popup|advertisement)[^>]*>[\s\S]*?<\/iframe>/gi, '');
    html = html.replace(/<div[^>]*class=["'][^"']*(?:ad|banner|popup)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
    html = html.replace(/<div[^>]*id=["'][^"']*(?:ad|banner|popup)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
    
    // Heq çdo script që përmban 'src' të jashtëm (mund të jetë reklamë)
    html = html.replace(/<script\b[^>]*src=["'][^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Heq çdo element që ka stile "display:none" (ndonjëherë përdoret për reklama të fshehura)
    html = html.replace(/<[^>]+style=["'][^"']*display\s*:\s*none[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '');

    // 3. Dërgojme HTML-në e pastruar
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(html);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Error fetching or cleaning the embed.');
  }
}
