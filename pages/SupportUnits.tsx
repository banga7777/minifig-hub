import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useParams, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minifigure } from '../types';
import MinifigCard from '../components/MinifigCard';
import SEO from '../components/SEO';
import { PILOT_DATA, TECH_OFFICER_DATA, DROID_DATA, SupportSection } from '../src/constants/supportData';
import { useMinifigLoader, LoaderConfig } from '../hooks/useMinifigLoader';

interface SupportUnitsProps {
  allMinifigs: Minifigure[];
  onToggleOwned: (id: string) => void;
}

const SupportSubArchive = ({ allMinifigs, onToggleOwned, faction }: { allMinifigs: Minifigure[], onToggleOwned: (id: string) => void, faction: 'pilots' | 'tech-officers' | 'droids' }) => {
  const { subId } = useParams();
  const navigate = useNavigate();

  const data = useMemo(() => {
    if (faction === 'pilots') return PILOT_DATA;
    if (faction === 'tech-officers') return TECH_OFFICER_DATA;
    return DROID_DATA;
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
            <p className="text-slate-400 text-lg leading-relaxed max-w-3xl border-l-4 border-emerald-500 pl-6">
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
                <div className="mb-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    {item.label}
                    <span className="text-slate-600">({figs.length})</span>
                  </h4>
                  {item.desc && <p className="text-slate-500 text-[10px] leading-relaxed max-w-xl">{item.desc}</p>}
                </div>
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
  data: SupportSection[],
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
                {section.name}
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
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">{data[activeTab].name}</h2>
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
                            <div className="mb-6">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                {item.label}
                                <span className="text-slate-600">({figs.length})</span>
                              </h4>
                              {item.desc && <p className="text-slate-500 text-[10px] leading-relaxed max-w-xl">{item.desc}</p>}
                            </div>
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

const SupportUnits: React.FC<SupportUnitsProps> = ({ allMinifigs, onToggleOwned }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-[110] bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/lego-star-wars-minifigure-archive')} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              <i className="fas fa-arrow-left"></i> Archive
            </button>
            <span className="text-slate-700">/</span>
            <Link to="/lego-star-wars-minifigure-archive/support-units" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              Support Units
            </Link>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Support Guide</div>
        </div>
      </nav>

      <Routes>
        <Route index element={<SupportHome allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} />} />
        <Route path="pilots" element={
          <ArchiveView 
            allMinifigs={allMinifigs}
            onToggleOwned={onToggleOwned}
            faction="pilots"
            data={PILOT_DATA}
            title="Starfighter Pilots: Master Archive"
            subtitle="Aces of the Galaxy"
            desc="Welcome to the definitive visual archive of the galaxy's starfighter pilots."
            themeColor="orange"
            seo={{
              title: "LEGO Starfighter Pilots Master Archive | Support Guide",
              description: "A comprehensive visual guide to every LEGO Starfighter Pilot variant.",
              keywords: "LEGO Pilot, Rebel Pilot, TIE Pilot, Clone Pilot"
            }}
          />
        } />
        <Route path="pilots/:subId" element={<SupportSubArchive allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} faction="pilots" />} />
        
        <Route path="tech-officers" element={
          <ArchiveView 
            allMinifigs={allMinifigs}
            onToggleOwned={onToggleOwned}
            faction="tech-officers"
            data={TECH_OFFICER_DATA}
            title="Tech & Officers: Master Archive"
            subtitle="Command & Logistics"
            desc="The officers, technicians, and support staff that keep the military machines running."
            themeColor="slate"
            seo={{
              title: "LEGO Tech & Officers Master Archive | Support Guide",
              description: "A comprehensive visual guide to every LEGO Tech & Officer variant.",
              keywords: "LEGO Imperial Officer, AT-AT Driver, Rebel Crew"
            }}
          />
        } />
        <Route path="tech-officers/:subId" element={<SupportSubArchive allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} faction="tech-officers" />} />

        <Route path="droids" element={
          <ArchiveView 
            allMinifigs={allMinifigs}
            onToggleOwned={onToggleOwned}
            faction="droids"
            data={DROID_DATA}
            title="Droids: Master Archive"
            subtitle="Mechanical Assistants"
            desc="The astromechs, protocol droids, and utility units of the Star Wars universe."
            themeColor="amber"
            seo={{
              title: "LEGO Droids Master Archive | Support Guide",
              description: "A comprehensive visual guide to every LEGO Droid variant.",
              keywords: "LEGO Astromech, R2-D2, C-3PO, Protocol Droid"
            }}
          />
        } />
        <Route path="droids/:subId" element={<SupportSubArchive allMinifigs={allMinifigs} onToggleOwned={onToggleOwned} faction="droids" />} />
      </Routes>
    </div>
  );
};

