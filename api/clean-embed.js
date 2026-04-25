// api/clean-embed.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let { url } = req.query;
  if (!url) {
    return res.status(400).send('Missing URL parameter.');
  }

  // Dekodojmë URL-në (në rast se është e koduar dy herë)
  try {
    url = decodeURIComponent(url);
  } catch (e) {
    // Mbetet siç është
  }

  // Lista e User-Agent-ëve për të imituar shfletues të ndryshëm
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];
  const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 sekonda timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': randomUA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': new URL(url).origin,
        'Upgrade-Insecure-Requests': '1'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    let html = await response.text();

    // Filtrim i zgjeruar i reklamave
    const removePatterns = [
      /<script[^>]*?(?:ads?|popup|advertisement|doubleclick|googlead|analytics|googlesyndication)[^>]*?>[\s\S]*?<\/script>/gi,
      /<iframe[^>]*?(?:ads?|popup|doubleclick|google)[^>]*?>[\s\S]*?<\/iframe>/gi,
      /<div[^>]*?(?:class|id)=["'][^"']*?(?:ad|banner|popup|advertisement)[^"']*?["'][^>]*?>[\s\S]*?<\/div>/gi,
      /<ins[^>]*?(?:adsbygoogle)[^>]*?>[\s\S]*?<\/ins>/gi,
      /<script\b[^>]*src=["'][^"']*["'][^>]*?>[\s\S]*?<\/script>/gi,
      /<link[^>]*?(?:ads?|doubleclick)[^>]*?>/gi,
      /<meta[^>]*?(?:ads?|doubleclick)[^>]*?>/gi
    ];

    for (const pattern of removePatterns) {
      html = html.replace(pattern, '');
    }

    // Heq linjat bosh dhe komentet e mëdha (për performancë)
    html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/\n\s*\n/g, '\n');

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.status(200).send(html);
  } catch (error) {
    console.error(`Proxy error for ${url}:`, error.message);
    // Në vend të gabimit, kthe një HTML që tregon mesazh miqësor dhe një buton për të kaluar direkt
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>AlbaTV - Burimi nuk u ngarkua</title>
      <style>body{background:#0a0c15; color:white; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; text-align:center;}</style>
      </head>
      <body>
        <div>
          <h2>⚠️ Burimi i videos nuk mund të pastrohej nga reklamat</h2>
          <p>Reklamat mund të shfaqen në këtë burim. Provoni një burim tjetër nga butonat më poshtë.</p>
          <button onclick="window.location.reload()" style="background:#e50914; color:white; border:none; padding:10px 20px; border-radius:5px;">Rifresko</button>
        </div>
      </body>
      </html>
    `);
  }
}
