import React, { useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, TrendingUp, TrendingDown, Info, Calendar, Database, Award, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import { Minifigure } from '../types';
import { generateSlug } from '../utils/slug';
import SEO from '../components/SEO';

interface TrooperSubHubProps {
  allMinifigs: Minifigure[];
  onToggleOwned: (id: string) => void;
}

interface HubConfig {
  id: string;
  name: string;
  faction: 'Imperial' | 'Republic' | 'First Order';
  searchQuery: string[];
  excludeQuery?: string[];
  includeIds?: string[];
  representativeImg: string;
  description: string;
  seoTitle?: string;
  seoDesc?: string;
  marketInsight?: string;
  collectingTip?: string;
  keyFeatures?: string[];
}

const HUB_CONFIGS: Record<string, HubConfig> = {
  // Imperial
  'imperial-stormtrooper': {
    id: 'imperial-stormtrooper',
    name: 'Imperial Stormtrooper',
    faction: 'Imperial',
    searchQuery: ['stormtrooper'],
    excludeQuery: ['first order', 'sith', 'clone', 'snowtrooper', 'scout', 'death', 'shadow', 'shore', 'range', 'sandtrooper', 'mimban', 'mudtrooper', 'head', 'torso', 'legs'],
    representativeImg: 'sw0188',
    description: 'The iconic backbone of the Galactic Empire.',
    seoTitle: 'LEGO Imperial Stormtrooper Minifigure Guide & Price List (1999-2026)',
    seoDesc: 'Complete guide to every LEGO Imperial Stormtrooper variant. Track market values, compare helmet molds from 1999 to 2026, and build your perfect Empire army.',
    marketInsight: 'Demand for "Original Trilogy" accurate variants (2014-2026) remains highest.',
    collectingTip: 'Focus on the 2019 dual-molded version as the definitive modern standard.',
    keyFeatures: ['Dual-Molded Helmets', 'Thermal Detonator Printing']
  },
  'snowtrooper': {
    id: 'snowtrooper',
    name: 'Snowtrooper',
    faction: 'Imperial',
    searchQuery: ['snowtrooper'],
    excludeQuery: ['first order', 'head', 'torso', 'legs'],
    representativeImg: 'sw1181',
    description: 'Cold-weather specialists trained for sub-zero environments.',
    seoTitle: 'LEGO Snowtrooper Minifigure Collection Guide | Hoth Army Building',
    seoDesc: 'Explore the evolution of LEGO Snowtroopers from 2003 to 2026. Compare Kama skirts, backpack prints, and helmet molds for your Hoth diorama.',
    marketInsight: 'Battle Packs have kept prices stable, making Snowtroopers very affordable.',
    collectingTip: 'Look for cloth kamas for superior display realism.',
    keyFeatures: ['Insulated Helmet Cowl', 'Thermal Backpack']
  },
  'scout-trooper': {
    id: 'scout-trooper',
    name: 'Scout Trooper',
    faction: 'Imperial',
    searchQuery: ['scout trooper'],
    excludeQuery: ['head', 'torso', 'legs'],
    includeIds: ['sw0005', 'sw0005a', 'sw0505', 'sw1007', 'sw1011', 'sw1116', 'sw1182', 'sw0131', 'sw1002', 'sw0795', 'sw0518', 'sw1115', 'sw0806', 'sw0444'],
    representativeImg: 'sw1011',
    description: 'Lightweight recon and sniper units for the Empire.',
    seoTitle: 'LEGO Scout Trooper Minifigure Guide | Biker Scout Variants',
    seoDesc: 'The ultimate list of LEGO Scout Troopers. From the classic 1999 yellow-head to the 2026 dual-molded masterpiece. Essential for Endor MOCs.',
    marketInsight: 'Dual-molded helmet versions (2019+) command a premium for accuracy.',
    collectingTip: 'Modern dual-molded helmets eliminate misprint issues entirely.',
    keyFeatures: ['Dual-Molded Visor', 'Lightweight Armor']
  },
  'death-trooper': {
    id: 'death-trooper',
    name: 'Death Trooper',
    faction: 'Imperial',
    searchQuery: ['death trooper'],
    excludeQuery: ['head', 'torso', 'legs'],
    representativeImg: 'sw0807',
    description: 'Elite Imperial Intelligence guards for high-ranking officers.',
    seoTitle: 'LEGO Death Trooper Minifigure Guide | Rogue One Specialists',
    seoDesc: 'Collect the elite. Detailed guide to LEGO Death Troopers, featuring pauldron variants and specialist gear from Rogue One and The Mandalorian.',
    marketInsight: 'Specialist variants with pauldrons are significantly more valuable.',
    collectingTip: 'The pauldron version is the essential squad leader.',
    keyFeatures: ['Glossy Black Armor', 'Green Visor']
  },
  'shadow-trooper': {
    id: 'shadow-trooper',
    name: 'Shadow Trooper',
    faction: 'Imperial',
    searchQuery: ['shadow trooper'],
    excludeQuery: ['head', 'torso', 'legs'],
    representativeImg: 'sw0166',
    description: 'Stealth-focused elite units with cloaking technology.',
    seoTitle: 'LEGO Shadow Trooper Minifigure Price Guide | Rare Variants',
    seoDesc: 'Track the value of the elusive LEGO Shadow Trooper. From the 2005 classic to modern remakes. A must-have for completionist collectors.',
    marketInsight: 'The 2005 original remains a high-value "grail" item.',
    collectingTip: 'Distinguish between EU Legends and Canon game appearances.',
    keyFeatures: ['Stealth Grey/Black Armor', 'Silver Detailing']
  },
  // Clone
  'clone-trooper': {
    id: 'clone-trooper',
    name: 'Clone Trooper',
    faction: 'Republic',
    searchQuery: ['clone trooper'],
    excludeQuery: ['anakin', 'obi-wan', 'yoda', 'head', 'torso', 'legs', 'santa'],
    representativeImg: 'sw1233',
    description: 'The genetically engineered military force of the Republic.',
    seoTitle: 'LEGO Clone Trooper Army Building Hub | Republic Era Guide',
    seoDesc: 'The headquarters for LEGO Clone Trooper collectors. Navigate through Phase I, Phase II, and Legion-specific guides. The starting point for your Grand Army.',
    marketInsight: 'Generic "Shiny" clones are high in demand for army building.',
    collectingTip: 'Mixing plain clones with legion officers creates a balanced display.',
    keyFeatures: ['Phase I & II Armor', 'DC-15 Blasters']
  },
  'phase-1-clone': {
    id: 'phase-1-clone',
    name: 'Phase I Clone',
    faction: 'Republic',
    searchQuery: ['clone trooper', 'phase 1', 'phase i'],
    excludeQuery: ['phase 2', 'phase ii'],
    representativeImg: 'sw0058',
    description: 'The original Kaminoan armor design used at the start of the Clone Wars.',
    seoTitle: 'LEGO Phase I Clone Trooper Minifigure Guide (2002-2026)',
    seoDesc: 'Discover every LEGO Phase I Clone Trooper released. From the 2002 Attack of the Clones sets to the 2026 UCS updates. Fin-helmet vs Modern molds.',
    marketInsight: 'Original 2002 "cut-out visor" helmets are appreciating rapidly as nostalgic collectibles.',
    collectingTip: 'Decide between the "Movie Style" (realistic) and "Clone Wars Style" (animated) prints. They do not mix well visually.',
    keyFeatures: ['Fin-Crested Helmet', 'T-Visor Design', 'Clean White Armor']
  },
  'phase-2-clone': {
    id: 'phase-2-clone',
    name: 'Phase II Clone',
    faction: 'Republic',
    searchQuery: ['clone trooper', 'phase 2', 'phase ii'],
    excludeQuery: ['phase 1', 'phase i', '501st', '212th', 'shock'],
    representativeImg: 'sw1233',
    description: 'Advanced armor with specialized breathing filters and improved protection.',
    seoTitle: 'LEGO Phase II Clone Trooper Minifigure Guide | ROTS Era',
    seoDesc: 'The definitive list of LEGO Phase II Clone Troopers. Essential for Revenge of the Sith MOCs. Track prices for plain and officer variants.',
    marketInsight: 'Plain Phase II clones are the "gold standard" currency of army building, maintaining value due to constant demand.',
    collectingTip: 'The 2020+ mold update brought significant accuracy improvements. Focus on these for modern dioramas.',
    keyFeatures: ['Reinforced Helmet', 'Breathing Filters', 'Modular Attachment Points']
  },
  '501st-legion': {
    id: '501st-legion',
    name: '501st Legion',
    faction: 'Republic',
    searchQuery: ['501st'],
    excludeQuery: [],
    representativeImg: 'sw1094',
    description: 'The legendary blue-marked elite battalion led by Anakin Skywalker.',
    seoTitle: 'LEGO 501st Legion Clone Trooper Guide | Vader\'s Fist',
    seoDesc: 'Build Anakin\'s elite. Complete guide to LEGO 501st Legion minifigures, including Captain Rex, Jesse, and standard troopers from 2020-2026.',
    marketInsight: 'The 2020 Battle Pack saturated the market, making this the most affordable legion to collect in bulk.',
    collectingTip: 'Mix the 2020 "Clone Wars" style with the 2024 "Battle Pack" specialists for a diverse looking squad.',
    keyFeatures: ['Blue Legion Markings', 'Anakin\'s Command', 'Jet Trooper Variants']
  },
  '212th-battalion': {
    id: '212th-battalion',
    name: '212th Battalion',
    faction: 'Republic',
    searchQuery: ['212th'],
    excludeQuery: [],
    representativeImg: 'sw1235',
    description: 'Orange-marked units led by Obi-Wan Kenobi and Commander Cody.',
    seoTitle: 'LEGO 212th Battalion Clone Trooper Guide | Utapau Specialists',
    seoDesc: 'Guide to Obi-Wan\'s 212th Attack Battalion. Track down Commander Cody, Airborne Troopers, and standard infantry for your Utapau display.',
    marketInsight: 'The release of the AT-TE set made these widely available, stabilizing prices for mass-building.',
    collectingTip: 'Don\'t forget the "Airborne" variant to accurately recreate the Battle of Utapau.',
    keyFeatures: ['Orange Legion Markings', 'Airborne Variants', 'Commander Cody Leadership']
  },
  'shock-trooper': {
    id: 'shock-trooper',
    name: 'Shock Trooper',
    faction: 'Republic',
    searchQuery: ['shock trooper', 'coruscant guard'],
    excludeQuery: [],
    representativeImg: 'sw0531',
    description: 'Red-marked elite units serving as the Coruscant Guard.',
    seoTitle: 'LEGO Shock Trooper & Coruscant Guard Minifigure Guide',
    seoDesc: 'Collect the Coruscant Guard. Detailed list of LEGO Shock Troopers and Commander Fox. Essential for Senate and Gunship displays.',
    marketInsight: 'Historically rare due to inclusion in expensive sets (Gunships, Police Gunships). Prices reflect this scarcity.',
    collectingTip: 'The "Coruscant Guard" battle pack is the most cost-effective way to build this elite security force.',
    keyFeatures: ['Red Legion Markings', 'Senate Security Role', 'Heavy Weapons']
  },
  // First Order
  'first-order-stormtrooper': {
    id: 'first-order-stormtrooper',
    name: 'First Order Stormtrooper',
    faction: 'First Order',
    searchQuery: ['first order stormtrooper'],
    excludeQuery: ['sith', 'executioner', 'flametrooper', 'riot control', 'snowtrooper', 'treadspeeder', 'jet trooper'],
    representativeImg: 'sw0667',
    description: 'The sleek evolution of the stormtrooper for the First Order.',
    seoTitle: 'LEGO First Order Stormtrooper Minifigure Guide | Sequel Era',
    seoDesc: 'The modern face of the galaxy. Guide to LEGO First Order Stormtroopers. Compare TFA vs TLJ helmet prints and build your Sequel army.',
    marketInsight: 'Prices are currently low as Sequel Trilogy hype has cooled, making it a "buyer\'s market" for these figures.',
    collectingTip: 'The "pointed mouth" vs "rounded mouth" helmet print is the main difference between 2015 and 2017 versions.',
    keyFeatures: ['Sleek Integrated Armor', 'F-11D Blasters', 'Streamlined Helmet']
  },
  'sith-trooper': {
    id: 'sith-trooper',
    name: 'Sith Trooper',
    faction: 'First Order',
    searchQuery: ['sith trooper'],
    excludeQuery: [],
    representativeImg: 'sw1065',
    description: 'The striking crimson-armored elite of the Final Order.',
    seoTitle: 'LEGO Sith Trooper Minifigure Guide | Final Order Army',
    seoDesc: 'The red storm. Complete guide to LEGO Sith Troopers from The Rise of Skywalker. Track prices for these elite Exegol units.',
    marketInsight: 'Despite a short screen time, the unique textured armor mold keeps demand relatively high among variant collectors.',
    collectingTip: 'These figures feature intricate "tech-line" molding on the armor that is unique to this class.',
    keyFeatures: ['Crimson Red Armor', 'Textured Armor Mold', 'Final Order Allegiance']
  },
  'riot-control-trooper': {
    id: 'riot-control-trooper',
    name: 'Riot Control Trooper',
    faction: 'First Order',
    searchQuery: ['riot control'],
    excludeQuery: [],
    representativeImg: 'sw0671',
    description: 'Specialized units equipped for urban suppression and riot control.',
    seoTitle: 'LEGO Riot Control Stormtrooper Guide | TR-8R Variants',
    seoDesc: '"Traitor!" Guide to LEGO First Order Riot Control Troopers. Essential for recreating the Takodana duel scene.',
    marketInsight: 'Value is driven largely by the "Z6 Riot Control Baton" accessory rather than the figure itself.',
    collectingTip: 'Ensure the shield and baton accessories are included when buying used; they define the variant.',
    keyFeatures: ['Z6 Riot Baton', 'Betaplast Shield', 'Melee Combat Specialist']
  }
};

const TrooperSubHub: React.FC<TrooperSubHubProps> = ({ allMinifigs, onToggleOwned }) => {
  const { factionId, unitId } = useParams<{ factionId: string; unitId?: string }>();
  const navigate = useNavigate();
  
  const currentHubId = unitId || factionId || '';
  const config = HUB_CONFIGS[currentHubId];

  const filteredFigs = useMemo(() => {
    if (!config) return [];
    return allMinifigs.filter(m => {
      const name = m.name.toLowerCase();
      const id = m.item_no.toLowerCase();
      
      // Check if ID is explicitly included
      if (config.includeIds?.some(includeId => id === includeId.toLowerCase())) {
        return true;
      }

      const matchesSearch = config.searchQuery.some(q => name.includes(q.toLowerCase()));
      const matchesExclude = config.excludeQuery?.some(q => name.includes(q.toLowerCase()));
      return matchesSearch && !matchesExclude;
    }).sort((a, b) => b.year_released - a.year_released);
  }, [allMinifigs, config]);

  const stats = useMemo(() => {
    const total = filteredFigs.length;
    const owned = filteredFigs.filter(m => m.owned).length;
    const rate = total > 0 ? (owned / total) * 100 : 0;
    const latest = filteredFigs[0];
    
    return { total, owned, rate, latest };
  }, [filteredFigs]);

  // No manual SEO useEffect needed

  const [isSticky, setIsSticky] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('main-scroll-container') || window;
      const scrollTop = container === window ? window.scrollY : (container as HTMLElement).scrollTop;
      setIsSticky(scrollTop > 400);
    };
    
    const container = document.getElementById('main-scroll-container') || window;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const relatedHubs = useMemo(() => {
    if (!config) return [];
    return Object.values(HUB_CONFIGS).filter(h => h.faction === config.faction && h.id !== config.id);
  }, [config]);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <p className="text-slate-400 mb-4 uppercase tracking-widest font-black">Hub Not Found</p>
          <Link to="/character/troopers" className="text-indigo-400 font-bold hover:underline">Back to Trooper Hub</Link>
        </div>
      </div>
    );
  }

  const repFig = allMinifigs.find(m => m.item_no === config.representativeImg) || filteredFigs[0];

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": config.seoTitle,
    "description": config.seoDesc,
    "url": `https://minifig-hub.com/character/troopers/${currentHubId}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": filteredFigs.map((fig, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": fig.name,
          "image": fig.image_url,
          "sku": fig.item_no,
          "brand": {
            "@type": "Brand",
            "name": "LEGO"
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": fig.last_stock_min_price || "0",
            "availability": "https://schema.org/InStock"
          }
        }
      }))
    }
  };

  return (
    <div className="bg-[#0a0c14] min-h-screen text-white font-sans pb-24">
      <SEO 
        title={config.seoTitle || `${config.name} LEGO Minifigure Guide | Minifig Hub`}
        description={config.seoDesc || `Complete guide to LEGO ${config.name} minifigures. Track prices, variants, and collection data.`}
        keywords={`LEGO, ${config.name}, Minifigure, Guide, Collection, Price List`}
        ogImage={repFig?.image_url}
        schemaData={schemaData}
      />
      {/* Sticky Navigation */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: isSticky ? 0 : -100 }}
        className="fixed top-0 left-0 right-0 z-40 bg-[#0a0c14]/90 backdrop-blur-md border-b border-white/10 px-6 py-4"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-black italic uppercase tracking-tight">{config.name}</h2>
            <div className="h-4 w-[1px] bg-white/20"></div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[200px] md:max-w-none">
              {relatedHubs.map(hub => (
                <Link 
                  key={hub.id}
                  to={`/character/troopers/${hub.faction === 'Imperial' ? 'imperial-stormtrooper' : hub.faction === 'Republic' ? 'clone-trooper' : 'first-order-stormtrooper'}/${hub.id === 'imperial-stormtrooper' || hub.id === 'clone-trooper' || hub.id === 'first-order-stormtrooper' ? '' : hub.id}`}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wide transition-colors whitespace-nowrap"
                >
                  {hub.name}
                </Link>
              ))}
            </div>
          </div>
          <Link 
            to="/character/troopers"
            className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
          >
            Hub Home
          </Link>
        </div>
      </motion.div>

      {/* Hero Section */}
      <div className="relative pt-16 pb-12 px-6 overflow-hidden">
        {/* Background Image Blur */}
        <div className="absolute inset-0 z-0">
          <img 
            src={repFig?.image_url} 
            alt="" 
            className="w-full h-full object-contain opacity-10 blur-3xl scale-125"
          />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
          {/* Representative Image */}
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
            <div className="w-32 h-32 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center p-4 relative overflow-hidden shadow-xl">
              <img 
                src={repFig?.image_url} 
                alt={config.name} 
                className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-6 leading-none">
            {config.name}
          </h1>

          <div className="flex gap-8 md:gap-16 mb-10">
            <div className="text-center">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Total Variations</p>
              <p className="text-3xl font-black">{stats.total}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Collection Rate</p>
              <p className="text-3xl font-black text-indigo-500">{stats.rate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Market Insight & Collecting Tip Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mb-10">
            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-5 text-left backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 text-indigo-400">
                <BarChart3 size={16} />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Market Insight</h3>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                {config.marketInsight || "Market data indicates steady demand for this faction."}
              </p>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-5 text-left backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <ShieldCheck size={16} />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Pro Tip</h3>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed font-medium">
                {config.collectingTip || "Focus on acquiring battle packs for the most cost-effective collection."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
            <div className="bg-[#151926] border border-white/5 rounded-2xl p-5 text-left flex flex-col justify-between shadow-xl">
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Latest Release</p>
                <p className="text-3xl font-black mb-1">{stats.latest?.year_released || 'N/A'}</p>
              </div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">{stats.latest?.item_no || ''}</p>
            </div>
            <div className="bg-[#151926] border border-white/5 rounded-2xl p-5 text-left shadow-xl">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Owned</p>
              <div className="flex items-end gap-2 mb-4">
                <p className="text-3xl font-black text-emerald-500">{stats.owned}</p>
                <p className="text-lg font-black text-white/20 mb-0.5">/ {stats.total}</p>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.rate}%` }}
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variations Section */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
            <h2 className="text-xl font-black italic uppercase tracking-tight">Variations</h2>
          </div>
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">{stats.total} Figs</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredFigs.map((fig) => (
            <div 
              key={fig.item_no}
              className="bg-white rounded-2xl overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-square bg-slate-50 relative p-3 flex items-center justify-center overflow-hidden">
                {/* Price Tag */}
                {fig.last_stock_min_price ? (
                  <div className="absolute top-2 left-2 z-10 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-md">
                    ${fig.last_stock_min_price.toFixed(2)}
                  </div>
                ) : null}
                
                {/* Heart Icon */}
                <div className="absolute top-0 right-0 flex flex-col items-end z-20">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleOwned(fig.item_no);
                    }}
                    className="w-8 h-8 flex items-center justify-center transition-all duration-200 active:scale-75"
                    aria-label="Toggle owned status"
                  >
                    <i className={`${
                      fig.owned 
                        ? 'fas text-rose-500 scale-110 drop-shadow-[0_1px_4px_rgba(244,63,94,0.3)]' 
                        : 'far text-slate-300 scale-95 hover:text-rose-300'
                      } fa-heart text-[12px] transition-all`}
                    ></i>
                  </button>
                </div>

                <Link to={`/minifigs/${fig.item_no}-${generateSlug(fig.name)}`} className="w-full h-full flex items-center justify-center">
                  <img 
                    src={fig.image_url} 
                    alt={fig.name} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                  />
                </Link>
              </div>
              
              <div className="p-3">
                <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mb-0.5 truncate">Star Wars</p>
                <h3 className="text-[10px] font-black text-slate-900 uppercase leading-tight mb-2 line-clamp-2 h-7">
                  {fig.name}
                </h3>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <p className="text-[8px] font-bold text-slate-400 uppercase">{fig.item_no}</p>
                  <p className="text-[8px] font-black text-slate-900">{fig.year_released}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default TrooperSubHub;
