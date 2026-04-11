import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useParams, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minifigure } from '../types';
import MinifigCard from '../components/MinifigCard';
import SEO from '../components/SEO';
import { CLONE_ARMY_DATA, STORMTROOPER_ARMY_DATA, DROID_ARMY_DATA, ArmySection } from '../src/constants/armyData';
import { useMinifigLoader, LoaderConfig } from '../hooks/useMinifigLoader';

interface ArmyBuildersProps {
  allMinifigs: Minifigure[];
  onToggleOwned: (id: string) => void;
}

const ArmySubArchive = ({ allMinifigs, onToggleOwned, faction }: { allMinifigs: Minifigure[], onToggleOwned: (id: string) => void, faction: 'clones' | 'stormtroopers' | 'droids' }) => {
  const { subId } = useParams();
  const navigate = useNavigate();

  const data = useMemo(() => {
    if (faction === 'clones') return CLONE_ARMY_DATA;
    if (faction === 'stormtroopers') return STORMTROOPER_ARMY_DATA;
    return DROID_ARMY_DATA;
  }, [faction]);

  const subSection = useMemo(() => {
    for (const section of data) {
      const found = section.subsections.find(s => s.id === subId);
      if (found) return { section, sub: found };
    }
    return null;
  }, [data, subId]);

  const loaderConfigs = useMemo(() => {
    if (!subSection) return [];
    return subSection.sub.items.map(item => ({ ids: item.ids }));
  }, [subSection]);

  const { combinedMinifigs, isLoading } = useMinifigLoader(allMinifigs, loaderConfigs);

  if (!subSection) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Sub-archive not found</div>;

  const getFigs = (ids: string[]) => 
    combinedMinifigs
      .filter(m => ids.includes(m.item_no))
      .sort((a, b) => a.item_no.localeCompare(b.item_no));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-6">
      <SEO 
        title={`${subSection.sub.name} | LEGO Star Wars Master Archive`}
        description={subSection.sub.desc || `Detailed archive of LEGO ${subSection.sub.name} minifigures.`}
      />
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors group"
        >
          <i className="fas fa-arrow-left text-xs group-hover:-translate-x-1 transition-transform"></i>
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Archive</span>
        </button>

        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-6">
            {subSection.sub.name}
          </h1>
          {subSection.sub.desc && (
            <p className="text-slate-400 text-lg leading-relaxed max-w-3xl border-l-4 border-indigo-500 pl-6">
              {subSection.sub.desc}
            </p>
          )}
        </header>

        <div className="space-y-16">
          {subSection.sub.items.map((item, iIdx) => {
            const figs = getFigs(item.ids);
            if (figs.length === 0) return null;
            return (
              <div key={iIdx}>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  {item.label}
                  <span className="text-slate-600">({figs.length})</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {figs.map(m => (
                    <MinifigCard 
                      key={m.item_no} 
                      minifig={m} 
                      variant="dark"
                      onToggleOwned={onToggleOwned}
                      onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ArchiveView = ({ 
  allMinifigs, 
  onToggleOwned, 
  faction, 
  data, 
  title, 
  subtitle, 
  desc, 
  themeColor,
  seo 
}: { 
  allMinifigs: Minifigure[], 
  onToggleOwned: (id: string) => void, 
  faction: string,
  data: ArmySection[],
  title: string,
  subtitle: string,
  desc: string,
  themeColor: string,
  seo: { title: string; description: string; keywords?: string }
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const loaderConfigs = useMemo(() => {
    const configs: LoaderConfig[] = [];
    data.forEach(section => {
      section.subsections.forEach(sub => {
        sub.items.forEach(item => {
          configs.push({ ids: item.ids });
        });
      });
    });
    return configs;
  }, [data]);

  const { combinedMinifigs } = useMinifigLoader(allMinifigs, loaderConfigs);

  const getFigs = (ids: string[]) => 
    combinedMinifigs
      .filter(m => ids.includes(m.item_no))
      .sort((a, b) => a.item_no.localeCompare(b.item_no));

  return (
    <div className="py-16 px-6 bg-slate-950 relative overflow-hidden min-h-screen">
      <SEO {...seo} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-${themeColor}-500/10 border border-${themeColor}-500/20 mb-6`}
          >
            <span className={`w-2 h-2 bg-${themeColor}-500 rounded-full`}></span>
            <span className={`text-[10px] font-black uppercase tracking-widest text-${themeColor}-300`}>{subtitle}</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
            {title}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
            {desc}
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="sticky top-0 z-[100] bg-slate-950/80 backdrop-blur-md -mx-6 px-6 py-4 border-b border-white/5 mb-12 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {data.map((section, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === idx 
                    ? `bg-${themeColor}-600 text-white shadow-lg shadow-${themeColor}-600/20` 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {section.title.split('. ')[1] || section.title}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-24"
          >
            <section>
              <div className="mb-12">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">{data[activeTab].title}</h2>
                <p className="text-slate-500 text-sm">{data[activeTab].desc}</p>
              </div>

              <div className="space-y-16">
                {data[activeTab].subsections.map((sub, subIdx) => (
                  <div key={subIdx} className="bg-white/5 rounded-[2.5rem] p-8 md:p-12 border border-white/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <h3 className={`text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3`}>
                        <span className={`w-8 h-px bg-${themeColor}-500`}></span>
                        {sub.name}
                      </h3>
                      <Link 
                        to={`${sub.id}`}
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-${themeColor}-500/10 text-${themeColor}-400 border border-${themeColor}-500/20 hover:bg-${themeColor}-500 hover:text-white transition-all text-center`}
                      >
                        Explore Detailed Archive →
                      </Link>
                    </div>

                    {sub.desc && (
                      <p className={`text-slate-500 text-xs leading-relaxed mb-8 max-w-2xl border-l-2 border-${themeColor}-500/30 pl-4`}>
                        {sub.desc}
                      </p>
                    )}
                    
                    <div className="space-y-12">
                      {sub.items.map((item, iIdx) => {
                        const figs = getFigs(item.ids);
                        if (figs.length === 0) return null;
                        return (
                          <div key={iIdx}>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                              {item.label}
                              <span className="text-slate-600">({figs.length})</span>
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                              {figs.slice(0, 6).map(m => (
                                <MinifigCard 
                                  key={m.item_no} 
                                  minifig={m} 
                                  variant="dark"
                                  onToggleOwned={onToggleOwned}
                                  onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)}
                                />
                              ))}
                              {figs.length > 6 && (
                                <Link 
                                  to={`${sub.id}`}
                                  className="aspect-[3/4] rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-2 group hover:bg-white/10 transition-all"
                                >
                                  <div className={`w-10 h-10 rounded-full bg-${themeColor}-500/20 flex items-center justify-center text-${themeColor}-400 group-hover:scale-110 transition-transform`}>
                                    <i className="fas fa-plus text-xs"></i>
                                  </div>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">View {figs.length - 6} More</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const ArmyBuilders: React.FC<ArmyBuildersProps> = ({ allMinifigs, onToggleOwned }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-[110] bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/lego-star-wars-minifigure-archive')} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              <i className="fas fa-arrow-left"></i> Archive
            </button>
            <span className="text-slate-700">/</span>
            <Link to="/lego-star-wars-minifigure-archive/army-builders" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              Army Builders
            </Link>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Army Building Guide</div>
        </div>
      </nav>

      <Routes>
        <Route index element={<ArmyBuilderHome allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} />} />
        <Route path="clones" element={
          <ArchiveView 
            allMinifigs={allMinifigs}
            onToggleOwned={onToggleOwned}
            faction="clones"
            data={CLONE_ARMY_DATA}
            title="Galactic Republic: Clone Trooper Master Archive"
            subtitle="Grand Army of the Republic"
            desc="Welcome to the definitive visual archive of the Grand Army of the Republic. Since their debut in 2002, LEGO Clone Troopers have become the cornerstone of Star Wars army building."
            themeColor="blue"
            seo={{
              title: "LEGO Clone Trooper Master Archive | Army Building Guide",
              description: "A comprehensive visual guide to every LEGO Clone Trooper variant. From 2002 Phase 1 classics to modern 2025 Phase 2 legions with helmet holes.",
              keywords: "LEGO Clone Trooper, 501st Legion, 212th Attack Battalion, Phase 1 Clone, Phase 2 Clone, LEGO Star Wars Army"
            }}
          />
        } />
        <Route path="clones/:subId" element={<ArmySubArchive allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} faction="clones" />} />
        
        <Route path="stormtroopers" element={
          <ArchiveView 
            allMinifigs={allMinifigs}
            onToggleOwned={onToggleOwned}
            faction="stormtroopers"
            data={STORMTROOPER_ARMY_DATA}
            title="Imperial Legions: Stormtrooper Master Archive"
            subtitle="Imperial Stormtrooper Corps"
            desc="The backbone of the Galactic Empire. LEGO Stormtroopers represent the most iconic infantry in the Star Wars universe through three distinct generations of design."
            themeColor="slate"
            seo={{
              title: "LEGO Stormtrooper Master Archive | Imperial Army Building",
              description: "The ultimate guide to LEGO Imperial Stormtroopers. From 1999 classic molds to 2025 dual-mold masterpieces. Categorized by generation and operational role.",
              keywords: "LEGO Stormtrooper, Imperial Army, Sandtrooper, Snowtrooper, Death Trooper, LEGO Star Wars Collection"
            }}
          />
        } />
        <Route path="stormtroopers/:subId" element={<ArmySubArchive allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} faction="stormtroopers" />} />

        <Route path="droids" element={
          <ArchiveView 
            allMinifigs={allMinifigs}
            onToggleOwned={onToggleOwned}
            faction="droids"
            data={DROID_ARMY_DATA}
            title="Droid Army: Separatist Legion Master Archive"
            subtitle="Confederacy of Independent Systems"
            desc="The heart of the Separatist Alliance, this is the complete list of the Battle Droid legion. Master your CIS army by understanding the mechanical evolution of these units."
            themeColor="amber"
            seo={{
              title: "LEGO Battle Droid Master Archive | Separatist Army Building",
              description: "The heart of the Separatist Alliance. A complete list of LEGO Battle Droid variants, from B1 and B2 models to elite Commandos and Droidekas.",
              keywords: "LEGO Battle Droid, B1 Battle Droid, B2 Super Battle Droid, Droideka, Separatist Army, LEGO Star Wars Droids"
            }}
          />
        } />
        <Route path="droids/:subId" element={<ArmySubArchive allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} faction="droids" />} />
      </Routes>

      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Master Archive Army Building Division</p>
      </footer>
    </div>
  );
};

const ArmyBuilderHome = ({ allMinifigs, onToggleOwned }: { allMinifigs: Minifigure[], onToggleOwned: (id: string) => void }) => {
  const navigate = useNavigate();

  const loaderConfigs = useMemo(() => [
    { ids: ['sw1189', 'sw1094', 'sw0442', 'sw1235'] }, // Clones
    { ids: ['sw0585', 'sw0997', 'sw1135', 'sw0005'] }, // Stormtroopers
    { ids: ['sw0001', 'sw0001c', 'sw0467', 'sw0359'] }  // Droids
  ], []);

  const { combinedMinifigs } = useMinifigLoader(allMinifigs, loaderConfigs);

  const topArmyBuilders = useMemo(() => {
    return combinedMinifigs
      .filter(m => 
        m.name.toLowerCase().includes('trooper') || 
        m.name.toLowerCase().includes('droid') ||
        m.sub_category?.toLowerCase().includes('army builder')
      )
      .sort((a, b) => (b.last_price || 0) - (a.last_price || 0))
      .slice(0, 10);
  }, [combinedMinifigs]);

  const getFigures = (ids: string[]) => combinedMinifigs.filter(m => ids.includes(m.item_no)).slice(0, 4);

  const cloneFigures = getFigures(['sw1189', 'sw1094', 'sw0442', 'sw1235']);
  const stormFigures = getFigures(['sw0585', 'sw0997', 'sw1135', 'sw0005']);
  const droidFigures = getFigures(['sw0001', 'sw0001c', 'sw0467', 'sw0359']);

  return (
    <>
      <SEO 
        title="LEGO Star Wars Army Building Master Guide | Minifig Hub"
        description="The ultimate LEGO Star Wars Army Building Master Guide. Explore the complete evolution of Clone Troopers, Stormtroopers, and Battle Droids from 1999 to 2025."
      />

      <header className="relative pt-16 pb-24 px-6 overflow-hidden bg-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] opacity-30"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Legions of the Galaxy</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-8"
          >
            LEGO Star Wars <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-400">Army Building Master Guide</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Go beyond single figures and complete the majesty of the legion. Analyzing all Clone Troopers, Stormtroopers, and Battle Droid types and evolutions from 1999 to present.
          </motion.p>
          <div className="mt-12 p-8 bg-slate-900/50 rounded-3xl border border-white/5 text-slate-300 text-sm leading-relaxed max-w-3xl mx-auto">
            LEGO Star Wars army building is one of the most compelling aspects of collecting. Amassing legions of Clone Troopers or Stormtroopers to create massive, cinematic dioramas is a dream for many fans. When building your army, it's crucial to look beyond just the raw numbers. Understanding the subtle differences between Phase 1 and Phase 2 Clone Trooper helmet designs, the evolution of printing techniques across generations, and the specific armor variations is key to a truly curated collection. Utilize Battle Packs to efficiently build your ranks, and experiment with dynamic posing to bring your battlefield to life. Adding rare legion soldiers can significantly elevate the overall value and visual impact of your display.
          </div>
        </div>
      </header>

      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-24">
          {/* Clone Troopers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <Link to="clones" className="group block">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🟦</div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors">Clone Troopers</h2>
                </div>
              </Link>
              <p className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-6">"Great Legacy of the Galactic Republic"</p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Phase System
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Comparison between classic Phase 1 molds and modern Phase 2 models featuring accessory "Helmet Holes".
                  </p>
                </div>
                <Link to="clones" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors">
                  Enter Master Archive <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {cloneFigures.map(m => (
                <MinifigCard key={m.item_no} minifig={m} variant="dark" onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)} />
              ))}
            </div>
          </div>

          {/* Stormtroopers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 lg:order-2">
              <Link to="stormtroopers" className="group block">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⬜</div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-slate-300 transition-colors">Imperial Stormtroopers</h2>
                </div>
              </Link>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-6">"White Terror maintaining order in the galaxy"</p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                    Helmet Evolution
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    From the nostalgic charm of early single-piece molds to high-detail dual-mold helmets.
                  </p>
                </div>
                <Link to="stormtroopers" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                  Enter Master Archive <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7 lg:order-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stormFigures.map(m => (
                <MinifigCard key={m.item_no} minifig={m} variant="dark" onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)} />
              ))}
            </div>
          </div>

          {/* Droid Army */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <Link to="droids" className="group block">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-900/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🟫</div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-amber-400 transition-colors">Separatist Droid Army</h2>
                </div>
              </Link>
              <p className="text-amber-500 font-bold text-sm uppercase tracking-widest mb-6">"Separatist Alliance of overwhelming quantity"</p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                    B1 Series
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Role classification by paint markings: Standard, Commander, Security, and Pilot.
                  </p>
                </div>
                <Link to="droids" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-400 hover:text-white transition-colors">
                  Enter Master Archive <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {droidFigures.map(m => (
                <MinifigCard key={m.item_no} minifig={m} variant="dark" onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em]">Popular Army Builders TOP 10</h2>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {topArmyBuilders.map((m, idx) => (
              <div key={m.item_no} className="relative">
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black text-white z-10 shadow-lg">
                  {idx + 1}
                </div>
                <MinifigCard minifig={m} variant="dark" onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ArmyBuilders;
