import fs from 'fs';
import { supabase } from '../services/supabaseClient';
import { CLONE_ARMY_DATA, STORMTROOPER_ARMY_DATA, DROID_ARMY_DATA } from '../src/constants/armyData';
import { SKYWALKER_SAGA_DATA, JEDI_COUNCIL_DATA, SITH_DARK_SIDE_DATA } from '../src/constants/characterData';
import { MANDALORIAN_DATA, ELITE_CLONE_DATA, IMPERIAL_GUARD_DATA } from '../src/constants/eliteData';
import { PILOT_DATA, TECH_OFFICER_DATA, DROID_DATA } from '../src/constants/supportData';

const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

async function generateSitemap() {
  console.log('Generating sitemap...');
  
  // Fetch all minifigs from Supabase
  const { data: minifigs, error } = await supabase
    .from('minifigures')
    .select('item_no, name_en, main_category');

  if (error) {
    console.error('Error fetching minifigs:', error);
    return;
  }

  const baseUrl = 'https://minifig-hub.com';
  const lastmod = new Date().toISOString().split('T')[0];

  const urls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/themes`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/lego-star-wars-minifigure-archive`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${baseUrl}/privacy-policy`, priority: '0.3', changefreq: 'monthly' },
    { loc: `${baseUrl}/terms-of-service`, priority: '0.3', changefreq: 'monthly' },
    { loc: `${baseUrl}/about`, priority: '0.5', changefreq: 'monthly' },
  ];

  // Add Role Hubs
  const roles = ['army-builders', 'character-centerpieces', 'elite-specialists', 'support-units'];
  roles.forEach(role => {
    urls.push({ loc: `${baseUrl}/lego-star-wars-minifigure-archive/${role}`, priority: '0.8', changefreq: 'weekly' });
  });

  // Add Parent URLs
  const parentUrls = [
    '/lego-star-wars-minifigure-archive/army-builders/clones',
    '/lego-star-wars-minifigure-archive/army-builders/stormtroopers',
    '/lego-star-wars-minifigure-archive/army-builders/droids',
    '/lego-star-wars-minifigure-archive/character-centerpieces/skywalker',
    '/lego-star-wars-minifigure-archive/character-centerpieces/jedi',
    '/lego-star-wars-minifigure-archive/character-centerpieces/sith',
    '/lego-star-wars-minifigure-archive/elite-specialists/mandalorians',
    '/lego-star-wars-minifigure-archive/elite-specialists/elite-clones',
    '/lego-star-wars-minifigure-archive/elite-specialists/imperial-guards',
    '/lego-star-wars-minifigure-archive/support-units/pilots',
    '/lego-star-wars-minifigure-archive/support-units/tech-officers',
    '/lego-star-wars-minifigure-archive/support-units/droids'
  ];
  parentUrls.forEach(url => {
    urls.push({ loc: `${baseUrl}${url}`, priority: '0.8', changefreq: 'weekly' });
  });

  // Add all Sub-sections
  const dataMap = {
    'army-builders/clones': CLONE_ARMY_DATA,
    'army-builders/stormtroopers': STORMTROOPER_ARMY_DATA,
    'army-builders/droids': DROID_ARMY_DATA,
    'character-centerpieces/skywalker': SKYWALKER_SAGA_DATA,
    'character-centerpieces/jedi': JEDI_COUNCIL_DATA,
    'character-centerpieces/sith': SITH_DARK_SIDE_DATA,
    'elite-specialists/mandalorians': MANDALORIAN_DATA,
    'elite-specialists/elite-clones': ELITE_CLONE_DATA,
    'elite-specialists/imperial-guards': IMPERIAL_GUARD_DATA,
    'support-units/pilots': PILOT_DATA,
    'support-units/tech-officers': TECH_OFFICER_DATA,
    'support-units/droids': DROID_DATA
  };

  Object.entries(dataMap).forEach(([path, data]) => {
    data.forEach(section => {
      section.subsections.forEach(sub => {
        urls.push({ loc: `${baseUrl}/lego-star-wars-minifigure-archive/${path}/${sub.id}`, priority: '0.8', changefreq: 'weekly' });
      });
    });
  });

  // Add Theme Hubs
  const themes = [...new Set(minifigs.map(m => m.main_category).filter(Boolean))];
  themes.forEach(theme => {
    urls.push({ loc: `${baseUrl}/themes/${generateSlug(theme)}`, priority: '0.7', changefreq: 'weekly' });
  });

  // Add Minifigure Detail Pages
  minifigs.forEach(m => {
    const slug = generateSlug(m.name_en);
    urls.push({
      loc: `${baseUrl}/minifigs/${m.item_no}-${slug}`,
      priority: '0.6',
      changefreq: 'weekly'
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log(`sitemap.xml generated successfully with ${urls.length} URLs.`);
}

generateSitemap();
