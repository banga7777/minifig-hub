import fs from 'fs';
import { supabase } from '../services/supabaseClient';

async function generateSitemap() {
  console.log('Generating sitemap...');
  
  // Fetch all minifigs from Supabase
  const { data: minifigs, error } = await supabase
    .from('minifigures')
    .select('item_no');

  if (error) {
    console.error('Error fetching minifigs:', error);
    return;
  }

  const baseUrl = 'https://minifig-hub.com';
  const urls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/themes`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/lego-star-wars-minifigure-framework`, priority: '0.9', changefreq: 'weekly' },
  ];

  minifigs.forEach(m => {
    urls.push({
      loc: `${baseUrl}/minifigs/${m.item_no}`,
      priority: '0.7',
      changefreq: 'weekly'
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log('sitemap.xml generated successfully in public/');
}

// Note: This script needs to be run in an environment where supabase is configured.
// For now, I will create the script, but it might need to be integrated into the build process.
generateSitemap();
