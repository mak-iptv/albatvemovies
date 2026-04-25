// api/clean-embed.js
export default async function handler(req, res) {
  const { url } = req.query; // URL origjinale e burimit (p.sh., embed.su)

  if (!url) {
    return res.status(400).send('Missing URL parameter.');
  }

  try {
    // 1. Merrni përmbajtjen HTML nga burimi origjinal
    const response = await fetch(url);
    let html = await response.text();

    // 2. Pastroni HTML-në nga reklamat.
    //    Kjo pjesë është shembull dhe mund të kërkojë rregullime sipas strukturës së faqes.
    //    Heq çdo etiketë script ose div që përmban fjalë si 'ad', 'popup', etj.
    html = html.replace(/<script[^>]*src=["'][^"']*ads[^"']*["'][^>]*><\/script>/gi, '');
    html = html.replace(/<div[^>]*class=["'][^"']*ad[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
    // ... shtoni rregulla të tjera sipas nevojës ...

    // 3. Dërgojini përmbajtjen e pastruar
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching or cleaning the embed.');
  }
}