const SupportHome = ({ allMinifigs, onToggleOwned }: { allMinifigs: Minifigure[], onToggleOwned: (id: string) => void }) => {
  const navigate = useNavigate();

  const loaderConfigs = useMemo(() => [
    { ids: ['sw0019', 'sw0032', 'sw0035', 'sw0118'] }, // Pilots
    { ids: ['sw0114', 'sw0046', 'sw0036', 'sw0016'] }, // Tech
    { ids: ['sw0028', 'sw0010', 'sw0430', 'sw0373'] }  // Droids
  ], []);

  const { combinedMinifigs } = useMinifigLoader(allMinifigs, loaderConfigs);

  const topSupportUnits = useMemo(() => {
    return combinedMinifigs
      .filter(m => 
        m.name.toLowerCase().includes('pilot') || 
        m.name.toLowerCase().includes('officer') ||
        m.name.toLowerCase().includes('driver') ||
        m.name.toLowerCase().includes('droid') ||
        m.name.toLowerCase().includes('astromech')
      )
      .sort((a, b) => (b.last_price || 0) - (a.last_price || 0))
      .slice(0, 10);
  }, [combinedMinifigs]);

  const getFigures = (ids: string[]) => combinedMinifigs.filter(m => ids.includes(m.item_no)).slice(0, 4);

  const pilotFigures = getFigures(['sw0019', 'sw0032', 'sw0035', 'sw0118']);
  const techFigures = getFigures(['sw0114', 'sw0046', 'sw0036', 'sw0016']);
  const droidFigures = getFigures(['sw0028', 'sw0010', 'sw0430', 'sw0373']);

  return (
    <>
      <SEO 
        title="LEGO Star Wars Support Units | The Master Archive"
        description="Explore the definitive visual guide to LEGO Star Wars Support Units, including Pilots, Tech & Officers, and Droids."
      />

      <header className="relative pt-16 pb-24 px-6 overflow-hidden bg-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-600/10 rounded-full blur-[100px] opacity-30"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-300">The Backbone of the Fleet</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-8"
          >
            LEGO Star Wars <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-amber-400">Support Units</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            The unsung heroes that keep the galaxy moving. Explore the complete visual history of Starfighter Pilots, Tech & Officers, and Droids.
          </motion.p>
          <div className="mt-12 p-8 bg-slate-900/50 rounded-3xl border border-white/5 text-slate-300 text-sm leading-relaxed max-w-3xl mx-auto">
            The completeness of a diorama is defined by its supporting cast. Pilots, technicians, and the vast array of droids that sustain the Star Wars universe are essential for bringing any battlefield to life. Astromech droids like R2-D2 and protocol droids like C-3PO offer endless collecting variety, with subtle printing differences across versions that add depth to your collection. Examining the intricate helmet printing of pilots or the specialized gear of technicians is a rewarding experience. Incorporating these support units into your display will create a richer, more authentic, and immersive Star Wars universe.
          </div>
        </div>
      </header>

      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-24">
          {/* Starfighter Pilots */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <Link to="pilots" className="group block">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">✈️</div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-orange-400 transition-colors">Starfighter Pilots</h2>
                </div>
              </Link>
              <p className="text-orange-400 font-bold text-sm uppercase tracking-widest mb-6">"Aces of the Galaxy"</p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    Flight Squadrons
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Rebel/Resistance Pilots, Imperial TIE Pilots, and Clone Pilots.
                  </p>
                </div>
                <Link to="pilots" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-400 hover:text-white transition-colors">
                  Enter Master Archive <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {pilotFigures.map(m => (
                <MinifigCard key={m.item_no} minifig={m} variant="dark" onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)} />
              ))}
            </div>
          </div>

          {/* Tech & Officers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 lg:order-2">
              <Link to="tech-officers" className="group block">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">👔</div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-slate-400 transition-colors">Tech & Officers</h2>
                </div>
              </Link>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-6">"Command & Logistics"</p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                    Support Staff
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    AT-AT/AT-ST Drivers, Imperial Officers, Rebel Crew, and Death Star Gunners.
                  </p>
                </div>
                <Link to="tech-officers" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                  Enter Master Archive <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7 lg:order-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {techFigures.map(m => (
                <MinifigCard key={m.item_no} minifig={m} variant="dark" onToggleOwned={onToggleOwned} onClick={() => navigate(`/minifigs/${m.item_no}-${m.name.toLowerCase().replace(/ /g, '-')}`)} />
              ))}
            </div>
          </div>

          {/* Droids */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <Link to="droids" className="group block">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🤖</div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-amber-400 transition-colors">Droids</h2>
                </div>
              </Link>
              <p className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-6">"Mechanical Assistants"</p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    Utility Units
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    R2-D2 & Astromech series, C-3PO, Protocol, and Gonk Droids.
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
            <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em]">Popular Support Units TOP 10</h2>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {topSupportUnits.map((m, idx) => (
              <div key={m.item_no} className="relative">
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black text-white z-10 shadow-lg">
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

export default SupportUnits;
